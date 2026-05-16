import { CheckCircle2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const STAGES = [
  { title: "Stage 1 · MVP credibility", window: "0–6 months", items: ["CPS navigation", "Case-plan tracker", "Visitation logs", "IEP/504 vault", "OhioKAN + Ombudsman links", "Court-ready exports"] },
  { title: "Stage 2 · Court + clinical", window: "6–18 months", items: ["Unalterable records", "Practitioner accounts", "Parent-partner program", "42 CFR Part 2 consent", "SOC 2 Type II path"] },
  { title: "Stage 3 · Statewide adoption", window: "18–36 months", items: ["DCY/ODJFS pathway", "OhioRISE referrals", "Plan of Safe Care", "County deployment", "WCAG 2.1 AA localization"] },
  { title: "Stage 4 · National expansion", window: "36+ months", items: ["Replicate CCWIS mirror model", "Foundation co-investment", "State-by-state resource routing"] },
];

export default function BlueprintStageCard() {
  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <p className="text-sm font-black" style={{ color: C.darkGreen }}>Build roadmap from your blueprint</p>
      <div className="mt-3 space-y-3">
        {STAGES.map(stage => (
          <div key={stage.title} className="rounded-xl p-3" style={{ background: C.offWhite }}>
            <p className="text-xs font-black" style={{ color: C.darkGreen }}>{stage.title}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide" style={{ color: C.brown }}>{stage.window}</p>
            <div className="mt-2 grid gap-1.5">
              {stage.items.map(item => (
                <p key={item} className="flex items-center gap-2 text-[11px]" style={{ color: C.mutedText }}>
                  <CheckCircle2 size={12} color={C.midGreen} /> {item}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}