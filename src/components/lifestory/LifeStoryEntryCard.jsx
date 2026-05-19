import { Pencil, Trash2, GripVertical, FileText, Image, Mic, NotebookText } from "lucide-react";
import { ENTRY_TYPES } from "@/pages/ChildLifeStory";
import { C } from "@/lib/rooted-constants";

const TONE_COLORS = {
  joyful: "#4CAF50",
  difficult: "#E07A5F",
  neutral: C.mutedText,
  hopeful: C.midGreen,
  scary: "#C0392B",
  bittersweet: C.gold,
};

export default function LifeStoryEntryCard({ entry, isLast, onEdit, onDelete }) {
  const typeInfo = ENTRY_TYPES[entry.entry_type] || ENTRY_TYPES.other;

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 z-10"
          style={{ background: typeInfo.color + "20", border: `2px solid ${typeInfo.color}` }}
        >
          {typeInfo.emoji}
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 mt-1" style={{ background: C.cream, minHeight: 24 }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 mb-4 rounded-2xl overflow-hidden"
        style={{ background: C.white, border: `1px solid ${C.cream}` }}>

        {/* Photo gallery */}
        {Array.from(new Set([...(entry.photo_urls || []), entry.photo_url].filter(Boolean))).length > 0 && (
          <div className="grid grid-cols-2 gap-1 p-1">
            {Array.from(new Set([...(entry.photo_urls || []), entry.photo_url].filter(Boolean))).slice(0, 4).map((url, index) => (
              <img key={url} src={url} alt={`Memory ${index + 1}`} className="h-28 w-full object-cover rounded-xl" />
            ))}
          </div>
        )}

        <div className="p-3">
          {/* Sensitive banner */}
          {(entry.is_sensitive || ENTRY_TYPES[entry.entry_type]?.sensitive) && (
            <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 rounded-lg"
              style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <span className="text-xs">🔒</span>
              <p className="text-[10px] font-bold" style={{ color: "#B84C2A" }}>Sensitive — caregiver record only</p>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{entry.title}</p>
                {entry.emotional_tone && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: TONE_COLORS[entry.emotional_tone] + "18", color: TONE_COLORS[entry.emotional_tone] }}>
                    {entry.emotional_tone}
                  </span>
                )}
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                {entry.date}{entry.age_at_event ? ` · Age ${entry.age_at_event}` : ""}
                {entry.location ? ` · 📍 ${entry.location}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <GripVertical size={14} color={C.cream} />
              <button onClick={() => onEdit(entry)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Pencil size={13} color={C.mutedText} />
              </button>
              <button onClick={() => onDelete(entry.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Trash2 size={13} color={C.mutedText} />
              </button>
            </div>
          </div>

          {entry.description && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "#3a3028" }}>{entry.description}</p>
          )}
          {entry.linked_milestone && (
            <p className="text-[10px] mt-1.5 font-bold" style={{ color: C.darkGreen }}>🏷️ Linked milestone: {entry.linked_milestone}</p>
          )}
          {entry.people_involved && (
            <p className="text-[10px] mt-1.5" style={{ color: C.mutedText }}>👥 {entry.people_involved}</p>
          )}
          {entry.voice_note_url && (
            <div className="mt-2 rounded-xl p-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="mb-1 flex items-center gap-1 text-[10px] font-bold" style={{ color: C.darkGreen }}><Mic size={11} /> Voice note</p>
              <audio controls src={entry.voice_note_url} className="w-full" />
            </div>
          )}
          {entry.journal_entry && (
            <div className="mt-2 rounded-xl p-2" style={{ background: "#FEF9EC", border: `1px solid ${C.gold}55` }}>
              <p className="mb-1 flex items-center gap-1 text-[10px] font-bold" style={{ color: C.brown }}><NotebookText size={11} /> Private journal entry</p>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3028" }}>{entry.journal_entry}</p>
            </div>
          )}

          {/* Attachments */}
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from(new Set([...(entry.photo_urls || []), entry.photo_url].filter(Boolean))).length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: C.offWhite, color: C.darkGreen }}>
                <Image size={10} /> {Array.from(new Set([...(entry.photo_urls || []), entry.photo_url].filter(Boolean))).length} photo(s)
              </span>
            )}
            {entry.document_url && (
              <a href={entry.document_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{ background: C.offWhite, color: C.darkGreen, textDecoration: "none" }}>
                <FileText size={10} /> Document
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}