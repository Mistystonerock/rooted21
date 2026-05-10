import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Sparkles, Loader2, ChevronDown } from "lucide-react";

export default function InsightGeneratorPanel({ onGenerated }) {
  const [loading, setLoading] = useState(false);
  const [weeksBack, setWeeksBack] = useState(0);

  async function handleGenerate() {
    setLoading(true);
    const res = await base44.functions.invoke("generateWeeklyGrowthInsight", { weeksBack });
    setLoading(false);
    if (res?.data?.insight) {
      onGenerated && onGenerated();
    }
  }

  const weekLabel = weeksBack === 0 ? "This Week" : weeksBack === 1 ? "Last Week" : `${weeksBack} Weeks Ago`;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.darkGreen }}>
      <div>
        <p className="font-serif font-bold text-base" style={{ color: C.cream }}>✨ Generate Growth Insight</p>
        <p className="text-xs mt-0.5" style={{ color: C.lightGreen }}>
          AI analyzes your behavior logs, check-ins & journal entries to create a personalized report.
        </p>
      </div>

      {/* Week selector */}
      <div className="relative">
        <select
          value={weeksBack}
          onChange={e => setWeeksBack(Number(e.target.value))}
          className="w-full appearance-none rounded-xl px-3 py-2.5 text-sm font-bold pr-8"
          style={{ background: "rgba(255,255,255,0.12)", color: C.cream, border: `1px solid rgba(255,255,255,0.2)` }}
        >
          <option value={0} style={{ color: "#000" }}>This Week</option>
          <option value={1} style={{ color: "#000" }}>Last Week</option>
          <option value={2} style={{ color: "#000" }}>2 Weeks Ago</option>
          <option value={3} style={{ color: "#000" }}>3 Weeks Ago</option>
        </select>
        <ChevronDown size={14} color={C.lightGreen} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-opacity"
        style={{
          background: C.gold,
          color: "#fff",
          border: "none",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.75 : 1,
        }}
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Analyzing {weekLabel}…</>
        ) : (
          <><Sparkles size={16} /> Generate {weekLabel}'s Report</>
        )}
      </button>

      {loading && (
        <p className="text-[10px] text-center" style={{ color: C.lightGreen }}>
          Reading your behavior logs, check-ins & journal entries…
        </p>
      )}
    </div>
  );
}