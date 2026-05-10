import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { GripVertical, Pencil, Trash2, ChevronDown, ChevronUp, FileText, Lock } from "lucide-react";

const TYPE_CONFIG = {
  placement: { emoji: "🏠", color: "#2E7D60", bg: "#EAF4EA" },
  school:    { emoji: "🏫", color: "#1A5FAD", bg: "#EAF0FF" },
  milestone: { emoji: "⭐", color: "#B07D00", bg: "#FFF8E0" },
  medical:   { emoji: "🏥", color: "#B84C2A", bg: "#FEF3EE" },
  family:    { emoji: "❤️", color: "#C2185B", bg: "#FFF0F5" },
  loss:      { emoji: "🕯️", color: "#555", bg: "#F5F5F5" },
  achievement: { emoji: "🏅", color: "#6A1B9A", bg: "#F5EEF8" },
  other:     { emoji: "📌", color: C.brown, bg: C.offWhite },
};

export default function LifeStoryCard({ entry, dragHandleProps, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const config = TYPE_CONFIG[entry.entry_type] || TYPE_CONFIG.other;

  const hasExtra = entry.description || entry.photo_url || entry.document_url || entry.people_involved || entry.location || entry.private_note;

  return (
    <div className="flex gap-3 items-start relative" style={{ zIndex: 1 }}>
      {/* Timeline dot */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm"
        style={{ background: config.bg, border: `2px solid ${config.color}`, zIndex: 2 }}
      >
        {config.emoji}
      </div>

      {/* Card */}
      <div className="flex-1 rounded-xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
        {/* Header row */}
        <div className="flex items-start gap-2 px-3 py-2.5">
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing"
            style={{ touchAction: "none" }}
          >
            <GripVertical size={14} color={C.cream} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight" style={{ color: C.darkGreen }}>{entry.title}</p>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {entry.date && (
                <span className="text-[10px]" style={{ color: C.mutedText }}>
                  {entry.date_approximate ? "~" : ""}{entry.date}
                </span>
              )}
              {entry.age_at_event && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: config.bg, color: config.color }}>
                  {entry.age_at_event}
                </span>
              )}
              {entry.location && (
                <span className="text-[10px]" style={{ color: C.mutedText }}>📍 {entry.location}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {hasExtra && (
              <button
                onClick={() => setExpanded(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {expanded ? <ChevronUp size={14} color={C.mutedText} /> : <ChevronDown size={14} color={C.mutedText} />}
              </button>
            )}
            <button onClick={() => onEdit(entry)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Pencil size={13} color={C.mutedText} />
            </button>
            <button onClick={() => onDelete(entry.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Trash2 size={13} color={C.mutedText} />
            </button>
          </div>
        </div>

        {/* Photo preview strip (always visible if photo exists) */}
        {entry.photo_url && (
          <div className="px-3 pb-2">
            <img
              src={entry.photo_url}
              alt="Memory"
              className="w-full max-h-40 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Expandable details */}
        {expanded && hasExtra && (
          <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: C.cream }}>
            {entry.description && (
              <p className="text-xs leading-relaxed pt-2" style={{ color: C.darkGreen }}>{entry.description}</p>
            )}
            {entry.people_involved && (
              <p className="text-[11px]" style={{ color: C.mutedText }}>👥 {entry.people_involved}</p>
            )}
            {entry.document_url && (
              <a
                href={entry.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-bold"
                style={{ color: C.brown, textDecoration: "none" }}
              >
                <FileText size={11} /> {entry.document_name || "View Attached Document"}
              </a>
            )}
            {entry.private_note && (
              <div className="flex gap-2 rounded-lg px-2.5 py-2 mt-1" style={{ background: "#FEF3EE" }}>
                <Lock size={10} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
                <p className="text-[10px] italic leading-relaxed" style={{ color: "#B84C2A" }}>
                  {entry.private_note}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}