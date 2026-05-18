import { DoorOpen } from "lucide-react";
import { activateQuickExit } from "@/lib/survivorMode";

export default function QuickExitButton() {
  if (window.location.pathname === "/safe-screen") return null;

  return (
    <button
      type="button"
      onClick={activateQuickExit}
      className="fixed right-3 bottom-28 z-[60] rounded-full px-3 py-2 text-xs font-black shadow-lg"
      style={{ background: "#6b9d6e", color: "#fff", border: "none", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="Quick exit"
    >
      <DoorOpen size={14} className="mr-1" /> Exit
    </button>
  );
}