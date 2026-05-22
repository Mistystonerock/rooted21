import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import DocumentTypeSelector from "@/components/court-ready-generator/DocumentTypeSelector";
import GeneratorStats from "@/components/court-ready-generator/GeneratorStats";
import GeneratorResult from "@/components/court-ready-generator/GeneratorResult";
import { C } from "@/lib/rooted-constants";
import { AlertTriangle, Download, FileText, Loader2, Scale } from "lucide-react";

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

function inRange(value, from, to) {
  const date = new Date(value);
  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);
  return !Number.isNaN(date.getTime()) && date >= fromDate && date <= toDate;
}

export default function CourtReadyDocumentGenerator() {
  const [loading, setLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState([]);
  const [visitationLogs, setVisitationLogs] = useState([]);
  const [dateFrom, setDateFrom] = useState(() => daysAgo(90));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [childName, setChildName] = useState("");
  const [documentTypes, setDocumentTypes] = useState(["chronology", "incident_report", "consistency_summary"]);
  const [includeToneAnalysis, setIncludeToneAnalysis] = useState(true);
  const [declared, setDeclared] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { loadRecords(); }, []);

  async function loadRecords() {
    setLoading(true);
    const user = await base44.auth.me();
    const [communications, visits] = await Promise.all([
      base44.entities.CommunicationJournalEntry.list("-entry_date", 500),
      base44.entities.VisitationLog.filter({ parent_email: user.email }, "-visit_date", 500),
    ]);
    setJournalEntries(communications);
    setVisitationLogs(visits);
    setLoading(false);
  }

  const childOptions = useMemo(() => {
    const names = new Set();
    journalEntries.forEach(entry => entry.child_name && names.add(entry.child_name));
    visitationLogs.forEach(log => log.child_name && names.add(log.child_name));
    return Array.from(names).sort();
  }, [journalEntries, visitationLogs]);

  const stats = useMemo(() => {
    const communications = journalEntries.filter(entry => inRange(entry.entry_date || entry.created_date, dateFrom, dateTo) && (!childName || entry.child_name === childName));
    const visits = visitationLogs.filter(log => inRange(log.visit_date || log.created_date, dateFrom, dateTo) && (!childName || log.child_name === childName));
    const incidents = visits.filter(log => log.attended === false || log.compliance_status !== "as_scheduled" || (log.incident_type && log.incident_type !== "none") || log.concerns || log.incident_notes).length;
    return { communications: communications.length, visits: visits.length, incidents, children: childOptions.length };
  }, [journalEntries, visitationLogs, dateFrom, dateTo, childName, childOptions.length]);

  function toggleDocumentType(key) {
    setDocumentTypes(prev => prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]);
  }

  async function handleGenerate() {
    if (!declared || documentTypes.length === 0) return;
    setGenerating(true);
    setError("");
    setResult(null);

    const response = await base44.functions.invoke("generateCourtReadyDocument", {
      dateFrom,
      dateTo,
      childName,
      documentTypes,
      includeToneAnalysis,
    });

    if (response.data?.success && response.data?.base64) {
      const byteChars = atob(response.data.base64);
      const byteArray = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i += 1) byteArray[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = response.data.fileName;
      link.click();
      URL.revokeObjectURL(url);
      setResult({ reportId: response.data.reportId, summary: response.data.summary });
    } else {
      setError(response.data?.error || "The PDF could not be generated. Please try again.");
    }
    setGenerating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Court-Ready Generator" backTo="/dashboard" />
        <div className="flex justify-center py-12"><Loader2 className="animate-spin" color={C.darkGreen} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Court-Ready Generator" subtitle="Journal + visitation PDF packets" backTo="/dashboard" />
      <main className="mx-auto max-w-[620px] space-y-4 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.14)" }}>
              <Scale size={23} color={C.cream} />
            </div>
            <div>
              <p className="font-serif text-xl font-black" style={{ color: C.cream }}>Court-Ready Document Generator</p>
              <p className="mt-1 text-xs leading-5" style={{ color: C.lightGreen }}>Draft chronologies, incident reports, and consistency summaries from your saved records.</p>
            </div>
          </div>
        </section>

        <GeneratorStats stats={stats} />

        <section className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
          <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>Report criteria</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold" style={{ color: C.mutedText }}>From</span>
              <input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs" style={{ borderColor: C.cream, background: C.offWhite }} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold" style={{ color: C.mutedText }}>To</span>
              <input type="date" value={dateTo} max={new Date().toISOString().split("T")[0]} onChange={event => setDateTo(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs" style={{ borderColor: C.cream, background: C.offWhite }} />
            </label>
          </div>
          <label className="mt-3 block">
            <span className="mb-1 block text-[10px] font-bold" style={{ color: C.mutedText }}>Child</span>
            <select value={childName} onChange={event => setChildName(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream, background: C.offWhite }}>
              <option value="">All children</option>
              {childOptions.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
        </section>

        <DocumentTypeSelector selected={documentTypes} onToggle={toggleDocumentType} />

        <section className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={includeToneAnalysis} onChange={event => setIncludeToneAnalysis(event.target.checked)} className="mt-1" style={{ accentColor: C.darkGreen }} />
            <span className="text-xs leading-5" style={{ color: C.darkGreen }}>Include saved AI tone flags from Communication Journal where available.</span>
          </label>
          <label className="mt-3 flex items-start gap-3 rounded-2xl p-3" style={{ background: "#F0F7F2" }}>
            <input type="checkbox" checked={declared} onChange={event => setDeclared(event.target.checked)} className="mt-1" style={{ accentColor: C.darkGreen }} />
            <span className="text-xs leading-5" style={{ color: C.darkGreen }}>I confirm these records are accurate to the best of my knowledge and understand this tool does not provide legal advice.</span>
          </label>
        </section>

        {error && (
          <section className="flex gap-2 rounded-2xl border p-3" style={{ background: "#FEF3EE", borderColor: "#F4C9B8" }}>
            <AlertTriangle size={15} color="#B84C2A" />
            <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
          </section>
        )}

        <GeneratorResult result={result} />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !declared || documentTypes.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black shadow-sm"
          style={{ background: declared && documentTypes.length ? C.darkGreen : C.mutedText, color: "#fff", border: "none", opacity: generating ? 0.75 : 1 }}
        >
          {generating ? <><Loader2 size={17} className="animate-spin" /> Generating PDF…</> : <><Download size={17} /> Download Court-Ready PDF</>}
        </button>

        <section className="rounded-2xl p-3 text-center text-[11px] leading-5" style={{ background: C.cream, color: C.mutedText }}>
          <FileText size={14} className="mx-auto mb-1" /> Each PDF includes a report ID, timestamp, certification statement, and evidence signature for review.
        </section>
      </main>
    </div>
  );
}