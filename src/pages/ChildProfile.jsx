import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Save } from "lucide-react";

const FIELDS = [
  { key: "first_name", label: "Child's First Name", required: true, type: "input" },
  { key: "age", label: "Age", type: "input", inputType: "number" },
  { key: "strengths", label: "Strengths", type: "textarea", placeholder: "What is this child good at? What do they love?" },
  { key: "concerns", label: "Current Concerns", type: "textarea", placeholder: "Behaviors or challenges you are navigating..." },
  { key: "triggers", label: "Known Triggers", type: "textarea", placeholder: "What tends to set them off?" },
  { key: "coping_tools", label: "Coping Tools That Help", type: "textarea", placeholder: "What helps them calm down?" },
  { key: "behavior_patterns", label: "Behavior Patterns", type: "textarea", placeholder: "Patterns you've noticed over time..." },
  { key: "school_notes", label: "School Notes", type: "textarea", placeholder: "Important info for school or support staff..." },
];

export default function ChildProfile() {
  const [form, setForm] = useState({});
  const [profileId, setProfileId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.ChildProfile.list("-created_date", 1).then(r => {
      if (r[0]) {
        setForm(r[0]);
        setProfileId(r[0].id);
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    if (profileId) {
      await base44.entities.ChildProfile.update(profileId, form);
    } else {
      const created = await base44.entities.ChildProfile.create(form);
      setProfileId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <p className="font-serif font-bold" style={{ color: C.cream }}>Child Profile</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: saved ? C.midGreen : C.gold, border: "none", color: C.darkGreen }}
        >
          <Save size={13} />
          {saved ? "Saved!" : saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-3">
        <div className="rounded-xl p-3.5" style={{ background: C.darkGreen }}>
          <p className="text-xs" style={{ color: C.lightGreen }}>
            This profile helps professionals (counselors, CPS, courts) understand your child's needs. Only share what you're comfortable with.
          </p>
        </div>

        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold mb-1.5" style={{ color: C.darkGreen }}>
              {f.label} {f.required && <span style={{ color: C.brown }}>*</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                value={form[f.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                rows={3}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
                style={{ border: `1.5px solid ${C.cream}`, background: C.white }}
              />
            ) : (
              <input
                type={f.inputType || "text"}
                value={form[f.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: f.inputType === "number" ? Number(e.target.value) : e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                style={{ border: `1.5px solid ${C.cream}`, background: C.white }}
              />
            )}
          </div>
        ))}

        <div className="pb-6" />
      </div>
    </div>
  );
}