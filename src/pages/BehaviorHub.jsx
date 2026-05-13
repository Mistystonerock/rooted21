import MobileHeader from "@/components/mobile/MobileHeader";
import HubCard from "@/components/hubs/HubCard";
import { C } from "@/lib/rooted-constants";

const BEHAVIOR_ITEMS = [
  { title: "Behavior Daily Logs", description: "Track patterns, triggers, mood, and regulation over time.", url: "/behavior-logs", emoji: "📋" },
  { title: "Behavior Analytics", description: "View trends and understand what may be driving behaviors.", url: "/analytics", emoji: "📊" },
  { title: "Behavioral Trends", description: "Visual progress charts for patterns and improvements.", url: "/behavioral-trends", emoji: "📈" },
  { title: "Growth Insights", description: "AI weekly behavior summaries and next-step ideas.", url: "/growth-insights", emoji: "🌱", tag: "AI" },
  { title: "Daily Check-In", description: "Quick daily mood, calm, and regulation tracking.", url: "/daily-checkin", emoji: "✅" },
  { title: "Goals", description: "Set and track parenting, regulation, and family goals.", url: "/goals", emoji: "🎯" },
  { title: "Sensory Toolbox", description: "3-minute regulation and sensory support activities.", url: "/sensory-toolbox", emoji: "🧠" },
  { title: "Anger Management", description: "Calming tools, anger education, and local support options.", url: "/anger-management", emoji: "😤" },
  { title: "Incident Reports", description: "Document serious events for care teams or court records.", url: "/incident-reports", emoji: "📌" },
];

export default function BehaviorHub() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Behavior Hub" subtitle="Tracking, trends, and regulation tools" backTo="/dashboard" />
      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🧠</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>All Behavior Tools</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>Track what is happening, spot patterns, and find calming supports faster.</p>
        </div>
        <div className="space-y-3">{BEHAVIOR_ITEMS.map(item => <HubCard key={item.title} item={item} />)}</div>
        <div className="pb-8" />
      </div>
    </div>
  );
}