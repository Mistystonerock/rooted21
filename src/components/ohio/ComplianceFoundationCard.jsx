import { LockKeyhole, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const FOUNDATIONS = [
  "No direct SACWIS integration; parent-owned mirror fields and exports only.",
  "HIPAA-aware design with BAA readiness when working with covered entities.",
  "42 CFR Part 2 segmented consent for substance-use recovery records.",
  "FERPA-aware school records and release-of-information workflows.",
  "Append-only audit trail and court-export pathway without promising admissibility.",
  "No ads, no data resale, and no third-party tracker positioning for vulnerable families.",
];

export default function ComplianceFoundationCard() {
  return (
    <section className="rounded-2xl p-4" style={{ background: "#F7F3EA", border: `1.5px solid ${C.gold}` }}>
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck size={16} color={C.gold} />
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>Trust + compliance foundation</p>
      </div>
      <div className="grid gap-2">
        {FOUNDATIONS.map(item => (
          <p key={item} className="flex items-start gap-2 rounded-xl p-3 text-[11px] leading-relaxed" style={{ background: C.white, color: C.mutedText }}>
            <LockKeyhole size={12} color={C.midGreen} className="mt-0.5 shrink-0" /> {item}
          </p>
        ))}
      </div>
    </section>
  );
}