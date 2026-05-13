import { useState } from "react";
import { C } from "@/lib/rooted-constants";

const ROSS_ZIPS = ["45601", "45628", "45644", "45673", "45617", "45612", "43115", "43164"];

export default function ZipResourceNotice({ onZipChange }) {
  const [zip, setZip] = useState("45601");
  const isRoss = ROSS_ZIPS.includes(zip.trim());

  function update(value) {
    setZip(value);
    onZipChange?.(value);
  }

  return (
    <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <label className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>ZIP CODE</label>
      <input
        value={zip}
        onChange={e => update(e.target.value.replace(/\D/g, "").slice(0, 5))}
        placeholder="Enter ZIP code"
        className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
        style={{ borderColor: C.cream, background: C.offWhite }}
      />
      <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
        {isRoss ? "Showing Ross County / Chillicothe-area resources first." : "Showing statewide Ohio resources plus search tools you can use for your ZIP code."}
      </p>
    </div>
  );
}