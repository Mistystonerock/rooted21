import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { TOPICS } from "@/pages/PeerSupport";

export default function NewPostForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ topic: "general", title: "", body: "", is_anonymous: false });
  const [saving, setSaving] = useState(false);

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function handleSubmit() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
      <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Share with the Community</p>

      {/* Topic */}
      <div>
        <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>TOPIC</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TOPICS).map(([key, t]) => (
            <button key={key} onClick={() => f("topic", key)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: form.topic === key ? C.darkGreen : C.offWhite,
                color: form.topic === key ? "#fff" : C.darkGreen,
                border: `1px solid ${form.topic === key ? C.darkGreen : C.cream}`,
                cursor: "pointer",
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <input placeholder="Post title *" value={form.title} onChange={e => f("title", e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

      <textarea placeholder="Share what's on your mind... This community gets it." value={form.body}
        onChange={e => f("body", e.target.value)} rows={4}
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
        style={{ borderColor: C.cream, background: C.offWhite }} />

      <label className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
        <input type="checkbox" checked={form.is_anonymous} onChange={e => f("is_anonymous", e.target.checked)} />
        Post anonymously
      </label>

      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={saving || !form.title.trim() || !form.body.trim()}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
          {saving ? "Posting…" : "Post to Community"}
        </button>
        <button onClick={onCancel}
          className="py-2.5 px-4 rounded-xl font-bold text-sm"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
          Cancel
        </button>
      </div>

      <p className="text-[10px] text-center" style={{ color: C.mutedText }}>
        Be kind. This is a safe space. No personal attacks or judgment.
      </p>
    </div>
  );
}