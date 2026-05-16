import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import ExportResultCard from "./ExportResultCard";

const RECIPIENTS = ["attorney", "gal_casa", "caseworker", "court", "ombudsman", "other"];
const EXPORT_TYPES = [
  ["combined_packet", "Messages + documents"],
  ["communication_thread", "Thread only"],
  ["case_documents", "Documents only"],
];

function today() {
  return new Date().toISOString().split("T")[0];
}

function ninetyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().split("T")[0];
}

function downloadPdf(base64, fileName) {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([arr], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CertifiedExportBuilder() {
  const [user, setUser] = useState(null);
  const [secureMessages, setSecureMessages] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [exportType, setExportType] = useState("combined_packet");
  const [recipientType, setRecipientType] = useState("attorney");
  const [purpose, setPurpose] = useState("Legal/GAL/CASA review");
  const [dateFrom, setDateFrom] = useState(ninetyDaysAgo());
  const [dateTo, setDateTo] = useState(today());
  const [secureThreadKey, setSecureThreadKey] = useState("");
  const [coparentingPartnershipId, setCoparentingPartnershipId] = useState("");
  const [documentIds, setDocumentIds] = useState([]);
  const [declared, setDeclared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const [msgs, parts, docs] = await Promise.all([
        base44.entities.SecureMessage.list("-created_date", 500),
        base44.entities.CoParentingPartnership.list("-created_date", 100),
        base44.entities.SecureDocument.list("-created_date", 200),
      ]);
      setSecureMessages(msgs);
      setPartnerships(parts);
      setDocuments(docs);
      setLoading(false);
    }
    load();
  }, []);

  const secureThreads = useMemo(() => {
    const map = new Map();
    secureMessages.forEach(msg => {
      if (!msg.family_email || !msg.professional_email) return;
      const key = `${msg.family_email}::${msg.professional_email}`;
      if (!map.has(key)) map.set(key, { key, label: `${msg.family_email} ↔ ${msg.professional_email}`, count: 0 });
      map.get(key).count += 1;
    });
    return Array.from(map.values());
  }, [secureMessages]);

  function toggleDocument(id) {
    setDocumentIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  }

  async function generate() {
    if (!declared) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    const response = await base44.functions.invoke("generateCertifiedLegalExport", {
      exportType,
      recipientType,
      purpose,
      dateFrom,
      dateTo,
      secureThreadKey,
      coparentingPartnershipId,
      documentIds,
      includeCertification: true,
    });
    if (response.data?.success) {
      downloadPdf(response.data.base64, response.data.fileName);
      setResult(response.data);
    } else {
      setError(response.data?.error || "Could not generate the certified export.");
    }
    setGenerating(false);
  }

  if (loading) {
    return <div className="rounded-2xl p-4 text-sm" style={{ background: C.white, color: C.mutedText }}>Loading export options…</div>;
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>Build certified export packet</p>
        <div className="grid gap-2">
          <label className="text-[10px] font-black uppercase" style={{ color: C.mutedText }}>Export scope</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {EXPORT_TYPES.map(([value, label]) => (
              <button key={value} onClick={() => setExportType(value)} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: exportType === value ? C.darkGreen : C.offWhite, color: exportType === value ? C.white : C.darkGreen, border: `1px solid ${C.cream}` }}>{label}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] font-black uppercase" style={{ color: C.mutedText }}>From<input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 text-xs" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} /></label>
          <label className="text-[10px] font-black uppercase" style={{ color: C.mutedText }}>To<input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 text-xs" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} /></label>
        </div>
        <label className="text-[10px] font-black uppercase" style={{ color: C.mutedText }}>Recipient type<select value={recipientType} onChange={e => setRecipientType(e.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>{RECIPIENTS.map(item => <option key={item} value={item}>{item.replace(/_/g, " ")}</option>)}</select></label>
        <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={2} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} placeholder="Purpose for export" />
      </div>

      {exportType !== "case_documents" && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-sm font-black" style={{ color: C.darkGreen }}>Select communication thread</p>
          <select value={secureThreadKey} onChange={e => setSecureThreadKey(e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <option value="">No secure professional thread</option>
            {secureThreads.map(thread => <option key={thread.key} value={thread.key}>{thread.label} · {thread.count} messages</option>)}
          </select>
          <select value={coparentingPartnershipId} onChange={e => setCoparentingPartnershipId(e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <option value="">No co-parenting thread</option>
            {partnerships.map(p => <option key={p.id} value={p.id}>{p.child_name || "Co-parenting thread"} · {p.parent_1_email || "parent 1"} / {p.parent_2_email || "parent 2"}</option>)}
          </select>
        </div>
      )}

      {exportType !== "communication_thread" && (
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-sm font-black" style={{ color: C.darkGreen }}>Select case documents</p>
          <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
            {documents.length === 0 ? <p className="text-xs" style={{ color: C.mutedText }}>No secure documents found.</p> : documents.map(doc => (
              <label key={doc.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <input type="checkbox" checked={documentIds.includes(doc.id)} onChange={() => toggleDocument(doc.id)} className="mt-1" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black" style={{ color: C.darkGreen }}>{doc.title || doc.file_name || "Untitled document"}</span>
                  <span className="block text-[11px]" style={{ color: C.mutedText }}>{doc.category || "other"}{doc.child_name ? ` · ${doc.child_name}` : ""}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-4" style={{ background: "#F0F7F2", border: `1.5px solid ${C.midGreen}` }}>
        <label className="flex items-start gap-3 text-xs leading-relaxed" style={{ color: C.darkGreen }}>
          <input type="checkbox" checked={declared} onChange={e => setDeclared(e.target.checked)} className="mt-1" />
          I understand this export may contain confidential juvenile dependency information, and I am generating it only for authorized legal, GAL/CASA, court, caseworker, ombudsman, or professional review.
        </label>
      </div>

      {error && <div className="flex gap-2 rounded-xl p-3 text-xs" style={{ background: "#FEF3EE", color: "#B84C2A", border: "1px solid #F4C9B8" }}><AlertTriangle size={14} />{error}</div>}
      <ExportResultCard result={result} />

      <button onClick={generate} disabled={!declared || generating || !user} className="w-full rounded-2xl py-4 text-sm font-black" style={{ background: declared ? C.darkGreen : C.mutedText, color: C.white, border: "none", opacity: generating ? 0.75 : 1 }}>
        {generating ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Generating certified packet…</span> : <span className="inline-flex items-center gap-2"><Download size={16} /> Generate Certified Legal Export</span>}
      </button>
    </section>
  );
}