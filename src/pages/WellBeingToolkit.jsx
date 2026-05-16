import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import SupportFeatureGrid from "@/components/wraparound/SupportFeatureGrid";
import CalmModeCard from "@/components/wraparound/CalmModeCard";
import { C } from "@/lib/rooted-constants";

const ITEMS = [
  { emoji: "🌬️", title: "Breathing + grounding", description: "Short calming tools for stress peaks, conflict, or overwhelm.", to: "/sensory-toolbox" },
  { emoji: "🧘", title: "Self-care planning", description: "Create realistic care plans that fit your time, energy, and support system.", to: "/weekly-habits" },
  { emoji: "🔥", title: "Burnout support", description: "Learn signs of caregiver burnout and gentle steps toward relief.", to: "/caregiver-burnout" },
  { emoji: "📣", title: "Anonymous feedback", description: "Share concerns about stigma, discrimination, or barriers and request support.", to: "/survey" },
  { emoji: "💚", title: "Success stories", description: "Anti-stigma reminders that mental-health challenges are common and support helps.", to: "/peer-support" },
  { emoji: "🆘", title: "Crisis support", description: "Immediate support tools and emergency resources when things feel unsafe.", to: "/sos" },
];

export default function WellBeingToolkit() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Well-Being Toolkit" subtitle="Caregiver care, anti-stigma, and support" backTo="/wraparound-support" />
      <div className="mx-auto max-w-[560px] space-y-4 px-4 py-5">
        <WraparoundHero title="You deserve care, too" subtitle="Mental-health stress is not a failure. This space offers calming tools, burnout support, and ways to ask for help without shame." icon="💚" />
        <CalmModeCard />
        <SupportFeatureGrid items={ITEMS} />
      </div>
    </main>
  );
}