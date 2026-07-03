import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import QuickExitBar from "./QuickExitBar";

// Shared sticky header with back nav + Quick Exit / Safe Screen on every trafficking-support screen.
export default function TraffickingHeader({ title, subtitle, backTo }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-10 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
      <div className="mx-auto flex max-w-[520px] items-center gap-3">
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="rounded-xl p-2"
          style={{ background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer" }}
          aria-label="Go back"
        >
          <ChevronLeft size={22} color="#fff" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="truncate font-serif text-lg font-bold" style={{ color: "#fff" }}>{title}</h1>
          {subtitle && <p className="truncate text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.82)" }}>{subtitle}</p>}
        </div>
        <QuickExitBar />
      </div>
    </div>
  );
}