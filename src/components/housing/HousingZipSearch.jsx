import { useState } from "react";
import { C } from "@/lib/rooted-constants";

export default function HousingZipSearch({ zip, onSave, saving }) {
  const [editing, setEditing] = useState(!zip);
  const [value, setValue] = useState(zip || "");

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(value.trim());
    setEditing(false);
  }

  if (!editing && zip) {
    return (
      <div className="rounded-3xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <p className="text-xs font-bold" style={{ color: C.mutedText }}>Housing resources near</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-2xl font-black" style={{ color: C.darkGreen }}>{zip}</p>
          <button type="button" onClick={() => setEditing(true)} className="rounded-2xl px-4 py-3 text-sm font-black" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
            Edit Zip Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <label className="text-sm font-bold leading-relaxed" style={{ color: C.darkGreen }}>Enter your zip code to find housing resources near you.</label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 5))}
          inputMode="numeric"
          placeholder="Zip code"
          className="min-h-[52px] flex-1 rounded-2xl px-4 text-base font-bold"
          style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
        />
        <button type="submit" disabled={saving || value.length < 5} className="rounded-2xl px-5 py-3 text-base font-black" style={{ background: value.length < 5 ? C.cream : C.darkGreen, color: value.length < 5 ? C.mutedText : "#fff", border: "none" }}>
          {saving ? "Saving…" : "Find Housing"}
        </button>
      </div>
    </form>
  );
}