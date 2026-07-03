import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { Loader2, MapPin, X } from "lucide-react";

export const ROSS_ZIPS = ["45601", "45628", "45644", "45673", "45617", "45612", "43115", "43164"];

export default function ZipResourceNotice({ zip, onZipChange, includeStatewide, onToggleStatewide }) {
  const [editing, setEditing] = useState(!zip);
  const [draft, setDraft] = useState(zip || "");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const isRoss = ROSS_ZIPS.includes((zip || "").trim());

  function save(value) {
    onZipChange?.(value.trim());
    setEditing(false);
  }

  function clearZip() {
    setDraft("");
    onZipChange?.("");
    setEditing(true);
  }

  function useMyZip() {
    if (!navigator.geolocation) {
      setLocateError("Location is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const postcode = data.address?.postcode?.slice(0, 5) || "";
          if (postcode) {
            setDraft(postcode);
            save(postcode);
          } else {
            setLocateError("Could not find a ZIP code for your location.");
          }
        } catch {
          setLocateError("Could not detect your ZIP code. Please enter it manually.");
        }
        setLocating(false);
      },
      () => {
        setLocateError("Could not access your location. Please enter your ZIP manually.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <label className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>ZIP CODE</label>

      {editing ? (
        <>
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="Enter ZIP code"
              inputMode="numeric"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            />
            <button
              type="button"
              disabled={draft.length < 5}
              onClick={() => save(draft)}
              className="rounded-xl px-4 py-2.5 text-xs font-black"
              style={{ background: draft.length < 5 ? C.cream : C.darkGreen, color: draft.length < 5 ? C.mutedText : "#fff", border: "none" }}
            >
              Show Resources
            </button>
          </div>
          <button type="button" onClick={useMyZip} disabled={locating} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: C.darkGreen, background: "none", border: "none", padding: 0 }}>
            {locating ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />} Use my ZIP
          </button>
          {locateError && <p className="text-[11px]" style={{ color: "#B84C2A" }}>{locateError}</p>}
        </>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Showing resources near {zip}</p>
          <button type="button" onClick={() => { setDraft(zip); setEditing(true); }} className="shrink-0 rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
            Change ZIP
          </button>
        </div>
      )}

      {!editing && zip && (
        <button type="button" onClick={clearZip} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: C.mutedText, background: "none", border: "none", padding: 0 }}>
          <X size={12} /> Clear ZIP
        </button>
      )}

      <label className="flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}>
        <input type="checkbox" checked={!!includeStatewide} onChange={e => onToggleStatewide?.(e.target.checked)} />
        Include statewide resources
      </label>

      <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
        {!zip ? "Showing statewide Ohio resources plus search tools you can use for your ZIP code." : isRoss ? "Showing Ross County / Chillicothe-area resources first." : "Showing resources matched to your ZIP code."}
      </p>
    </div>
  );
}