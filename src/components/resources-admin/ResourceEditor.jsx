import { RESOURCE_CATEGORIES } from "./resourceAdminUtils";

export default function ResourceEditor({ form, onChange, onSubmit, onCancel, saving }) {
  const set = (field, value) => onChange({ ...form, [field]: value });

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border bg-white p-4 shadow-sm space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Resource name" className="rounded-xl border px-3 py-2 text-sm" />
        <select value={form.category} onChange={e => set("category", e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
          {RESOURCE_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input value={form.county} onChange={e => set("county", e.target.value)} placeholder="County" className="rounded-xl border px-3 py-2 text-sm" />
        <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Phone" className="rounded-xl border px-3 py-2 text-sm" />
        <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="Website" className="rounded-xl border px-3 py-2 text-sm" />
        <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Address" className="rounded-xl border px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <textarea value={form.description_en} onChange={e => set("description_en", e.target.value)} placeholder="English description" className="min-h-24 rounded-xl border px-3 py-2 text-sm" />
        <textarea value={form.description_es} onChange={e => set("description_es", e.target.value)} placeholder="Spanish description" className="min-h-24 rounded-xl border px-3 py-2 text-sm" />
        <textarea value={form.description_so} onChange={e => set("description_so", e.target.value)} placeholder="Somali description" className="min-h-24 rounded-xl border px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input value={form.source_url} onChange={e => set("source_url", e.target.value)} placeholder="Source URL" className="rounded-xl border px-3 py-2 text-sm" />
        <select value={form.verification_status} onChange={e => set("verification_status", e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
          <option value="needs_review">Needs review</option>
          <option value="verified">Verified</option>
          <option value="outdated">Outdated</option>
          <option value="archived">Archived</option>
        </select>
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold">
          <input type="checkbox" checked={!!form.crisis_priority} onChange={e => set("crisis_priority", e.target.checked)} /> Crisis priority
        </label>
      </div>

      <textarea value={form.eligibility_notes} onChange={e => set("eligibility_notes", e.target.value)} placeholder="Eligibility notes" className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm" />
      <textarea value={form.admin_notes} onChange={e => set("admin_notes", e.target.value)} placeholder="Admin review notes" className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm" />

      <div className="flex flex-wrap gap-2">
        <button disabled={saving} className="rounded-xl bg-green-800 px-4 py-2 text-sm font-bold text-white">{saving ? "Saving..." : "Save listing"}</button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2 text-sm font-bold">Cancel</button>}
      </div>
    </form>
  );
}