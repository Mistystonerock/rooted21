import { useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import { AlertTriangle, ArrowRight, Building2, CheckCircle2, Loader2, Phone } from "lucide-react";

const BG = "#faf6f1";
const CARD = "#ffffff";
const CREAM = "#f5ede2";
const GREEN = "#6b9d6e";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const BORDER = "rgba(120,85,60,0.2)";

const crisisTypes = [
  ["court", "Court"],
  ["cps", "CPS / case plan"],
  ["housing", "Housing"],
  ["food", "Food / benefits"],
  ["domestic_violence", "Domestic violence"],
  ["behavior", "Child behavior"],
  ["school", "School / IEP"],
  ["medical", "Medical / mental health"],
  ["recovery", "Recovery"],
  ["transportation", "Transportation"],
  ["other", "Other"],
];

export default function CrisisIntake() {
  const [form, setForm] = useState({ crisis_type: "cps", county: "", city: "", zip_code: "", child_age: "", urgency_level: "today", safety_concern: false, situation_summary: "", support_already_tried: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const response = await base44.functions.invoke("generateCrisisSupportPlan", form);
    setResult(response.data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <MobileHeader title="Crisis Intake" subtitle="Get ranked next steps and local supports" backTo="/dashboard" />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-36">
        <section className="rounded-3xl border p-5 shadow-sm" style={{ background: CARD, borderColor: BORDER }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1" size={22} color={GREEN} />
            <div>
              <h1 className="font-serif text-2xl font-black" style={{ color: DARK }}>Tell us what is happening right now</h1>
              <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>Rooted 21 will organize your situation into practical next steps and match nearby agency resources. If anyone is in immediate danger, call 911. For crisis support, call or text 988.</p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-3xl border p-5 shadow-sm" style={{ background: CARD, borderColor: BORDER }}>
          <div>
            <label className="text-xs font-bold" style={{ color: DARK }}>Main crisis area</label>
            <select required value={form.crisis_type} onChange={e => setForm({ ...form, crisis_type: e.target.value })} className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: BORDER }}>
              {crisisTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold" style={{ color: DARK }}>County</label>
              <input required value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} placeholder="Ross" className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: BORDER }} />
            </div>
            <div>
              <label className="text-xs font-bold" style={{ color: DARK }}>City</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Chillicothe" className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: BORDER }} />
            </div>
            <div>
              <label className="text-xs font-bold" style={{ color: DARK }}>ZIP</label>
              <input value={form.zip_code} onChange={e => setForm({ ...form, zip_code: e.target.value })} placeholder="45601" className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: BORDER }} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold" style={{ color: DARK }}>Child age / family detail</label>
              <input value={form.child_age} onChange={e => setForm({ ...form, child_age: e.target.value })} placeholder="Example: 8 years old" className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: BORDER }} />
            </div>
            <div>
              <label className="text-xs font-bold" style={{ color: DARK }}>How urgent is this?</label>
              <select value={form.urgency_level} onChange={e => setForm({ ...form, urgency_level: e.target.value })} className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: BORDER }}>
                <option value="today">Today</option>
                <option value="this_week">This week</option>
                <option value="soon">Soon</option>
                <option value="planning">Planning ahead</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl p-3 text-sm font-bold" style={{ background: CREAM, color: DARK }}>
            <input type="checkbox" checked={form.safety_concern} onChange={e => setForm({ ...form, safety_concern: e.target.checked })} />
            There may be a safety concern today
          </label>

          <div>
            <label className="text-xs font-bold" style={{ color: DARK }}>What is happening?</label>
            <textarea required value={form.situation_summary} onChange={e => setForm({ ...form, situation_summary: e.target.value })} rows={5} placeholder="Briefly explain the court, CPS, housing, school, behavior, or other crisis." className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: BORDER }} />
          </div>

          <div>
            <label className="text-xs font-bold" style={{ color: DARK }}>What have you already tried?</label>
            <textarea value={form.support_already_tried} onChange={e => setForm({ ...form, support_already_tried: e.target.value })} rows={3} placeholder="Calls made, agencies contacted, court dates, caseworker notes, etc." className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: BORDER }} />
          </div>

          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black" style={{ background: GREEN, color: "#fff", border: "none" }}>
            {loading ? <><Loader2 className="animate-spin" size={18} /> Building your support plan...</> : <>Get My Next Steps <ArrowRight size={18} /></>}
          </button>
        </form>

        {result && (
          <section className="mt-5 space-y-4">
            <div className="rounded-3xl border p-5" style={{ background: CARD, borderColor: BORDER }}>
              <h2 className="font-serif text-xl font-black" style={{ color: DARK }}>Ranked next steps</h2>
              <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>{result.plan?.safety_note}</p>
              <div className="mt-4 space-y-3">
                {(result.plan?.ranked_steps || []).map(step => (
                  <div key={step.rank} className="rounded-2xl border p-4" style={{ borderColor: BORDER, background: BG }}>
                    <p className="font-bold" style={{ color: DARK }}>{step.rank}. {step.title}</p>
                    <p className="mt-2 text-sm" style={{ color: MUTED }}>{step.why}</p>
                    <p className="mt-2 flex items-start gap-2 text-sm font-bold" style={{ color: GREEN }}><CheckCircle2 size={16} className="mt-0.5" /> {step.action}</p>
                    <p className="mt-1 text-xs" style={{ color: MUTED }}>Timeframe: {step.timeframe}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border p-5" style={{ background: CARD, borderColor: BORDER }}>
              <h2 className="font-serif text-xl font-black" style={{ color: DARK }}>Matched local resources</h2>
              <div className="mt-4 space-y-3">
                {(result.resources || []).map(resource => (
                  <div key={`${resource.name}-${resource.phone}`} className="rounded-2xl border p-4" style={{ borderColor: BORDER }}>
                    <div className="flex items-start gap-3">
                      <Building2 size={18} color={GREEN} className="mt-1" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold" style={{ color: DARK }}>{resource.name}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{resource.category} · {resource.city || resource.county || "Local resource"}</p>
                        {resource.description && <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>{resource.description}</p>}
                        {resource.phone && <a href={`tel:${resource.phone}`} className="mt-2 inline-flex items-center gap-2 text-sm font-bold" style={{ color: GREEN }}><Phone size={14} /> {resource.phone}</a>}
                        {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="ml-3 mt-2 inline-flex text-sm font-bold" style={{ color: GREEN }}>Website</a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}