import { DoorOpen } from "lucide-react";

export default function QuickExitButton() {
  function quickExit() {
    sessionStorage.clear();
    window.location.replace("https://www.google.com/search?q=weather");
  }

  return (
    <button
      type="button"
      onClick={quickExit}
      className="fixed left-3 top-16 z-[60] rounded-full px-3 py-2 text-xs font-black shadow-lg"
      style={{ background: "#B84C2A", color: "#fff", border: "none", paddingTop: "max(8px, env(safe-area-inset-top))" }}
      aria-label="Quick exit"
    >
      <DoorOpen size={14} className="mr-1" /> Exit
    </button>
  );
}