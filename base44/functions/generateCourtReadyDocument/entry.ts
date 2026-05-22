import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

const DOCUMENT_LABELS = {
  chronology: "Chronology of Events",
  incident_report: "Incident Report",
  consistency_summary: "Parenting-Time Consistency Summary",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const {
      dateFrom,
      dateTo,
      childName = "",
      documentTypes = ["chronology", "incident_report", "consistency_summary"],
      includeToneAnalysis = true,
    } = await req.json();

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    const inRange = (value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date >= fromDate && date <= toDate;
    };
    const childMatches = (value) => !childName || String(value || "").toLowerCase() === childName.toLowerCase();

    const [journalEntries, visitationLogs] = await Promise.all([
      base44.entities.CommunicationJournalEntry.list("-entry_date", 500),
      base44.entities.VisitationLog.filter({ parent_email: user.email }, "-visit_date", 500),
    ]);

    const communications = journalEntries
      .filter(entry => inRange(entry.entry_date || entry.created_date) && childMatches(entry.child_name))
      .sort((a, b) => new Date(a.entry_date || a.created_date) - new Date(b.entry_date || b.created_date));

    const visits = visitationLogs
      .filter(log => inRange(log.visit_date || log.created_date) && childMatches(log.child_name))
      .sort((a, b) => new Date(a.visit_date || a.created_date) - new Date(b.visit_date || b.created_date));

    const incidents = visits.filter(log =>
      log.attended === false ||
      ["late_start", "ended_early", "shortened", "rescheduled", "cancelled", "no_show", "other"].includes(log.compliance_status) ||
      (log.incident_type && log.incident_type !== "none") ||
      log.concerns ||
      log.incident_notes ||
      log.logistical_challenges
    );

    const completedVisits = visits.filter(log => log.attended !== false && log.compliance_status !== "no_show" && log.compliance_status !== "cancelled").length;
    const missedVisits = visits.length - completedVisits;
    const consistencyRate = visits.length ? Math.round((completedVisits / visits.length) * 100) : 0;
    const highTone = communications.filter(entry => entry.ai_risk_level === "high").length;
    const mediumTone = communications.filter(entry => entry.ai_risk_level === "medium").length;
    const reportId = `CRDG-${Date.now().toString(36).toUpperCase()}`;
    const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "long" });

    const signaturePayload = JSON.stringify({ reportId, user: user.email, dateFrom, dateTo, childName, documentTypes, communications: communications.length, visits: visits.length, incidents: incidents.length });
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signaturePayload));
    const evidenceSignature = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 18;
    const marginRight = 18;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 18;

    const GREEN = [27, 68, 44];
    const GOLD = [180, 130, 40];
    const TEXT = [45, 39, 34];
    const MUTED = [110, 96, 84];
    const LINE = [210, 202, 190];
    const LIGHT = [248, 245, 240];
    const WARN = [170, 72, 36];

    function footer() {
      doc.setFillColor(245, 242, 236);
      doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(`Court-Ready Document Generator · Report ID ${reportId}`, marginLeft, pageHeight - 6);
      doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth - marginRight - 18, pageHeight - 6);
    }

    function header() {
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, pageWidth, 10, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("ROOTED 21 · COURT-READY DOCUMENT GENERATOR · CONFIDENTIAL", marginLeft, 6.5);
    }

    function newPage() {
      footer();
      doc.addPage();
      y = 18;
      header();
    }

    function ensure(space = 18) {
      if (y + space > pageHeight - 18) newPage();
    }

    function text(value, size = 9, color = TEXT, bold = false, indent = 0) {
      ensure(8);
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(value || ""), contentWidth - indent);
      doc.text(lines, marginLeft + indent, y);
      y += lines.length * (size * 0.45) + 3;
    }

    function meta(label, value) {
      ensure(8);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREEN);
      doc.text(`${label}:`, marginLeft, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(String(value || "N/A"), contentWidth - 44);
      doc.text(lines, marginLeft + 42, y);
      y += lines.length * 4 + 2;
    }

    function section(title) {
      ensure(18);
      y += 3;
      doc.setFillColor(...GREEN);
      doc.roundedRect(marginLeft, y - 5, contentWidth, 10, 1.5, 1.5, "F");
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(title, marginLeft + 4, y + 1.5);
      y += 11;
    }

    function line() {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.25);
      doc.line(marginLeft, y, pageWidth - marginRight, y);
      y += 4;
    }

    function formatDate(value) {
      if (!value) return "Date not recorded";
      return new Date(value).toLocaleDateString("en-US", { dateStyle: "medium" });
    }

    function addChronology() {
      section("CHRONOLOGY OF EVENTS");
      const events = [
        ...communications.map(entry => ({
          date: entry.entry_date || entry.created_date,
          type: "Communication Journal",
          title: entry.title || entry.interaction_type || "Journal entry",
          summary: entry.neutral_summary || entry.ai_summary || entry.draft_message || entry.challenge || entry.milestone || "No summary recorded.",
          risk: entry.ai_risk_level,
        })),
        ...visits.map(log => ({
          date: log.visit_date || log.created_date,
          type: "Visitation Tracker",
          title: `${log.visit_type || "visit"} with ${log.visitor_name || "visitor"}`,
          summary: `Scheduled ${log.scheduled_start_time || log.visit_time || "time not recorded"}; outcome: ${(log.compliance_status || "as_scheduled").replaceAll("_", " ")}. ${log.notes || log.incident_notes || ""}`,
          risk: log.incident_type && log.incident_type !== "none" ? "incident" : "",
        })),
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      if (!events.length) {
        text("No communication journal or visitation tracker records were found for the selected period.", 9, MUTED);
        return;
      }

      events.forEach((event, index) => {
        ensure(28);
        doc.setFillColor(...LIGHT);
        const startY = y - 2;
        doc.roundedRect(marginLeft, startY, contentWidth, 8, 1.5, 1.5, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GREEN);
        doc.text(`${index + 1}. ${formatDate(event.date)} · ${event.type}`, marginLeft + 3, y + 3);
        y += 10;
        text(event.title, 9, TEXT, true, 2);
        text(event.summary, 8.5, TEXT, false, 2);
        if (includeToneAnalysis && event.risk) text(`Flag/Status: ${String(event.risk).replaceAll("_", " ")}`, 8, event.risk === "high" ? WARN : MUTED, true, 2);
        line();
      });
    }

    function addIncidentReport() {
      section("INCIDENT REPORT");
      if (!incidents.length) {
        text("No visitation incidents, no-shows, cancellations, safety concerns, or logistical concerns were found for the selected period.", 9, MUTED);
        return;
      }

      incidents.forEach((log, index) => {
        ensure(34);
        text(`Incident ${index + 1} · ${formatDate(log.visit_date || log.created_date)}`, 10, GREEN, true);
        meta("Child", log.child_name || childName || "Not specified");
        meta("Visitor", log.visitor_name || "Not recorded");
        meta("Scheduled", `${log.scheduled_start_time || log.visit_time || "time not set"} · ${log.scheduled_duration_minutes || log.duration_minutes || "duration not set"} minutes · ${log.location || "location not set"}`);
        meta("Actual", log.attended === false ? "Not attended" : `${log.actual_start_time || "start not set"}–${log.actual_end_time || "end not set"} · ${log.actual_location || log.location || "location not set"}`);
        meta("Outcome", (log.compliance_status || "other").replaceAll("_", " "));
        if (log.incident_type && log.incident_type !== "none") meta("Incident Type", log.incident_type.replaceAll("_", " "));
        if (log.no_show_reason) meta("No-show / cancellation reason", log.no_show_reason);
        if (log.incident_notes) meta("Incident Notes", log.incident_notes);
        if (log.logistical_challenges) meta("Logistical Challenges", log.logistical_challenges);
        if (log.concerns) meta("Safety / Behavioral Concerns", log.concerns);
        line();
      });
    }

    function addConsistencySummary() {
      section("PARENTING-TIME CONSISTENCY SUMMARY");
      meta("Total scheduled/logged visits", visits.length);
      meta("Completed visits", completedVisits);
      meta("Missed, cancelled, or not completed", missedVisits);
      meta("Consistency rate", `${consistencyRate}%`);
      meta("Communication journal entries reviewed", communications.length);
      if (includeToneAnalysis) {
        meta("High-tension communication entries", highTone);
        meta("Medium-tension communication entries", mediumTone);
      }
      text("Summary Statement", 10, GREEN, true);
      text(`For the selected period, the records show ${visits.length} visitation tracker entries and ${communications.length} communication journal entries. Visitation consistency is calculated as completed visits divided by all logged visits. Communication tone flags reflect AI-assisted categorization saved in the journal and should be reviewed by the user before submission.`, 9);

      const grouped = visits.reduce((acc, log) => {
        const key = (log.compliance_status || "as_scheduled").replaceAll("_", " ");
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      Object.entries(grouped).forEach(([status, count]) => meta(status, count));
    }

    header();
    doc.setFillColor(...GREEN);
    doc.roundedRect(marginLeft, y + 4, contentWidth, 28, 3, 3, "F");
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("COURT-READY DOCUMENT PACKET", pageWidth / 2, y + 16, { align: "center" });
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("Chronologies · Incident Reports · Parenting-Time Consistency Summaries", pageWidth / 2, y + 24, { align: "center" });
    y += 42;

    meta("Report ID", reportId);
    meta("Generated By", `${user.full_name || "User"} (${user.email})`);
    meta("Generated At", generatedAt);
    meta("Reporting Period", `${formatDate(dateFrom)} through ${formatDate(dateTo)}`);
    meta("Child Subject", childName || "All children in available records");
    meta("Included Document Types", documentTypes.map(type => DOCUMENT_LABELS[type] || type).join(", "));
    meta("Evidence Signature", evidenceSignature);
    y += 4;

    text("Certification Statement", 10, GREEN, true);
    text("This packet was generated from records stored in the Rooted 21 platform. It is organized in a standardized court-ready format for review by the user, attorney, court personnel, or child welfare professionals. The user should review for accuracy before submission. This tool does not provide legal advice.", 9);
    y += 6;
    doc.setDrawColor(...LINE);
    doc.line(marginLeft, y, marginLeft + 80, y);
    doc.line(marginLeft + 100, y, pageWidth - marginRight, y);
    y += 5;
    text("Signature of Parent/Caregiver                                      Date", 8, MUTED);

    if (documentTypes.includes("chronology")) { newPage(); addChronology(); }
    if (documentTypes.includes("incident_report")) { newPage(); addIncidentReport(); }
    if (documentTypes.includes("consistency_summary")) { newPage(); addConsistencySummary(); }

    newPage();
    section("CLOSING NOTICE");
    text("Confidentiality Notice", 10, GREEN, true);
    text("This document may contain confidential information about a minor child, family members, and court or child welfare matters. Share only with authorized parties.", 9);
    text("Data Integrity Notice", 10, GREEN, true);
    text(`Report ID ${reportId} was generated from ${communications.length} communication journal entries and ${visits.length} visitation tracker entries. Evidence signature: ${evidenceSignature}`, 8.5);
    footer();

    const pdfBytes = new Uint8Array(doc.output("arraybuffer"));
    let binary = "";
    for (let i = 0; i < pdfBytes.length; i += 8192) {
      binary += String.fromCharCode(...pdfBytes.slice(i, i + 8192));
    }

    return Response.json({
      success: true,
      base64: btoa(binary),
      fileName: `Court-Ready-Document-Packet-${childName || "Family"}-${dateFrom}-to-${dateTo}.pdf`,
      reportId,
      summary: {
        communications: communications.length,
        visitationLogs: visits.length,
        incidents: incidents.length,
        consistencyRate,
      },
    });
  } catch (error) {
    console.error("Court-ready document generation failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});