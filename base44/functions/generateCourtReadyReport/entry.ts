import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { dateFrom, dateTo, childName } = await req.json();

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);

    const inRange = (d) => { const dt = new Date(d); return dt >= fromDate && dt <= toDate; };

    // Fetch all relevant data in parallel
    const [children, behaviors, goals, checkins, caseNotes, calendarEvents, journals, caseTasks] = await Promise.all([
      base44.entities.ChildProfile.list("-created_date", 10),
      base44.entities.BehaviorLog.list("-created_date", 500),
      base44.entities.Goal.list("-created_date", 200),
      base44.entities.CheckIn.list("-created_date", 500),
      base44.entities.CaseNote.list("-created_date", 200),
      base44.entities.CareCalendarEvent.list("-created_date", 200),
      base44.entities.ParentJournal.list("-created_date", 200),
      base44.entities.CaseTask.list("-created_date", 200),
    ]);

    // Filter by date range
    const child = childName
      ? children.find(c => c.first_name?.toLowerCase() === childName.toLowerCase()) || children[0]
      : children[0];

    const filteredBehaviors = behaviors.filter(b => inRange(b.created_date));
    const filteredGoals = goals.filter(g => inRange(g.created_date));
    const filteredCheckins = checkins.filter(c => inRange(c.created_date));
    const filteredNotes = caseNotes.filter(n => inRange(n.created_date));
    const filteredEvents = calendarEvents.filter(e => inRange(e.date || e.created_date));
    const filteredJournals = journals.filter(j => inRange(j.created_date));
    const filteredTasks = caseTasks.filter(t => inRange(t.created_date));

    const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "long" });
    const reportId = `R-${Date.now().toString(36).toUpperCase()}`;

    // ── PDF SETUP ──────────────────────────────────────────────────
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const ML = 18, MR = 18, MT = 18;
    const CW = PW - ML - MR;
    let y = MT;

    const DARK_GREEN = [27, 68, 44];
    const MID_GREEN  = [88, 140, 100];
    const GOLD       = [180, 130, 40];
    const LIGHT_GRAY = [245, 245, 245];
    const MED_GRAY   = [180, 180, 180];
    const TEXT       = [40, 35, 30];

    // ── HELPERS ────────────────────────────────────────────────────
    function checkPage(needed = 18) {
      if (y + needed > PH - 22) { addPageFooter(); doc.addPage(); y = MT + 4; addPageHeader(); }
    }

    function addText(text, fontSize = 10, color = TEXT, bold = false, indent = 0) {
      checkPage(fontSize * 0.55 + 4);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ""), CW - indent);
      doc.text(lines, ML + indent, y);
      y += lines.length * (fontSize * 0.45) + 3;
    }

    function addHRule(color = MED_GRAY, thickness = 0.3) {
      doc.setDrawColor(...color);
      doc.setLineWidth(thickness);
      doc.line(ML, y, PW - MR, y);
      y += 4;
    }

    function addSectionHeader(title, emoji = "") {
      checkPage(16);
      y += 3;
      doc.setFillColor(...DARK_GREEN);
      doc.roundedRect(ML, y - 5, CW, 10, 1.5, 1.5, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`${emoji}  ${title}`, ML + 4, y + 1.5);
      y += 10;
    }

    function addSubHeader(title) {
      checkPage(12);
      y += 2;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...MID_GREEN);
      doc.text(title.toUpperCase(), ML, y);
      y += 5;
      addHRule(MID_GREEN, 0.2);
    }

    function addMetaRow(label, value) {
      checkPage(8);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...MID_GREEN);
      doc.text(label + ":", ML, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(String(value || "N/A"), CW - 45);
      doc.text(lines, ML + 42, y);
      y += lines.length * 4 + 2;
    }

    function addBadge(label, x, badgeY, bgColor, textColor = [255,255,255]) {
      doc.setFillColor(...bgColor);
      doc.roundedRect(x, badgeY - 3.5, doc.getTextWidth(label) + 4, 5.5, 1, 1, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      doc.text(label, x + 2, badgeY);
      return doc.getTextWidth(label) + 6;
    }

    function addPageHeader() {
      doc.setFillColor(...DARK_GREEN);
      doc.rect(0, 0, PW, 10, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("ROOTED 21 — COURT-READY REPORT  |  CONFIDENTIAL & PRIVILEGED", ML, 6.5);
      doc.text(`ID: ${reportId}`, PW - MR - 25, 6.5);
    }

    function addPageFooter() {
      const pg = doc.internal.pages.length - 1;
      doc.setFillColor(240, 240, 240);
      doc.rect(0, PH - 12, PW, 12, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Certified Copy — Generated: ${generatedAt}`, ML, PH - 6);
      doc.text(`Page ${pg}  |  Report ID: ${reportId}`, PW - MR - 40, PH - 6);
    }

    // ══════════════════════════════════════════════════════════════
    // PAGE 1 — COVER / DECLARATION
    // ══════════════════════════════════════════════════════════════
    addPageHeader();

    // Logo / Title band
    doc.setFillColor(...DARK_GREEN);
    doc.roundedRect(ML, y + 2, CW, 28, 3, 3, "F");
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("COURT-READY DOCUMENTATION REPORT", ML + CW / 2, y + 14, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 210, 190);
    doc.text("Rooted 21 Parenting Support Network  —  Trauma-Informed Family Records", ML + CW / 2, y + 22, { align: "center" });
    y += 38;

    // CERTIFIED COPY badge
    doc.setFillColor(...GOLD);
    doc.roundedRect(ML + CW / 2 - 28, y, 56, 10, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("★  CERTIFIED COPY", ML + CW / 2, y + 6.5, { align: "center" });
    y += 16;

    // Report metadata box
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(ML, y, CW, 50, 2, 2, "F");
    doc.setDrawColor(...MED_GRAY);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, CW, 50, 2, 2, "S");
    const bY = y + 8;
    y += 4;
    addMetaRow("Report ID", reportId);
    addMetaRow("Generated By", `${user.full_name} (${user.email})`);
    addMetaRow("Generation Date", generatedAt);
    addMetaRow("Reporting Period", `${new Date(dateFrom).toLocaleDateString("en-US", { dateStyle: "long" })} — ${new Date(dateTo).toLocaleDateString("en-US", { dateStyle: "long" })}`);
    addMetaRow("Child Subject", child ? `${child.first_name}${child.last_name ? " " + child.last_name : ""}, Age ${child.age || "N/A"} (${child.placement_type || "N/A"})` : "No child profile on file");
    y += 4;

    // Declaration
    y += 4;
    addHRule(MID_GREEN);
    addText("DECLARATION OF AUTHENTICITY", 10, DARK_GREEN, true);
    const declaration = `I, ${user.full_name}, declare under penalty of perjury that the information contained in this report was generated directly from the Rooted 21 parenting platform database and accurately reflects records created and maintained in the ordinary course of parenting and case management activities. All entries were recorded contemporaneously by the individuals identified herein. This report was generated on ${generatedAt} and has not been altered.`;
    addText(declaration, 9, TEXT, false, 0);
    y += 4;

    // Signature lines
    doc.setDrawColor(...MED_GRAY);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + 80, y);
    doc.line(ML + 100, y, PW - MR, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MED_GRAY);
    doc.text("Signature of Parent/Caregiver", ML, y);
    doc.text("Date", ML + 100, y);
    y += 14;

    // Stats summary row
    const stats = [
      { label: "Behavior Logs", value: filteredBehaviors.length },
      { label: "Check-ins", value: filteredCheckins.length },
      { label: "Goals", value: filteredGoals.length },
      { label: "Case Notes", value: filteredNotes.length },
      { label: "Events", value: filteredEvents.length },
      { label: "Journal Entries", value: filteredJournals.length },
    ];
    const boxW = CW / stats.length;
    stats.forEach((s, i) => {
      const bx = ML + i * boxW;
      doc.setFillColor(i % 2 === 0 ? 235 : 245, i % 2 === 0 ? 245 : 250, i % 2 === 0 ? 235 : 245);
      doc.roundedRect(bx, y, boxW - 1, 16, 1.5, 1.5, "F");
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK_GREEN);
      doc.text(String(s.value), bx + boxW / 2 - 0.5, y + 8, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(s.label, bx + boxW / 2 - 0.5, y + 13, { align: "center" });
    });
    y += 22;

    addPageFooter();

    // ══════════════════════════════════════════════════════════════
    // SECTION 1 — CHILD PROFILE
    // ══════════════════════════════════════════════════════════════
    if (child) {
      doc.addPage();
      y = MT + 4;
      addPageHeader();
      addSectionHeader("SECTION 1 — CHILD PROFILE & BACKGROUND", "👤");
      y += 2;
      addMetaRow("Full Name", `${child.first_name}${child.last_name ? " " + child.last_name : ""}`);
      addMetaRow("Age", child.age || "N/A");
      addMetaRow("Placement Type", child.placement_type || "N/A");
      if (child.strengths) { addSubHeader("Strengths"); addText(child.strengths, 9, TEXT, false, 3); }
      if (child.concerns) { addSubHeader("Reported Concerns"); addText(child.concerns, 9, TEXT, false, 3); }
      if (child.triggers) { addSubHeader("Known Triggers"); addText(child.triggers, 9, TEXT, false, 3); }
      if (child.coping_tools) { addSubHeader("Coping Tools & Strategies"); addText(child.coping_tools, 9, TEXT, false, 3); }
      if (child.school_notes) { addSubHeader("School Notes / IEP"); addText(child.school_notes, 9, TEXT, false, 3); }
      if (child.behavior_patterns) { addSubHeader("Observed Behavior Patterns"); addText(child.behavior_patterns, 9, TEXT, false, 3); }
      if (child.care_goals && child.care_goals.length > 0) {
        addSubHeader("Care Goals");
        child.care_goals.forEach((g, i) => addText(`${i + 1}. ${g}`, 9, TEXT, false, 3));
      }
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 2 — BEHAVIOR LOGS
    // ══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();
    addSectionHeader("SECTION 2 — BEHAVIOR INCIDENT LOGS", "📋");
    if (filteredBehaviors.length === 0) {
      addText("No behavior logs recorded in the selected date range.", 9, MED_GRAY);
    } else {
      addText(`Total incidents logged: ${filteredBehaviors.length}`, 9, DARK_GREEN, true);
      y += 2;
      filteredBehaviors.forEach((b, i) => {
        checkPage(30);
        const entryDate = new Date(b.created_date).toLocaleDateString("en-US", { dateStyle: "medium" });
        const entryTime = new Date(b.created_date).toLocaleTimeString("en-US", { timeStyle: "short" });
        doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 252 : 255, i % 2 === 0 ? 248 : 255);
        const startY = y;
        y += 2;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_GREEN);
        doc.text(`#${i + 1}  ${entryDate} at ${entryTime}`, ML + 2, y);
        y += 5;
        if (b.behavior_description) { addMetaRow("Description", b.behavior_description); }
        if (b.trigger) { addMetaRow("Trigger", b.trigger); }
        if (b.child_mood) { addMetaRow("Child Mood", b.child_mood); }
        if (b.parent_response) { addMetaRow("Caregiver Response", b.parent_response); }
        if (b.intensity) { addMetaRow("Intensity Level", b.intensity); }
        if (b.notes) { addMetaRow("Notes", b.notes); }
        doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 252 : 255, i % 2 === 0 ? 248 : 255);
        doc.rect(ML, startY, CW, y - startY + 1, "F");
        doc.setDrawColor(...MED_GRAY);
        doc.setLineWidth(0.2);
        doc.rect(ML, startY, CW, y - startY + 1, "S");
        y += 3;
      });
    }
    addPageFooter();

    // ══════════════════════════════════════════════════════════════
    // SECTION 3 — DAILY CHECK-INS
    // ══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();
    addSectionHeader("SECTION 3 — DAILY REGULATION CHECK-INS", "📈");
    if (filteredCheckins.length === 0) {
      addText("No check-ins recorded in the selected date range.", 9, MED_GRAY);
    } else {
      const avgReg = (filteredCheckins.reduce((s, c) => s + (c.child_regulation || 0), 0) / filteredCheckins.length).toFixed(2);
      const avgCalm = (filteredCheckins.reduce((s, c) => s + (c.parent_calm || 0), 0) / filteredCheckins.length).toFixed(2);
      addText(`Total check-ins: ${filteredCheckins.length}   |   Avg Child Regulation: ${avgReg}/5   |   Avg Parent Calm: ${avgCalm}/5`, 9, DARK_GREEN, true);
      y += 2;
      filteredCheckins.forEach((c, i) => {
        checkPage(20);
        const entryDate = new Date(c.created_date).toLocaleDateString("en-US", { dateStyle: "medium" });
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_GREEN);
        doc.text(`${entryDate}`, ML + 2, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT);
        doc.text(`Child Regulation: ${c.child_regulation}/5   |   Parent Calm: ${c.parent_calm}/5${c.notes ? "   |   " + c.notes : ""}`, ML + 35, y);
        y += 5;
        if (i < filteredCheckins.length - 1) {
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.1);
          doc.line(ML, y - 1, PW - MR, y - 1);
        }
      });
    }
    addPageFooter();

    // ══════════════════════════════════════════════════════════════
    // SECTION 4 — GOALS
    // ══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();
    addSectionHeader("SECTION 4 — FAMILY GOALS & PROGRESS", "🎯");
    if (filteredGoals.length === 0) {
      addText("No goals recorded in the selected date range.", 9, MED_GRAY);
    } else {
      const completed = filteredGoals.filter(g => g.progress === "completed").length;
      addText(`Total goals: ${filteredGoals.length}   |   Completed: ${completed}   |   In Progress: ${filteredGoals.filter(g => g.progress === "in_progress").length}`, 9, DARK_GREEN, true);
      y += 2;
      filteredGoals.forEach((g, i) => {
        checkPage(22);
        const statusColor = g.progress === "completed" ? MID_GREEN : g.progress === "in_progress" ? GOLD : MED_GRAY;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_GREEN);
        doc.text(`${i + 1}. ${g.title || "Untitled Goal"}`, ML + 2, y);
        addBadge((g.progress || "unknown").replace(/_/g, " ").toUpperCase(), PW - MR - 30, y, statusColor);
        y += 5;
        if (g.description) { addMetaRow("Description", g.description); }
        if (g.category) { addMetaRow("Category", g.category); }
        addMetaRow("Created", new Date(g.created_date).toLocaleDateString("en-US", { dateStyle: "medium" }));
        y += 2;
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(ML, y, PW - MR, y);
        y += 3;
      });
    }
    addPageFooter();

    // ══════════════════════════════════════════════════════════════
    // SECTION 5 — CASE NOTES
    // ══════════════════════════════════════════════════════════════
    if (filteredNotes.length > 0) {
      doc.addPage();
      y = MT + 4;
      addPageHeader();
      addSectionHeader("SECTION 5 — CASE NOTES & THERAPY RECORDS", "📝");
      addText(`Total entries: ${filteredNotes.length}`, 9, DARK_GREEN, true);
      y += 2;
      filteredNotes.forEach((n, i) => {
        checkPage(25);
        const noteDate = new Date(n.created_date).toLocaleDateString("en-US", { dateStyle: "medium" });
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_GREEN);
        doc.text(`${i + 1}. ${n.title || "Note"}  —  ${noteDate}`, ML + 2, y);
        y += 5;
        addMetaRow("Type", (n.note_type || "").replace(/_/g, " ").toUpperCase());
        addMetaRow("Author", `${n.author_name || "Unknown"} (${n.author_role || ""})`);
        if (n.body) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...TEXT);
          const lines = doc.splitTextToSize(n.body, CW - 3);
          checkPage(lines.length * 4 + 6);
          doc.text(lines, ML + 3, y);
          y += lines.length * 4 + 4;
        }
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(ML, y, PW - MR, y);
        y += 4;
      });
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 6 — CALENDAR EVENTS
    // ══════════════════════════════════════════════════════════════
    if (filteredEvents.length > 0) {
      doc.addPage();
      y = MT + 4;
      addPageHeader();
      addSectionHeader("SECTION 6 — APPOINTMENTS & CALENDAR EVENTS", "📅");
      addText(`Total events: ${filteredEvents.length}`, 9, DARK_GREEN, true);
      y += 2;
      filteredEvents.forEach((ev, i) => {
        checkPage(20);
        const evDate = new Date(ev.date || ev.created_date).toLocaleDateString("en-US", { dateStyle: "medium" });
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_GREEN);
        doc.text(`${i + 1}. ${ev.title}`, ML + 2, y);
        y += 5;
        addMetaRow("Date", `${evDate}${ev.time ? " at " + ev.time : ""}`);
        addMetaRow("Type", (ev.event_type || "").replace(/_/g, " ").toUpperCase());
        if (ev.location) addMetaRow("Location", ev.location);
        if (ev.status) addMetaRow("Status", ev.status.toUpperCase());
        if (ev.notes) addMetaRow("Notes", ev.notes);
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(ML, y, PW - MR, y);
        y += 3;
      });
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 7 — TASKS
    // ══════════════════════════════════════════════════════════════
    if (filteredTasks.length > 0) {
      doc.addPage();
      y = MT + 4;
      addPageHeader();
      addSectionHeader("SECTION 7 — CASE TASKS & ACTION ITEMS", "✅");
      addText(`Total tasks: ${filteredTasks.length}   |   Completed: ${filteredTasks.filter(t => t.status === "completed").length}`, 9, DARK_GREEN, true);
      y += 2;
      filteredTasks.forEach((t, i) => {
        checkPage(22);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_GREEN);
        doc.text(`${i + 1}. ${t.title}`, ML + 2, y);
        y += 5;
        addMetaRow("Assigned To", `${t.assigned_to_name || ""} (${t.assigned_to_role || ""})`);
        addMetaRow("Due Date", t.due_date || "N/A");
        addMetaRow("Status", (t.status || "").toUpperCase());
        addMetaRow("Priority", (t.priority || "").toUpperCase());
        if (t.notes) addMetaRow("Notes", t.notes);
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(ML, y, PW - MR, y);
        y += 3;
      });
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // FINAL PAGE — CLOSING CERTIFICATION
    // ══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();
    addSectionHeader("CERTIFICATION & CLOSING STATEMENT", "⚖️");

    addText("STATEMENT OF COMPLETENESS", 10, DARK_GREEN, true);
    addText(
      `This document constitutes a complete and accurate export of all records stored within the Rooted 21 platform for the reporting period of ${new Date(dateFrom).toLocaleDateString("en-US", { dateStyle: "long" })} through ${new Date(dateTo).toLocaleDateString("en-US", { dateStyle: "long" })}, as requested by ${user.full_name} (${user.email}).`,
      9, TEXT
    );
    y += 4;

    addText("CONFIDENTIALITY NOTICE", 10, DARK_GREEN, true);
    addText(
      "This document contains confidential and privileged information pertaining to a minor child and is intended solely for use by authorized parties in legal, child welfare, or court proceedings. Unauthorized disclosure, copying, or distribution is strictly prohibited and may be subject to legal penalties.",
      9, TEXT
    );
    y += 4;

    addText("DATA INTEGRITY NOTICE", 10, DARK_GREEN, true);
    addText(
      "Records were created and stored contemporaneously within the Rooted 21 system. No records have been selectively omitted or modified for the purposes of this export. Timestamps reflect Eastern Time (ET). All entries are associated with authenticated user accounts.",
      9, TEXT
    );
    y += 6;
    addHRule(DARK_GREEN, 0.5);

    // Final certification block
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(ML, y, CW, 40, 2, 2, "F");
    doc.setDrawColor(...MID_GREEN);
    doc.setLineWidth(0.5);
    doc.roundedRect(ML, y, CW, 40, 2, 2, "S");
    const fy = y + 6;
    y += 3;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_GREEN);
    doc.text("CERTIFIED COPY", ML + CW / 2, fy, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT);
    doc.text(`Report ID: ${reportId}`, ML + CW / 2, fy + 6, { align: "center" });
    doc.text(`Prepared by: ${user.full_name}  |  ${user.email}`, ML + CW / 2, fy + 12, { align: "center" });
    doc.text(`Generated: ${generatedAt}`, ML + CW / 2, fy + 18, { align: "center" });
    doc.text("Rooted 21 Parenting Support Network", ML + CW / 2, fy + 24, { align: "center" });
    y += 44;

    // Signature lines
    doc.setDrawColor(...MED_GRAY);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + 80, y);
    doc.line(ML + 100, y, PW - MR, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MED_GRAY);
    doc.text("Parent/Caregiver Signature", ML, y);
    doc.text("Date Signed", ML + 100, y);

    addPageFooter();

    // ── OUTPUT ────────────────────────────────────────────────────
    const pdfBytes = doc.output("arraybuffer");
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    return Response.json({
      success: true,
      base64,
      fileName: `Court-Ready-Report-${child?.first_name || "Family"}-${dateFrom}-to-${dateTo}.pdf`,
      reportId,
      summary: {
        behaviors: filteredBehaviors.length,
        checkins: filteredCheckins.length,
        goals: filteredGoals.length,
        notes: filteredNotes.length,
        events: filteredEvents.length,
        tasks: filteredTasks.length,
      },
    });
  } catch (error) {
    console.error("Error generating court-ready report:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});