import { CalendarPlus, Bell } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function DocumentCalendarSyncPanel({ parsedData, enabled, onChange }) {
  if (!parsedData) return null;

  const calendarCount = (parsedData.calendar_items || []).filter(item => item.date).length;
  const deadlineCount = (parsedData.deadlines || []).filter(item => item.due_date).length;
  const keyDateCount = parsedData.key_dates?.length || 0;
  const total = calendarCount + deadlineCount || keyDateCount;

  if (!total) return null;

  return (
    <label className="flex items-start gap-3 rounded-2xl p-3" style={{ background: "#FFF8E6", border: "1.5px solid #D9B45F" }}>
      <input
        type="checkbox"
        checked={enabled}
        onChange={e => onChange(e.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <CalendarPlus size={15} color={C.brown} />
          <p className="text-xs font-black" style={{ color: C.darkGreen }}>Sync dates to family calendar</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
          Add {total} extracted legal date{total === 1 ? "" : "s"} to the master family calendar and create push reminders for upcoming court dates.
        </p>
        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold" style={{ color: C.brown }}>
          <Bell size={12} /> Court and hearing reminders will appear in notifications.
        </div>
      </div>
    </label>
  );
}