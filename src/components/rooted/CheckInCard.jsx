import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { CheckCircle2 } from "lucide-react";

const EMOJIS = ["😰", "😟", "😐", "🙂", "😊"];
const LABELS = ["Very hard", "Hard", "Okay", "Good", "Great"];

function RatingRow({ label, emoji, value, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>
        {label}
      </p>
      <div className="flex gap-2">
        {EMOJIS.map((e, i) => {
          const score = i + 1;
          const selected = value === score;
          return (
            <button
              key={score}
              onClick={() => onChange(score)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
              style={{
                background: selected ? C.darkGreen : C.offWhite,
                border: `2px solid ${selected ? C.darkGreen : C.cream}`,
              }}
            >
              <span className="text-lg">{e}</span>
              <span
                className="text-[9px] font-bold leading-tight text-center"
                style={{ color: selected ? C.cream : C.mutedText }}
              >
                {LABELS[i]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CheckInCard({ sessionId, onDone }) {
  const [childReg, setChildReg] = useState(null);
  const [parentCalm, setParentCalm] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!childReg || !parentCalm) return;
    setSaving(true);
    await base44.entities.CheckIn.create({
      session_id: sessionId || "",
      child_regulation: childReg,
      parent_calm: parentCalm,
      note: note.trim(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => onDone?.(), 1200);
  }

  if (saved) {
    return (
      <div
        className="rounded-2xl p-5 mt-3.5 flex flex-col items-center gap-2"
        style={{ background: C.white, border: `1px solid ${C.cream}` }}
      >
        <CheckCircle2 size={32} color={C.midGreen} />
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
          Check-in saved!
        </p>
        <p className="text-xs" style={{ color: C.mutedText }}>
          Your growth is being tracked.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 mt-3.5"
      style={{ background: C.white, border: `1px solid ${C.cream}` }}
    >
      <p className="font-serif font-bold text-[15px] mb-0.5" style={{ color: C.darkGreen }}>
        After-session check-in
      </p>
      <p className="text-xs mb-4" style={{ color: C.mutedText }}>
        Rate how things went — this tracks your growth over time.
      </p>

      <RatingRow
        label="🧒 Child's emotional regulation"
        value={childReg}
        onChange={setChildReg}
      />
      <RatingRow
        label="🌿 Your calm level"
        value={parentCalm}
        onChange={setParentCalm}
      />

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional reflection… what helped most?"
        rows={2}
        className="w-full rounded-xl p-3 text-xs font-sans resize-none mb-3"
        style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
      />

      <button
        onClick={handleSave}
        disabled={!childReg || !parentCalm || saving}
        className="w-full py-3 rounded-xl border-none font-extrabold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          background: childReg && parentCalm ? C.darkGreen : C.cream,
          color: childReg && parentCalm ? C.white : C.mutedText,
          cursor: childReg && parentCalm ? "pointer" : "default",
        }}
      >
        {saving ? "Saving…" : "Save Check-in"}
      </button>
    </div>
  );
}