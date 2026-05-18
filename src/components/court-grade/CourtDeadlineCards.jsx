import { CalendarClock } from "lucide-react";
import { C } from "@/lib/rooted-constants";

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function CourtDeadlineCards({ records }) {
  const deadlines = records
    .filter(record => record.hearing_date || record.deadline_date)
    .slice(0, 6)
    .map(record => ({ ...record, days: daysUntil(record.hearing_date || record.deadline_date) }));

  return (
    <section className="grid grid-cols-1 gap-2">
      {deadlines.length === 0 ? (
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No court countdowns yet</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Add hearing, 72-hour, 30-day, or 90-day records to track reminders.</p>
        </div>
      ) : deadlines.map(record => (
        <div key={record.id} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <CalendarClock size={18} color={C.gold} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate" style={{ color: C.darkGreen }}>{record.title}</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>{new Date(record.hearing_date || record.deadline_date).toLocaleString()}</p>
          </div>
          <span className="rounded-xl px-2 py-1 text-xs font-black" style={{ background: record.days <= 3 ? "#FEF3EE" : C.cream, color: record.days <= 3 ? "#9A3412" : C.darkGreen }}>
            {record.days === 0 ? "Today" : `${record.days}d`}
          </span>
        </div>
      ))}
    </section>
  );
}