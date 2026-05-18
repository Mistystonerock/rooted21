import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function VaultPinGate({ pin, onSetPin, onUnlock }) {
  const [value, setValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const hasPin = !!pin;

  function submit() {
    if (hasPin) {
      if (value === pin) onUnlock();
      else setError("That PIN did not match.");
      return;
    }

    if (value.length < 4 || value !== confirm) {
      setError("Set a matching PIN with at least 4 digits.");
      return;
    }
    onSetPin(value);
    onUnlock();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{ background: C.offWhite }}>
      <section className="w-full max-w-sm rounded-3xl p-6 text-center shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.cream }}>
          {hasPin ? <Lock color={C.darkGreen} /> : <ShieldCheck color={C.darkGreen} />}
        </div>
        <h1 className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>{hasPin ? "Vault locked" : "Create vault PIN"}</h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>
          {hasPin ? "Enter your PIN to open the hidden document vault." : "Choose a private PIN for this device before storing survivor documents."}
        </p>
        <input value={value} onChange={e => setValue(e.target.value.replace(/\D/g, "").slice(0, 8))} type="password" inputMode="numeric" placeholder="PIN" className="mt-5 w-full rounded-xl px-3 py-3 text-center text-lg font-black" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
        {!hasPin && <input value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 8))} type="password" inputMode="numeric" placeholder="Confirm PIN" className="mt-3 w-full rounded-xl px-3 py-3 text-center text-lg font-black" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />}
        {error && <p className="mt-3 text-xs font-bold" style={{ color: "#B42318" }}>{error}</p>}
        <button onClick={submit} className="mt-4 w-full rounded-xl py-3 font-black" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>{hasPin ? "Unlock vault" : "Set PIN"}</button>
      </section>
    </main>
  );
}