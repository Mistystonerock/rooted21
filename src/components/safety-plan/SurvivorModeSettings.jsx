import { useEffect, useState } from "react";
import { EyeOff, Lock, Shield } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { getQuickExitTarget, getSurvivorPin, isDvSectionHidden, setDvSectionHidden, setQuickExitTarget, setSurvivorPin } from "@/lib/survivorMode";

export default function SurvivorModeSettings() {
  const [target, setTarget] = useState("weather");
  const [hidden, setHidden] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    setTarget(getQuickExitTarget());
    setHidden(isDvSectionHidden());
    setPin(getSurvivorPin());
  }, []);

  const changeTarget = (value) => {
    setTarget(value);
    setQuickExitTarget(value);
  };

  const changeHidden = (value) => {
    setHidden(value);
    setDvSectionHidden(value);
  };

  const changePin = (value) => {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setPin(clean);
    setSurvivorPin(clean);
  };

  return (
    <section className="rounded-3xl p-4 shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: C.cream }}>
          <Shield size={20} color={C.darkGreen} />
        </div>
        <div>
          <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Quick Exit / Survivor Mode</h2>
          <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>Choose what opens after Exit, hide sensitive sections, and optionally require a PIN.</p>
        </div>
      </div>

      <label className="text-xs font-black" style={{ color: C.darkGreen }}>Neutral screen after Exit</label>
      <select value={target} onChange={e => changeTarget(e.target.value)} className="mt-2 w-full rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}>
        <option value="weather">Fake weather screen</option>
        <option value="notes">Fake notes page</option>
        <option value="article">Fake parenting article</option>
      </select>

      <label className="mt-4 flex items-center justify-between gap-3 rounded-xl p-3" style={{ background: C.offWhite }}>
        <span className="flex items-center gap-2 text-sm font-bold" style={{ color: C.darkGreen }}><EyeOff size={16} /> Hide DV section from SOS/homepage</span>
        <input type="checkbox" checked={hidden} onChange={e => changeHidden(e.target.checked)} />
      </label>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-xs font-black" style={{ color: C.darkGreen }}><Lock size={14} /> Optional PIN</label>
        <input value={pin} onChange={e => changePin(e.target.value)} inputMode="numeric" placeholder="4–6 digit PIN" className="mt-2 w-full rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
      </div>
    </section>
  );
}