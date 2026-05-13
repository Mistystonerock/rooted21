import MobileHeader from "@/components/mobile/MobileHeader";
import HubCard from "@/components/hubs/HubCard";
import { C } from "@/lib/rooted-constants";

const SUPPORT_ITEMS = [
  { title: "Parenting Support Coach", description: "Personalized support for hard parenting moments.", url: "/personalized-chat", emoji: "🌿", tag: "AI" },
  { title: "Support Conversation Guide", description: "Generate talking points for therapists, caseworkers, counselors, or court team meetings.", url: "/support-guide", emoji: "💬" },
  { title: "My Support Team", description: "Keep professionals, family helpers, and support contacts organized.", url: "/my-team", emoji: "🤝" },
  { title: "Team Contacts", description: "Caseworker, CASA, GAL, school, doctor, attorney, and agency phone numbers.", url: "/team-contacts", emoji: "📞" },
  { title: "Parent Community", description: "Connect with other parents and caregivers who understand.", url: "/peer-support", emoji: "👥" },
  { title: "Safety Plan", description: "Crisis preparation and safety steps for stressful situations.", url: "/safety-plan", emoji: "🛡️", tag: "IMPORTANT", color: "#B84C2A" },
  { title: "Emergency Toolbox", description: "Immediate calming tools and urgent support guidance.", url: "/emergency-toolbox", emoji: "🚨", tag: "CRISIS", color: "#B84C2A" },
  { title: "Caregiver Burnout", description: "Support for exhaustion, secondary trauma, and rebuilding capacity.", url: "/caregiver-burnout", emoji: "🕯️" },
];

export default function SupportHub() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Support Hub" subtitle="People, crisis tools, and guided conversations" backTo="/dashboard" />
      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🤝</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>All Support in One Place</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>Find help for right now, prepare for professional conversations, and keep your support team organized.</p>
        </div>
        <div className="space-y-3">{SUPPORT_ITEMS.map(item => <HubCard key={item.title} item={item} />)}</div>
        <div className="pb-8" />
      </div>
    </div>
  );
}