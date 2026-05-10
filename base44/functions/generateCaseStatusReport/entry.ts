import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const {
      caseId,
      childName,
      caseType,
      caseNumber,
      selectedNoteIds,
      selectedEventIds,
      selectedDocIds,
      includeTimeline,
      timelineEntries,
    } = await req.json();

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - 2 * margin;
    let y = margin;

    const checkPage = (needed = 20) => {
      if (y + needed > pageHeight - 15) { doc.addPage(); y = margin; }
    };

    const drawLine = (color = [220, 215, 205]) => {
      doc.setDrawColor(...color);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
    };

    // ── COVER HEADER ────────────────────────────────────────────────
    // Dark green header bar
    doc.setFillColor(47, 75, 58); // C.darkGreen
    doc.rect(0, 0, pageWidth, 38, "F");

    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("CASE STATUS REPORT", margin, 16);

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(180, 210, 190);
    doc.text("Rooted 21 Parenting Network — Court Documentation", margin, 24);
    doc.text(`Generated: ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}`, margin, 30);

    y = 46;

    // ── CASE INFO BOX ────────────────────────────────────────────────
    doc.setFillColor(248, 245, 240);
    doc.roundedRect(margin, y, contentWidth, caseNumber ? 26 : 20, 3, 3, "F");
    doc.setDrawColor(200, 195, 185);
    doc.roundedRect(margin, y, contentWidth, caseNumber ? 26 : 20, 3, 3, "S");

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(40, 60, 45);
    doc.text(`Child: ${childName}`, margin + 5, y + 8);

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(90, 90, 80);
    doc.text(`Case Type: ${caseType ? caseType.charAt(0).toUpperCase() + caseType.slice(1) : "General"}`, margin + 5, y + 15);
    if (caseNumber) {
      doc.text(`Case Number: ${caseNumber}`, margin + 80, y + 15);
      doc.text(`Report ID: RPT-${Date.now().toString(36).toUpperCase()}`, margin + 5, y + 21);
    }

    y += caseNumber ? 34 : 28;

    // ── TIMELINE SECTION ─────────────────────────────────────────────
    if (includeTimeline && timelineEntries && timelineEntries.length > 0) {
      checkPage(20);
      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.setTextColor(47, 75, 58);
      doc.text("CHRONOLOGICAL CASE TIMELINE", margin, y);
      y += 3;
      drawLine([47, 75, 58]);
      y += 3;

      const typeLabels = { note: "CASE NOTE", document: "DOCUMENT", message: "CO-PARENT MSG" };
      const typeColors = {
        note:     { fill: [234, 244, 234], text: [46, 125, 96]  },
        document: { fill: [254, 243, 238], text: [184, 76, 42]  },
        message:  { fill: [243, 237, 255], text: [92, 61, 158]  },
      };

      timelineEntries.forEach((entry, idx) => {
        const entryHeight = entry.body ? Math.ceil(entry.body.length / 80) * 5 + 22 : 20;
        checkPage(entryHeight + 4);

        const cfg = typeColors[entry.type] || typeColors.note;

        // Type badge
        const label = typeLabels[entry.type] || "NOTE";
        doc.setFillColor(...cfg.fill);
        doc.roundedRect(margin, y, 28, 5, 1, 1, "F");
        doc.setFontSize(6.5);
        doc.setFont(undefined, "bold");
        doc.setTextColor(...cfg.text);
        doc.text(label, margin + 2, y + 3.5);

        // Date/time right-aligned
        const dateStr = new Date(entry.date).toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
        doc.setFontSize(7.5);
        doc.setFont(undefined, "normal");
        doc.setTextColor(130, 125, 115);
        doc.text(dateStr, pageWidth - margin - doc.getTextWidth(dateStr), y + 3.5);

        y += 7;

        // Title
        if (entry.title) {
          checkPage(8);
          doc.setFontSize(9.5);
          doc.setFont(undefined, "bold");
          doc.setTextColor(40, 60, 45);
          doc.text(entry.title, margin, y);
          y += 5;
        }

        // Body
        if (entry.body) {
          checkPage(6);
          doc.setFontSize(8.5);
          doc.setFont(undefined, "normal");
          doc.setTextColor(60, 55, 48);
          const lines = doc.splitTextToSize(entry.body, contentWidth);
          lines.forEach(line => {
            checkPage(5);
            doc.text(line, margin, y);
            y += 4.5;
          });
        }

        // Author
        if (entry.author) {
          doc.setFontSize(7.5);
          doc.setFont(undefined, "italic");
          doc.setTextColor(140, 135, 125);
          doc.text(`— ${entry.author}`, margin, y);
          y += 4;
        }

        // Divider between entries (not last)
        if (idx < timelineEntries.length - 1) {
          y += 1;
          doc.setDrawColor(235, 230, 220);
          doc.setLineDashPattern([1, 2], 0);
          doc.line(margin + 5, y, pageWidth - margin - 5, y);
          doc.setLineDashPattern([], 0);
          y += 4;
        }
      });

      y += 8;
    }

    // ── SELECTED NOTES (legacy support) ──────────────────────────────
    if (!includeTimeline && selectedNoteIds && selectedNoteIds.length > 0) {
      const allNotes = await base44.asServiceRole.entities.CaseNote.filter({ case_id: caseId }, "-created_date", 100);
      const notes = allNotes.filter(n => selectedNoteIds.includes(n.id));

      if (notes.length > 0) {
        checkPage(20);
        doc.setFontSize(13);
        doc.setFont(undefined, "bold");
        doc.setTextColor(47, 75, 58);
        doc.text("CASE NOTES", margin, y);
        y += 3;
        drawLine();
        y += 3;

        notes.forEach((note, idx) => {
          const bodyLines = doc.splitTextToSize(note.body || "", contentWidth);
          checkPage(bodyLines.length * 4.5 + 20);

          doc.setFontSize(10);
          doc.setFont(undefined, "bold");
          doc.setTextColor(47, 75, 58);
          doc.text(`${idx + 1}. ${note.title}`, margin, y);
          y += 6;

          doc.setFontSize(8);
          doc.setFont(undefined, "normal");
          doc.setTextColor(120, 120, 110);
          doc.text(`${note.note_type?.toUpperCase()} · ${note.author_name} · ${new Date(note.created_date).toLocaleDateString()}`, margin, y);
          y += 5;

          doc.setFontSize(9);
          doc.setTextColor(60, 55, 48);
          doc.text(bodyLines, margin, y);
          y += bodyLines.length * 4.5 + 6;
        });
        y += 4;
      }
    }

    // ── SUMMARY STATS ─────────────────────────────────────────────────
    if (timelineEntries && timelineEntries.length > 0) {
      checkPage(30);
      y += 4;
      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.setTextColor(47, 75, 58);
      doc.text("REPORT SUMMARY", margin, y);
      y += 3;
      drawLine([47, 75, 58]);
      y += 3;

      const counts = { note: 0, document: 0, message: 0 };
      timelineEntries.forEach(e => { if (counts[e.type] !== undefined) counts[e.type]++; });

      const dateRange = timelineEntries.length > 1
        ? `${new Date(timelineEntries[0].date).toLocaleDateString()} — ${new Date(timelineEntries[timelineEntries.length - 1].date).toLocaleDateString()}`
        : new Date(timelineEntries[0]?.date).toLocaleDateString();

      const stats = [
        ["Total Timeline Events", timelineEntries.length],
        ["Case Notes", counts.note],
        ["Documents", counts.document],
        ["Co-Parent Messages", counts.message],
        ["Date Range", dateRange],
      ];

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(60, 55, 48);
      stats.forEach(([label, val]) => {
        checkPage(6);
        doc.setFont(undefined, "bold");
        doc.text(`${label}:`, margin, y);
        doc.setFont(undefined, "normal");
        doc.text(String(val), margin + 55, y);
        y += 5.5;
      });
      y += 6;
    }

    // ── CERTIFICATION ─────────────────────────────────────────────────
    checkPage(40);
    doc.setFillColor(248, 245, 240);
    doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "F");
    doc.setDrawColor(47, 75, 58);
    doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "S");

    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(47, 75, 58);
    doc.text("CERTIFICATION & DECLARATION", margin + 5, y + 7);

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(60, 55, 48);
    const cert = `I, ${user.full_name}, declare under penalty of perjury that the information contained in this report is true and accurate to the best of my knowledge. This report was generated by the Rooted 21 Case Management System on ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}.`;
    const certLines = doc.splitTextToSize(cert, contentWidth - 10);
    certLines.forEach((line, i) => { doc.text(line, margin + 5, y + 14 + i * 4.5); });

    doc.setFont(undefined, "bold");
    doc.text(`Signature: ${user.full_name}`, margin + 5, y + 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + 110, y + 30);
    y += 46;

    // ── FOOTER on every page ──────────────────────────────────────────
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(47, 75, 58);
      doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
      doc.setFontSize(7);
      doc.setFont(undefined, "normal");
      doc.setTextColor(180, 210, 190);
      doc.text("Rooted 21 Parenting Network — Confidential Case Documentation", margin, pageHeight - 4);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 4);
    }

    const pdfBytes = doc.output("arraybuffer");
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    const fileName = `${childName.replace(/\s+/g, "-")}-Case-Report-${new Date().toISOString().split("T")[0]}.pdf`;

    return Response.json({ success: true, base64, fileName });
  } catch (error) {
    console.error("generateCaseStatusReport error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});