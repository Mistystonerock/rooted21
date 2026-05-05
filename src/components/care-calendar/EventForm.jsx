import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { X } from "lucide-react";

const EVENT_TYPES = [
  { value: "school_meeting", label: "School Meeting", emoji: "🏫" },
  { value: "medication",     label: "Medication",     emoji: "💊" },
  { value: "therapy",        label: "Therapy",        emoji: "🧠" },
  { value: "court_date",     label: "Court Date",     emoji: "⚖️" },
  { value: "appointment",    label: "Appointment",    emoji: "📅" },
  { value: "activity",       label: "Activity",       emoji: "🎯" },
  { value: "other",          label: "Other",          emoji: "📌" },
];

const BLANK = {
  title: "",
  event_type: "appointment",
  date: "",
  time: "",
  location: "",
  notes: "",
  status: "pending",
  recurrence: "none",
  medication_name: "",
  medication_dose: "",
  child_name: "",
};

export default function EventForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial || BLANK);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] rounded-t-3xl"
        style={{ background: "#fff", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
            {initial ? "Edit Event" : "Add Event"}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.mutedText} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Event type */}
          <div>
            <label className="text-[10px] font-extrabold tracking-wider block mb-2" style={{ color: C.mutedText }}>EVENT TYPE</label>
            <div className="grid grid-cols-4 gap-1.5">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => set("event_type", t.value)}
                  className="py-2 px-1 rounded-xl text-[9px] font-bold flex flex-col items-center gap-0.5"
                  style={{
                    background: form.event_type === t.value ? C.darkGreen : C.cream,
                    color: form.event_type === t.value ? "#fff" : C.mutedText,
                    border: "none", cursor: "pointer",
                  }}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>TITLE *</label>
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Event name…"
              className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>

          {/* Medication fields */}
          {form.event_type === "medication" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>MEDICATION NAME</label>
                <input
                  value={form.medication_name}
                  onChange={e => set("medication_name", e.target.value)}
                  placeholder="e.g. Melatonin"
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                  style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>DOSE</label>
                <input
                  value={form.medication_dose}
                  onChange={e => set("medication_dose", e.target.value)}
                  placeholder="e.g. 5mg"
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                  style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                />
              </div>
            </div>
          )}

          {/* Child + Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>CHILD'S NAME</label>
              <input
                value={form.child_name}
                onChange={e => set("child_name", e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>DATE *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>TIME</label>
              <input
                value={form.time}
                onChange={e => set("time", e.target.value)}
                placeholder="e.g. 2:30 PM"
                className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>STATUS</label>
              <div className="flex gap-1.5">
                {["pending", "confirmed"].map(s => (
                  <button
                    key={s}
                    onClick={() => set("status", s)}
                    className="flex-1 py-2.5 rounded-xl text-[10px] font-bold capitalize"
                    style={{
                      background: form.status === s ? (s === "confirmed" ? C.midGreen : C.gold) : C.cream,
                      color: form.status === s ? "#fff" : C.mutedText,
                      border: "none", cursor: "pointer",
                    }}
                  >
                    {s === "confirmed" ? "✅ Confirmed" : "⏳ Pending"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>LOCATION</label>
            <input
              value={form.location}
              onChange={e => set("location", e.target.value)}
              placeholder="Address or virtual link…"
              className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-[10px] font-extrabold tracking-wider block mb-1.5" style={{ color: C.mutedText }}>RECURRENCE</label>
            <div className="flex gap-1.5 flex-wrap">
              {["none", "daily", "weekly", "monthly"].map(r => (
                <button
                  key={r}
                  onClick={() => set("recurrence", r)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold capitalize"
                  style={{
                    background: form.recurrence === r ? C.darkGreen : C.cream,
                    color: form.recurrence === r ? "#fff" : C.mutedText,
                    border: "none", cursor: "pointer",
                  }}
                >
                  {r === "none" ? "No repeat" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>NOTES</label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Any additional details…"
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.date}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{
              background: (form.title.trim() && form.date) ? C.darkGreen : C.cream,
              color: (form.title.trim() && form.date) ? "#fff" : C.mutedText,
              border: "none", cursor: (form.title.trim() && form.date) ? "pointer" : "default",
            }}
          >
            {saving ? "Saving…" : initial ? "Update Event" : "Add to Calendar"}
          </button>
        </div>
      </div>
    </div>
  );
}