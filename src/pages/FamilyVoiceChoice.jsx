import { useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import { C } from "@/lib/rooted-constants";

const SERVICES = ["Counselling", "Respite care", "After-school programs", "Parent mentor", "Substance-use recovery support", "School advocacy", "Housing support"];

export default function FamilyVoiceChoice() {
  const [form, setForm] = useState({ goals: "", priorities: "", cultural_considerations: "", ranked_services: [] });
  const [saved, setSaved] = useState(false);

  function toggleService(service) {
    setForm(prev => ({ ...prev, ranked_services: prev.ranked_services.includes(service) ? prev.ranked_services.filter(item => item !== service) : [...prev.ranked_services, service] }));
  }

  async function save() {
    await base44.auth.updateMe({ family_plan_goals: form.goals, family_priorities: form.priorities, family_cultural_considerations: form.cultural_considerations, ranked_service_preferences: form.ranked_services, family_voice_updated_at: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Family Voice + Choice" subtitle="Goals, priorities, service options, and approval" backTo="/wraparound-support" />
      <div className="mx-auto max-w-[520px] space-y-5 px-4 pt-6 pb-32">
        <WraparoundHero title="Your goals come first" subtitle="Start planning with your priorities, values, and preferred services. Professional changes should be reviewed before plans are updated." icon="🧭" />
        <section className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          {[['goals', 'What goals matter most right now?'], ['priorities', 'Top priorities or urgent needs'], ['cultural_considerations', 'Cultural, religious, disability, or family considerations']].map(([key, label]) => (
            <label key={key} className="block"><span className="text-xs font-black" style={{ color: C.darkGreen }}>{label}</span><textarea value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1.5px solid ${C.cream}` }} /></label>
          ))}
          <div className="pt-1"><p className="text-xs font-black" style={{ color: C.darkGreen }}>Choose and rank preferred services</p><div className="mt-3 flex flex-wrap gap-2.5">{SERVICES.map(service => <button key={service} onClick={() => toggleService(service)} className="rounded-full px-3.5 py-2 text-[11px] font-black leading-tight" style={{ background: form.ranked_services.includes(service) ? C.darkGreen : C.offWhite, color: form.ranked_services.includes(service) ? C.white : C.darkGreen, border: `1px solid ${C.cream}` }}>{form.ranked_services.includes(service) ? `${form.ranked_services.indexOf(service) + 1}. ` : ''}{service}</button>)}</div></div>
          <button onClick={save} className="mt-3 w-full rounded-2xl py-3.5 text-sm font-black" style={{ background: saved ? C.midGreen : C.darkGreen, color: C.white, border: "none" }}>{saved ? "Saved" : "Save Family Preferences"}</button>
        </section>
        <section className="rounded-2xl p-4" style={{ background: "#FEF8EC", border: `1.5px solid ${C.gold}` }}><p className="text-sm font-black" style={{ color: C.darkGreen }}>Caregiver approval reminder</p><p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Use this page before any plan-building process. If a professional changes goals, tasks, or service choices, caregivers should review and approve those changes.</p></section>
      </div>
    </main>
  );
}