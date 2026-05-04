import { format } from "date-fns";
import { C } from "@/lib/rooted-constants";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";

const MOOD_EMOJI = {
  peaceful: "😌",
  calm: "😊",
  okay: "🙂",
  stressed: "😰",
  overwhelmed: "😩",
};

const MOOD_COLOR = {
  peaceful: C.midGreen,
  calm: C.midGreen,
  okay: C.gold,
  stressed: "#C9844C",
  overwhelmed: "#B84C2A",
};

export default function JournalEntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const entryDate = new Date(entry.entry_date);
  const dateStr = format(entryDate, "MMM d, yyyy");
  const dayStr = format(entryDate, "EEEE");

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all ${expanded ? "ring-2" : ""}`}
      style={{
        background: C.white,
        border: `1.5px solid ${C.cream}`,
        ringColor: expanded ? C.midGreen : "transparent",
      }}
    >
      {/* HEADER */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between"
        style={{ background: MOOD_COLOR[entry.mood] || C.cream }}
      >
        <div className="flex items-center gap-3 text-left flex-1">
          <span className="text-2xl">{MOOD_EMOJI[entry.mood]}</span>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight" style={{ color: entry.mood === "peaceful" || entry.mood === "calm" ? "white" : C.darkGreen }}>
              {dayStr}
            </p>
            <p className="text-xs opacity-80" style={{ color: entry.mood === "peaceful" || entry.mood === "calm" ? "white" : C.darkGreen }}>
              {dateStr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: `${entry.mood === "peaceful" || entry.mood === "calm" ? "white" : MOOD_COLOR[entry.mood]}30`, color: entry.mood === "peaceful" || entry.mood === "calm" ? "white" : C.darkGreen }}>
            {entry.mood}
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* EXPANDED CONTENT */}
      {expanded && (
        <div className="px-4 py-4 space-y-4 border-t" style={{ borderColor: C.cream }}>
          {/* REGULATION */}
          {entry.regulation_reflection && (
            <div>
              <p className="text-[10px] font-extrabold tracking-wider mb-1.5" style={{ color: C.mutedText }}>
                💪 MY REGULATION
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.warmText }}>
                {entry.regulation_reflection}
              </p>
            </div>
          )}

          {/* WINS */}
          {entry.wins_of_day && (
            <div>
              <p className="text-[10px] font-extrabold tracking-wider mb-1.5" style={{ color: C.mutedText }}>
                🏆 WINS OF THE DAY
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.warmText }}>
                {entry.wins_of_day}
              </p>
            </div>
          )}

          {/* GRATITUDE */}
          {entry.gratitude && (
            <div>
              <p className="text-[10px] font-extrabold tracking-wider mb-1.5" style={{ color: C.mutedText }}>
                🙏 GRATITUDE
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.warmText }}>
                {entry.gratitude}
              </p>
            </div>
          )}

          {/* WHAT I LEARNED */}
          {entry.what_i_learned && (
            <div>
              <p className="text-[10px] font-extrabold tracking-wider mb-1.5" style={{ color: C.mutedText }}>
                💡 WHAT I LEARNED
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.warmText }}>
                {entry.what_i_learned}
              </p>
            </div>
          )}

          {/* DELETE */}
          <button
            onClick={() => onDelete(entry.id)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold"
            style={{ background: "#B84C2A18", border: "none", color: "#B84C2A", cursor: "pointer" }}
          >
            <Trash2 size={12} /> Delete Entry
          </button>
        </div>
      )}
    </div>
  );
}