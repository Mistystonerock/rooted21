import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import { C } from "@/lib/rooted-constants";

export default function CulturalCare() {
  const [form, setForm] = useState({ cultural_values: "", language_preference: "English", notification_tone: "warm", imagery_preference: "nature", soundscape_preference: "quiet" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => setForm(prev => ({ ...prev, ...user })));
  }, []);

  async function save() {
    await base44.auth.updateMe({ ...form, cultural_preferences_updated_at: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Cultural Care" subtitle="Family values, language, tone, and comfort" backTo="/wraparound-support" />
      <div className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <WraparoundHero title="Care should respect your family" subtitle="Share preferences so content, reminders, and support feel culturally responsive, trauma-informed, and respectful." icon="🌎" />
        <section className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <label className="block"><span className="text-xs font-black" style={{ color: C.darkGreen }}>Family values, culture, faith, or traditions to honor</span><textarea value={form.cultural_values || ""} onChange={e => setForm(prev => ({ ...prev, cultural_values: e.target.value }))} rows={4} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1.5px solid ${C.cream}` }} /></label>
          {[
            ["language_preference", "Preferred language", ["English", "Spanish", "Arabic", "Other"]],
            ["notification_tone", "Notification tone", ["warm", "direct", "very gentle"]],
            ["imagery_preference", "Imagery preference", ["nature", "family", "minimal", "faith-neutral"]],
            ["soundscape_preference", "Calming soundscape", ["quiet", "rain", "soft music", "nature sounds"]],
          ].map(([key, label, options]) => (
            <label key={key} className="block"><span className="text-xs font-black" style={{ color: C.darkGreen }}>{label}</span><select value={form[key] || options[0]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1.5px solid ${C.cream}` }}>{options.map(option => <option key={option}>{option}</option>)}</select></label>
          ))}
          <button onClick={save} className="w-full rounded-2xl py-3 text-sm font-black" style={{ background: saved ? C.midGreen : C.darkGreen, color: C.white, border: "none" }}>{saved ? "Saved" : "Save Preferences"}</button>
        </section>
        <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}><p className="text-sm font-black" style={{ color: C.darkGreen }}>Cultural humility guide</p><p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Support should ask before assuming, honor family expertise, use respectful language, and recognize how culture, history, faith, disability, race, and lived experience shape care.</p></section>
      </div>
    </main>
  );
}