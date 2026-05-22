import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Upload } from "lucide-react";

const CATEGORY_OPTIONS = ["Visitation", "Safety", "Communication", "School", "Medical", "CPS", "Court", "Child Support", "Housing", "Other"];
const BLANK = { event_date: "", event_time: "", title: "", summary: "", evidence_type: "document", case_categories: [], message_text: "", related_document_ids: [], source_note: "" };

export default function EvidenceUploadForm({ user, courtDocuments, onCreated }) {
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function toggleCategory(category) {
    setForm(prev => ({
      ...prev,
      case_categories: prev.case_categories.includes(category)
        ? prev.case_categories.filter(item => item !== category)
        : [...prev.case_categories, category]
    }));
  }

  function toggleDocument(id) {
    setForm(prev => ({
      ...prev,
      related_document_ids: prev.related_document_ids.includes(id)
        ? prev.related_document_ids.filter(item => item !== id)
        : [...prev.related_document_ids, id]
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    let uploaded = {};
    if (file) {
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      uploaded = { private_file_uri: result.file_uri, file_name: file.name, file_size: file.size };
    }
    const created = await base44.entities.EvidenceTimelineItem.create({ ...form, ...uploaded, owner_email: user.email });
    onCreated(created);
    setForm(BLANK);
    setFile(null);
    event.target.reset();
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <p className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Pin evidence to the timeline</p>
      <p className="mt-1 text-xs leading-5" style={{ color: C.mutedText }}>Upload a photo/document or paste message text, then tag it for court chronology review.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input required type="date" value={form.event_date} onChange={e => setForm(prev => ({ ...prev, event_date: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <input placeholder="Time, if known" value={form.event_time} onChange={e => setForm(prev => ({ ...prev, event_time: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <input required placeholder="Evidence title" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" style={{ borderColor: C.cream }} />
        <select value={form.evidence_type} onChange={e => setForm(prev => ({ ...prev, evidence_type: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          <option value="document">Document</option>
          <option value="photo">Photo</option>
          <option value="message">Message</option>
          <option value="other">Other</option>
        </select>
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
      </div>

      <textarea required value={form.summary} onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))} placeholder="Neutral factual summary: what happened, who was involved, and why this matters." className="mt-3 min-h-24 w-full rounded-2xl border p-3 text-sm" style={{ borderColor: C.cream }} />
      <textarea value={form.message_text} onChange={e => setForm(prev => ({ ...prev, message_text: e.target.value }))} placeholder="Paste message text or transcript if relevant." className="mt-3 min-h-20 w-full rounded-2xl border p-3 text-sm" style={{ borderColor: C.cream }} />
      <input value={form.source_note} onChange={e => setForm(prev => ({ ...prev, source_note: e.target.value }))} placeholder="Source note, e.g. text message, school email, visitation log" className="mt-3 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>Case categories</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(category => (
            <button key={category} type="button" onClick={() => toggleCategory(category)} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: form.case_categories.includes(category) ? C.darkGreen : C.offWhite, color: form.case_categories.includes(category) ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>{category}</button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>Cross-reference Court Packet / Document Vault items</p>
        <div className="max-h-40 space-y-2 overflow-auto rounded-2xl border p-2" style={{ borderColor: C.cream }}>
          {courtDocuments.length === 0 ? <p className="p-2 text-xs" style={{ color: C.mutedText }}>No court documents found yet.</p> : courtDocuments.map(doc => (
            <label key={doc.id} className="flex items-start gap-2 rounded-xl p-2 text-xs" style={{ background: C.offWhite }}>
              <input type="checkbox" checked={form.related_document_ids.includes(doc.id)} onChange={() => toggleDocument(doc.id)} />
              <span><strong>{doc.title}</strong><br />{doc.category || "document"}{doc.court_case_number ? ` · Case ${doc.court_case_number}` : ""}</span>
            </label>
          ))}
        </div>
      </div>

      <button disabled={saving} type="submit" className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black" style={{ background: saving ? C.cream : C.gold, color: C.darkGreen, border: "none" }}>
        <Upload size={16} className="mr-2" /> {saving ? "Saving evidence..." : "Add to timeline"}
      </button>
    </form>
  );
}