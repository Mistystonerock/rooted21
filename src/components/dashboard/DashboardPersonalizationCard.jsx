import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";

const CARD = "#ffffff";
const CREAM = "#f5ede2";
const GREEN = "#6b9d6e";
const GOLD = "#a67c52";
const TEXT = "#1a1a1a";
const MUTED = "#8b6f54";

const OPTIONS = [
  {
    id: "caregiver",
    label: "Caregiver",
    desc: "Check-ins, behavior, safety, and resources",
    suggestions: [
      { to: "/daily-checkin", emoji: "✅", label: "Daily Check-In" },
      { to: "/behavior-hub", emoji: "🧠", label: "Behavior Hub" },
      { to: "/safety-plan", emoji: "🛡️", label: "Safety Plan" },
    ],
  },
  {
    id: "child_teen",
    label: "Child / Teen",
    desc: "Calming tools, learning, and support",
    suggestions: [
      { to: "/sensory-toolbox", emoji: "🧸", label: "Sensory Toolbox" },
      { to: "/education-hub", emoji: "📚", label: "Education" },
      { to: "/support-hub", emoji: "🤝", label: "Support" },
    ],
  },
  {
    id: "professional",
    label: "Professional",
    desc: "Family support, communication, and case tools",
    suggestions: [
      { to: "/professional", emoji: "👥", label: "Professional Portal" },
      { to: "/communications", emoji: "💬", label: "Communications" },
      { to: "/case-management", emoji: "📁", label: "Case Management" },
    ],
  },
  {
    id: "administrator",
    label: "Administrator",
    desc: "Platform, users, docs, and reporting",
    suggestions: [
      { to: "/founder-dashboard", emoji: "📊", label: "Founder Dashboard" },
      { to: "/analytics", emoji: "📈", label: "Analytics" },
      { to: "/app-docs", emoji: "📘", label: "App Docs" },
    ],
  },
];

export default function DashboardPersonalizationCard({ user, onUpdated }) {
  const [focus, setFocus] = useState(user?.dashboard_focus || "caregiver");
  const [saving, setSaving] = useState(false);
  const selected = OPTIONS.find(option => option.id === focus) || OPTIONS[0];

  async function saveFocus(nextFocus) {
    setFocus(nextFocus);
    setSaving(true);
    const updatedUser = await base44.auth.updateMe({ dashboard_focus: nextFocus });
    onUpdated?.(updatedUser);
    setSaving(false);
  }

  return (
    <section className="rounded-3xl p-4" style={{ background: CARD, border: `1.5px solid rgba(120,85,60,0.2)`, boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${GREEN}18` }}>
          <Sparkles size={20} color={GREEN} />
        </div>
        <div className="flex-1">
          <p className="font-serif text-base font-bold" style={{ color: TEXT }}>Personalize your dashboard</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>Choose what kind of tools you want Rooted 21 to show first.</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => saveFocus(option.id)}
            className="rounded-2xl p-3 text-left"
            style={{
              background: focus === option.id ? `${GREEN}18` : CREAM,
              border: `1.5px solid ${focus === option.id ? GREEN : "transparent"}`,
              color: TEXT,
            }}
          >
            <span className="block text-xs font-black">{option.label}</span>
            <span className="mt-1 block text-[10px] leading-snug" style={{ color: MUTED }}>{option.desc}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl p-3" style={{ background: "#faf6f1", border: `1px solid ${CREAM}` }}>
        <p className="text-[10px] font-extrabold tracking-[0.14em]" style={{ color: GOLD }}>SUGGESTED FOR {selected.label.toUpperCase()}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {selected.suggestions.map(item => (
            <Link key={item.to} to={item.to} className="rounded-2xl p-2 text-center no-underline" style={{ background: CARD, border: `1px solid ${CREAM}` }}>
              <span className="block text-xl">{item.emoji}</span>
              <span className="mt-1 block text-[10px] font-bold leading-tight" style={{ color: TEXT }}>{item.label}</span>
            </Link>
          ))}
        </div>
        {saving && <p className="mt-2 text-[10px] font-bold" style={{ color: GREEN }}>Saving your preference…</p>}
      </div>
    </section>
  );
}