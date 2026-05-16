import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import SupportFeatureGrid from "@/components/wraparound/SupportFeatureGrid";
import { C } from "@/lib/rooted-constants";

const LESSONS = [
  { emoji: "🧭", title: "CPS case navigation", description: "Ohio timelines, case snapshot, case-plan tools, visitation records, and escalation contacts.", to: "/cps-case-navigation" },
  { emoji: "🧠", title: "Mental-health literacy", description: "Understand trauma responses, stress cycles, regulation, grief, and when to ask for help.", to: "/education-hub" },
  { emoji: "🌱", title: "Parenting strategies", description: "Connection-based routines, behavior supports, sensory tools, and de-escalation steps.", to: "/behavior-hub" },
  { emoji: "⚖️", title: "Legal rights", description: "Plain-language court, CPS, documentation, and advocacy guides.", to: "/court-rights-education" },
  { emoji: "🏫", title: "School advocacy", description: "Prepare for IEP, school conferences, behavior meetings, and education records.", to: "/education-hub" },
  { emoji: "✅", title: "Printable checklists", description: "Case-plan, court prep, safety plan, and document checklists.", to: "/case-plan-checklist" },
  { emoji: "💬", title: "Mentor live chat", description: "Ask trained support mentors about CPS, court, school meetings, and next steps.", to: "/support-chat" },
  { emoji: "📅", title: "Forms + appointments", description: "Track deadlines, reminders, court dates, therapy appointments, and school conferences.", to: "/legal-calendar" },
];

export default function FamilyKnowledgeHub() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Family Knowledge Hub" subtitle="Short lessons, guides, checklists, and support" backTo="/wraparound-support" />
      <div className="mx-auto max-w-[560px] space-y-4 px-4 py-5">
        <WraparoundHero title="Learn one small step at a time" subtitle="Clear, trauma-informed lessons and practical tools for child welfare, parenting, school advocacy, and legal navigation." icon="📚" />
        <SupportFeatureGrid items={LESSONS} />
      </div>
    </main>
  );
}