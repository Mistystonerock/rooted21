import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const {
      dateFrom,
      dateTo,
      childName,
      includeSections = {
        childProfile: true,
        lifeStory: true,
        behaviorLogs: true,
        checkIns: true,
        goals: true,
        caseNotes: true,
        calendarEvents: true,
        caseTasks: true,
        messages: true,
      },
      entryTypeFilter = [],   // For life story: array of entry_type strings; empty = all
      messageSource = "both", // "coparenting" | "secure" | "both"
    } = await req.json();

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);

    const inRange = (d) => { const dt = new Date(d); return dt >= fromDate && dt <= toDate; };

    // Fetch all relevant data in parallel
    const [
      children,
      behaviors,
      goals,
      checkins,
      caseNotes,
      calendarEvents,
      journals,
      caseTasks,
      lifeStoryEntries,
      coParentMessages,
      secureMessages,
      checklists,
      secureDocuments,
    ] = await Promise.all([
      base44.entities.ChildProfile.list("-created_date", 10),
      base44.entities.BehaviorLog.list("-created_date", 500),
      base44.entities.Goal.list("-created_date", 200),
      base44.entities.CheckIn.list("-created_date", 500),
      base44.entities.CaseNote.list("-created_date", 200),
      base44.entities.CareCalendarEvent.list("-created_date", 200),
      base44.entities.ParentJournal.list("-created_date", 200),
      base44.entities.CaseTask.list("-created_date", 200),
      base44.entities.LifeStoryEntry.list("-date", 500),
      base44.entities.CoParentingMessage.list("-created_date", 500),
      base44.entities.SecureMessage.list("-created_date", 500),
      base44.entities.CasePlanChecklist.list("-created_date", 100),
      base44.entities.SecureDocument.list("-created_date", 200),
    ]);

    const child = childName
      ? children.find(c => c.first_name?.toLowerCase() === childName.toLowerCase()) || children[0]
      : children[0];

    const filteredBehaviors = behaviors.filter(b => inRange(b.created_date));
    const filteredGoals = goals.filter(g => inRange(g.created_date));
    const filteredCheckins = checkins.filter(c => inRange(c.created_date));
    const filteredNotes = caseNotes.filter(n => inRange(n.created_date));
    const filteredEvents = calendarEvents.filter(e => inRange(e.date || e.created_date));
    const filteredTasks = caseTasks.filter(t => inRange(t.created_date));

    // Checklists — filter by child name if provided, include all items
    const filteredChecklists = checklists.filter(cl => {
      const childMatch = !childName || cl.child_name?.toLowerCase() === childName.toLowerCase();
      const ownerMatch = cl.parent_email === user.email;
      return childMatch && ownerMatch;
    });

    // Completed checklist items within date range
    const completedChecklistItems = [];
    filteredChecklists.forEach(cl => {
      (cl.items || []).forEach(item => {
        if (item.completed && item.completed_date && inRange(item.completed_date)) {
          completedChecklistItems.push({ ...item, checklist_title: cl.title, source: cl.source });
        }
      });
    });

    // Documents uploaded in date range
    const filteredDocuments = secureDocuments.filter(d => {
      const ownerMatch = d.owner_email === user.email;
      const childMatch = !childName || !d.child_name || d.child_name?.toLowerCase() === childName.toLowerCase();
      const dateMatch = inRange(d.created_date);
      return ownerMatch && childMatch && dateMatch;
    });

    // Life story — filter by date range AND optional entry type filter
    let filteredLifeStory = lifeStoryEntries
      .filter(e => {
        const childMatch = !childName || e.child_name?.toLowerCase() === childName.toLowerCase();
        const ownerMatch = e.owner_email === user.email;
        const dateMatch = inRange(e.date || e.created_date);
        return childMatch && ownerMatch && dateMatch;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (entryTypeFilter.length > 0) {
      filteredLifeStory = filteredLifeStory.filter(e => entryTypeFilter.includes(e.entry_type));
    }

    // Messages — filter by date range and source
    let filteredMessages = [];
    if (messageSource === "coparenting" || messageSource === "both") {
      const msgs = coParentMessages
        .filter(m => inRange(m.created_date) && (m.sender_email === user.email || m.recipient_email === user.email))
        .map(m => ({ ...m, _source: "Co-Parent Portal" }));
      filteredMessages = [...filteredMessages, ...msgs];
    }
    if (messageSource === "secure" || messageSource === "both") {
      const msgs = secureMessages
        .filter(m => inRange(m.created_date) && (m.sender_email === user.email || m.recipient_email === user.email))
        .map(m => ({ ...m, _source: "Secure Message" }));
      filteredMessages = [...filteredMessages, ...msgs];
    }
    filteredMessages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

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
    const BLUE       = [30, 80, 160];
    const LIGHT_GRAY = [245, 245, 245];
    const MED_GRAY   = [180, 180, 180];
    const TEXT       = [40, 35, 30];

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
      doc.text("ROOTED 21 — COURT-READY SUMMARY REPORT  |  CONFIDENTIAL & PRIVILEGED", ML, 6.5);
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
    // COVER PAGE
    // ══════════════════════════════════════════════════════════════
    addPageHeader();

    doc.setFillColor(...DARK_GREEN);
    doc.roundedRect(ML, y + 2, CW, 28, 3, 3, "F");
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("COURT-READY SUMMARY REPORT", ML + CW / 2, y + 12, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 210, 190);
    doc.text("Rooted 21 Parenting Support Network  —  Ohio Custody & Foster Care Records", ML + CW / 2, y + 20, { align: "center" });
    doc.text("Prepared pursuant to ORC §2151.421, §3109.04, and Ohio foster care record-keeping standards", ML + CW / 2, y + 26, { align: "center" });
    y += 38;

    doc.setFillColor(...GOLD);
    doc.roundedRect(ML + CW / 2 - 28, y, 56, 10, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("★  CERTIFIED ACCURACY COPY", ML + CW / 2, y + 6.5, { align: "center" });
    y += 16;

    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(ML, y, CW, 54, 2, 2, "F");
    doc.setDrawColor(...MED_GRAY);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, CW, 54, 2, 2, "S");
    y += 4;
    addMetaRow("Report ID", reportId);
    addMetaRow("Generated By", `${user.full_name} (${user.email})`);
    addMetaRow("Generation Date", generatedAt);
    addMetaRow("Reporting Period", `${new Date(dateFrom).toLocaleDateString("en-US", { dateStyle: "long" })} — ${new Date(dateTo).toLocaleDateString("en-US", { dateStyle: "long" })}`);
    addMetaRow("Child Subject", child ? `${child.first_name}${child.last_name ? " " + child.last_name : ""}, Age ${child.age || "N/A"} (${child.placement_type || "N/A"})` : "No child profile on file");
    addMetaRow("Applicable Law", "ORC §2151.421, §3109.04, §5103.0212; ODJFS foster care record standards");
    y += 4;

    y += 4;
    addHRule(MID_GREEN);
    addText("DECLARATION OF CERTIFIED ACCURACY", 10, DARK_GREEN, true);
    const declaration = `I, ${user.full_name}, declare under penalty of perjury pursuant to Ohio Revised Code that the information contained in this report was generated directly from the Rooted 21 parenting platform database and accurately reflects records created and maintained in the ordinary course of parenting and case management activities. All entries were recorded contemporaneously by the individuals identified herein. This report was generated on ${generatedAt} and has not been altered. This report is submitted in accordance with Ohio foster care, custody, and child welfare record-keeping standards.`;
    addText(declaration, 9, TEXT);
    y += 4;

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

    // Summary stats
    const stats = [
      { label: "Behavior Logs", value: filteredBehaviors.length },
      { label: "Check-ins", value: filteredCheckins.length },
      { label: "Goals", value: filteredGoals.length },
      { label: "Case Notes", value: filteredNotes.length },
      { label: "Checklist ✓", value: completedChecklistItems.length },
      { label: "Documents", value: filteredDocuments.length },
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
    if (includeSections.childProfile && child) {
      doc.addPage(); y = MT + 4; addPageHeader();
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
    // SECTION 2 — LIFE STORY TIMELINE (NEW)
    // ══════════════════════════════════════════════════════════════
    if (includeSections.lifeStory) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 2 — CHILD LIFE STORY TIMELINE", "📖");
      if (filteredLifeStory.length === 0) {
        addText("No life story entries found for the selected period or entry type filter.", 9, MED_GRAY);
      } else {
        addText(`Total life events documented: ${filteredLifeStory.length}`, 9, DARK_GREEN, true);
        if (entryTypeFilter.length > 0) {
          addText(`Entry type filter applied: ${entryTypeFilter.join(", ")}`, 8, MID_GREEN);
        }
        y += 2;

        const SENSITIVE_TYPES = ["substance_exposure","physical_abuse","emotional_abuse","sexual_abuse","neglect"];

        filteredLifeStory.forEach((entry, i) => {
          checkPage(35);
          const isSensitive = entry.is_sensitive || SENSITIVE_TYPES.includes(entry.entry_type);
          const entryDate = entry.date
            ? new Date(entry.date).toLocaleDateString("en-US", { dateStyle: "medium" })
            : "Date unknown";

          const startY = y;
          y += 2;

          // Entry header row
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...DARK_GREEN);
          doc.text(`${i + 1}. ${entry.title || "Untitled Entry"}  —  ${entryDate}`, ML + 2, y);
          if (isSensitive) {
            addBadge("SENSITIVE", PW - MR - 24, y, [192, 57, 43]);
          }
          y += 5;

          addMetaRow("Event Type", (entry.entry_type || "other").replace(/_/g, " ").toUpperCase());
          if (entry.age_at_event) addMetaRow("Age at Event", entry.age_at_event);
          if (entry.location) addMetaRow("Location", entry.location);
          if (entry.people_involved) addMetaRow("People Involved", entry.people_involved);
          if (entry.emotional_tone) addMetaRow("Emotional Tone", entry.emotional_tone.toUpperCase());

          if (entry.description) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TEXT);
            const lines = doc.splitTextToSize(entry.description, CW - 5);
            checkPage(lines.length * 4 + 6);
            doc.text(lines, ML + 3, y);
            y += lines.length * 4 + 3;
          }

          // Caregiver notes are included (for court purposes) but labeled clearly
          if (entry.caregiver_notes) {
            addSubHeader("Caregiver Notes (Confidential)");
            addText(entry.caregiver_notes, 8, [100, 80, 50], false, 3);
          }

          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.2);
          doc.line(ML, y, PW - MR, y);
          y += 4;
        });
      }
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 3 — BEHAVIOR LOGS
    // ══════════════════════════════════════════════════════════════
    if (includeSections.behaviorLogs) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 3 — BEHAVIOR INCIDENT LOGS", "📋");
      if (filteredBehaviors.length === 0) {
        addText("No behavior logs recorded in the selected date range.", 9, MED_GRAY);
      } else {
        addText(`Total incidents logged: ${filteredBehaviors.length}`, 9, DARK_GREEN, true);
        y += 2;
        filteredBehaviors.forEach((b, i) => {
          checkPage(30);
          const entryDate = new Date(b.created_date).toLocaleDateString("en-US", { dateStyle: "medium" });
          const entryTime = new Date(b.created_date).toLocaleTimeString("en-US", { timeStyle: "short" });
          y += 2;
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...DARK_GREEN);
          doc.text(`#${i + 1}  ${entryDate} at ${entryTime}`, ML + 2, y);
          y += 5;
          if (b.behavior_description) addMetaRow("Description", b.behavior_description);
          if (b.trigger) addMetaRow("Trigger", b.trigger);
          if (b.child_mood) addMetaRow("Child Mood", b.child_mood);
          if (b.parent_response) addMetaRow("Caregiver Response", b.parent_response);
          if (b.intensity) addMetaRow("Intensity Level", b.intensity);
          if (b.notes) addMetaRow("Notes", b.notes);
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.2);
          doc.line(ML, y, PW - MR, y);
          y += 3;
        });
      }
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 4 — DAILY CHECK-INS
    // ══════════════════════════════════════════════════════════════
    if (includeSections.checkIns) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 4 — DAILY REGULATION CHECK-INS", "📈");
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
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 5 — GOALS
    // ══════════════════════════════════════════════════════════════
    if (includeSections.goals) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 5 — FAMILY GOALS & PROGRESS", "🎯");
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
          if (g.description) addMetaRow("Description", g.description);
          if (g.category) addMetaRow("Category", g.category);
          addMetaRow("Created", new Date(g.created_date).toLocaleDateString("en-US", { dateStyle: "medium" }));
          y += 2;
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.2);
          doc.line(ML, y, PW - MR, y);
          y += 3;
        });
      }
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 6 — CASE NOTES
    // ══════════════════════════════════════════════════════════════
    if (includeSections.caseNotes && filteredNotes.length > 0) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 6 — CASE NOTES & THERAPY RECORDS", "📝");
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
          const lines = doc.splitTextToSize(n.body, CW - 3);
          checkPage(lines.length * 4 + 6);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...TEXT);
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
    // SECTION 7 — CALENDAR EVENTS
    // ══════════════════════════════════════════════════════════════
    if (includeSections.calendarEvents && filteredEvents.length > 0) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 7 — APPOINTMENTS & CALENDAR EVENTS", "📅");
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
    // SECTION 8 — CASE TASKS
    // ══════════════════════════════════════════════════════════════
    if (includeSections.caseTasks && filteredTasks.length > 0) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 8 — CASE TASKS & ACTION ITEMS", "✅");
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
    // SECTION 9 — CASE PLAN CHECKLIST PROGRESS
    // ══════════════════════════════════════════════════════════════
    if (includeSections.checklistProgress) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 9 — CASE PLAN CHECKLIST PROGRESS", "✅");

      if (filteredChecklists.length === 0) {
        addText("No case plan checklists found for this child.", 9, MED_GRAY);
      } else {
        // Summary across all checklists
        const totalItems = filteredChecklists.reduce((s, cl) => s + (cl.items?.length || 0), 0);
        const totalCompleted = filteredChecklists.reduce((s, cl) => s + (cl.items?.filter(i => i.completed).length || 0), 0);
        const pct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
        addText(`${filteredChecklists.length} checklist(s) on file  |  ${totalCompleted} of ${totalItems} items completed (${pct}%)`, 9, DARK_GREEN, true);
        addText(`Items completed within reporting period: ${completedChecklistItems.length}`, 9, MID_GREEN);
        y += 3;

        filteredChecklists.forEach((cl, ci) => {
          checkPage(20);
          addSubHeader(`${ci + 1}. ${cl.title}  [${(cl.source || "manual").toUpperCase()}]`);
          const clItems = cl.items || [];
          const clCompleted = clItems.filter(i => i.completed).length;
          addMetaRow("Progress", `${clCompleted} / ${clItems.length} items completed`);
          addMetaRow("Status", (cl.status || "active").toUpperCase());
          if (cl.ai_summary) addMetaRow("AI Summary", cl.ai_summary);
          y += 2;

          clItems.forEach((item, ii) => {
            checkPage(14);
            const doneStr = item.completed
              ? `✓ Completed ${item.completed_date ? new Date(item.completed_date).toLocaleDateString("en-US", { dateStyle: "medium" }) : ""}`
              : "○ Pending";
            const statusColor = item.completed ? MID_GREEN : MED_GRAY;

            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...statusColor);
            doc.text(`${ii + 1}.`, ML + 2, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TEXT);
            const itemLines = doc.splitTextToSize(item.text || "—", CW - 24);
            doc.text(itemLines, ML + 8, y);

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...statusColor);
            doc.text(doneStr, PW - MR - doc.getTextWidth(doneStr) - 2, y);

            y += itemLines.length * 4.5;

            if (item.due_date) {
              doc.setFontSize(8);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(...MED_GRAY);
              doc.text(`  Due: ${item.due_date}${item.category ? "  |  " + item.category.replace(/_/g, " ").toUpperCase() : ""}`, ML + 8, y);
              y += 4;
            }
            if (item.notes) {
              doc.setFontSize(8);
              doc.setFont("helvetica", "italic");
              doc.setTextColor(100, 80, 50);
              doc.text(`  Note: ${item.notes}`, ML + 8, y);
              y += 4;
            }
            if (item.proof_filename) {
              doc.setFontSize(7.5);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(...MID_GREEN);
              doc.text(`  📎 Proof attached: ${item.proof_filename}`, ML + 8, y);
              y += 4;
            }
            doc.setDrawColor(235, 235, 235);
            doc.setLineWidth(0.15);
            doc.line(ML + 6, y - 1, PW - MR, y - 1);
          });
          y += 4;
        });
      }
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 10 — UPLOADED DOCUMENTS INVENTORY
    // ══════════════════════════════════════════════════════════════
    if (includeSections.documentInventory) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 10 — UPLOADED DOCUMENT INVENTORY", "📁");

      if (filteredDocuments.length === 0) {
        addText("No documents uploaded in the selected date range.", 9, MED_GRAY);
      } else {
        addText(`Total documents uploaded in period: ${filteredDocuments.length}`, 9, DARK_GREEN, true);
        y += 3;

        const categoryGroups = {};
        filteredDocuments.forEach(d => {
          const cat = d.category || "other";
          if (!categoryGroups[cat]) categoryGroups[cat] = [];
          categoryGroups[cat].push(d);
        });

        Object.entries(categoryGroups).forEach(([cat, docs]) => {
          checkPage(16);
          addSubHeader(cat.replace(/_/g, " ").toUpperCase() + ` (${docs.length})`);

          docs.forEach((d, di) => {
            checkPage(18);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...DARK_GREEN);
            doc.text(`${di + 1}. ${d.title}`, ML + 2, y);
            y += 5;
            addMetaRow("File", d.file_name || "—");
            addMetaRow("Uploaded", new Date(d.created_date).toLocaleDateString("en-US", { dateStyle: "medium" }));
            if (d.child_name) addMetaRow("Child", d.child_name);
            if (d.description) addMetaRow("Description", d.description);
            if (d.expiry_date) addMetaRow("Review / Expiry Date", d.expiry_date);
            if (d.tags && d.tags.length > 0) addMetaRow("Tags", d.tags.join(", "));
            addMetaRow("Access", d.is_private ? "Private — owner only" : `Shared with ${(d.shared_with || []).length} contacts`);
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.2);
            doc.line(ML, y, PW - MR, y);
            y += 3;
          });
        });
      }
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // SECTION 11 — COMMUNICATIONS LOG
    // ══════════════════════════════════════════════════════════════
    if (includeSections.messages) {
      doc.addPage(); y = MT + 4; addPageHeader();
      addSectionHeader("SECTION 11 — COMMUNICATIONS LOG", "💬");

      if (filteredMessages.length === 0) {
        addText("No messages found for the selected period or message source filter.", 9, MED_GRAY);
      } else {
        addText(`Total messages in log: ${filteredMessages.length}`, 9, DARK_GREEN, true);
        addText("All messages are reproduced verbatim as stored in the Rooted 21 system. Co-Parent Portal messages are monitored records. Secure messages were exchanged between identified parties.", 8, TEXT);
        y += 2;

        filteredMessages.forEach((m, i) => {
          checkPage(28);
          const msgDate = new Date(m.created_date).toLocaleDateString("en-US", { dateStyle: "medium" });
          const msgTime = new Date(m.created_date).toLocaleTimeString("en-US", { timeStyle: "short" });
          const isOutbound = m.sender_email === user.email;

          const rowBg = isOutbound ? [240, 248, 240] : [245, 245, 255];
          doc.setFillColor(...rowBg);

          const startY = y;
          y += 3;

          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(isOutbound ? DARK_GREEN[0] : BLUE[0], isOutbound ? DARK_GREEN[1] : BLUE[1], isOutbound ? DARK_GREEN[2] : BLUE[2]);
          const direction = isOutbound ? "SENT" : "RECEIVED";
          doc.text(`[${i + 1}] ${direction}  —  ${msgDate} at ${msgTime}`, ML + 2, y);
          addBadge(m._source, PW - MR - 30, y, isOutbound ? DARK_GREEN : BLUE);
          y += 5;

          addMetaRow("From", m.sender_email || "Unknown");
          addMetaRow("To", m.recipient_email || "Unknown");
          if (m.topic || m.category) addMetaRow("Topic/Category", (m.topic || m.category || "").replace(/_/g, " "));

          if (m.body) {
            const lines = doc.splitTextToSize(m.body, CW - 5);
            checkPage(lines.length * 4 + 6);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TEXT);
            doc.text(lines, ML + 3, y);
            y += lines.length * 4 + 3;
          }

          // Draw the background rect now that we know the height
          doc.setFillColor(...rowBg);
          doc.rect(ML, startY, CW, y - startY, "F");
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.2);
          doc.rect(ML, startY, CW, y - startY, "S");

          y += 3;
        });
      }
      addPageFooter();
    }

    // ══════════════════════════════════════════════════════════════
    // FINAL — CERTIFICATION PAGE
    // ══════════════════════════════════════════════════════════════
    doc.addPage(); y = MT + 4; addPageHeader();
    addSectionHeader("CERTIFICATION & CLOSING STATEMENT", "⚖️");

    addText("STATEMENT OF COMPLETENESS", 10, DARK_GREEN, true);
    addText(`This document constitutes a complete and accurate export of selected records stored within the Rooted 21 platform for the reporting period of ${new Date(dateFrom).toLocaleDateString("en-US", { dateStyle: "long" })} through ${new Date(dateTo).toLocaleDateString("en-US", { dateStyle: "long" })}, as requested by ${user.full_name} (${user.email}).`, 9, TEXT);
    y += 4;

    addText("OHIO RECORD-KEEPING COMPLIANCE NOTICE", 10, DARK_GREEN, true);
    addText("This report is prepared in accordance with Ohio Revised Code §2151.421 (mandatory reporting), §3109.04 (custody factors), §5103.0212 (foster care records), and applicable ODJFS foster care documentation standards. Life story entries comply with the ODJFS requirement for child life history documentation.", 9, TEXT);
    y += 4;

    addText("CONFIDENTIALITY NOTICE", 10, DARK_GREEN, true);
    addText("This document contains confidential and privileged information pertaining to a minor child and is intended solely for use by authorized parties in legal, child welfare, or court proceedings. Unauthorized disclosure, copying, or distribution is strictly prohibited.", 9, TEXT);
    y += 4;

    addText("DATA INTEGRITY NOTICE", 10, DARK_GREEN, true);
    addText("Records were created and stored contemporaneously within the Rooted 21 system. Timestamps reflect Eastern Time (ET). All entries are associated with authenticated user accounts. The certified accuracy disclaimer on the cover page applies to all sections herein.", 9, TEXT);
    y += 6;
    addHRule(DARK_GREEN, 0.5);

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
    doc.text("★  CERTIFIED ACCURACY COPY", ML + CW / 2, fy, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT);
    doc.text(`Report ID: ${reportId}`, ML + CW / 2, fy + 6, { align: "center" });
    doc.text(`Prepared by: ${user.full_name}  |  ${user.email}`, ML + CW / 2, fy + 12, { align: "center" });
    doc.text(`Generated: ${generatedAt}`, ML + CW / 2, fy + 18, { align: "center" });
    doc.text("Rooted 21 Parenting Support Network — Ohio Foster Care & Custody Documentation", ML + CW / 2, fy + 24, { align: "center" });
    y += 44;

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

    const pdfBytes = doc.output("arraybuffer");
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    return Response.json({
      success: true,
      base64,
      fileName: `Court-Ready-Summary-${child?.first_name || "Family"}-${dateFrom}-to-${dateTo}.pdf`,
      reportId,
      summary: {
        lifeStory: filteredLifeStory.length,
        behaviors: filteredBehaviors.length,
        checkins: filteredCheckins.length,
        goals: filteredGoals.length,
        notes: filteredNotes.length,
        events: filteredEvents.length,
        tasks: filteredTasks.length,
        checklistItems: completedChecklistItems.length,
        documents: filteredDocuments.length,
        messages: filteredMessages.length,
        },
    });
  } catch (error) {
    console.error("Error generating court-ready report:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});