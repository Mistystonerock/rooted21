import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";

export default function TutorialScriptEditor({ tutorial, onSaved }) {
  const [draft, setDraft] = useState(() => ({
    title: tutorial.title,
    description: tutorial.description,
    steps: tutorial.steps.map(step => ({ ...step })),
  }));
  const [saving, setSaving] = useState(false);

  function updateStep(index, field, value) {
    setDraft(prev => ({ ...prev, steps: prev.steps.map((step, i) => i === index ? { ...step, [field]: value } : step) }));
  }

  async function save() {
    setSaving(true);
    const user = await base44.auth.me();
    const existing = await base44.entities.TutorialScript.filter({ section_id: tutorial.section_id }, "-created_date", 1);
    const payload = {
      section_id: tutorial.section_id,
      audience: tutorial.audience || "both",
      title: draft.title,
      description: draft.description,
      steps: draft.steps,
      updated_by: user.email,
    };
    const saved = existing[0]
      ? await base44.entities.TutorialScript.update(existing[0].id, payload)
      : await base44.entities.TutorialScript.create(payload);
    onSaved?.(saved);
    setSaving(false);
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.86)", border: `1.5px solid ${C.cream}` }}>
      <div>
        <p className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: C.gold }}>FOUNDER SCRIPT EDITOR</p>
        <p className="text-xs mt-1" style={{ color: C.mutedText }}>Edit the narration and click prompts users hear and see.</p>
      </div>
      <input value={draft.title} onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
      <textarea value={draft.description} onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full rounded-xl px-3 py-2 text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />
      {draft.steps.map((step, index) => (
        <div key={index} className="rounded-xl p-3 space-y-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>STEP {index + 1}</p>
          <input value={step.title || ""} onChange={e => updateStep(index, "title", e.target.value)} className="w-full rounded-lg px-2 py-2 text-xs border outline-none" style={{ borderColor: C.cream }} placeholder="Step title" />
          <textarea value={step.narration || ""} onChange={e => updateStep(index, "narration", e.target.value)} rows={4} className="w-full rounded-lg px-2 py-2 text-xs border outline-none resize-none" style={{ borderColor: C.cream }} placeholder="Voice narration" />
          <input value={step.prompt || ""} onChange={e => updateStep(index, "prompt", e.target.value)} className="w-full rounded-lg px-2 py-2 text-xs border outline-none" style={{ borderColor: C.cream }} placeholder="Click prompt" />
        </div>
      ))}
      <button onClick={save} disabled={saving} className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: C.darkGreen, color: "#fff", border: "none", opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : "Save Tutorial Script"}
      </button>
    </div>
  );
}