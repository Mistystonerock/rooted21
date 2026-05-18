import { useEffect, useState } from "react";
import { EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
const SURVIVOR_MODE_KEYS = {
  hideDvSection: "rooted_hide_dv_section",
  fakeScreenType: "rooted_fake_screen_type"
};

async function sha256(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function SurvivorModeControls({ onHideChange }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    base44.auth.me().then(async (me) => {
      setUser(me);
      const rows = await base44.entities.PrivacyVaultSetting.filter({ user_email: me.email }, "-updated_date", 1);
      const current = rows[0] || { user_email: me.email, fake_screen_type: localStorage.getItem(SURVIVOR_MODE_KEYS.fakeScreenType) || "weather", hide_dv_section: localStorage.getItem(SURVIVOR_MODE_KEYS.hideDvSection) === "true" };
      setSettings(current);
      onHideChange?.(current.hide_dv_section === true);
    });
  }, [onHideChange]);

  async function save(next) {
    const saved = settings?.id ? await base44.entities.PrivacyVaultSetting.update(settings.id, next) : await base44.entities.PrivacyVaultSetting.create(next);
    setSettings(saved);
    localStorage.setItem(SURVIVOR_MODE_KEYS.fakeScreenType, saved.fake_screen_type || "weather");
    localStorage.setItem(SURVIVOR_MODE_KEYS.hideDvSection, String(saved.hide_dv_section === true));
    onHideChange?.(saved.hide_dv_section === true);
    setStatus("Safety settings saved.");
  }

  async function updateField(field, value) {
    await save({ ...settings, user_email: user.email, [field]: value });
  }

  async function savePin() {
    if (!user || pin.length < 4) return;
    await save({ ...settings, user_email: user.email, pin_hash: await sha256(pin), pin_set_at: new Date().toISOString() });
    setPin("");
  }

  if (!settings) return null;

  return (
    <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: `${C.midGreen}22` }}>
          <EyeOff size={22} color={C.darkGreen} />
        </div>
        <div>
          <h2 className="font-serif text-xl font-black" style={{ color: C.darkGreen }}>Quick Exit & Survivor Mode</h2>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Choose a neutral screen, hide this section, and add PIN protection for safer access.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block text-xs font-black" style={{ color: C.darkGreen }}>Neutral screen after Quick Exit</label>
        <select value={settings.fake_screen_type || "weather"} onChange={e => updateField("fake_screen_type", e.target.value)} className="w-full rounded-2xl border px-3 py-3 text-sm" style={{ borderColor: C.cream }}>
          <option value="weather">Fake weather screen</option>
          <option value="notes">Fake notes page</option>
          <option value="parenting_article">Fake parenting article</option>
        </select>

        <button type="button" onClick={() => updateField("hide_dv_section", !settings.hide_dv_section)} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-black" style={{ background: settings.hide_dv_section ? C.darkGreen : C.offWhite, color: settings.hide_dv_section ? "#fff" : C.darkGreen, border: `1px solid ${C.cream}` }}>
          Hide this section from homepage
          <span>{settings.hide_dv_section ? "On" : "Off"}</span>
        </button>

        <div className="rounded-2xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
          <p className="mb-2 flex items-center gap-2 text-xs font-black" style={{ color: C.darkGreen }}><KeyRound size={14} /> PIN-protected access</p>
          <div className="flex gap-2">
            <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))} type="password" inputMode="numeric" placeholder="Set 4+ digit PIN" className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm" />
            <button onClick={savePin} disabled={pin.length < 4} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.darkGreen, color: "#fff", border: "none", opacity: pin.length < 4 ? 0.6 : 1 }}>Save</button>
          </div>
          <p className="mt-2 text-[11px]" style={{ color: C.mutedText }}>{settings.pin_hash ? "PIN is set for safer access." : "No PIN set yet."}</p>
        </div>

        {status && <p className="flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}><ShieldCheck size={14} /> {status}</p>}
      </div>
    </section>
  );
}