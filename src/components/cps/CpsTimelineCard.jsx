import { CalendarDays, Clock } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const TIMELINE = [
  { title: "Shelter-care / emergency hearing", time: "Usually within 72 hours", note: "Ask what order is in place, who has custody, visitation rules, and what must happen before the next hearing." },
  { title: "Adjudication", time: "Generally 30 days, 60 max", note: "The court decides whether abuse, neglect, or dependency is proven." },
  { title: "Disposition + case plan", time: "After adjudication", note: "The court orders services, visitation, placement, and case-plan requirements." },
  { title: "Review hearings", time: "About every 90 days", note: "Progress, reasonable efforts, visits, services, and barriers are reviewed." },
  { title: "Sunset / annual review", time: "Around 1 year", note: "The court reviews permanency progress and whether temporary custody should continue." },
  { title: "Permanency wall", time: "Around 24 months", note: "A long-term decision is usually required. Keep documentation current." },
];

export default function CpsTimelineCard() {
  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={16} color={C.midGreen} />
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>Ohio CPS court timeline guide</p>
      </div>
      <div className="space-y-3">
        {TIMELINE.map(item => (
          <div key={item.title} className="rounded-xl p-3" style={{ background: C.offWhite }}>
            <div className="flex items-center gap-2">
              <Clock size={13} color={C.gold} />
              <p className="text-xs font-black" style={{ color: C.darkGreen }}>{item.title}</p>
            </div>
            <p className="mt-1 text-[11px] font-bold" style={{ color: C.brown }}>{item.time}</p>
            <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{item.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed" style={{ color: C.mutedText }}>This is plain-language navigation, not legal advice. Confirm deadlines with your attorney or court paperwork.</p>
    </section>
  );
}