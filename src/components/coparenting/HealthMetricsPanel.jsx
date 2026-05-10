import { C } from "@/lib/rooted-constants";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function HealthMetricsPanel({ sentiment, incidents, goals, regulation }) {
  const getTrendIcon = (trend) => {
    if (trend === "improving") return <TrendingUp size={14} color={C.midGreen} />;
    if (trend === "declining" || trend === "worsening") return <TrendingDown size={14} color="#C0392B" />;
    return <span style={{ fontSize: "12px" }}>→</span>;
  };

  const getTrendColor = (trend) => {
    if (trend === "improving") return { bg: "#EAF4EA", text: C.midGreen };
    if (trend === "declining" || trend === "worsening") return { bg: "#FDECEC", text: "#C0392B" };
    return { bg: "#FEF9EC", text: "#B87A0A" };
  };

  return (
    <div className="space-y-3">
      {/* Sentiment */}
      {sentiment && (
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>💬 COMMUNICATION SENTIMENT</p>
              <p className="text-sm font-bold mt-1" style={{ color: C.darkGreen }}>
                {sentiment.overall.charAt(0).toUpperCase() + sentiment.overall.slice(1)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold" style={{ color: sentiment.score > 60 ? C.midGreen : "#B87A0A" }}>
                {sentiment.score}%
              </p>
              <div className="flex items-center gap-1 mt-1" style={{ color: getTrendColor(sentiment.trend).text }}>
                {getTrendIcon(sentiment.trend)}
                <p className="text-[10px] font-bold capitalize">{sentiment.trend}</p>
              </div>
            </div>
          </div>

          {sentiment.quality && (
            <div className="px-2 py-1 rounded-lg text-[10px] font-bold mb-2"
              style={{
                background: sentiment.quality === "excellent" ? "#EAF4EA" : "#FEF9EC",
                color: sentiment.quality === "excellent" ? C.midGreen : "#B87A0A",
              }}>
              Quality: {sentiment.quality.charAt(0).toUpperCase() + sentiment.quality.slice(1)}
            </div>
          )}

          {sentiment.themes && sentiment.themes.length > 0 && (
            <div>
              <p className="text-[9px] font-bold mb-1" style={{ color: C.mutedText }}>KEY THEMES</p>
              <div className="flex flex-wrap gap-1">
                {sentiment.themes.map((theme, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full"
                    style={{ background: C.offWhite, color: C.darkGreen }}>
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Incidents */}
      {incidents && (
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>📊 INCIDENT FREQUENCY</p>
              <p className="text-lg font-extrabold mt-1" style={{ color: C.darkGreen }}>
                {incidents.avgPerWeek.toFixed(1)}/week
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold" style={{ color: C.brown }}>
                {incidents.total}
              </p>
              <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>total incidents</p>
              <div className="flex items-center gap-1 mt-2" style={{ color: getTrendColor(incidents.trend).text }}>
                {getTrendIcon(incidents.trend)}
                <p className="text-[10px] font-bold capitalize">{incidents.trend}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Progress */}
      {goals && (
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>🎯 GOAL PROGRESS</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Total", value: goals.total, color: C.mutedText },
              { label: "Done", value: goals.completed, color: C.midGreen },
              { label: "In Progress", value: goals.in_progress, color: C.gold },
              { label: "Not Started", value: goals.not_started, color: C.brown },
            ].map(item => (
              <div key={item.label} className="text-center rounded-lg p-2" style={{ background: C.offWhite }}>
                <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-[9px]" style={{ color: C.mutedText }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulation */}
      {regulation && (
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>🧠 CHILD & PARENT REGULATION</p>
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Child Regulation</p>
                <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{regulation.childRegulation}/5</p>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "rgba(0,0,0,0.1)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(regulation.childRegulation / 5) * 100}%`, background: C.midGreen }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Parent Calmness</p>
                <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{regulation.parentCalmness}/5</p>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "rgba(0,0,0,0.1)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(regulation.parentCalmness / 5) * 100}%`, background: C.midGreen }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}