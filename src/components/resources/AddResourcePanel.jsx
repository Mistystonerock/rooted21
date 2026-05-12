import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { C } from "@/lib/rooted-constants";
const TYPE_META = {
  article: { label: "Article" },
  video: { label: "Video" },
  book: { label: "Book" },
  worksheet: { label: "Worksheet" },
  podcast: { label: "Podcast" },
  tool: { label: "Tool" },
};

const CATEGORIES = [
  { id: "trauma", label: "Trauma Basics" },
  { id: "sensory", label: "Sensory Regulation" },
  { id: "selfcare", label: "Self-Care" },
  { id: "attachment", label: "Attachment" },
  { id: "behavior", label: "Behavior Tools" },
  { id: "grief", label: "Grief & Loss" },
  { id: "system", label: "Navigating Systems" },
  { id: "reading", label: "Recommended Reading" },
];

const BLANK = { title: "", author: "", desc: "", url: "", category: "trauma", type: "article", free: true, featured: false };

export default function AddResourcePanel({ userRole, onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saved, setSaved] = useState(false);

  if (userRole !== "admin") return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    onAdd({ ...form, id: Date.now() });
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); setForm(BLANK); }, 1200);
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
        >
          <Plus size={15} /> Add Resource
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl p-4 space-y-3"
          style={{ background: C.white, border: `2px solid ${C.midGreen}` }}>
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Add New Resource</p>
            <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={16} color={C.mutedText} />
            </button>
          </div>

          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title *" className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }} />

          <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
            placeholder="Author / Source" className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }} />

          <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            placeholder="Short description" rows={2}
            className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none resize-none"
            style={{ borderColor: C.cream, background: C.offWhite }} />

          <input required value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="URL * (https://...)" type="url" className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>CATEGORY</p>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>TYPE</p>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}>
                {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.free} onChange={e => setForm(f => ({ ...f, free: e.target.checked }))} />
              <span className="text-xs font-bold" style={{ color: C.darkGreen }}>Free</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
              <span className="text-xs font-bold" style={{ color: C.darkGreen }}>Featured</span>
            </label>
          </div>

          <button type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: saved ? C.midGreen : C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            {saved ? <><Check size={14} /> Saved!</> : "Save Resource"}
          </button>
        </form>
      )}
    </div>
  );
}