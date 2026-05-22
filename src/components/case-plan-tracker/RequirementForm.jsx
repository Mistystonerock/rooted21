import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { Plus } from "lucide-react";
import { getChildDisplayName } from "@/lib/child-selection";

const BLANK = { title: "", category: "visitation", legal_source: "", description: "", due_date: "", status: "not_started", priority: "medium", progress_notes: "", evidence_item_ids: [] };
const CATEGORIES = [
  ["visitation", "Visitation"], ["parenting_classes", "Parenting Classes"], ["treatment", "Treatment"], ["housing", "Housing"], ["employment", "Employment"], ["drug_screening", "Drug Screening"], ["mental_health", "Mental Health"], ["school", "School"], ["court", "Court"], ["documentation", "Documentation"], ["other", "Other"]
];

export default function RequirementForm({ user, selectedChild, onCreate }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    const childData = selectedChild ? { child_profile_id: selectedChild.id, child_name: getChildDisplayName(selectedChild) } : {};
    await onCreate({ ...form, ...childData, owner_email: user.email });
    setForm(BLANK);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <p className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Add case plan requirement</p>
      {selectedChild && <p className="mt-2 rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.offWhite, color: C.darkGreen }}>For: {getChildDisplayName(selectedChild)}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input required value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Requirement title" className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" style={{ borderColor: C.cream }} />
        <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input type="date" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="needs_review">Needs review</option>
        </select>
        <select value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
      </div>
      <input value={form.legal_source} onChange={e => setForm(prev => ({ ...prev, legal_source: e.target.value }))} placeholder="Source, e.g. CPS case plan, court order, hearing notes" className="mt-3 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
      <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="What exactly is required?" className="mt-3 min-h-20 w-full rounded-2xl border p-3 text-sm" style={{ borderColor: C.cream }} />
      <textarea value={form.progress_notes} onChange={e => setForm(prev => ({ ...prev, progress_notes: e.target.value }))} placeholder="Progress notes or next steps" className="mt-3 min-h-20 w-full rounded-2xl border p-3 text-sm" style={{ borderColor: C.cream }} />
      <button disabled={saving} type="submit" className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black" style={{ background: saving ? C.cream : C.gold, color: C.darkGreen, border: "none" }}><Plus size={16} className="mr-2" /> {saving ? "Saving..." : "Add Requirement"}</button>
    </form>
  );
}