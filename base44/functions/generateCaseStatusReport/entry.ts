import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      caseId,
      childName,
      caseType,
      caseNumber,
      selectedNoteIds,
      selectedEventIds,
      selectedDocIds,
    } = await req.json();

    // Fetch selected notes
    const allNotes = await base44.entities.CaseNote.filter({ case_id: caseId }, "-created_date", 100);
    const selectedNotes = allNotes.filter(n => selectedNoteIds.includes(n.id));

    // Fetch selected events
    const allEvents = await base44.entities.CareCalendarEvent.list("-created_date", 100);
    const selectedEvents = allEvents.filter(e => selectedEventIds.includes(e.id));

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Helper to add content and handle page breaks
    const addText = (text, fontSize = 10, bold = false, spacing = 5) => {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(fontSize);
      doc.setFont(undefined, bold ? "bold" : "normal");
      const splitText = doc.splitTextToSize(text, contentWidth);
      doc.text(splitText, margin, yPos);
      yPos += (splitText.length * fontSize * 0.5) + spacing;
      return yPos;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("CASE STATUS REPORT", margin, yPos);
    yPos += 15;

    // Header info
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Child: ${childName}`, margin, yPos);
    yPos += 7;
    doc.text(`Case Type: ${caseType.charAt(0).toUpperCase() + caseType.slice(1)}`, margin, yPos);
    yPos += 7;
    if (caseNumber) {
      doc.text(`Case Number: ${caseNumber}`, margin, yPos);
      yPos += 7;
    }
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 12;

    // Divider
    doc.setDrawColor(60, 80, 90);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Notes section
    if (selectedNotes.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("CASE NOTES", margin, yPos);
      yPos += 10;

      selectedNotes.forEach((note, idx) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }

        // Note header
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.setTextColor(60, 80, 90);
        doc.text(`${idx + 1}. ${note.title}`, margin, yPos);
        yPos += 7;

        // Note metadata
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(120, 120, 120);
        const noteDate = new Date(note.created_date).toLocaleDateString();
        doc.text(`Type: ${note.note_type.toUpperCase()} | Author: ${note.author_name} | Date: ${noteDate}`, margin, yPos);
        yPos += 6;

        // Note body
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
        const splitBody = doc.splitTextToSize(note.body, contentWidth);
        doc.text(splitBody, margin, yPos);
        yPos += (splitBody.length * 4.5) + 8;
      });

      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    }

    // Events section
    if (selectedEvents.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(60, 80, 90);
      doc.text("IMPORTANT EVENTS & APPOINTMENTS", margin, yPos);
      yPos += 10;

      selectedEvents.forEach((event, idx) => {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = margin;
        }

        // Event header
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.setTextColor(60, 80, 90);
        doc.text(`${idx + 1}. ${event.title}`, margin, yPos);
        yPos += 7;

        // Event details
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(120, 120, 120);
        const eventDate = new Date(event.date).toLocaleDateString();
        doc.text(`Date: ${eventDate} | Type: ${event.event_type} | Location: ${event.location || "Virtual"}`, margin, yPos);
        yPos += 6;

        // Event notes
        if (event.notes) {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          const splitNotes = doc.splitTextToSize(event.notes, contentWidth);
          doc.text(splitNotes, margin, yPos);
          yPos += (splitNotes.length * 4.5);
        }
        yPos += 6;
      });

      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    }

    // Documents section
    if (selectedDocIds.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(60, 80, 90);
      doc.text("REFERENCED DOCUMENTS", margin, yPos);
      yPos += 10;

      selectedDocIds.forEach((docId, idx) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.setTextColor(60, 80, 90);
        doc.text(`${idx + 1}. Document Included`, margin, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(120, 120, 120);
        doc.text(`ID: ${docId}`, margin, yPos);
        yPos += 5;
      });
    }

    // Footer
    if (yPos > pageHeight - 20) {
      doc.addPage();
    }
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This report was generated by Rooted 21 Case Management System", margin, pageHeight - 10);
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth - margin - 20, pageHeight - 10);

    // Save PDF
    const pdfBytes = doc.output("arraybuffer");
    const fileName = `${childName.replace(/\s+/g, "-")}-Case-Status-Report.pdf`;

    // Upload to Base44 private storage if needed, or return as blob
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return Response.json({
      success: true,
      url,
      fileName,
    });
  } catch (error) {
    console.error("Error generating case status report:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});