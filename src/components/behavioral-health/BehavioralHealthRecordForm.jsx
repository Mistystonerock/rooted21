import { useState } from "react";
import { C } from "@/lib/rooted-constants";

const TYPES = [
  ["therapy_session", "Therapy tracking"],
  ["mood_check", "Mood check"],
  ["safety_plan", "Safety plan"],
  ["crisis_plan", "Crisis plan"],
  ["provider_contact", "Provider contact"],
  ["substance_use", "Substance-use record"],
  ["other", "Other"]
];

function segmentFor(type) {
  if (type === "substance_use") return "substance_use";
  if (type === "safety_plan" || type === "crisis_plan") return "safety";
  return "behavioral_health";
}

export default function BehavioralHealthRecordForm({ user, onSave, onCancel }) {
  const [form, setForm] = useState({
    child_name: "",
    record_kind: "therapy_session",
    title: "",
    summary: "",
    event_date: new Date().toISOString().slice(0, 10),
    provider_name: "",
    provider_role: "",
    provider_phone: "",
    provider_email: "",
    mood_rating: "",
    mood_notes: "",
    crisis_steps: ""
  });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const permission_segment = segmentFor(form.record_kind);
    await onSave({
      ...form,
      owner_email: user.email,
      permission_segment,
      part2_segmented: permission_segment === "substance_use",
      mood_rating: form.mood_rating ? Number(form.mood_rating) : undefined,
      storage_class: "record_only",
      consent_required: true
    });
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border p-4 space-y-3" style={{ background: C.white, borderColor: C.cream }}>
      <div>
        <p className="font-serif text-lg font-bold" style={{ color: C.darkText }}>Add private record</p>
        <p className="text-xs mt-1" style={{ color: C.mutedText }}>Segmented and visible only to you unless you create consent.</p>
      </div>

      <select value={form.record_kind} onChange={e => setForm({ ...form, record_kind: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
        {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
      <input placeholder="Child name" value={form.child_name} onChange={e => setForm({ ...form, child_name: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
      <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
      <textarea required placeholder="Plain-language notes. Keep it factual and kind to your future self." value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm min-h-[92px]" style={{ borderColor: C.cream }} />

      {form.record_kind === "mood_check" && (
        <div className="grid grid-cols-2 gap-2">
          <input type="number" min="1" max="10" placeholder="Mood 1-10" value={form.mood_rating} onChange={e => setForm({ ...form, mood_rating: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <input placeholder="Mood notes" value={form.mood_notes} onChange={e => setForm({ ...form, mood_notes: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        </div>
      )}

      {(form.record_kind === "therapy_session" || form.record_kind === "provider_contact") && (
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Provider name" value={form.provider_name} onChange={e => setForm({ ...form, provider_name: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <input placeholder="Role" value={form.provider_role} onChange={e => setForm({ ...form, provider_role: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <input placeholder="Phone" value={form.provider_phone} onChange={e => setForm({ ...form, provider_phone: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <input placeholder="Email" value={form.provider_email} onChange={e => setForm({ ...form, provider_email: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        </div>
      )}

      {(form.record_kind === "crisis_plan" || form.record_kind === "safety_plan") && (
        <textarea placeholder="Steps to follow when things feel unsafe or overwhelming" value={form.crisis_steps} onChange={e => setForm({ ...form, crisis_steps: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm min-h-[80px]" style={{ borderColor: C.cream }} />
      )}

      {form.record_kind === "substance_use" && <p className="rounded-xl p-3 text-xs" style={{ background: "#FFF7ED", color: "#9A3412" }}>This will be marked as 42 CFR Part 2 segmented and should only be shared with specific written consent.</p>}

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-xl px-3 py-2 text-sm font-bold" style={{ background: C.cream, color: C.darkText, border: "none" }}>Cancel</button>
        <button disabled={saving} className="flex-1 rounded-xl px-3 py-2 text-sm font-bold" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>{saving ? "Saving..." : "Save secure record"}</button>
      </div>
    </form>
  );
}