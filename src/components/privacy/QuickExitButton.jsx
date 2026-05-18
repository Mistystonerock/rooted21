import { DoorOpen } from "lucide-react";
import { activateQuickExit } from "@/lib/survivorMode";

export default function QuickExitButton() {
  return (
    <button
      type="button"
      onClick={activateQuickExit}
      className="fixed left-3 top-16 z-[60] rounded-full px-3 py-2 text-xs font-black shadow-lg"
      style={{ background: "#6b9d6e", color: "#fff", border: "none", paddingTop: "max(8px, env(safe-area-inset-top))" }}
      aria-label="Quick exit"
    >
      <DoorOpen size={14} className="mr-1" /> Exit
    </button>
  );
}