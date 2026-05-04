import { useState } from "react";
import { Plus } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { TASK_COLORS } from "@/lib/schedule-tasks";

const EMOJI_SUGGESTIONS = [
  "⭐","🎯","📚","🎨","🧩","🌳","🚴","🍎","💧","🎵","🧸","🏃","🎲","💪","🌈","🐶",
  "🦁","🌙","☀️","🌸","🚀","🏆","✏️","🧹","🤸","💤","🍳","🎤","🎹","🌊",
];

export default function CustomTaskForm({ onAdd, onCancel }) {
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [duration, setDuration] = useState(10);
  const [color, setColor] = useState(TASK_COLORS[0]);
  const [note, setNote] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd({ label: label.trim(), emoji, duration_min: Number(duration), color, note: note.trim() });
    setLabel(""); setEmoji("⭐"); setDuration(10); setColor(TASK_COLORS[0]); setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-4 space-y-3"
      style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
        CREATE CUSTOM TASK
      </p>

      {/* Emoji picker */}
      <div>
        <p className="text-xs font-bold mb-1.5" style={{ color: C.darkGreen }}>Icon</p>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_SUGGESTIONS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className="w-8 h-8 rounded-lg text-lg transition-all"
              style={{
                background: emoji === e ? `${color}35` : C.offWhite,
                border: emoji === e ? `2px solid ${color}` : `1px solid ${C.cream}`,
                cursor: "pointer",
              }}
            >{e}</button>
          ))}
        </div>
      </div>

      {/* Label */}
      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="Task name (e.g. Read for 10 minutes)"
        className="w-full rounded-xl px-3 py-2.5 text-sm"
        style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none" }}
        required
      />

      {/* Duration */}
      <div>
        <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>Duration: {duration} min</p>
        <input
          type="range" min={1} max={60} value={duration}
          onChange={e => setDuration(e.target.value)}
          className="w-full"
          style={{ accentColor: color }}
        />
        <div className="flex justify-between text-[9px]" style={{ color: C.mutedText }}>
          <span>1 min</span><span>30 min</span><span>60 min</span>
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-bold mb-1.5" style={{ color: C.darkGreen }}>Color</p>
        <div className="flex gap-2">
          {TASK_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                background: c,
                border: color === c ? `3px solid ${C.darkGreen}` : `2px solid transparent`,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      {/* Note (optional) */}
      <input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Optional note for your child (e.g. use the blue toothbrush)"
        className="w-full rounded-xl px-3 py-2 text-xs"
        style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none" }}
      />

      <div className="flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold"
          style={{ background: C.cream, border: "none", color: C.mutedText, cursor: "pointer" }}>
          Cancel
        </button>
        <button type="submit"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
          style={{ background: C.darkGreen, border: "none", color: C.white, cursor: "pointer" }}>
          <Plus size={13} /> Add Task
        </button>
      </div>
    </form>
  );
}