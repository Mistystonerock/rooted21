import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { DoorOpen, EyeOff, KeyRound } from "lucide-react";

async function sha256(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function SurvivorSafetyPanel({ user, vault, onVaultChange }) {
  const [pin, setPin] = useState("");
  const survivorOn = vault?.survivor_mode_enabled === true;

  async function toggleSurvivorMode() {
    const next = { ...vault, user_email: user.email, survivor_mode_enabled: !survivorOn, fake_screen_enabled: true };
    const saved = vault?.id ? await base44.entities.PrivacyVaultSetting.update(vault.id, next) : await base44.entities.PrivacyVaultSetting.create(next);
    localStorage.setItem("rooted_survivor_mode", String(saved.survivor_mode_enabled));
    onVaultChange(saved);
  }

  async function savePin() {
    if (pin.length < 4) return;
    const next = { ...vault, user_email: user.email, pin_hash: await sha256(pin), pin_set_at: new Date().toISOString() };
    const saved = vault?.id ? await base44.entities.PrivacyVaultSetting.update(vault.id, next) : await base44.entities.PrivacyVaultSetting.create(next);
    setPin("");
    onVaultChange(saved);
  }

  return (
    <section className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-2">
        <EyeOff size={18} color={C.darkGreen} />
        <div>
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Survivor mode</p>
          <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>Adds a quick exit, keeps language calm, and supports a safe-looking screen if you need privacy fast.</p>
        </div>
      </div>
      <button onClick={toggleSurvivorMode} className="w-full rounded-xl py-3 text-xs font-black" style={{ background: survivorOn ? C.midGreen : C.cream, color: survivorOn ? C.white : C.darkGreen, border: "none" }}>
        {survivorOn ? "Survivor mode is on" : "Turn on survivor mode"}
      </button>
      <a href="/quick-exit-safe" className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black no-underline" style={{ background: C.offWhite, color: C.darkGreen }}>
        <DoorOpen size={14} /> Open fake screen
      </a>
      <div className="rounded-xl p-3" style={{ background: C.offWhite }}>
        <p className="mb-2 flex items-center gap-2 text-xs font-black" style={{ color: C.darkGreen }}><KeyRound size={14} /> PIN-protected vault</p>
        <div className="flex gap-2">
          <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))} type="password" inputMode="numeric" placeholder="Set 4+ digit PIN" className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm" />
          <button onClick={savePin} disabled={pin.length < 4} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.darkGreen, color: C.white, border: "none", opacity: pin.length < 4 ? 0.6 : 1 }}>Save</button>
        </div>
        <p className="mt-2 text-[11px]" style={{ color: C.mutedText }}>{vault?.pin_hash ? "PIN is set for vault actions." : "No PIN set yet."}</p>
      </div>
    </section>
  );
}