import { useEffect, useRef } from "react";
import TrainingWalkthroughSeries from "@/components/training/TrainingWalkthroughSeries";

export default function OnboardingTour({ onComplete }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onComplete?.();
    };
    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    setTimeout(() => panelRef.current?.querySelector("button, a")?.focus?.(), 0);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" onMouseDown={(event) => event.target === event.currentTarget && onComplete?.()} style={{ background: "rgba(47, 75, 58, 0.42)", backdropFilter: "blur(12px)" }}>
      <div ref={panelRef} className="w-full max-w-[540px]">
        <TrainingWalkthroughSeries compact />
        <button type="button" onClick={onComplete} aria-label="Exit tutorial" className="w-full mt-3 rounded-2xl py-3 text-sm font-bold" style={{ background: "rgba(255,255,255,0.86)", color: "#5a3d28", border: "1px solid rgba(255,255,255,0.9)" }}>
          Skip for now — Continue to Dashboard
        </button>
      </div>
    </div>
  );
}