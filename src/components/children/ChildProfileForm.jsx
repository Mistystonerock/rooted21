import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { X, Plus, Target } from "lucide-react";

const EMOJIS = ["🧒", "👦", "👧", "🧒‍♂️", "🧒‍♀️", "👶", "🌟", "🦁", "🐻", "🐺", "🦊", "🐸"];

const PLACEMENT_OPTIONS = [
  { value: "biological", label: "Biological" },
  { value: "foster",     label: "Foster" },
  { value: "adoptive",   label: "Adoptive" },
  { value: "kinship",    label: "Kinship" },
  { value: "other",      label: "Other" },
];

const SUGGESTED_GOALS = [
  "Improve emotional regulation",
  "Build trust & attachment",
  "Reduce school anxiety",
  "Develop sensory coping skills",
  "Improve peer relationships",
  "Manage anger & frustration",
  "Build self-esteem",
  "Reduce separation anxiety",
  "Improve sleep routine",
  "Develop communication skills",
];

const BLANK = {
  first_name: "",
  last_name: "",
  age: "",
  placement_type: "",
  photo_emoji: "🧒",
  care_goals: [],
  strengths: "",
  concerns: "",
  triggers: "",
  coping_tools: "",
  behavior_patterns: "",
  school_notes: "",
};

export default function ChildProfileForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial ? { ...BLANK, ...initial } : BLANK);
  const [customGoal, setCustomGoal] = useState("");

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  function toggleGoal(goal) {
    setForm(f => {
      const goals = f.care_goals || [];
      return {
        ...f,
        care_goals: goals.includes(goal)
          ? goals.filter(g => g !== goal)
          : [...goals, goal],
      };
    });
  }

  function addCustomGoal() {
    const g = customGoal.trim();
    if (!g) return;
    setForm(f => ({ ...f, care_goals: [...(f.care_goals || []), g] }));
    setCustomGoal("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.first_name.trim()) return;
    onSave({ ...form, age: form.age ? Number(form.age) : undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Emoji picker */}
      <div>
        <p className="text-[11px] font-bold mb-2" style={{ color: C.darkGreen }}>Choose an avatar</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(e => (
            <button
              type="button"
              key={e}
              onClick={() => set("photo_emoji", e)}
              className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
              style={{
                background: form.photo_emoji === e ? C.darkGreen : C.cream,
                border: "none", cursor: "pointer",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name & age */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold block mb-1" style={{ color: C.darkGreen }}>First Name *</label>
          <input
            value={form.first_name}
            onChange={e => set("first_name", e.target.value)}
            required
            placeholder="e.g. Jordan"
            className="w-full rounded-xl px-3 py-2.5 text-sm"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold block mb-1" style={{ color: C.darkGreen }}>Last Name</label>
          <input
            value={form.last_name}
            onChange={e => set("last_name", e.target.value)}
            placeholder="Optional"
            className="w-full rounded-xl px-3 py-2.5 text-sm"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold block mb-1" style={{ color: C.darkGreen }}>Age</label>
          <input
            type="number"
            min={0}
            max={25}
            value={form.age}
            onChange={e => set("age", e.target.value)}
            placeholder="e.g. 8"
            className="w-full rounded-xl px-3 py-2.5 text-sm"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold block mb-1" style={{ color: C.darkGreen }}>Placement Type</label>
          <select
            value={form.placement_type}
            onChange={e => set("placement_type", e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          >
            <option value="">Select…</option>
            {PLACEMENT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Care Goals */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Target size={13} color={C.midGreen} />
          <label className="text-[11px] font-bold" style={{ color: C.darkGreen }}>
            Care Goals <span style={{ color: C.mutedText, fontWeight: 400 }}>(personalizes AI insights)</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SUGGESTED_GOALS.map(g => {
            const active = form.care_goals?.includes(g);
            return (
              <button
                type="button"
                key={g}
                onClick={() => toggleGoal(g)}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-full transition-all"
                style={{
                  background: active ? C.darkGreen : C.cream,
                  color: active ? "#fff" : C.mutedText,
                  border: "none", cursor: "pointer",
                }}
              >
                {active ? "✓ " : ""}{g}
              </button>
            );
          })}
        </div>
        {/* Custom goal input */}
        <div className="flex gap-2">
          <input
            value={customGoal}
            onChange={e => setCustomGoal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomGoal(); } }}
            placeholder="Add a custom goal…"
            className="flex-1 rounded-xl px-3 py-2 text-xs"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
          <button
            type="button"
            onClick={addCustomGoal}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: C.midGreen, border: "none", cursor: "pointer" }}
          >
            <Plus size={15} color="#fff" />
          </button>
        </div>
        {form.care_goals?.filter(g => !SUGGESTED_GOALS.includes(g)).map((g, i) => (
          <div key={i} className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${C.midGreen}18`, color: C.darkGreen }}>{g}</span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, care_goals: f.care_goals.filter(x => x !== g) }))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
            >
              <X size={11} color={C.mutedText} />
            </button>
          </div>
        ))}
      </div>

      {/* Detailed fields */}
      {[
        { field: "strengths",        label: "💪 Strengths",          placeholder: "What does this child do well?" },
        { field: "concerns",         label: "⚠️ Current Concerns",   placeholder: "Behavioral or emotional concerns…" },
        { field: "triggers",         label: "⚡ Known Triggers",     placeholder: "What tends to dysregulate them?" },
        { field: "coping_tools",     label: "🛠️ Coping Tools",      placeholder: "Strategies that help calm them…" },
        { field: "behavior_patterns",label: "📊 Behavior Patterns",  placeholder: "Patterns you've noticed…" },
        { field: "school_notes",     label: "🏫 School Notes",       placeholder: "IEP, accommodations, teacher notes…" },
      ].map(({ field, label, placeholder }) => (
        <div key={field}>
          <label className="text-[11px] font-bold block mb-1" style={{ color: C.darkGreen }}>{label}</label>
          <textarea
            value={form[field]}
            onChange={e => set(field, e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full rounded-xl px-3 py-2.5 text-xs resize-none"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>
      ))}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-bold text-sm"
          style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !form.first_name.trim()}
          className="flex-1 py-3 rounded-xl font-bold text-sm"
          style={{
            background: form.first_name.trim() ? C.darkGreen : C.cream,
            color: form.first_name.trim() ? "#fff" : C.mutedText,
            border: "none",
            cursor: form.first_name.trim() ? "pointer" : "default",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : initial ? "Save Changes" : "Add Child"}
        </button>
      </div>
    </form>
  );
}