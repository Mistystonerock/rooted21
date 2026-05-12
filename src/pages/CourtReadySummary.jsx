import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { FileText, Download, Loader2, AlertCircle, Check } from "lucide-react";
import jsPDF from "jspdf";

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

export default function CourtReadySummary() {
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [config, setConfig] = useState({
    child_name: "",
    date_from: (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split("T")[0]; })(),
    date_to: new Date().toISOString().split("T")[0],
    include_journals: true,
    include_incidents: true,
    include_behavior_logs: true,
    parent_name: "",
    case_number: "",
    prepared_for: "",
  });

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setConfig(c => ({ ...c, parent_name: u.full_name || "" }));
      const [j, inc, bl] = await Promise.all([
        base44.entities.ParentJournal.list("-entry_date", 500),
        base44.entities.IncidentReport.filter({ parent_email: u.email }, "-incident_date", 500),
        base44.entities.BehaviorLog.list("-entry_date", 500),
      ]);
      setJournals(j);
      setIncidents(inc);
      setBehaviorLogs(bl);
      setLoading(false);
    });
  }, []);

  function filterByDateRange(items, dateField) {
    return items.filter(item => {
      const d = item[dateField];
      return d >= config.date_from && d <= config.date_to;
    });
  }

  function getFilteredData() {
    const filteredJournals = filterByDateRange(journals, "entry_date");
    const filteredIncidents = filterByDateRange(incidents, "incident_date");
    const filteredBehavior = filterByDateRange(behaviorLogs, "entry_date");
    return { filteredJournals, filteredIncidents, filteredBehavior };
  }

  const { filteredJournals, filteredIncidents, filteredBehavior } = getFilteredData();

  function buildChronologicalTimeline() {
    const entries = [];

    if (config.include_journals) {
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

    if (config.include_incidents) {
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

    if (config.include_behavior_logs) {
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

    return entries.sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  function generatePDF() {
    setGenerating(true);
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 54;
    const maxW = W - margin * 2;
    let y = margin;

    function checkPage(needed = 40) {
      if (y + needed > H - margin) {
        doc.addPage();
        y = margin;
        addPageHeader();
      }
    }

    function addPageHeader() {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`CONFIDENTIAL — Court-Ready Summary | ${config.parent_name} | Case: ${config.case_number || "N/A"} | Generated ${new Date().toLocaleDateString()}`, margin, 28);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 36, W - margin, 36);
    }

    // Cover Header
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
    doc.text(`CONFIDENTIAL — For Legal Review Only`, margin, 84);
    y = 124;

    // Metadata block
    doc.setDrawColor(201, 151, 58);
    doc.setLineWidth(1.5);
    doc.line(margin, y, W - margin, y);
    y += 12;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    const meta = [
      ["Parent / Caregiver:", config.parent_name || "Not specified"],
      ["Date Range:", `${config.date_from} to ${config.date_to}`],
      ["Case Number:", config.case_number || "Not provided"],
      ["Prepared For:", config.prepared_for || "Not specified"],
      ["Generated On:", new Date().toLocaleString()],
      ["Child Name (filter):", config.child_name || "All children"],
    ];
    meta.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(val, margin + 160, y);
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
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const timeline = buildChronologicalTimeline();
    const incCount = timeline.filter(e => e.type === "incident").length;
    const jrnCount = timeline.filter(e => e.type === "journal").length;
    const bhvCount = timeline.filter(e => e.type === "behavior").length;
    doc.text(`Total entries: ${timeline.length}  |  Incident Reports: ${incCount}  |  Journal Entries: ${jrnCount}  |  Behavior Logs: ${bhvCount}`, margin, y);
    y += 28;

    // Timeline
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 61, 32);
    doc.text("CHRONOLOGICAL EVIDENCE TIMELINE", margin, y);
    y += 20;

    timeline.forEach((entry, i) => {
      checkPage(80);

      // Entry header bar
      const typeColors = { incident: [184, 76, 42], journal: [26, 107, 58], behavior: [139, 94, 52] };
      const [r, g, b] = typeColors[entry.type] || [80, 80, 80];
      doc.setFillColor(r, g, b);
      doc.rect(margin, y - 2, maxW, 18, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const typeLabel = entry.type === "incident" ? "⚠ INCIDENT REPORT" : entry.type === "journal" ? "📓 JOURNAL ENTRY" : "📋 BEHAVIOR LOG";
      doc.text(`[${entry.citation}]  ${entry.date}  —  ${typeLabel}`, margin + 6, y + 10);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);

      if (entry.type === "incident") {
        const lines = [
          `Incident Type: ${entry.incidentType}${entry.child ? ` | Child: ${entry.child}` : ""}${entry.location ? ` | Location: ${entry.location}` : ""}`,
          `Description: ${entry.summary}`,
          entry.what_led_up && `Antecedent: ${entry.what_led_up}`,
          entry.parent_response && `Caregiver Response: ${entry.parent_response}`,
          entry.caseworker_notified && `Caseworker Notified: Yes`,
          entry.police_report && `Police Report #: ${entry.police_report}`,
        ].filter(Boolean);
        lines.forEach(line => {
          checkPage(14);
          const wrapped = doc.splitTextToSize(line, maxW - 8);
          doc.text(wrapped, margin + 4, y);
          y += wrapped.length * 13;
        });
      } else if (entry.type === "journal") {
        const lines = [
          `Mood: ${entry.mood || "Not recorded"}`,
          `Notes: ${entry.summary}`,
        ];
        lines.forEach(line => {
          checkPage(14);
          const wrapped = doc.splitTextToSize(line, maxW - 8);
          doc.text(wrapped, margin + 4, y);
          y += wrapped.length * 13;
        });
      } else if (entry.type === "behavior") {
        const lines = [
          `Time: ${entry.time || "Not recorded"} | Child Mood: ${MOOD_LABELS[entry.mood] || "Not recorded"}`,
          `Behavior: ${entry.summary}`,
          entry.trigger && `Trigger: ${entry.trigger}`,
          entry.parent_response && `Caregiver Response: ${entry.parent_response}`,
          entry.outcome && `Outcome: ${entry.outcome}`,
        ].filter(Boolean);
        lines.forEach(line => {
          checkPage(14);
          const wrapped = doc.splitTextToSize(line, maxW - 8);
          doc.text(wrapped, margin + 4, y);
          y += wrapped.length * 13;
        });
      }

      y += 10;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, W - margin, y);
      y += 14;
    });

    // Footer / signature block
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
    const cert = `I, ${config.parent_name || "the undersigned"}, certify that the information in this document was recorded contemporaneously with the events described, to the best of my knowledge and belief. All entries were generated through the Rooted 21 Parenting Network platform and represent an accurate record of documented observations.`;
    const certLines = doc.splitTextToSize(cert, maxW);
    doc.text(certLines, margin, y);
    y += certLines.length * 13 + 24;
    doc.setDrawColor(80, 80, 80);
    doc.line(margin, y, margin + 200, y);
    y += 14;
    doc.text(`${config.parent_name || "_______________________"}     Date: ___________`, margin, y);
    y += 28;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated by Rooted 21 Parenting Network · rooted21.com · This document is confidential and intended for legal review only.", margin, y);

    doc.save(`CourtReadySummary_${config.date_from}_to_${config.date_to}.pdf`);
    setGenerating(false);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 4000);
  }

  const timeline = getFilteredData();
  const totalEntries = (config.include_journals ? filteredJournals.filter(j => j.wins_of_day || j.regulation_reflection || j.what_i_learned).length : 0) +
    (config.include_incidents ? filteredIncidents.length : 0) +
    (config.include_behavior_logs ? filteredBehavior.length : 0);

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${C.cream}`,
    borderRadius: 8,
    padding: "9px 12px",
    color: C.cream,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="⚖️ Court-Ready Summary" subtitle="Chronological evidence PDF" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* Intro */}
        <div style={{ background: C.darkGreen, borderRadius: 16, padding: 18 }}>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Legal-Grade Evidence Document</p>
          <p style={{ fontSize: 12, color: C.mutedText, marginTop: 6, lineHeight: 1.6 }}>
            Pulls journal entries, incident reports, and behavior logs into a chronological PDF with citation codes (JRN-, INC-, BHV-) formatted for court, CPS, or legal review.
          </p>
        </div>

        {/* Config */}
        <div style={{ background: C.darkGreen, borderRadius: 16, padding: 18, border: `1.5px solid rgba(201,151,58,0.3)` }}>
          <p style={{ fontWeight: 800, fontSize: 13, color: C.cream, marginBottom: 14 }}>📋 Report Settings</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>From Date</label>
              <input type="date" value={config.date_from} onChange={e => setConfig(c => ({ ...c, date_from: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>To Date</label>
              <input type="date" value={config.date_to} onChange={e => setConfig(c => ({ ...c, date_to: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Child Name (optional filter)</label>
            <input value={config.child_name} onChange={e => setConfig(c => ({ ...c, child_name: e.target.value }))}
              placeholder="Leave blank for all children" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Your Full Name</label>
              <input value={config.parent_name} onChange={e => setConfig(c => ({ ...c, parent_name: e.target.value }))}
                placeholder="For signature block" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Case Number</label>
              <input value={config.case_number} onChange={e => setConfig(c => ({ ...c, case_number: e.target.value }))}
                placeholder="Optional" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Prepared For</label>
            <input value={config.prepared_for} onChange={e => setConfig(c => ({ ...c, prepared_for: e.target.value }))}
              placeholder="e.g. Judge Smith, CPS Supervisor Jones..." style={inputStyle} />
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, color: C.mutedText, marginBottom: 8 }}>INCLUDE IN REPORT:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { key: "include_journals", label: "📓 Journal Entries", count: filteredJournals.filter(j => j.wins_of_day || j.regulation_reflection).length },
              { key: "include_incidents", label: "⚠️ Incident Reports", count: filteredIncidents.length },
              { key: "include_behavior_logs", label: "📋 Behavior Logs", count: filteredBehavior.length },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setConfig(c => ({ ...c, [key]: !c[key] }))}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                  background: config[key] ? "rgba(26,107,58,0.3)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${config[key] ? C.midGreen : "rgba(255,255,255,0.15)"}` }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.cream }}>{label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.mutedText }}>{count} entries</span>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: config[key] ? C.midGreen : "transparent",
                    border: `2px solid ${config[key] ? C.midGreen : C.mutedText}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {config[key] && <Check size={12} color="#fff" />}
                  </div>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview count */}
        <div style={{ background: "rgba(201,151,58,0.1)", border: `1.5px solid ${C.gold}`, borderRadius: 14, padding: "14px 18px" }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: C.gold }}>{totalEntries} entries will be included</p>
          <p style={{ fontSize: 11, color: C.mutedText, marginTop: 4 }}>
            {filteredIncidents.length} incidents · {filteredJournals.filter(j => j.wins_of_day || j.regulation_reflection).length} journal entries · {filteredBehavior.length} behavior logs — sorted chronologically with citation codes
          </p>
        </div>

        {totalEntries === 0 && (
          <div style={{ background: "rgba(184,76,42,0.1)", border: "1px solid #B84C2A", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <AlertCircle size={16} color="#B84C2A" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#F08060" }}>No entries found for this date range and selection. Try widening the date range.</p>
          </div>
        )}

        <button
          onClick={generatePDF}
          disabled={generating || totalEntries === 0}
          style={{
            width: "100%", padding: 16, borderRadius: 14, fontWeight: 800, fontSize: 14, cursor: generating || totalEntries === 0 ? "default" : "pointer",
            background: generated ? C.midGreen : (generating || totalEntries === 0 ? "rgba(201,151,58,0.3)" : C.gold),
            color: generated ? "#fff" : C.darkGreen, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.2s",
          }}
        >
          {generating ? (
            <><Loader2 size={16} className="animate-spin" /> Building PDF...</>
          ) : generated ? (
            <><Check size={16} /> PDF Downloaded!</>
          ) : (
            <><Download size={16} /> Generate Court-Ready PDF</>
          )}
        </button>

        <div style={{ background: C.darkGreen, borderRadius: 14, padding: "14px 18px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 6 }}>📌 What's in the PDF?</p>
          <ul style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.8, paddingLeft: 0, listStyle: "none" }}>
            <li>• Cover page with parent info, case number & date range</li>
            <li>• Every entry sorted chronologically with citation codes</li>
            <li>• Color-coded by type: Incidents (red), Journals (green), Behavior (brown)</li>
            <li>• Certification / signature block at the end</li>
            <li>• Running header on every page with case number</li>
          </ul>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}