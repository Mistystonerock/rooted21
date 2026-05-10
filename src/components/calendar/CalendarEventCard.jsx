import { C } from "@/lib/rooted-constants";
import { Calendar, AlertCircle, Clock, MapPin, Users } from "lucide-react";

const EVENT_TYPES = {
  court_deadline: { emoji: "⚖️", label: "Court Deadline", color: "#C0392B" },
  visitation: { emoji: "👥", label: "Visitation", color: C.midGreen },
  task: { emoji: "✓", label: "Task Due", color: C.gold },
  appointment: { emoji: "📋", label: "Appointment", color: "#5B8DB8" },
};

export default function CalendarEventCard({ event, daysUntil }) {
  const isOverdue = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isThisWeek = daysUntil > 0 && daysUntil <= 7;

  const typeConfig = EVENT_TYPES[event.event_type] || EVENT_TYPES.task;

  return (
    <div
      className="rounded-xl p-3.5 border-l-4 transition-all hover:shadow-md"
      style={{
        background: "#fff",
        borderColor: typeConfig.color,
        borderLeft: `4px solid ${typeConfig.color}`,
        opacity: isOverdue ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span style={{ fontSize: 14 }}>{typeConfig.emoji}</span>
            <p className="font-bold text-xs truncate" style={{ color: C.darkGreen }}>
              {event.title}
            </p>
          </div>

          {event.date && (
            <div className="flex items-center gap-1.5 mb-1.5 text-[10px]" style={{ color: C.mutedText }}>
              <Calendar size={10} />
              <span>
                {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              {event.time && <span className="ml-1">@ {event.time}</span>}
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: C.mutedText }}>
              <MapPin size={10} />
              <span>{event.location}</span>
            </div>
          )}

          {event.case_name && (
            <p className="text-[10px] mt-1.5" style={{ color: C.mutedText }}>
              📋 {event.case_name}
            </p>
          )}

          {event.attendees && (
            <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>
              <Users size={9} className="inline mr-1" />
              {event.attendees}
            </p>
          )}
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {isOverdue && (
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
              style={{ background: "#FDECEC", color: "#C0392B" }}
            >
              ⚠️ Overdue
            </span>
          )}
          {isToday && (
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
              style={{ background: "#FFF0E6", color: "#B87A0A" }}
            >
              📍 TODAY
            </span>
          )}
          {isThisWeek && !isToday && !isOverdue && (
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
              style={{ background: "#EAF4EA", color: C.midGreen }}
            >
              Soon
            </span>
          )}
        </div>
      </div>

      {/* Days countdown */}
      {daysUntil !== null && (
        <p className="text-[9px] mt-2" style={{ color: isOverdue ? "#C0392B" : C.mutedText }}>
          {isOverdue
            ? `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""} overdue`
            : isToday
            ? "Due today"
            : `${daysUntil} day${daysUntil !== 1 ? "s" : ""} away`}
        </p>
      )}
    </div>
  );
}