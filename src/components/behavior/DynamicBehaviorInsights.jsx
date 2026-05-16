import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, ArrowRight, Brain, Clock, Lightbulb, TrendingUp } from "lucide-react";
import ChildSelector from "@/components/children/ChildSelector";
import { filterRecordsForChild, getChildDisplayName } from "@/lib/child-selection";
import { C } from "@/lib/rooted-constants";

function normalizeTimeWindow(time = "") {
  const value = String(time).toLowerCase();
  const match = value.match(/(\d{1,2})/);
  if (!match) return "unknown";
  let hour = Number(match[1]);
  if (value.includes("pm") && hour < 12) hour += 12;
  if (value.includes("am") && hour === 12) hour = 0;
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getTopCount(items, getter) {
  const counts = items.reduce((acc, item) => {
    const key = getter(item);
    if (!key || key === "unknown") return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? { label: top[0], count: top[1] } : null;
}

function includesAny(text = "", words = []) {
  const normalized = String(text).toLowerCase();
  return words.some(word => normalized.includes(word));
}

function buildSuggestions({ topMood, topTrigger, peakWindow, lowRegulationCount }) {
  const trigger = topTrigger?.label || "";
  const mood = topMood?.label || "";
  const suggestions = [];

  if (mood === "angry" || includesAny(trigger, ["anger", "yelling", "aggression", "defiant"])) {
    suggestions.push({ to: "/anger-management", emoji: "😤", title: "Try Anger Management", reason: "Anger or escalation is showing up in recent patterns." });
  }

  if (mood === "dysregulated" || includesAny(trigger, ["noise", "sensory", "transition", "overwhelmed", "school"])) {
    suggestions.push({ to: "/sensory-toolbox", emoji: "🧠", title: "Open Sensory Toolbox", reason: "Sensory or transition support may help before the pattern peaks." });
  }

  if (peakWindow && lowRegulationCount >= 2) {
    suggestions.push({ to: "/safety-plan", emoji: "🛡️", title: "Review Safety Plan", reason: `Plan extra support before the ${peakWindow.label}.` });
  }

  if (suggestions.length === 0) {
    suggestions.push({ to: "/daily-checkin", emoji: "✅", title: "Keep Check-Ins Going", reason: "A few more entries will make predictions more accurate." });
  }

  return suggestions.slice(0, 3);
}

export default function DynamicBehaviorInsights() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.BehaviorLog.list("-created_date", 120),
      base44.entities.CheckIn.list("-created_date", 60),
    ]).then(([behaviorLogs, checkInRows]) => {
      setLogs(behaviorLogs);
      setCheckins(checkInRows);
    });
  }, []);

  const insight = useMemo(() => {
    const childLogs = filterRecordsForChild(logs, selectedChild);
    const childCheckins = filterRecordsForChild(checkins, selectedChild);
    const recentLogs = childLogs.slice(0, 30);
    const hardMoments = recentLogs.filter(log => ["angry", "dysregulated", "anxious"].includes(log.child_mood));
    const peakWindow = getTopCount(hardMoments, log => normalizeTimeWindow(log.time));
    const topMood = getTopCount(recentLogs, log => log.child_mood);
    const topTrigger = getTopCount(recentLogs, log => log.trigger?.trim()?.toLowerCase());
    const lowRegulationCount = childCheckins.slice(0, 7).filter(row => Number(row.child_regulation) <= 2).length;
    const childName = selectedChild ? getChildDisplayName(selectedChild) : "your child";
    const hasData = recentLogs.length > 0 || childCheckins.length > 0;
    const forecast = peakWindow
      ? `${childName} tends to have more difficult moments in the ${peakWindow.label}. Try planning regulation support before that window.`
      : hasData
        ? "Patterns are starting to form. Keep logging behavior and check-ins to strengthen predictions."
        : "Add behavior logs and daily check-ins to begin seeing personalized forecasts.";

    return {
      hasData,
      forecast,
      topMood: topMood?.label || "Not enough data yet",
      topTrigger: topTrigger?.label || "No repeated trigger yet",
      peakWindow: peakWindow?.label || "No clear window yet",
      lowRegulationCount,
      suggestions: buildSuggestions({ topMood, topTrigger, peakWindow, lowRegulationCount }),
    };
  }, [logs, checkins, selectedChild]);

  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${C.midGreen}18` }}>
          <TrendingUp size={20} color={C.midGreen} />
        </div>
        <div className="flex-1">
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Dynamic Behavior Insights</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Forecast patterns and find the right support tools earlier.</p>
        </div>
      </div>

      <div className="mt-3">
        <ChildSelector selectedChild={selectedChild} onChange={setSelectedChild} />
      </div>

      <div className="mt-3 rounded-2xl p-3" style={{ background: insight.hasData ? `${C.midGreen}12` : C.offWhite, border: `1px solid ${insight.hasData ? `${C.midGreen}35` : C.cream}` }}>
        <div className="flex gap-2">
          {insight.hasData ? <Lightbulb size={16} color={C.midGreen} /> : <AlertTriangle size={16} color={C.gold} />}
          <p className="text-xs font-bold leading-relaxed" style={{ color: C.darkGreen }}>{insight.forecast}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { icon: Brain, label: "Mood", value: insight.topMood },
          { icon: Clock, label: "Window", value: insight.peakWindow },
          { icon: AlertTriangle, label: "Trigger", value: insight.topTrigger },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl p-2" style={{ background: C.offWhite }}>
              <Icon size={14} color={C.gold} />
              <p className="mt-1 text-[9px] font-extrabold uppercase" style={{ color: C.mutedText }}>{item.label}</p>
              <p className="mt-1 text-[10px] font-bold capitalize leading-tight" style={{ color: C.darkGreen }}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: C.gold }}>Suggested Next Steps</p>
        {insight.suggestions.map(item => (
          <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-2xl p-3 no-underline" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <span className="text-xl">{item.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-black" style={{ color: C.darkGreen }}>{item.title}</p>
              <p className="mt-0.5 text-[10px] leading-snug" style={{ color: C.mutedText }}>{item.reason}</p>
            </div>
            <ArrowRight size={14} color={C.midGreen} />
          </Link>
        ))}
      </div>
    </section>
  );
}