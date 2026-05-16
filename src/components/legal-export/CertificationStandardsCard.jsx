import { BadgeCheck, FileKey, LockKeyhole, Scale } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const ITEMS = [
  { icon: Scale, title: "FRE 902(11)-style support", text: "Includes business-record certification language for attorney or custodian review." },
  { icon: FileKey, title: "16-digit authentication code", text: "Every packet receives a unique code printed on the export and saved to the export log." },
  { icon: LockKeyhole, title: "Tamper-evident hash chain", text: "Each selected record is hashed in order so altered or missing records are easier to detect." },
  { icon: BadgeCheck, title: "Thread + document scope", text: "Parents choose the exact communication thread and secure-vault documents to include." },
];

export default function CertificationStandardsCard() {
  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <p className="text-sm font-black" style={{ color: C.darkGreen }}>Certified export safeguards</p>
      <div className="mt-3 grid gap-2">
        {ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 rounded-xl p-3" style={{ background: C.offWhite }}>
              <Icon size={16} color={C.midGreen} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black" style={{ color: C.darkGreen }}>{item.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed" style={{ color: C.mutedText }}>Rooted 21 provides documentation tools; court admissibility is decided by the court and should be reviewed with legal counsel.</p>
    </section>
  );
}