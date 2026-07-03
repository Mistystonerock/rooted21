import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { FileText, Download, Loader2, AlertCircle, Check } from "lucide-react";

export default function CourtReadySummary() {
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState(null);
  const [reportId, setReportId] = useState(null);

  const [config, setConfig] = useState({
    child_name: "",
    date_from: (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split("T")[0]; })(),
    date_to: new Date().toISOString().split("T")[0],
    include_journals: true,
    include_incidents: true,
    include_behavior_logs: true,
  });

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
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

  async function generatePDF() {
    setGenerating(true);
    setError(null);
    setReportId(null);
    try {
      // Server owns identity, report ID, timestamps, certification language,
      // and builds the chronology from trusted records. Client sends filters only.
      const response = await base44.functions.invoke("generateCourtReadySummaryPdf", {
        dateFrom: config.date_from,
        dateTo: config.date_to,
        childName: config.child_name,
        includeSections: {
          journals: config.include_journals,
          incidents: config.include_incidents,
          behaviorLogs: config.include_behavior_logs,
        },
      });
      if (response.data?.success && response.data?.base64) {
        const { base64, fileName } = response.data;
        const byteChars = atob(base64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArr], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        setReportId(response.data.reportId);
        setGenerated(true);
        setTimeout(() => setGenerated(false), 4000);
      } else {
        setError(response.data?.error || "Failed to generate report. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
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

          <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(201,151,58,0.25)` }}>
            <p style={{ fontSize: 11, color: C.cream, fontWeight: 700 }}>Prepared for: {user?.full_name || "you"}</p>
            <p style={{ fontSize: 10, color: C.mutedText, marginTop: 3, lineHeight: 1.5 }}>
              Your name, the report ID, timestamps, and certification statement are generated securely by Rooted 21 and cannot be edited.
            </p>
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

        {error && (
          <div style={{ background: "rgba(184,76,42,0.1)", border: "1px solid #B84C2A", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <AlertCircle size={16} color="#B84C2A" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#F08060" }}>{error}</p>
          </div>
        )}

        {reportId && (
          <div style={{ background: "rgba(26,107,58,0.15)", border: `1px solid ${C.midGreen}`, borderRadius: 12, padding: "12px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.midGreen }}>Report generated — ID: {reportId}</p>
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
            <li>• Cover page with your verified name, server report ID & date range</li>
            <li>• Every entry sorted chronologically with citation codes</li>
            <li>• Color-coded by type: Incidents (red), Journals (green), Behavior (brown)</li>
            <li>• System-generated certification statement & signature line</li>
            <li>• Running header on every page with the report ID</li>
          </ul>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}