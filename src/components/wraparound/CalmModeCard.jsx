import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CalmModeCard() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem("rooted21_calm_mode") === "true");

  useEffect(() => {
    document.body.classList.toggle("rooted-calm-mode", enabled);
    localStorage.setItem("rooted21_calm_mode", String(enabled));
  }, [enabled]);

  return (
    <button
      type="button"
      onClick={() => setEnabled(value => !value)}
      aria-pressed={enabled}
      className="flex w-full items-center justify-between rounded-2xl p-4 text-left"
      style={{ background: enabled ? "#F3EFE7" : C.white, border: `1.5px solid ${enabled ? C.midGreen : C.cream}` }}
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: enabled ? `${C.midGreen}22` : C.offWhite }}>
          {enabled ? <Moon size={18} color={C.midGreen} /> : <Sun size={18} color={C.gold} />}
        </span>
        <span>
          <span className="block text-sm font-black" style={{ color: C.darkGreen }}>Calm Mode</span>
          <span className="block text-xs" style={{ color: C.mutedText }}>Reduces visual intensity, motion, and sensory load.</span>
        </span>
      </span>
      <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: enabled ? C.midGreen : C.cream, color: enabled ? C.white : C.mutedText }}>
        {enabled ? "On" : "Off"}
      </span>
    </button>
  );
}