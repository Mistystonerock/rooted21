import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ShieldCheck, Plus, Trash2, Loader2, CheckCircle2, Lock } from "lucide-react";
import TraffickingHeader from "@/components/trafficking/TraffickingHeader";

const uid = () => `sp_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const GRAB_BAG_DEFAULTS = ["ID / documents", "Phone & charger", "Cash", "Keys", "Medications", "Change of clothes", "Comfort item"];
const GROUNDING_DEFAULTS = ["Slow breathing", "5-4-3-2-1 grounding", "Cold water on hands", "Call a safe person", "Step outside", "Play calming music"];

export default function TraffickingSafetyPlan() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const emptyPlan = {
    safe_word: "",
    safe_places: [],
    warning_signs: "",
    quick_escape_notes: "",
    grab_bag_items: [],
    grounding_tools: [],
    safe_contact_notes: "",
    important_notes: "",
  };

  const load = useCallback(async () => {
    const u = await base44.auth.me();
    setUser(u);
    const rows = await base44.entities.TraffickingSafetyPlan.filter({ user_id: u.id, is_deleted: false }, "-created_date", 1);
    if (rows[0]) {
      setPlanId(rows[0].id);
      setPlan({ ...emptyPlan, ...rows[0] });
    } else {
      setPlan(emptyPlan);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key, value) => { setPlan((p) => ({ ...p, [key]: value })); setSaved(false); };

  const toggleItem = (key, item) => {
    const list = plan[key] || [];
    set(key, list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const addPlace = () => set("safe_places", [...(plan.safe_places || []), { id: uid(), name: "", notes: "" }]);
  const updatePlace = (id, field, value) => set("safe_places", plan.safe_places.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  const removePlace = (id) => set("safe_places", plan.safe_places.filter((p) => p.id !== id));

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const data = {
      user_id: user.id,
      safe_word: plan.safe_word,
      safe_places: plan.safe_places,
      warning_signs: plan.warning_signs,
      quick_escape_notes: plan.quick_escape_notes,
      grab_bag_items: plan.grab_bag_items,
      grounding_tools: plan.grounding_tools,
      safe_contact_notes: plan.safe_contact_notes,
      important_notes: plan.important_notes,
      is_deleted: false,
    };
    if (planId) await base44.entities.TraffickingSafetyPlan.update(planId, data);
    else {
      const created = await base44.entities.TraffickingSafetyPlan.create(data);
      setPlanId(created.id);
    }
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <TraffickingHeader title="Safety Planning" subtitle="Private to you only" backTo="/human-trafficking-support" />

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-2xl p-4" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}40` }}>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
              <Lock size={18} color="#fff" />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.mutedText }}>
              Fill in only what feels safe. This plan is private to you — it is never shared with anyone unless you choose to. You can leave any part blank.
            </p>
          </div>
        </section>

        {loading || !plan ? (
          <div className="flex justify-center py-10"><Loader2 size={28} className="animate-spin" color={C.darkGreen} /></div>
        ) : (
          <>
            <Field label="Safe word (optional)" hint="A word you can text or say to signal a trusted person that you need help.">
              <input value={plan.safe_word} onChange={(e) => set("safe_word", e.target.value)}
                placeholder="e.g. a code word only you and your person know"
                className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
            </Field>

            <Card title="Safe places">
              <div className="space-y-3">
                {(plan.safe_places || []).map((p) => (
                  <div key={p.id} className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                    <input value={p.name} onChange={(e) => updatePlace(p.id, "name", e.target.value)} placeholder="Place name"
                      className="w-full rounded-lg px-3 py-2 text-xs outline-none" style={{ border: `1px solid ${C.cream}` }} />
                    <input value={p.notes} onChange={(e) => updatePlace(p.id, "notes", e.target.value)} placeholder="Notes (how to get there, who is there)"
                      className="mt-2 w-full rounded-lg px-3 py-2 text-xs outline-none" style={{ border: `1px solid ${C.cream}` }} />
                    <button type="button" onClick={() => removePlace(p.id)} className="mt-2 flex items-center gap-1 text-xs font-bold" style={{ color: "#C0392B", background: "none", border: "none", cursor: "pointer" }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addPlace} className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-black"
                  style={{ background: `${C.midGreen}18`, color: C.darkGreen, border: `1px solid ${C.midGreen}40`, cursor: "pointer" }}>
                  <Plus size={14} /> Add a safe place
                </button>
              </div>
            </Card>

            <Card title="Grab bag — things to have ready">
              <Checklist defaults={GRAB_BAG_DEFAULTS} selected={plan.grab_bag_items || []} onToggle={(i) => toggleItem("grab_bag_items", i)} />
            </Card>

            <Card title="Grounding tools that help me">
              <Checklist defaults={GROUNDING_DEFAULTS} selected={plan.grounding_tools || []} onToggle={(i) => toggleItem("grounding_tools", i)} />
            </Card>

            <Field label="Warning signs (optional)" hint="Signs that tell you the situation is getting less safe.">
              <textarea value={plan.warning_signs} onChange={(e) => set("warning_signs", e.target.value)} rows={3}
                className="w-full resize-none rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
            </Field>

            <Field label="Quick escape notes (optional)" hint="Where you would go first and how you would get there.">
              <textarea value={plan.quick_escape_notes} onChange={(e) => set("quick_escape_notes", e.target.value)} rows={3}
                className="w-full resize-none rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
            </Field>

            <Field label="Other private notes (optional)">
              <textarea value={plan.important_notes} onChange={(e) => set("important_notes", e.target.value)} rows={3}
                className="w-full resize-none rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
            </Field>

            <button type="button" onClick={handleSave} disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black shadow-lg"
              style={{ background: saved ? C.midGreen : C.darkGreen, color: "#fff", border: "none", cursor: saving ? "default" : "pointer" }}>
              {saving ? <Loader2 size={20} className="animate-spin" /> : saved ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
              {saving ? "Saving…" : saved ? "Saved privately" : "Save my safety plan"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl p-4 shadow-sm" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
      <h3 className="text-sm font-black" style={{ color: C.darkGreen }}>{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <section className="rounded-2xl p-4 shadow-sm" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
      <label className="block text-sm font-black" style={{ color: C.darkGreen }}>{label}</label>
      {hint && <p className="mb-2 mt-0.5 text-[11px] leading-snug" style={{ color: C.mutedText }}>{hint}</p>}
      <div className={hint ? "" : "mt-2"}>{children}</div>
    </section>
  );
}

function Checklist({ defaults, selected, onToggle }) {
  return (
    <div className="grid gap-2">
      {defaults.map((label) => (
        <label key={label} className="flex items-center gap-3 rounded-xl p-3 text-sm font-bold" style={{ background: C.offWhite, color: C.darkGreen, cursor: "pointer" }}>
          <input type="checkbox" checked={selected.includes(label)} onChange={() => onToggle(label)} />
          {label}
        </label>
      ))}
    </div>
  );
}