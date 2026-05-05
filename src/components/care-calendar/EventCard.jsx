import { C } from "@/lib/rooted-constants";
import { MapPin, Repeat, Pencil, Trash2 } from "lucide-react";

const TYPE_META = {
  school_meeting: { emoji: "🏫", color: "#5B8DB8",   label: "School Meeting" },
  medication:     { emoji: "💊", color: "#B84C2A",   label: "Medication" },
  therapy:        { emoji: "🧠", color: C.midGreen,  label: "Therapy" },
  court_date:     { emoji: "⚖️", color: C.brown,     label: "Court Date" },
  appointment:    { emoji: "📅", color: C.gold,      label: "Appointment" },
  activity:       { emoji: "🎯", color: C.darkGreen, label: "Activity" },
  other:          { emoji: "📌", color: C.mutedText,  label: "Other" },
};

export default function EventCard({ event, onEdit, onDelete, canEdit }) {
  const meta = TYPE_META[event.event_type] || TYPE_META.other;
  const isConfirmed = event.status === "confirmed";
  const isCancelled = event.status === "cancelled";

  return (
    <div
      className="rounded-2xl p-4 space-y-2"
      style={{
        background: "#fff",
        border: `1.5px solid ${isCancelled ? "#eee" : meta.color + "33"}`,
        opacity: isCancelled ? 0.6 : 1,
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${meta.color}18` }}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-sm leading-snug" style={{ color: C.darkGreen }}>{event.title}</p>
            {/* Status badge */}
            <span
              className="text-[9px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: isConfirmed ? "#EAF4EA" : isCancelled ? "#eee" : "#FFF8E6",
                color: isConfirmed ? C.midGreen : isCancelled ? C.mutedText : "#B8860B",
              }}
            >
              {isConfirmed ? "✅ Confirmed" : isCancelled ? "❌ Cancelled" : "⏳ Pending"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${meta.color}18`, color: meta.color }}
            >
              {meta.label}
            </span>
            {event.child_name && (
              <span className="text-[10px]" style={{ color: C.mutedText }}>👶 {event.child_name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Date / time */}
      <div className="flex items-center gap-3 text-[10px]" style={{ color: C.mutedText }}>
        <span>
          {new Date(event.date + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          })}
          {event.time && ` · ${event.time}`}
        </span>
        {event.recurrence && event.recurrence !== "none" && (
          <span className="flex items-center gap-0.5">
            <Repeat size={9} /> {event.recurrence}
          </span>
        )}
      </div>

      {/* Medication info */}
      {event.event_type === "medication" && event.medication_name && (
        <div className="rounded-lg px-3 py-2 text-[10px] font-bold"
          style={{ background: "#FEF3EE", color: "#B84C2A" }}>
          💊 {event.medication_name}{event.medication_dose && ` — ${event.medication_dose}`}
        </div>
      )}

      {/* Location */}
      {event.location && (
        <div className="flex items-center gap-1 text-[10px]" style={{ color: C.mutedText }}>
          <MapPin size={9} /> {event.location}
        </div>
      )}

      {/* Notes */}
      {event.notes && (
        <p className="text-[10px] leading-relaxed" style={{ color: "#3a3028" }}>{event.notes}</p>
      )}

      {/* Added by + actions */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[9px]" style={{ color: C.mutedText }}>
          Added by {event.added_by_name || event.added_by_email || "someone"}
        </p>
        {canEdit && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(event)}
              className="flex items-center justify-center rounded-lg"
              style={{ width: 30, height: 30, background: C.cream, border: "none", cursor: "pointer" }}>
              <Pencil size={11} color={C.darkGreen} />
            </button>
            <button onClick={() => onDelete(event.id)}
              className="flex items-center justify-center rounded-lg"
              style={{ width: 30, height: 30, background: "#FEF3EE", border: "none", cursor: "pointer" }}>
              <Trash2 size={11} color="#B84C2A" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}