import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";

const GROUPS = [
  {
    title: "Organize",
    note: "Keep the important pieces in one place.",
    cards: [
      ["Case plans", "Track requirements, deadlines, proof, and next steps.", "/case-plan-tracker", "📋"],
      ["Documents", "Store court, school, medical, and parenting records securely.", "/documents", "📁"],
    ],
  },
  {
    title: "Prepare",
    note: "Walk into meetings and court dates with less overwhelm.",
    cards: [
      ["Court dates", "Review upcoming dates, appointments, and preparation steps.", "/care-calendar", "📅"],
      ["Parenting education", "Continue classes, reflections, and certificates.", "/lessons", "📚"],
    ],
  },
  {
    title: "Understand",
    note: "Use plain-language support to see patterns and progress.",
    cards: [
      ["Moxie AI", "Get organizing help and supportive guidance with clear boundaries.", "/personalized-chat", "🌿"],
      ["Progress tracking", "View goals, behavior trends, and growth summaries.", "/progress", "📈"],
    ],
  },
  {
    title: "Connect",
    note: "Share only what you approve with people helping your family.",
    cards: [
      ["Resources", "Find housing, benefits, recovery, legal aid, and local supports.", "/resources", "🧭"],
      ["Professional access", "Manage consent-based sharing and approved access codes.", "/consent-dashboard", "🔐"],
    ],
  },
];

const SUPPORT_CARDS = [
  ["Court-ready summaries", "Generate reviewed summaries for court, CPS, therapists, or attorney review.", "/court-ready-export"],
  ["Monthly behavior report", "Create a shareable child progress report from approved behavior data.", "/monthly-report"],
  ["Future support options", "Donations, premium classes, grants, and organization plans can grow from this foundation.", "/donate"],
];

function Card({ card }) {
  return (
    <Link to={card[2]} className="block rounded-xl p-3 no-underline" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
      <p className="text-sm font-black" style={{ color: C.darkGreen }}><span className="mr-1">{card[3]}</span>{card[0]}</p>
      <p className="mt-1 text-[11px] leading-5" style={{ color: C.mutedText }}>{card[1]}</p>
    </Link>
  );
}

export default function FamilyHubLinks() {
  return (
    <section className="space-y-3">
      <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
        <p className="font-serif text-lg font-bold" style={{ color: C.cream }}>Your family hub</p>
        <p className="mt-1 text-xs leading-6" style={{ color: C.lightGreen }}>A calm place to organize, prepare, understand, and connect — one step at a time.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {GROUPS.map(group => (
          <div key={group.title} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>{group.title}</p>
            <p className="mt-1 text-[11px]" style={{ color: C.mutedText }}>{group.note}</p>
            <div className="mt-3 space-y-2">{group.cards.map(card => <Card key={card[0]} card={card} />)}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>Reports, review, and sustainability</p>
        <p className="mt-1 text-xs leading-6" style={{ color: C.mutedText }}>AI summaries are preparation tools. Families review them before sharing, and professionals view approved progress without editing family-owned records.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {SUPPORT_CARDS.map(card => <Card key={card[0]} card={card} />)}
        </div>
      </div>
    </section>
  );
}