import { BadgeCheck, EyeOff, HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const indicators = [
  { icon: LockKeyhole, title: "Encrypted data", text: "Sensitive records are protected in transit and at rest." },
  { icon: EyeOff, title: "No data selling", text: "Rooted 21 does not sell family data to advertisers." },
  { icon: ShieldCheck, title: "HIPAA-aware", text: "Built with privacy practices for health-adjacent family records." },
  { icon: BadgeCheck, title: "Verified resources", text: "Resource listings show the last verification date when available." },
  { icon: HeartHandshake, title: "Transparency", text: "Plain-language privacy controls explain what each choice does." }
];

export default function TrustIndicatorGrid() {
  return (
    <section className="grid gap-2 sm:grid-cols-2">
      {indicators.map(({ icon: Icon, title, text }) => (
        <div key={title} className="rounded-2xl p-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-center gap-2">
            <Icon size={16} color={C.darkGreen} />
            <p className="text-sm font-black" style={{ color: C.darkGreen }}>{title}</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{text}</p>
        </div>
      ))}
    </section>
  );
}