import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Download, Loader2, Shield, FileText, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";

const SECTIONS = [
  { icon: "👤", label: "Child Profile & Background" },
  { icon: "📋", label: "Behavior Incident Logs" },
  { icon: "📈", label: "Daily Regulation Check-ins" },
  { icon: "🎯", label: "Family Goals & Progress" },
  { icon: "📝", label: "Case Notes & Therapy Records" },
  { icon: "📅", label: "Appointments & Calendar Events" },
  { icon: "✅", label: "Case Tasks & Action Items" },
  { icon: "⚖️", label: "Certification & Declaration" },
];

export default function CourtReadyExport() {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [declared, setDeclared] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.ChildProfile.list("-created_date", 10).then(c => {
        setChildren(c);
        if (c.length > 0) setSelectedChild(c[0].first_name);
      });
    });
  }, []);

  async function handleGenerate() {
    if (!declared) return;
    setGenerating(true);
    setError(null);
    setResult(null);

    const response = await base44.functions.invoke("generateCourtReadyReport", {
      dateFrom,
      dateTo,
      childName: selectedChild,
    });

    if (response.data?.success && response.data?.base64) {
      const { base64, fileName, reportId, summary } = response.data;
      // Decode base64 and trigger download
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
      setResult({ reportId, summary, fileName });
    } else {
      setError(response.data?.error || "Failed to generate report. Please try again.");
    }
    setGenerating(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Court-Ready Export" subtitle="Formal legal documentation" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <Shield size={22} color="#fff" />
            </div>
            <div>
              <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Court-Ready Documentation</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>CPS & Legal Proceedings</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            Generates a consolidated, multi-section PDF with a certified declaration header, timestamped entries, and all required metadata for court or CPS submissions.
          </p>
        </div>

        {/* Legal warning */}
        <div className="rounded-xl p-3.5 flex gap-3"
          style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <AlertTriangle size={15} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
            This report is for legal use. Consult your attorney before submitting to court or CPS. All records are pulled directly from your account and timestamped at generation.
          </p>
        </div>

        {/* Date range */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} color={C.midGreen} />
            <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>REPORTING PERIOD</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold mb-1.5" style={{ color: C.mutedText }}>FROM DATE</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>
            <div>
              <label className="block text-[9px] font-bold mb-1.5" style={{ color: C.mutedText }}>TO DATE</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl px-3 py-2.5 text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>
          </div>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <label className="block text-[9px] font-bold mb-1.5" style={{ color: C.mutedText }}>CHILD SUBJECT</label>
            <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}>
              {children.map(c => (
                <option key={c.id} value={c.first_name}>{c.first_name}{c.last_name ? " " + c.last_name : ""}</option>
              ))}
            </select>
          </div>
        )}

        {/* What's included */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-extrabold tracking-wider mb-3" style={{ color: C.mutedText }}>
            REPORT SECTIONS INCLUDED
          </p>
          <div className="space-y-1.5">
            {SECTIONS.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span style={{ fontSize: 13 }}>{s.icon}</span>
                <p className="text-xs" style={{ color: C.darkGreen }}>{s.label}</p>
                <CheckCircle2 size={12} color={C.midGreen} className="ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Declaration checkbox */}
        <div className="rounded-2xl p-4" style={{ background: "#F0F7F2", border: `1.5px solid ${C.midGreen}` }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={declared}
              onChange={e => setDeclared(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
              style={{ accentColor: C.darkGreen, width: 16, height: 16 }}
            />
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
              I, <strong>{user?.full_name || "the undersigned"}</strong>, declare under penalty of perjury that the records in this report are true and accurate to the best of my knowledge, and I am authorized to generate this document. I understand this report is intended for use in legal or child welfare proceedings.
            </p>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-3.5 flex gap-2"
            style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
            <AlertTriangle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} color={C.midGreen} />
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Report Generated Successfully</p>
            </div>
            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Report ID: {result.reportId}</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.entries(result.summary).map(([key, val]) => (
                <div key={key} className="text-center rounded-xl p-2" style={{ background: C.white }}>
                  <p className="text-base font-extrabold" style={{ color: C.darkGreen }}>{val}</p>
                  <p className="text-[9px]" style={{ color: C.mutedText }}>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !declared || !user}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: declared ? C.darkGreen : C.mutedText,
            color: "#fff",
            border: "none",
            cursor: declared && !generating ? "pointer" : "not-allowed",
            opacity: generating ? 0.75 : 1,
          }}
        >
          {generating ? (
            <><Loader2 size={17} className="animate-spin" /> Building Court-Ready PDF…</>
          ) : (
            <><FileText size={17} /> Generate & Download Report</>
          )}
        </button>

        {!declared && (
          <p className="text-center text-[11px]" style={{ color: C.mutedText }}>
            Please check the declaration box above to enable export.
          </p>
        )}

        {/* Footer note */}
        <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
          <p className="text-[11px] leading-relaxed text-center" style={{ color: C.mutedText }}>
            Each report receives a unique Report ID and is timestamped at generation. Keep your downloaded copy in a secure location. Rooted 21 does not retain exported PDFs.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}