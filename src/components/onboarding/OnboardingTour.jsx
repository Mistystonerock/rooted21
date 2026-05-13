import TrainingWalkthroughSeries from "@/components/training/TrainingWalkthroughSeries";

export default function OnboardingTour({ onComplete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" style={{ background: "rgba(47, 75, 58, 0.42)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-[540px]">
        <TrainingWalkthroughSeries compact />
        <button onClick={onComplete} className="w-full mt-3 rounded-2xl py-3 text-sm font-bold" style={{ background: "rgba(255,255,255,0.86)", color: "#5a3d28", border: "1px solid rgba(255,255,255,0.9)" }}>
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}