import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import SupportFeatureGrid from "@/components/wraparound/SupportFeatureGrid";
import CalmModeCard from "@/components/wraparound/CalmModeCard";
import { C } from "@/lib/rooted-constants";

const MODULES = [
  { emoji: "🧭", title: "CPS Case Navigation", description: "Track where you are in the Ohio CPS process, case-plan tasks, hearings, visitation, and escalation supports.", to: "/cps-case-navigation", tag: "Ohio MVP" },
  { emoji: "📚", title: "Family Knowledge Hub", description: "Trauma-informed lessons, legal rights, school advocacy, checklists, videos, and mentor support.", to: "/family-knowledge-hub", tag: "Training" },
  { emoji: "🤝", title: "Team Coordination", description: "Consent-based sharing, secure messages, document tools, court reports, and one shared calendar.", to: "/documents", tag: "HIPAA/FERPA aware" },
  { emoji: "🌎", title: "Cultural Care Preferences", description: "Set family values, language needs, supportive imagery, tone, quotes, and calming soundscapes.", to: "/cultural-care", tag: "Respect" },
  { emoji: "🫶", title: "Peer Support + Mentors", description: "Join moderated discussions, bookmark resources, suggest topics, and find families with similar experiences.", to: "/peer-support", tag: "Opt-in" },
  { emoji: "🎧", title: "Youth Zone", description: "Life-skills courses, regulation games, creative challenges, journaling, milestones, and approved mentor messaging.", to: "/youth-zone", tag: "Youth" },
  { emoji: "🧭", title: "Family Voice + Choice", description: "Start plans with family goals, priorities, cultural considerations, service options, and approval checkpoints.", to: "/family-voice-choice", tag: "Consent" },
  { emoji: "💚", title: "Well-Being Toolkit", description: "Breathing exercises, meditations, burnout checks, self-care plans, and anonymous feedback.", to: "/well-being-toolkit", tag: "Anti-stigma" },
  { emoji: "📈", title: "Evaluation + Analytics", description: "Track behavior, goals, service use, predictive insights, exports, and court-ready reports.", to: "/analytics", tag: "Insights" },
];

export default function WraparoundSupport() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Wrap-Around Support" subtitle="Knowledge, connection, coordination, and care" backTo="/dashboard" />
      <div className="mx-auto max-w-[560px] space-y-4 px-4 py-5">
        <WraparoundHero title="Rooted 21 Family Support System" subtitle="A calm, consent-based home for trauma-informed learning, care-team coordination, peer support, youth engagement, and caregiver well-being." icon="🌳" />
        <CalmModeCard />
        <SupportFeatureGrid items={MODULES} />
        <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-sm font-black" style={{ color: C.darkGreen }}>Consent-first safety promise</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Sharing tools are designed around user choice: caregivers decide what to share, with whom, and when. Privacy controls, access tracking, exports, and deletion live in the Privacy Center.</p>
        </section>
        <div className="pb-8" />
      </div>
    </main>
  );
}