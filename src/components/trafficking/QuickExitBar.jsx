import { X, EyeOff } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { activateQuickExit } from "@/lib/survivorMode";

// Quick Exit + Safe Screen controls shown on every Human Trafficking Survivor Support screen.
export default function QuickExitBar() {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => activateQuickExit()}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black"
        style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "none", cursor: "pointer" }}
        aria-label="Quick exit to a safe screen"
      >
        <X size={16} color="#fff" /> Quick exit
      </button>
      <button
        type="button"
        onClick={() => window.location.replace("/safe-screen?type=weather")}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black"
        style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "none", cursor: "pointer" }}
        aria-label="Open a safe cover screen"
      >
        <EyeOff size={16} color="#fff" /> Safe screen
      </button>
    </div>
  );
}