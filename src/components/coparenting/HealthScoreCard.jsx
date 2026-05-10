import { C } from "@/lib/rooted-constants";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function HealthScoreCard({ score, level, breakdown }) {
  const getColors = () => {
    if (score >= 80) return { bg: "#EAF4EA", ring: C.midGreen, text: C.midGreen, icon: "🌳" };
    if (score >= 65) return { bg: "#EEF4FB", ring: "#5B8DB8", text: "#5B8DB8", icon: "🌱" };
    if (score >= 50) return { bg: "#FEF9EC", ring: "#B87A0A", text: "#B87A0A", icon: "⚡" };
    return { bg: "#FDECEC", ring: "#C0392B", text: "#C0392B", icon: "🚨" };
  };

  const colors = getColors();

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${colors.ring}` }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ background: colors.ring }}>
        <p className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: "#fff" }}>
          Co-Parenting Health Score
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
          Based on sentiment, incidents & goal progress
        </p>
      </div>

      {/* Score display */}
      <div className="p-6" style={{ background: colors.bg }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-5xl font-extrabold" style={{ color: colors.text }}>{score}</p>
            <p className="text-sm font-bold mt-2" style={{ color: colors.text }}>{level}</p>
          </div>
          <p className="text-6xl">{colors.icon}</p>
        </div>

        {/* Score breakdown bars */}
        {breakdown && (
          <div className="space-y-3 mt-6 pt-6 border-t" style={{ borderColor: `${colors.ring}33` }}>
            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>SCORE COMPONENTS</p>
            {[
              { label: "Sentiment", value: breakdown.sentiment, icon: "💬" },
              { label: "Incidents", value: breakdown.incidents, icon: "📊" },
              { label: "Goal Progress", value: breakdown.goals, icon: "🎯" },
              { label: "Regulation", value: breakdown.regulation, icon: "🧠" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{item.icon} {item.label}</p>
                  <p className="text-xs font-bold" style={{ color: colors.text }}>{item.value}%</p>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: "rgba(0,0,0,0.1)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.value}%`, background: colors.ring }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}