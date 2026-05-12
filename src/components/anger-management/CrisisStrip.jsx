import { AlertTriangle, Phone } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CrisisStrip() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 gap-3 z-40"
      style={{ background: "#B84C2A", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2 flex-1">
        <AlertTriangle size={16} color="#fff" className="flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-bold text-white">Mental health crisis?</p>
          <p className="text-[10px] text-white opacity-90">Free. Anonymous. Available 24/7.</p>
        </div>
      </div>
      <a
        href="tel:988"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs flex-shrink-0"
        style={{ background: "#fff", color: "#B84C2A" }}
      >
        <Phone size={12} />
        Call 988
      </a>
    </div>
  );
}