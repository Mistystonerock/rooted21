import { Brain, Loader2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

function ListBlock({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide" style={{ color: C.darkGreen }}>{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5" style={{ color: C.mutedText }}>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}

export default function FamilyStabilityInsights({ insights, loading, onGenerate }) {
  return (
    <section className="space-y-3 rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: C.cream }}>
          <Brain size={18} color={C.darkGreen} />
        </div>
        <div className="flex-1">
          <p className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>AI improvement insights</p>
          <p className="mt-1 text-xs leading-5" style={{ color: C.mutedText }}>Get supportive next steps based on tone and visitation patterns.</p>
        </div>
        <button type="button" onClick={onGenerate} disabled={loading} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Analyze"}
        </button>
      </div>

      {insights ? (
        <div className="space-y-4 rounded-2xl p-3" style={{ background: C.offWhite }}>
          <p className="text-sm leading-6" style={{ color: C.darkText }}>{insights.stability_summary}</p>
          {insights.focus_area && <p className="rounded-xl bg-white p-3 text-xs font-bold" style={{ color: C.darkGreen }}>30-day focus: {insights.focus_area}</p>}
          <ListBlock title="Strengths" items={insights.strengths} />
          <ListBlock title="Patterns to watch" items={insights.risk_patterns} />
          <ListBlock title="Action steps" items={insights.actionable_steps} />
          <ListBlock title="Documentation tips" items={insights.documentation_tips} />
        </div>
      ) : (
        <p className="rounded-2xl p-3 text-xs leading-5" style={{ background: C.offWhite, color: C.mutedText }}>Run the AI analysis after you have communication journal entries or visitation logs.</p>
      )}
    </section>
  );
}