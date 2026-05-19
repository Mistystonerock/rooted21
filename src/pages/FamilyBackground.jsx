import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Brain, Heart, Save, ShieldCheck } from "lucide-react";

const FIELDS = [
  { key: "family_storyline", label: "Family story line", placeholder: "Tell Moxie the family’s backstory, major transitions, and what brought you here..." },
  { key: "mental_health_history", label: "Mental health history in the family", placeholder: "Share diagnoses, concerns, patterns, supports, or things that may run in the family..." },
  { key: "trauma_history", label: "Trauma history in the family", placeholder: "Share trauma, loss, violence, removals, instability, grief, or other history Moxie should understand..." },
  { key: "child_context", label: "Child-specific context", placeholder: "What should Moxie understand about the child’s behavior, needs, story, or relationships?" },
  { key: "triggers_patterns", label: "Triggers and patterns", placeholder: "What tends to overwhelm, escalate, shut down, or scare the child/family?" },
  { key: "calming_supports", label: "What helps", placeholder: "What helps everyone calm down, feel safe, reconnect, or repair?" },
  { key: "family_strengths", label: "Family strengths", placeholder: "What strengths, values, hopes, routines, or protective factors should Moxie notice?" },
  { key: "important_people", label: "Important people", placeholder: "Caregivers, relatives, caseworkers, therapists, teachers, mentors, safe adults..." },
  { key: "cultural_context", label: "Culture, identity, and traditions", placeholder: "Language, faith, culture, identity, traditions, or values that matter..." },
  { key: "moxie_notes", label: "Notes for Moxie", placeholder: "Anything Moxie should remember when giving support to your family..." },
];

const BLANK = {
  family_storyline: "",
  family_strengths: "",
  mental_health_history: "",
  trauma_history: "",
  child_context: "",
  triggers_patterns: "",
  calming_supports: "",
  important_people: "",
  cultural_context: "",
  moxie_notes: "",
  consent_to_use_with_moxie: true,
};

export default function FamilyBackground() {
  const [user, setUser] = useState(null);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async me => {
      setUser(me);
      const records = await base44.entities.FamilyBackground.filter({ owner_email: me.email }, "-updated_date", 1);
      if (records[0]) {
        setRecord(records[0]);
        setForm({ ...BLANK, ...records[0] });
      }
      setLoading(false);
    });
  }, []);

  function updateField(key, value) {
    setSaved(false);
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function saveBackground() {
    setSaving(true);
    const data = { ...form, owner_email: user.email };
    if (record) {
      const updated = await base44.entities.FamilyBackground.update(record.id, data);
      setRecord(updated);
    } else {
      const created = await base44.entities.FamilyBackground.create(data);
      setRecord(created);
    }
    setSaving(false);
    setSaved(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: `${C.midGreen} transparent` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Family Background" subtitle="Private context for Moxie" backTo="/dashboard" />

      <main className="mx-auto max-w-[640px] space-y-4 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.14)" }}>
              <Brain size={24} color="#fff" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold" style={{ color: C.cream }}>Help Moxie understand the full story</p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: C.lightGreen }}>
                This private background helps Moxie respond with more context around family history, mental health, trauma, strengths, triggers, and what actually helps.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-4" style={{ background: "#FEF9EC", border: `1px solid ${C.gold}55` }}>
          <p className="flex items-center gap-2 text-sm font-bold" style={{ color: C.darkGreen }}><ShieldCheck size={16} /> Private caregiver record</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>
            Only your account can read this record. Moxie uses it only when the switch below is on, and it should support—not replace—professional care.
          </p>
        </section>

        <label className="flex items-center justify-between gap-3 rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <span className="flex items-center gap-2 text-sm font-bold" style={{ color: C.darkGreen }}><Heart size={16} /> Let Moxie use this background</span>
          <input type="checkbox" checked={form.consent_to_use_with_moxie} onChange={event => updateField("consent_to_use_with_moxie", event.target.checked)} />
        </label>

        <div className="space-y-3">
          {FIELDS.map(field => (
            <label key={field.key} className="block rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <span className="text-xs font-black uppercase tracking-wide" style={{ color: C.darkGreen }}>{field.label}</span>
              <textarea
                value={form[field.key] || ""}
                onChange={event => updateField(field.key, event.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={saveBackground}
          disabled={saving}
          className="sticky bottom-24 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black shadow-lg"
          style={{ background: saving ? C.cream : C.darkGreen, color: saving ? C.mutedText : C.cream, border: "none" }}
        >
          <Save size={16} /> {saving ? "Saving..." : saved ? "Saved for Moxie" : "Save Family Background"}
        </button>
      </main>
    </div>
  );
}