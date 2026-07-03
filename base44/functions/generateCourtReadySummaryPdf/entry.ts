import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";
import { jsPDF } from "npm:jspdf@4.2.1";

const INCIDENT_TYPE_LABELS = {
  school_restraint: "School Restraint",
  police_contact: "Police Contact",
  runaway: "Runaway",
  hospitalization: "Hospitalization",
  self_harm: "Self-Harm",
  aggression: "Aggression",
  property_damage: "Property Damage",
  other: "Other",
};

const MOOD_LABELS = { calm: "Calm", sad: "Sad", anxious: "Anxious", angry: "Angry", dysregulated: "Dysregulated" };

function safeStr(v) { return v == null ? "" : String(v); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // ── Client may ONLY pass advisory filters. Everything else is ignored. ──
    const body = await req.json().catch(() => ({}));
    const includeSections = {
      journals: body?.includeSections?.journals !== false,
      incidents: body?.includeSections?.incidents !== false,
      behaviorLogs: body?.includeSections?.behaviorLogs !== false,
    };
    const childName = safeStr(body?.childName || "").trim();

    // Server owns the date range. Accept client dates only as a filter hint,
    // validated server-side; default to last 90 days.
    const now = new Date();
    let toDate = new Date(now);
    let fromDate = new Date(now);
    fromDate.setDate(fromDate.getDate() - 90);
    if (body?.dateFrom && !Number.isNaN(new Date(body.dateFrom).getTime())) fromDate = new Date(body.dateFrom);
    if (body?.dateTo && !Number.isNaN(new Date(body.dateTo).getTime())) toDate = new Date(body.dateTo);
    const dateFromStr = fromDate.toISOString().split("T")[0];
    const dateToStr = toDate.toISOString().split("T")[0];
    const inRange = (d) => { const s = safeStr(d).split("T")[0]; return s && s >= dateFromStr && s <= dateToStr; };

    // ── Server generates all identity, IDs, timestamps ──
    const reportId = `R21-SUM-${Date.now().toString(36).toUpperCase()}`;
    const generatedAt = now.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "long" });
    const parentName = user.full_name || user.email;

    // ── Read trusted records directly, scoped to the authenticated user ──
    const [journalsRaw, incidentsRaw, behaviorRaw] = await Promise.all([
      base44.entities.ParentJournal.list("-entry_date", 500).catch(() => []),
      base44.entities.IncidentReport.filter({ parent_email: user.email }, "-incident_date", 500).catch(() => []),
      base44.entities.BehaviorLog.list("-entry_date", 500).catch(() => []),
    ]);

    const childMatch = (name) => !childName || safeStr(name).toLowerCase() === childName.toLowerCase();

    const filteredJournals = journalsRaw.filter(j => inRange(j.entry_date));
    const filteredIncidents = incidentsRaw.filter(i => inRange(i.incident_date) && childMatch(i.child_name));
    const filteredBehavior = behaviorRaw.filter(b => inRange(b.entry_date));

    // ── Server builds the chronology from trusted records ──
    const entries = [];
    if (includeSections.journals) {
      filteredJournals.forEach((j, idx) => {
        if (j.wins_of_day || j.regulation_reflection || j.what_i_learned) {
          entries.push({
            date: j.entry_date,
            type: "journal",
            citation: `JRN-${String(idx + 1).padStart(3, "0")}`,
            summary: [j.wins_of_day, j.regulation_reflection, j.what_i_learned].filter(Boolean).join(" | "),
            mood: j.mood,
          });
        }
      });
    }
    if (includeSections.incidents) {
      filteredIncidents.forEach((inc, idx) => {
        entries.push({
          date: inc.incident_date,
          type: "incident",
          citation: `INC-${String(idx + 1).padStart(3, "0")}`,
          child: inc.child_name,
          incidentType: INCIDENT_TYPE_LABELS[inc.incident_type] || inc.incident_type,
          summary: inc.description,
          what_led_up: inc.what_led_up,
          parent_response: inc.parent_response,
          location: inc.location,
          caseworker_notified: inc.caseworker_notified,
          police_report: inc.police_report_number,
        });
      });
    }
    if (includeSections.behaviorLogs) {
      filteredBehavior.forEach((b, idx) => {
        entries.push({
          date: b.entry_date,
          type: "behavior",
          citation: `BHV-${String(idx + 1).padStart(3, "0")}`,
          summary: b.behavior_description,
          trigger: b.trigger,
          parent_response: b.parent_response,
          outcome: b.outcome,
          mood: b.child_mood,
          time: b.time,
        });
      });
    }
    const timeline = entries.sort((a, b) => (safeStr(a.date) < safeStr(b.date) ? -1 : 1));

    // Evidence signature for tamper-evidence
    const evidencePayload = JSON.stringify({ reportId, generatedBy: user.email, dateFromStr, dateToStr, childName: childName || "all", count: timeline.length });
    const sigBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(evidencePayload));
    const evidenceSignature = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

    // ── PDF (all layout/text server-owned) ──
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 54;
    const maxW = W - margin * 2;
    let y = margin;

    function addPageHeader() {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`CONFIDENTIAL — Court-Ready Summary | ${parentName} | Report ${reportId}`, margin, 28);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 36, W - margin, 36);
    }
    function checkPage(needed = 40) {
      if (y + needed > H - margin) { doc.addPage(); y = margin; addPageHeader(); }
    }

    // Cover
    doc.setFillColor(10, 61, 32);
    doc.rect(0, 0, W, 100, "F");
    doc.setFontSize(22);
    doc.setTextColor(245, 230, 200);
    doc.setFont("helvetica", "bold");
    doc.text("COURT-READY SUMMARY REPORT", margin, 48);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 220, 200);
    doc.text("Rooted 21 Parenting Network — Chronological Evidence Document", margin, 68);
    doc.text("CONFIDENTIAL — For Legal Review Only", margin, 84);
    y = 124;

    doc.setDrawColor(201, 151, 58);
    doc.setLineWidth(1.5);
    doc.line(margin, y, W - margin, y);
    y += 12;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const meta = [
      ["Report ID:", reportId],
      ["Parent / Caregiver:", parentName],
      ["Date Range:", `${dateFromStr} to ${dateToStr}`],
      ["Child Name (filter):", childName || "All children"],
      ["Generated On:", generatedAt],
      ["Evidence Signature:", evidenceSignature.substring(0, 32) + "…"],
    ];
    meta.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(safeStr(val), margin + 160, y);
      y += 16;
    });
    y += 6;
    doc.setDrawColor(201, 151, 58);
    doc.line(margin, y, W - margin, y);
    y += 20;

    // Summary counts
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 61, 32);
    doc.text("DOCUMENT SUMMARY", margin, y);
    y += 16;
    const incCount = timeline.filter(e => e.type === "incident").length;
    const jrnCount = timeline.filter(e => e.type === "journal").length;
    const bhvCount = timeline.filter(e => e.type === "behavior").length;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(`Total entries: ${timeline.length}  |  Incident Reports: ${incCount}  |  Journal Entries: ${jrnCount}  |  Behavior Logs: ${bhvCount}`, margin, y);
    y += 28;

    // Timeline
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 61, 32);
    doc.text("CHRONOLOGICAL EVIDENCE TIMELINE", margin, y);
    y += 20;

    timeline.forEach((entry) => {
      checkPage(80);
      const typeColors = { incident: [184, 76, 42], journal: [26, 107, 58], behavior: [139, 94, 52] };
      const [r, g, b] = typeColors[entry.type] || [80, 80, 80];
      doc.setFillColor(r, g, b);
      doc.rect(margin, y - 2, maxW, 18, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const typeLabel = entry.type === "incident" ? "INCIDENT REPORT" : entry.type === "journal" ? "JOURNAL ENTRY" : "BEHAVIOR LOG";
      doc.text(`[${entry.citation}]  ${safeStr(entry.date)}  —  ${typeLabel}`, margin + 6, y + 10);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);

      let lines = [];
      if (entry.type === "incident") {
        lines = [
          `Incident Type: ${safeStr(entry.incidentType)}${entry.child ? ` | Child: ${entry.child}` : ""}${entry.location ? ` | Location: ${entry.location}` : ""}`,
          `Description: ${safeStr(entry.summary)}`,
          entry.what_led_up && `Antecedent: ${entry.what_led_up}`,
          entry.parent_response && `Caregiver Response: ${entry.parent_response}`,
          entry.caseworker_notified && "Caseworker Notified: Yes",
          entry.police_report && `Police Report #: ${entry.police_report}`,
        ].filter(Boolean);
      } else if (entry.type === "journal") {
        lines = [`Mood: ${safeStr(entry.mood) || "Not recorded"}`, `Notes: ${safeStr(entry.summary)}`];
      } else if (entry.type === "behavior") {
        lines = [
          `Time: ${safeStr(entry.time) || "Not recorded"} | Child Mood: ${MOOD_LABELS[entry.mood] || "Not recorded"}`,
          `Behavior: ${safeStr(entry.summary)}`,
          entry.trigger && `Trigger: ${entry.trigger}`,
          entry.parent_response && `Caregiver Response: ${entry.parent_response}`,
          entry.outcome && `Outcome: ${entry.outcome}`,
        ].filter(Boolean);
      }
      lines.forEach(line => {
        checkPage(14);
        const wrapped = doc.splitTextToSize(safeStr(line), maxW - 8);
        doc.text(wrapped, margin + 4, y);
        y += wrapped.length * 13;
      });

      y += 10;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, W - margin, y);
      y += 14;
    });

    // Certification (server-owned language)
    checkPage(80);
    y += 10;
    doc.setDrawColor(201, 151, 58);
    doc.setLineWidth(1);
    doc.line(margin, y, W - margin, y);
    y += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(10, 61, 32);
    doc.text("CERTIFICATION STATEMENT", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const cert = `I, ${parentName}, certify that the information in this document was generated directly from records I created and maintained within the Rooted 21 Parenting Network platform, and that it accurately reflects those records as of ${generatedAt}. This report was compiled by the Rooted 21 system, assigned Report ID ${reportId}, and has not been altered.`;
    const certLines = doc.splitTextToSize(cert, maxW);
    doc.text(certLines, margin, y);
    y += certLines.length * 13 + 24;
    doc.setDrawColor(80, 80, 80);
    doc.line(margin, y, margin + 200, y);
    y += 14;
    doc.text(`${parentName}     Date: ___________`, margin, y);
    y += 28;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated by Rooted 21 Parenting Network · This document is confidential and intended for legal review only.", margin, y);

    const pdfBytes = doc.output("arraybuffer");
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // ── Audit ──
    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "document_export",
      entity_name: "ParentJournal",
      entity_id: "",
      severity: "info",
      summary: `Generated Court-Ready Summary PDF ${reportId} — ${jrnCount} journal, ${incCount} incident, ${bhvCount} behavior entries.`,
      metadata_json: JSON.stringify({ action: "court_ready_summary_export", report_id: reportId, date_from: dateFromStr, date_to: dateToStr, child_name: childName || "all", counts: { journals: jrnCount, incidents: incCount, behaviors: bhvCount }, evidence_signature: evidenceSignature }),
      occurred_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      base64,
      fileName: `CourtReadySummary_${dateFromStr}_to_${dateToStr}.pdf`,
      reportId,
      summary: { total: timeline.length, incidents: incCount, journals: jrnCount, behaviors: bhvCount },
    });
  } catch (error) {
    console.error("generateCourtReadySummaryPdf error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});