import { ExternalLink, Phone } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const RESOURCES_211 = [
  {
    id: "food-housing",
    icon: "🍎",
    title: "Food & Housing Assistance",
    description: "Emergency food, SNAP benefits, rental assistance, homeless services, and housing resources.",
  },
  {
    id: "mental-health",
    icon: "🧠",
    title: "Mental Health Crisis Support",
    description: "Immediate mental health crisis lines, suicide prevention, psychiatric emergency services.",
  },
  {
    id: "childcare",
    icon: "👶",
    title: "Childcare & Respite Care",
    description: "Licensed childcare, after-school programs, respite care for parents needing a break.",
  },
  {
    id: "dv-support",
    icon: "🛡️",
    title: "Domestic Violence Support",
    description: "Safe housing, counseling, legal advocacy, and support for survivors of domestic violence.",
  },
  {
    id: "substance-abuse",
    icon: "💊",
    title: "Substance Abuse Recovery",
    description: "Treatment programs, support groups, recovery resources for addiction and substance abuse.",
  },
  {
    id: "legal-aid",
    icon: "⚖️",
    title: "Legal Aid Services",
    description: "Free or low-cost legal representation, family law, custody, and rights advocacy.",
  },
  {
    id: "transportation",
    icon: "🚌",
    title: "Transportation Help",
    description: "Public transit assistance, medical transportation, programs for seniors and people with disabilities.",
  },
  {
    id: "utilities",
    icon: "💡",
    title: "Utility Assistance",
    description: "Help paying electric, gas, water, and other essential utility bills.",
  },
];

export default function CommunityResourcesSection() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-4" style={{ background: C.lightGreen }}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">📞</span>
          <div className="flex-1">
            <p className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>Ohio 211 Community Resources</p>
            <p className="text-xs mt-1" style={{ color: C.darkGreen }}>
              A free, confidential service connecting Ohioans to local help for basic needs, health, and human services.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Contact */}
      <div className="flex gap-2">
        <a
          href="tel:211"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm"
          style={{ background: C.midGreen, color: C.white, border: "none", textDecoration: "none" }}
        >
          <Phone size={14} />
          Call 211
        </a>
        <a
          href="https://ohio211.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm border-2"
          style={{ borderColor: C.midGreen, background: C.white, color: C.midGreen, textDecoration: "none" }}
        >
          <ExternalLink size={14} />
          Visit Website
        </a>
      </div>

      {/* Resource Categories Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {RESOURCES_211.map((resource) => (
          <div
            key={resource.id}
            className="rounded-xl p-3 flex flex-col"
            style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
          >
            <p className="text-2xl mb-1.5">{resource.icon}</p>
            <p className="font-bold text-xs leading-tight mb-1" style={{ color: C.darkGreen }}>
              {resource.title}
            </p>
            <p className="text-[10px] leading-tight mb-2.5 flex-1" style={{ color: C.mutedText }}>
              {resource.description}
            </p>
            <a
              href="https://ohio211.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[10px] font-bold rounded-lg py-1.5"
              style={{ background: C.offWhite, color: C.midGreen, border: "none", cursor: "pointer", textDecoration: "none" }}
            >
              Find Near Me
              <ExternalLink size={10} />
            </a>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
          <strong>211 is free and confidential.</strong> Available 24/7 by phone, text, chat, or website. Helps with food, housing, mental health, childcare, legal aid, and more. Ohio connects you to local resources in your area.
        </p>
      </div>
    </div>
  );
}