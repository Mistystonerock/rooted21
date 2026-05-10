import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Download, Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function ComprehensiveCaseReport() {
  const { caseId } = useParams();
  const [caseFile, setCaseFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sections, setSections] = useState({
    behaviorLogs: true,
    compliance: true,
    notes: true,
    timeline: true,
  });
  const [includeSignatures, setIncludeSignatures] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.CaseFile.filter({ id: caseId }),
    ]).then(([u, cases]) => {
      setUser(u);
      if (cases.length > 0) setCaseFile(cases[0]);
      setLoading(false);
    });
  }, [caseId]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResult(null);

    const response = await base44.functions.invoke("generateComprehensiveCaseSummary", {
      caseId,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      sections: Object.keys(sections).filter(k => sections[k]),
      includeSignatures,
    });

    if (response.data?.success && response.data?.base64) {
      const { base64, fileName, summary } = response.data;
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
      setResult({ summary, fileName });
    } else {
      setError(response.data?.error || "Failed to generate report");
    }
    setGenerating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Case Report Generator" backTo="/case-management" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!caseFile) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Case Report Generator" backTo="/case-management" />
        <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Case not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="📋 Comprehensive Case Report"
        subtitle={caseFile.child_name}
        backTo="/case-management"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Info banner */}
        <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#EEF4FF", border: `1.5px solid #B0C8F0` }}>
          <FileText size={18} color="#4A6FA5" className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold" style={{ color: "#4A6FA5" }}>Court-Admissible Report</p>
            <p className="text-[10px] mt-1" style={{ color: "#3a3028" }}>
              Generate multi-page PDFs merging behavioral logs, compliance tracking, case notes, and timeline events.
            </p>
          </div>
        </div>

        {/* Date range */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>REPORTING PERIOD (OPTIONAL)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold mb-1 block" style={{ color: C.mutedText }}>FROM</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
            <div>
              <label className="text-[9px] font-bold mb-1 block" style={{ color: C.mutedText }}>TO</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
          </div>
          <p className="text-[9px] mt-2" style={{ color: C.mutedText }}>Leave blank to include all records</p>
        </div>

        {/* Section toggles */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>REPORT SECTIONS</p>
          <div className="space-y-2.5">
            {[
              { key: "behaviorLogs", label: "📋 Behavioral Incident Logs", desc: "All recorded incidents and behaviors" },
              { key: "compliance", label: "✅ Tasks & Compliance", desc: "Case tasks, deadlines, completion status" },
              { key: "notes", label: "📝 Case Notes & Observations", desc: "Professional notes and assessments" },
              { key: "timeline", label: "📅 Timeline & Milestones", desc: "Case events, appointments, changes" },
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg hover:opacity-75"
                style={{ background: sections[item.key] ? C.cream : C.offWhite }}>
                <input
                  type="checkbox"
                  checked={sections[item.key]}
                  onChange={e => setSections({ ...sections, [item.key]: e.target.checked })}
                  style={{ accentColor: C.darkGreen, marginTop: "2px" }}
                />
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{item.label}</p>
                  <p className="text-[9px]" style={{ color: C.mutedText }}>{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSignatures}
              onChange={e => setIncludeSignatures(e.target.checked)}
              style={{ accentColor: C.darkGreen, marginTop: "2px" }}
            />
            <div>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Include Certification & Signature Page</p>
              <p className="text-[9px] mt-0.5" style={{ color: C.mutedText }}>
                Adds final page for professional signature and court certification
              </p>
            </div>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-3.5 flex gap-2" style={{ background: "#FDECEC", border: "1.5px solid #F5BEBE" }}>
            <AlertCircle size={14} color="#C0392B" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: "#C0392B" }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} color={C.midGreen} />
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Report Generated & Downloaded</p>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {Object.entries(result.summary).map(([key, val]) => (
                <div key={key} className="text-center rounded-lg p-2" style={{ background: "#fff" }}>
                  <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{val}</p>
                  <p className="text-[9px] leading-tight" style={{ color: C.mutedText }}>
                    {key === "behaviorLogs" && "Logs"}
                    {key === "tasks" && "Tasks"}
                    {key === "notes" && "Notes"}
                    {key === "events" && "Events"}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[9px] mt-2" style={{ color: C.midGreen }}>
              📄 {result.fileName}
            </p>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !Object.values(sections).some(v => v)}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: Object.values(sections).some(v => v) ? C.darkGreen : C.mutedText,
            color: "#fff",
            border: "none",
            cursor: Object.values(sections).some(v => v) && !generating ? "pointer" : "not-allowed",
            opacity: generating ? 0.75 : 1,
          }}
        >
          {generating ? (
            <><Loader2 size={17} className="animate-spin" /> Compiling Report…</>
          ) : (
            <><FileText size={17} /> Generate & Download PDF</>
          )}
        </button>

        {!Object.values(sections).some(v => v) && (
          <p className="text-center text-[11px]" style={{ color: C.mutedText }}>
            Select at least one section to generate report
          </p>
        )}

        {/* Info footer */}
        <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
          <p className="text-[10px] leading-relaxed text-center" style={{ color: C.mutedText }}>
            Reports are generated on-demand with current data. All PDF documents are court-admissible and include tamper-evident timestamps.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}