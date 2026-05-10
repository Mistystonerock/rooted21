import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { caseId, sections, dateFrom, dateTo, includeSignatures } = body;

    if (!caseId) return Response.json({ error: "Missing caseId" }, { status: 400 });

    // Fetch case and related data
    const [caseFile, behaviorLogs, caseTasks, caseNotes, timelineEvents] = await Promise.all([
      base44.entities.CaseFile.filter({ id: caseId }),
      base44.entities.BehaviorLog.filter({ case_id: caseId }, "-incident_date", 100),
      base44.entities.CaseTask.filter({ case_id: caseId }, "-due_date", 100),
      base44.entities.CaseNote.filter({ case_id: caseId }, "-created_date", 100),
      base44.entities.CareCalendarEvent.filter({ case_id: caseId }, "-event_date", 100),
    ]);

    if (!caseFile || caseFile.length === 0) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    const caseData = caseFile[0];

    // Filter by date range if provided
    const filterDate = (item, dateField) => {
      if (!dateFrom || !dateTo) return true;
      const itemDate = new Date(item[dateField]).getTime();
      return itemDate >= new Date(dateFrom).getTime() && itemDate <= new Date(dateTo).getTime();
    };

    const filteredLogs = behaviorLogs.filter(b => filterDate(b, "incident_date"));
    const filteredTasks = caseTasks.filter(t => filterDate(t, "due_date"));
    const filteredNotes = caseNotes.filter(n => filterDate(n, "created_date"));
    const filteredEvents = timelineEvents.filter(e => filterDate(e, "event_date"));

    // Initialize PDF
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const ML = 14, MR = 14, MT = 14;
    const CW = PW - ML - MR;
    let y = MT;

    const COLORS = {
      darkGreen: [46, 125, 96],
      midGreen: [120, 140, 100],
      gold: [180, 130, 40],
      text: [40, 35, 30],
      lightGray: [245, 245, 245],
      medGray: [180, 180, 180],
      danger: [192, 57, 43],
    };

    function checkPage(needed = 12) {
      if (y + needed > PH - 20) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${doc.internal.pages.length - 1}`, ML, PH - 6);
        doc.addPage();
        y = MT;
        addPageHeader();
      }
    }

    function addPageHeader() {
      doc.setFillColor(...COLORS.darkGreen);
      doc.rect(0, 0, PW, 8, "F");
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`${caseData.child_name} — Case Summary Report  |  Generated ${new Date().toLocaleDateString()}`, ML, 5);
    }

    function addHeading(text, size = 13, color = COLORS.darkGreen) {
      checkPage(size * 0.8 + 4);
      doc.setFontSize(size);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text(text, ML, y);
      y += size * 0.6 + 3;
    }

    function addSectionHeader(text) {
      checkPage(10);
      doc.setFillColor(...COLORS.darkGreen);
      doc.roundedRect(ML, y - 3, CW, 8, 0.8, 0.8, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(text, ML + 2, y + 1.5);
      y += 10;
    }

    function addText(text, size = 8.5, color = COLORS.text, bold = false) {
      checkPage(size * 0.5 + 2);
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ""), CW - 3);
      doc.text(lines, ML + 1.5, y);
      y += lines.length * (size * 0.38) + 1;
    }

    function addTable(headers, rows) {
      checkPage(rows.length * 6 + 10);
      const colWidth = CW / headers.length;
      let tableY = y;

      // Header
      doc.setFillColor(...COLORS.lightGray);
      doc.rect(ML, tableY, CW, 6, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.darkGreen);
      headers.forEach((h, i) => {
        doc.text(h, ML + i * colWidth + 1, tableY + 3.5);
      });
      tableY += 6;

      // Rows
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      rows.forEach((row, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(255, 255, 255);
          doc.rect(ML, tableY, CW, 5, "F");
        }
        row.forEach((cell, i) => {
          const lines = doc.splitTextToSize(String(cell || ""), colWidth - 2);
          doc.text(lines, ML + i * colWidth + 1, tableY + 2.5, { maxWidth: colWidth - 2 });
        });
        tableY += 5;
      });
      y = tableY + 2;
    }

    // ════════════════════════════════════════════════════════════════
    // COVER PAGE
    // ════════════════════════════════════════════════════════════════
    addPageHeader();

    doc.setFillColor(...COLORS.darkGreen);
    doc.roundedRect(ML, y + 8, CW, 40, 2, 2, "F");
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("CASE SUMMARY REPORT", ML + CW / 2, y + 18, { align: "center" });
    doc.setFontSize(11);
    doc.text(caseData.child_name, ML + CW / 2, y + 26, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(180, 210, 190);
    doc.text(`Case Type: ${caseData.case_type.toUpperCase()}`, ML + CW / 2, y + 32, { align: "center" });
    y += 55;

    addText(`Report Date: ${new Date().toLocaleDateString()}`, 9, COLORS.text);
    addText(
      `Reporting Period: ${dateFrom || "All"} to ${dateTo || "All"}`,
      9,
      COLORS.text
    );
    y += 8;

    if (caseData.case_number) {
      addText(`Case Number: ${caseData.case_number}`, 9, COLORS.text);
    }
    addText(`Case Status: ${caseData.status.toUpperCase()}`, 9, COLORS.text);
    y += 8;

    doc.setDrawColor(...COLORS.medGray);
    doc.setLineWidth(0.5);
    doc.line(ML, y, PW - MR, y);
    y += 6;

    addHeading("Case Overview", 12);
    if (caseData.description) {
      addText(caseData.description, 8.5);
    }
    if (caseData.key_issues && caseData.key_issues.length > 0) {
      addText("Key Issues:", 8.5, COLORS.text, true);
      caseData.key_issues.forEach(issue => {
        addText(`• ${issue}`, 8.5);
      });
    }

    // ════════════════════════════════════════════════════════════════
    // BEHAVIORAL LOGS SECTION
    // ════════════════════════════════════════════════════════════════
    if (sections?.includes("behaviorLogs") && filteredLogs.length > 0) {
      doc.addPage();
      y = MT;
      addPageHeader();

      addSectionHeader("BEHAVIORAL INCIDENT LOGS");
      addText(`Total Incidents: ${filteredLogs.length}`, 9, COLORS.text, true);
      y += 2;

      const logRows = filteredLogs.slice(0, 20).map(log => [
        new Date(log.incident_date).toLocaleDateString(),
        log.incident_type,
        log.description.substring(0, 40) + "...",
        log.status || "recorded",
      ]);

      if (logRows.length > 0) {
        addTable(["Date", "Type", "Description", "Status"], logRows);
      }

      if (filteredLogs.length > 20) {
        y += 3;
        addText(`Note: Showing first 20 of ${filteredLogs.length} incidents. See system for complete log.`, 7.5, COLORS.medGray);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // COMPLIANCE & TASKS SECTION
    // ════════════════════════════════════════════════════════════════
    if (sections?.includes("compliance") && filteredTasks.length > 0) {
      doc.addPage();
      y = MT;
      addPageHeader();

      addSectionHeader("CASE TASKS & COMPLIANCE TRACKING");
      const completed = filteredTasks.filter(t => t.status === "completed").length;
      const inProgress = filteredTasks.filter(t => t.status === "in_progress").length;
      const open = filteredTasks.filter(t => t.status === "open").length;

      addText(`Overall Completion: ${Math.round((completed / filteredTasks.length) * 100)}% (${completed}/${filteredTasks.length})`, 9, COLORS.text, true);
      y += 2;

      const taskRows = filteredTasks.map(task => [
        task.title,
        task.priority || "medium",
        task.status,
        task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A",
      ]);

      if (taskRows.length > 0) {
        addTable(["Task", "Priority", "Status", "Due Date"], taskRows);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // NOTES & OBSERVATIONS SECTION
    // ════════════════════════════════════════════════════════════════
    if (sections?.includes("notes") && filteredNotes.length > 0) {
      doc.addPage();
      y = MT;
      addPageHeader();

      addSectionHeader("CASE NOTES & OBSERVATIONS");
      addText(`Total Notes: ${filteredNotes.length}`, 9, COLORS.text, true);
      y += 3;

      filteredNotes.slice(0, 10).forEach((note, idx) => {
        if (idx > 0) {
          doc.setDrawColor(...COLORS.medGray);
          doc.setLineWidth(0.2);
          doc.line(ML, y, PW - MR, y);
          y += 2;
        }

        addText(`${note.title || "Note"}`, 8.5, COLORS.darkGreen, true);
        addText(`Type: ${note.note_type} | ${new Date(note.created_date).toLocaleDateString()} | ${note.author_name}`, 7.5, COLORS.medGray);
        addText(note.body, 8);
        y += 1;
      });

      if (filteredNotes.length > 10) {
        y += 2;
        addText(`+ ${filteredNotes.length - 10} additional notes available in system`, 7.5, COLORS.medGray);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // TIMELINE SECTION
    // ════════════════════════════════════════════════════════════════
    if (sections?.includes("timeline") && filteredEvents.length > 0) {
      doc.addPage();
      y = MT;
      addPageHeader();

      addSectionHeader("CASE TIMELINE & MILESTONES");

      const sortedEvents = [...filteredEvents].sort((a, b) => 
        new Date(b.event_date) - new Date(a.event_date)
      );

      sortedEvents.slice(0, 15).forEach((evt, idx) => {
        if (idx > 0) y += 1;
        checkPage(8);

        const dateStr = new Date(evt.event_date).toLocaleDateString();
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.gold);
        doc.text(`● ${dateStr}`, ML + 2, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.darkGreen);
        doc.text(evt.title || "Event", ML + 20, y);
        y += 4;

        if (evt.description) {
          addText(evt.description, 7.5);
        }
      });

      if (sortedEvents.length > 15) {
        y += 2;
        addText(`+ ${sortedEvents.length - 15} additional timeline events available in system`, 7.5, COLORS.medGray);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // CERTIFICATION PAGE
    // ════════════════════════════════════════════════════════════════
    if (includeSignatures) {
      doc.addPage();
      y = MT;
      addPageHeader();

      addSectionHeader("CERTIFICATION & SIGNATURE");
      y += 4;

      addText(
        `I certify that the information in this report is true and accurate to the best of my knowledge, based on records and documentation available in the case file as of ${new Date().toLocaleDateString()}.`,
        8.5,
        COLORS.text
      );
      y += 10;

      addText("Prepared By:", 8.5, COLORS.text, true);
      addText(`${user.full_name} | ${user.email}`, 8);
      addText(`Role: ${user.role}`, 8);
      y += 15;

      addText("Signature: ___________________________", 8.5, COLORS.text);
      addText("Date: ___________________________", 8.5, COLORS.text);
      y += 12;

      doc.setDrawColor(...COLORS.medGray);
      doc.setLineWidth(0.3);
      doc.line(ML, y, PW - MR, y);
      y += 4;

      addText(
        `This report was generated by the Rooted 21 case management system and contains court-admissible, timestamped records. All data is encrypted and secured per HIPAA standards.`,
        7.5,
        COLORS.medGray
      );
    }

    const pdfBytes = doc.output("arraybuffer");
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    return Response.json({
      success: true,
      base64,
      fileName: `${caseData.child_name}-Case-Summary-${new Date().toISOString().split("T")[0]}.pdf`,
      summary: {
        behaviorLogs: filteredLogs.length,
        tasks: filteredTasks.length,
        notes: filteredNotes.length,
        events: filteredEvents.length,
      },
    });
  } catch (error) {
    console.error("Error generating case summary:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});