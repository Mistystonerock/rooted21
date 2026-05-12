import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, FileText, Loader2, Download, Copy, CheckCircle2 } from "lucide-react";

export default function StatusReportModal({ checklist, onClose }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("casePlanStatusReport", { checklist_id: checklist.id });
    if (res.data?.success) {
      setReport(res.data.report);
      setStats(res.data.stats);
    } else {
      setError(res.data?.error || "Failed to generate report.");
    }
    setLoading(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${checklist.title.replace(/\s+/g, "_")}_Status_Report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-[520px] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "#fff", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: C.darkGreen, flexShrink: 0 }}>
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>📜 Status Report</p>
            <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>For legal & caseworker review</p>
          </div>
          <button onClick={onClose}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color={C.cream} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {!report && !loading && (
            <>
              {/* Checklist summary */}
              <div className="rounded-2xl p-4 space-y-2" style={{ background: "#F0F7F2", border: `1px solid ${C.midGreen}30` }}>
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{checklist.title}</p>
                {checklist.child_name && <p className="text-xs" style={{ color: C.mutedText }}>🧒 {checklist.child_name}</p>}
                <div className="flex gap-4 pt-1">
                  {[
                    { label: "Total Tasks", val: checklist.items?.length || 0, color: C.darkGreen },
                    { label: "Completed", val: checklist.items?.filter(i => i.completed).length || 0, color: C.midGreen },
                    { label: "Pending", val: checklist.items?.filter(i => !i.completed).length || 0, color: C.brown },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="font-black text-xl" style={{ color: s.color }}>{s.val}</p>
                      <p className="text-[9px] font-bold" style={{ color: C.mutedText }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
                The AI will generate a professional, court-ready status report based on your current progress — including completed tasks, outstanding requirements, and compliance narrative.
              </p>

              {error && (
                <p className="text-xs p-3 rounded-xl" style={{ background: "#FEF0EE", color: "#B84C2A" }}>{error}</p>
              )}

              <button onClick={generate}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                <FileText size={16} /> Generate Status Report
              </button>
            </>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 size={32} className="animate-spin" style={{ color: C.midGreen }} />
              <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Generating your report…</p>
              <p className="text-xs text-center" style={{ color: C.mutedText }}>AI is analyzing your progress and writing a court-ready summary.</p>
            </div>
          )}

          {report && stats && (
            <div className="space-y-4">
              {/* Stats banner */}
              <div className="rounded-2xl p-3 flex items-center justify-between" style={{ background: C.darkGreen }}>
                <div>
                  <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>{stats.pct}% Complete</p>
                  <p className="text-[10px]" style={{ color: C.lightGreen }}>{stats.completed} of {stats.total} tasks done · {stats.overdue} overdue</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px]" style={{ color: C.lightGreen }}>{stats.report_date}</p>
                  {stats.child_name && <p className="text-[10px]" style={{ color: C.lightGreen }}>🧒 {stats.child_name}</p>}
                </div>
              </div>

              {/* Report text */}
              <div className="rounded-2xl p-4" style={{ background: "#F9F7F2", border: `1px solid ${C.cream}` }}>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans" style={{ color: C.darkGreen }}>
                  {report}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleCopy}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: copied ? C.midGreen : C.cream, color: copied ? "#fff" : C.darkGreen, border: "none", cursor: "pointer" }}>
                  {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy Text</>}
                </button>
                <button onClick={handleDownload}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                  <Download size={14} /> Download
                </button>
              </div>

              <button onClick={() => { setReport(null); setStats(null); }}
                className="w-full py-2.5 rounded-2xl font-bold text-xs"
                style={{ background: "none", border: `1px solid ${C.cream}`, color: C.mutedText, cursor: "pointer" }}>
                Regenerate Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}