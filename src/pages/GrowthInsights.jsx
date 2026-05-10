import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import InsightGeneratorPanel from "@/components/growth/InsightGeneratorPanel";
import InsightCard from "@/components/growth/InsightCard";
import { Bookmark, BarChart2, BookOpen } from "lucide-react";

export default function GrowthInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | bookmarked

  async function loadInsights() {
    const data = await base44.entities.GrowthInsight.list("-created_date", 20);
    setInsights(data);
    setLoading(false);
  }

  useEffect(() => { loadInsights(); }, []);

  const displayed = filter === "bookmarked"
    ? insights.filter(i => i.is_bookmarked)
    : insights;

  const latestStats = insights[0]?.stats;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Growth Insights"
        subtitle="AI-powered weekly reports"
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* Summary bar (most recent) */}
        {latestStats && (
          <div className="grid grid-cols-3 gap-2">
            {latestStats.avg_child_regulation != null && (
              <div className="rounded-xl p-3 text-center" style={{ background: "#EAF4EA", border: `1px solid ${C.cream}` }}>
                <p className="text-lg font-extrabold" style={{ color: C.midGreen }}>{latestStats.avg_child_regulation}</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Avg Child Reg.</p>
              </div>
            )}
            {latestStats.avg_parent_calm != null && (
              <div className="rounded-xl p-3 text-center" style={{ background: "#FEF9EC", border: `1px solid ${C.cream}` }}>
                <p className="text-lg font-extrabold" style={{ color: C.gold }}>{latestStats.avg_parent_calm}</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Avg Parent Calm</p>
              </div>
            )}
            <div className="rounded-xl p-3 text-center" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
              <p className="text-lg font-extrabold" style={{ color: C.darkGreen }}>{insights.length}</p>
              <p className="text-[10px]" style={{ color: C.mutedText }}>Reports</p>
            </div>
          </div>
        )}

        {/* Generator */}
        <InsightGeneratorPanel onGenerated={loadInsights} />

        {/* Filter tabs */}
        {insights.length > 0 && (
          <div className="flex gap-2">
            {[
              { value: "all", label: "All Reports", icon: BarChart2 },
              { value: "bookmarked", label: "Saved", icon: Bookmark },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: filter === tab.value ? C.darkGreen : "#fff",
                    color: filter === tab.value ? C.cream : C.darkGreen,
                    border: `1.5px solid ${filter === tab.value ? C.darkGreen : C.cream}`,
                    cursor: "pointer",
                  }}
                >
                  <Icon size={12} /> {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Reports list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: C.cream, border: `1.5px dashed ${C.midGreen}` }}>
            <BookOpen size={32} color={C.midGreen} className="mx-auto mb-3" />
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
              {filter === "bookmarked" ? "No saved insights yet" : "No reports generated yet"}
            </p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>
              {filter === "bookmarked"
                ? "Bookmark any report to save it here."
                : "Tap 'Generate' above to create your first AI Growth Insight report."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onBookmarkToggle={(id, val) =>
                  setInsights(prev => prev.map(i => i.id === id ? { ...i, is_bookmarked: val } : i))
                }
              />
            ))}
          </div>
        )}

        <div className="pb-10" />
      </div>
    </div>
  );
}