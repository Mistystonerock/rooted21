import { useEffect, useState } from "react";
import { Download, FileText, Loader2, Scale, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import ChildSelector from "@/components/children/ChildSelector";
import { getChildDisplayName } from "@/lib/child-selection";

function downloadPdf(base64, fileName) {
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArr], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ChildCourtReportGenerator() {
  const [child, setChild] = useState(null);
  const [counts, setCounts] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadCounts() {
      const [behaviors, audits, goals] = await Promise.all([
        base44.entities.BehaviorLog.list("-created_date", 500),
        base44.entities.MessageAuditLog.list("-created_date", 500),
        base44.entities.Goal.list("-created_date", 300),
      ]);
      const from = new Date();
      from.setDate(from.getDate() - 30);
      const inRange = (d) => new Date(d) >= from;
      setCounts({
        behaviors: behaviors.filter(b => inRange(b.entry_date || b.created_date)).length,
        audits: audits.filter(a => inRange(a.sent_at || a.created_date)).length,
        goals: goals.filter(g => g.progress === "completed" && inRange(g.updated_date || g.created_date)).length,
      });
    }
    loadCounts();
  }, []);

  async function generateReport() {
    if (!child) return;
    setGenerating(true);
    setResult(null);
    const response = await base44.functions.invoke("generateChildCourtReport", { childId: child.id || child.child_uid });
    if (response.data?.success) {
      downloadPdf(response.data.base64, response.data.fileName);
      setResult(response.data.summary);
    }
    setGenerating(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Court Report Generator" subtitle="Last 30 days · child-specific records" backTo="/dashboard" />
      <div className="mx-auto max-w-[540px] space-y-4 px-4 py-5 pb-24">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.14)" }}>
              <Scale size={23} color="#fff" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold" style={{ color: C.cream }}>Court-Ready PDF Report</p>
              <p className="text-[11px]" style={{ color: C.lightGreen }}>Behavior logs · communication audits · completed goals</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            Select a child and generate an AI-formatted professional report summarizing progress, current needs, and compliance milestones from the last 30 days.
          </p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="mb-2 text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>SELECT CHILD</p>
          <ChildSelector selectedChild={child} onChange={setChild} />
        </div>

        {counts && (
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Behavior Logs", counts.behaviors, "📋"],
              ["Comm Audits", counts.audits, "💬"],
              ["Completed Goals", counts.goals, "🎯"],
            ].map(([label, value, icon]) => (
              <div key={label} className="rounded-2xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-xl">{icon}</p>
                <p className="text-2xl font-black" style={{ color: C.darkGreen }}>{value}</p>
                <p className="text-[10px] font-bold leading-tight" style={{ color: C.mutedText }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl p-4" style={{ background: "#F0F7F2", border: `1.5px solid ${C.midGreen}` }}>
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck size={16} color={C.midGreen} />
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>What will be included</p>
          </div>
          <ul className="ml-5 list-disc space-y-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>
            <li>Last 30 days of behavior logs for {child ? getChildDisplayName(child) : "the selected child"}</li>
            <li>Communication audit entries from the last 30 days</li>
            <li>Completed goals and compliance milestones</li>
            <li>AI-formatted court summary, current needs, and professional observations</li>
          </ul>
        </div>

        {result && (
          <div className="rounded-2xl p-4" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Report generated and downloaded.</p>
            <p className="mt-1 text-xs" style={{ color: C.mutedText }}>
              Included {result.behaviorLogs} behavior logs, {result.communicationAudits} communication audits, and {result.completedGoals} completed goals.
            </p>
          </div>
        )}

        <button
          onClick={generateReport}
          disabled={!child || generating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black"
          style={{ background: child && !generating ? C.darkGreen : C.mutedText, color: "#fff", border: "none", opacity: generating ? 0.75 : 1 }}
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {generating ? "Generating Court Report…" : "Generate Court-Ready PDF"}
        </button>

        <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
          <p className="text-center text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
            Review this report with your attorney or case professional before filing with court.
          </p>
        </div>
      </div>
    </div>
  );
}