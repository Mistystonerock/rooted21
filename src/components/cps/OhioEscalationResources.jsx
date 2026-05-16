import { AlertTriangle, Phone } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const RESOURCES = [
  { title: "OH-CHILD hotline", phone: "855-642-4453", note: "For suspected child abuse or neglect reports." },
  { title: "Youth & Family Ombudsman", phone: "1-877-OH-YOUTH", note: "For concerns about government services related to CPS, foster care, or adoption." },
  { title: "OhioKAN", phone: "844-OHIO-KAN", note: "Kinship and adoption navigation support and resource referrals." },
  { title: "Ohio 2-1-1", phone: "211", note: "Local benefits, housing, food, and crisis resource referrals." },
];

export default function OhioEscalationResources() {
  return (
    <section className="rounded-2xl p-4" style={{ background: "#FEF8EC", border: `1.5px solid ${C.gold}` }}>
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={16} color={C.gold} />
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>Ohio support + escalation</p>
      </div>
      <div className="space-y-2">
        {RESOURCES.map(resource => (
          <a key={resource.title} href={`tel:${resource.phone.replace(/[^0-9]/g, "")}`} className="block rounded-xl p-3 no-underline" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <div className="flex items-start gap-3">
              <Phone size={15} color={C.midGreen} className="mt-0.5" />
              <div>
                <p className="text-xs font-black" style={{ color: C.darkGreen }}>{resource.title}: {resource.phone}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{resource.note}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}