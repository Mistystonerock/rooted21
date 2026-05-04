import { useState, useEffect } from "react";
import { ChevronRight, X } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Rooted 21! 🌿",
    description: "Let's take a quick tour to help you navigate the app.",
    highlight: null,
  },
  {
    id: "daily-checkin",
    title: "Daily Check-In",
    description: "Track your child's regulation and your calm level each day. This helps you spot patterns over time.",
    highlight: null,
  },
  {
    id: "lessons",
    title: "Lessons",
    description: "Complete the 21-lesson HALO program. Each lesson teaches trauma-informed parenting skills.",
    highlight: null,
  },
  {
    id: "safety-plan",
    title: "Safety Plan",
    description: "Create a crisis response plan with warning signs, de-escalation strategies, and emergency resources.",
    highlight: null,
  },
  {
    id: "my-team",
    title: "My Support Team",
    description: "Securely message with therapists, caseworkers, and other professionals supporting your family.",
    highlight: null,
  },
  {
    id: "behavior-logs",
    title: "Behavior Logs",
    description: "Record daily behaviors, triggers, and outcomes to understand patterns and progress.",
    highlight: null,
  },
  {
    id: "done",
    title: "You're All Set! ✨",
    description: "You can skip the tour anytime, or tap Help from the dashboard for more info.",
    highlight: null,
  },
];

export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(47, 75, 58, 0.7)" }}>
      <div
        className="rounded-3xl p-6 max-w-sm mx-4 shadow-2xl"
        style={{ background: C.white }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-all hover:opacity-70"
          style={{ background: C.offWhite, border: "none", cursor: "pointer" }}
        >
          <X size={18} color={C.mutedText} />
        </button>

        {/* Emoji/Icon */}
        <div className="text-4xl mb-3">
          {step.id === "welcome" && "👋"}
          {step.id === "daily-checkin" && "📊"}
          {step.id === "lessons" && "📚"}
          {step.id === "safety-plan" && "🛡️"}
          {step.id === "my-team" && "👥"}
          {step.id === "behavior-logs" && "📝"}
          {step.id === "done" && "🌳"}
        </div>

        {/* Title */}
        <h2 className="font-serif font-bold text-lg mb-2" style={{ color: C.darkGreen }}>
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-sm mb-6 leading-relaxed" style={{ color: C.darkText }}>
          {step.description}
        </p>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full flex-1 transition-all"
              style={{
                background: i < currentStep ? C.midGreen : i === currentStep ? C.darkGreen : C.cream,
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm transition-all"
            style={{
              background: C.offWhite,
              color: C.darkGreen,
              border: "none",
              cursor: "pointer",
            }}
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
            style={{
              background: C.darkGreen,
              color: C.white,
              border: "none",
              cursor: "pointer",
            }}
          >
            {currentStep === TOUR_STEPS.length - 1 ? "Done" : "Next"}
            {currentStep !== TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}