import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";

const TOPICS = [
  {
    emoji: "🍃",
    title: "FASD Guide",
    subtitle: "Fetal Alcohol Spectrum Disorder — what it is, what helps, how to get a diagnosis",
    path: "/fasd-guide",
    color: C.midGreen,
    tag: "ESSENTIAL",
  },
  {
    emoji: "❤️",
    title: "Attachment Disorders",
    subtitle: "Understanding RAD & DSED — what they look like and what actually helps",
    path: "/attachment-guide",
    color: "#B84C2A",
    tag: "ESSENTIAL",
  },
  {
    emoji: "💔",
    title: "Grief & Ambiguous Loss",
    subtitle: "How children grieve people who are still alive — and how to hold space for it",
    path: "/grief-and-loss",
    color: C.brown,
    tag: "ESSENTIAL",
  },
  {
    emoji: "🌍",
    title: "Race, Culture & Identity",
    subtitle: "Supporting your child's racial and cultural identity — for all caregivers",
    path: "/race-and-identity",
    color: "#1A5FAD",
    tag: "ESSENTIAL",
  },
  {
    emoji: "🕯️",
    title: "Caregiver Burnout",
    subtitle: "Secondary traumatic stress, warning signs, and real recovery strategies",
    path: "/caregiver-burnout",
    color: C.darkGreen,
    tag: "FOR YOU",
  },
  {
    emoji: "🚀",
    title: "Aging Out Guide",
    subtitle: "Benefits, education, life skills, and staying connected after 18",
    path: "/aging-out-guide",
    color: C.gold,
    tag: "TEENS",
  },
  {
    emoji: "⚖️",
    title: "Know Your Rights",
    subtitle: "Pull this up at any IEP, CPS visit, or court hearing — your rights at a glance",
    path: "/rights-card",
    color: C.darkGreen,
    tag: "QUICK REF",
  },
];

export default function EducationHub() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Education Hub" subtitle="Trauma-informed learning for caregivers" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Hero */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">📚</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Caregiver Education Hub
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Practical, research-backed guides on the topics that matter most for foster, adoptive, and kinship families. Written in plain language — no textbooks, no jargon.
          </p>
        </div>

        {/* Topic cards */}
        <div className="space-y-3">
          {TOPICS.map((topic, i) => (
            <Link key={i} to={topic.path}
              className="block rounded-2xl overflow-hidden transition-all hover:shadow-md"
              style={{ textDecoration: "none", border: `1.5px solid ${C.cream}` }}>
              <div className="flex items-center gap-4 px-4 py-4" style={{ background: C.white }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: topic.color + "18" }}>
                  {topic.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{topic.title}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: topic.color + "18", color: topic.color }}>
                      {topic.tag}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: C.mutedText }}>{topic.subtitle}</p>
                </div>
                <span className="text-lg" style={{ color: C.cream }}>›</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming soon */}
        <div className="rounded-2xl p-4" style={{ background: C.cream, border: `1px solid ${C.cream}` }}>
          <p className="font-bold text-xs mb-1" style={{ color: C.darkGreen }}>📖 Also in the app</p>
          <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
            The 21-lesson TBRI® curriculum, sensory toolbox, emergency toolbox, and resource library are also part of your education toolkit. Explore them from your dashboard.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}