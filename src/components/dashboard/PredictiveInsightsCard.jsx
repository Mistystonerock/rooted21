import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { filterRecordsForChild } from "@/lib/child-selection";

const CARD = "#ffffff";
const GREEN = "#6b9d6e";
const GOLD = "#a67c52";
const TEXT = "#1a1a1a";
const MUTED = "#8b6f54";
const BORDER = "rgba(120,85,60,0.2)";

function getTimeWindow(time = "") {
  const match = String(time).match(/(\d{1,2})/);
  if (!match) return "unknown";
  const hour = Number(match[1]);
  const lower = String(time).toLowerCase();
  const normalized = lower.includes("pm") && hour < 12 ? hour + 12 : hour;
  if (normalized < 12) return "morning";
  if (normalized < 17) return "afternoon";
  return "evening";
}

function topValue(items, getter) {
  const counts = items.reduce((acc, item) => {
    const value = getter(item);
    if (!value || value === "unknown") return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export default function PredictiveInsightsCard({ child }) {
  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.BehaviorLog.list("-created_date", 100),
      base44.entities.CheckIn.list("-created_date", 30),
    ]).then(([behaviorLogs, checkInRows]) => {
      setLogs(behaviorLogs);
      setCheckins(checkInRows);
    });
  }, []);

  const insights = useMemo(() => {
    const childLogs = filterRecordsForChild(logs, child);
    const childCheckins = filterRecordsForChild(checkins, child);
    const recentLowRegulation = childCheckins.slice(0, 5).filter(item => Number(item.child_regulation) <= 2).length;
    const dysregulatedCount = childLogs.slice(0, 10).filter(item => item.child_mood === "dysregulated" || item.child_mood === "angry").length;
    const topTrigger = topValue(childLogs, item => item.trigger?.trim()?.toLowerCase());
    const topWindow = topValue(childLogs, item => getTimeWindow(item.time));
    const risk = recentLowRegulation >= 2 || dysregulatedCount >= 3 ? "Higher support need" : childLogs.length || childCheckins.length ? "Stable / watch gently" : "Ready when you add data";

    return {
      risk,
      topTrigger: topTrigger || "No clear trigger yet",
      topWindow: topWindow || "No clear time pattern yet",
      hasData: childLogs.length > 0 || childCheckins.length > 0,
    };
  }, [logs, checkins, child]);

  return (
    <section className="rounded-3xl p-4" style={{ background: CARD, border: `1.5px solid ${BORDER}`, boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${GOLD}18` }}>
          <TrendingUp size={20} color={GOLD} />
        </div>
        <div className="flex-1">
          <p className="font-serif text-base font-bold" style={{ color: TEXT }}>Predictive family insights</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>Rooted 21 looks for gentle patterns so you can prepare earlier, not blame yourself later.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <div className="rounded-2xl p-3" style={{ background: insights.risk.includes("Higher") ? "rgba(184,76,42,0.1)" : `${GREEN}12`, border: `1px solid ${insights.risk.includes("Higher") ? "rgba(184,76,42,0.25)" : `${GREEN}30`}` }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} color={insights.risk.includes("Higher") ? "#B84C2A" : GREEN} />
            <p className="text-xs font-black" style={{ color: TEXT }}>{insights.risk}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl p-3" style={{ background: "#faf6f1" }}>
            <p className="text-[10px] font-extrabold" style={{ color: GOLD }}>WATCH FOR</p>
            <p className="mt-1 text-xs font-bold capitalize" style={{ color: TEXT }}>{insights.topTrigger}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "#faf6f1" }}>
            <p className="text-[10px] font-extrabold" style={{ color: GOLD }}>COMMON WINDOW</p>
            <p className="mt-1 text-xs font-bold capitalize" style={{ color: TEXT }}>{insights.topWindow}</p>
          </div>
        </div>
      </div>

      <Link to={insights.hasData ? "/behavioral-trends" : "/behavior-logs"} className="mt-3 flex w-full items-center justify-center rounded-2xl px-4 py-3 text-xs font-black no-underline" style={{ background: GREEN, color: "#ffffff" }}>
        {insights.hasData ? "View behavior trends" : "Add behavior data"}
      </Link>
    </section>
  );
}