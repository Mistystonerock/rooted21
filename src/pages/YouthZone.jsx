import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import SupportFeatureGrid from "@/components/wraparound/SupportFeatureGrid";
import { C } from "@/lib/rooted-constants";

const ITEMS = [
  { emoji: "🫧", title: "Emotional regulation games", description: "Short calming, breathing, sensory, and grounding activities for stressful moments.", to: "/sensory-toolbox" },
  { emoji: "📝", title: "Journaling prompts", description: "Creative prompts for feelings, identity, hopes, worries, and wins.", to: "/journal" },
  { emoji: "🎯", title: "Goal setting", description: "Build confidence with small goals, progress tracking, and milestone rewards.", to: "/goals" },
  { emoji: "🎨", title: "Creative challenges", description: "Art, music, story, and life-book activities that support voice and expression.", to: "/life-story" },
  { emoji: "💬", title: "Approved mentor messages", description: "Secure support conversations with approved helpers and professionals.", to: "/support-chat" },
  { emoji: "🏅", title: "Milestones + rewards", description: "Caregivers can monitor completions and celebrate progress.", to: "/milestones" },
];

export default function YouthZone() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Youth Zone" subtitle="Skills, creativity, feelings, and safe support" backTo="/wraparound-support" />
      <div className="mx-auto max-w-[560px] space-y-4 px-4 py-5">
        <WraparoundHero title="A safe space for young people" subtitle="Age-aware activities for emotional regulation, communication, daily living skills, creativity, and supported connection." icon="🎧" />
        <SupportFeatureGrid items={ITEMS} />
      </div>
    </main>
  );
}