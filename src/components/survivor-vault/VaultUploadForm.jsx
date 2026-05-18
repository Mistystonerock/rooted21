import { useState } from "react";
import { FilePlus, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";

const categories = [
  ["screenshot", "Screenshot"],
  ["photo", "Photo"],
  ["police_report", "Police report"],
  ["threatening_message", "Threatening message"],
  ["custody_paperwork", "Custody paperwork"],
  ["journal", "Journal"],
  ["medical_document", "Medical document"],
  ["evidence_timeline", "Evidence timeline"],
  ["other", "Other"]
];

export default function VaultUploadForm({ user, onCreated }) {
  const [form, setForm] = useState({ title: "", disguise_name: "", category: "screenshot", description: "", incident_date: "", timeline_notes: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    let private_file_uri = "";
    let file_name = "";
    let file_size = 0;

    if (file) {
      const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
      private_file_uri = uploaded.file_uri;
      file_name = file.name;
      file_size = file.size;
    }

    const created = await base44.entities.SurvivorVaultEvidence.create({
      ...form,
      owner_email: user.email,
      uploaded_at: new Date().toISOString(),
      private_file_uri,
      file_name,
      file_size,
      tags: []
    });

    await base44.entities.SurvivorVaultAuditLog.create({
      owner_email: user.email,
      evidence_id: created.id,
      action: file ? "upload_created" : "note_created",
      summary: `${file ? "Uploaded" : "Created note"}: ${form.disguise_name || form.title}`,
      occurred_at: new Date().toISOString()
    });

    setForm({ title: "", disguise_name: "", category: "screenshot", description: "", incident_date: "", timeline_notes: "" });
    setFile(null);
    setSaving(false);
    onCreated(created);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl p-4 shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div className="mb-4 flex items-center gap-2">
        <FilePlus size={18} color={C.darkGreen} />
        <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Add vault item</h2>
      </div>
      <div className="grid gap-3">
        <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Private title" className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
        <input value={form.disguise_name} onChange={e => setForm({ ...form, disguise_name: e.target.value })} placeholder="Optional disguise name, like Receipt or Notes" className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}>
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input type="date" value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })} className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="min-h-20 rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
        <textarea value={form.timeline_notes} onChange={e => setForm({ ...form, timeline_notes: e.target.value })} placeholder="Evidence timeline notes or journal entry" className="min-h-24 rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
        <label className="rounded-xl p-3 text-sm font-bold" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>
          <Upload size={16} className="mr-2" /> Private encrypted file upload
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="mt-2 block w-full text-xs" />
        </label>
        <button disabled={saving} className="rounded-xl py-3 text-sm font-black" style={{ background: C.darkGreen, color: "#fff", border: "none", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Save to vault"}</button>
      </div>
    </form>
  );
}