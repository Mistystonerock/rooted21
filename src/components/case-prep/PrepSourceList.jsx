import { CheckSquare, CalendarDays } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function PrepSourceList({ title, type, items }) {
  const Icon = type === "calendar" ? CalendarDays : CheckSquare;

  return (
    <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} color={C.midGreen} />
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs" style={{ color: C.mutedText }}>No upcoming items found.</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map(item => (
            <div key={item.id} className="rounded-xl px-3 py-2" style={{ background: C.offWhite }}>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{item.title}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>{item.dateLabel}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}