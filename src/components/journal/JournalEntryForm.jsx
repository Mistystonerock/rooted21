import { Heart, Lightbulb, Award, Zap } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const MOOD_OPTIONS = [
  { value: "peaceful", emoji: "😌", label: "Peaceful" },
  { value: "calm", emoji: "😊", label: "Calm" },
  { value: "okay", emoji: "🙂", label: "Okay" },
  { value: "stressed", emoji: "😰", label: "Stressed" },
  { value: "overwhelmed", emoji: "😩", label: "Overwhelmed" },
];

export default function JournalEntryForm({ entry, onUpdate, onSave, saving, isSaved }) {
  return (
    <div className="space-y-4">
      {/* MOOD SELECTOR */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
          📊 HOW ARE YOU FEELING TODAY?
        </p>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map(mood => (
            <button
              key={mood.value}
              onClick={() => onUpdate({ mood: mood.value })}
              className="flex flex-col items-center gap-1 flex-1 py-2.5 rounded-xl transition-all"
              style={{
                background: entry.mood === mood.value ? mood.value === "peaceful" || mood.value === "calm" ? C.midGreen : "#B84C2A" : C.offWhite,
                border: entry.mood === mood.value ? `2px solid ${C.darkGreen}` : `1.5px solid ${C.cream}`,
                cursor: "pointer",
              }}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <p className={`text-[9px] font-bold ${entry.mood === mood.value ? "text-white" : ""}`}
                style={entry.mood !== mood.value ? { color: C.mutedText } : {}}>
                {mood.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* REGULATION REFLECTION */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <div className="flex items-center gap-2">
          <Zap size={14} color={C.gold} />
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
            💪 MY REGULATION
          </p>
        </div>
        <p className="text-xs" style={{ color: C.mutedText }}>
          How did you manage your emotions today? What helped you stay calm?
        </p>
        <textarea
          value={entry.regulation_reflection || ""}
          onChange={e => onUpdate({ regulation_reflection: e.target.value })}
          placeholder="e.g. I took a 10-minute break when I felt frustrated. I noticed my breathing getting shallow and paused to reset..."
          className="w-full rounded-xl px-3 py-2.5 text-sm min-h-24"
          style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", fontFamily: "inherit" }}
        />
      </div>

      {/* WINS OF THE DAY */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <div className="flex items-center gap-2">
          <Award size={14} color={C.midGreen} />
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
            🏆 WINS OF THE DAY
          </p>
        </div>
        <p className="text-xs" style={{ color: C.mutedText }}>
          What went well? A moment of connection, a calm response, something your child did well?
        </p>
        <textarea
          value={entry.wins_of_day || ""}
          onChange={e => onUpdate({ wins_of_day: e.target.value })}
          placeholder="e.g. We had a great bedtime routine today. My child responded to my calm voice instead of escalating. I gave genuine praise..."
          className="w-full rounded-xl px-3 py-2.5 text-sm min-h-24"
          style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", fontFamily: "inherit" }}
        />
      </div>

      {/* GRATITUDE */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <div className="flex items-center gap-2">
          <Heart size={14} color={C.brown} />
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
            🙏 GRATITUDE
          </p>
        </div>
        <p className="text-xs" style={{ color: C.mutedText }}>
          What are you grateful for, no matter how small?
        </p>
        <textarea
          value={entry.gratitude || ""}
          onChange={e => onUpdate({ gratitude: e.target.value })}
          placeholder="e.g. I'm grateful for my coffee this morning. For my partner who helped. For my child's laugh..."
          className="w-full rounded-xl px-3 py-2.5 text-sm min-h-20"
          style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", fontFamily: "inherit" }}
        />
      </div>

      {/* WHAT I LEARNED */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <div className="flex items-center gap-2">
          <Lightbulb size={14} color={C.midGreen} />
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
            💡 WHAT I LEARNED
          </p>
        </div>
        <p className="text-xs" style={{ color: C.mutedText }}>
          Parenting insights, breakthroughs, or areas you want to work on next time?
        </p>
        <textarea
          value={entry.what_i_learned || ""}
          onChange={e => onUpdate({ what_i_learned: e.target.value })}
          placeholder="e.g. I realized that when I'm tired, I lose patience faster. Next time I'll ask for help. I'm getting better at noticing my triggers..."
          className="w-full rounded-xl px-3 py-2.5 text-sm min-h-24"
          style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", fontFamily: "inherit" }}
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
          style={{
            background: isSaved ? C.midGreen : C.darkGreen,
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isSaved ? "✓ Entry Saved" : saving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </div>
  );
}