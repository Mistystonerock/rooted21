import { useState } from "react";
import { Zap, Wind, AlertCircle } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const GROUNDING_STEPS = [
  "🟠 Name 5 things you can **see** right now",
  "🟡 Name 4 things you can **touch** right now",
  "🟢 Name 3 things you can **hear** right now",
  "🔵 Name 2 things you can **smell** right now",
  "🟣 Name 1 thing you can **taste** right now",
];

const BOX_BREATH_SCRIPT = "Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4–5 times.";

const STEP_AWAY_SCRIPT = `"I'm feeling overwhelmed right now. I need to step away for a moment to calm down. I will be back in 15 minutes. This is not about you — it's about me taking care of myself."`;

export default function EmergencyTools() {
  const [activeModal, setActiveModal] = useState(null);
  const [grounding, setGrounding] = useState(Array(5).fill(false));

  function toggleGroundingStep(idx) {
    const updated = [...grounding];
    updated[idx] = !updated[idx];
    setGrounding(updated);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#FFE8E6", border: "1px solid #F4C9B8" }}>
        <AlertCircle size={18} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-serif font-bold text-base" style={{ color: "#B84C2A" }}>Feeling overwhelmed RIGHT NOW?</p>
          <p className="text-xs mt-1" style={{ color: "#6B3D2A" }}>Pick one of these tools to calm your nervous system in 5–10 minutes</p>
        </div>
      </div>

      {/* Tool Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {/* 5-4-3-2-1 Grounding */}
        <button
          onClick={() => setActiveModal("grounding")}
          className="w-full rounded-xl p-4 text-left transition-all"
          style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
        >
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>5-4-3-2-1 Grounding</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Ground yourself in your senses • 5 min</p>
        </button>

        {/* Box Breathing */}
        <button
          onClick={() => setActiveModal("breathing")}
          className="w-full rounded-xl p-4 text-left transition-all"
          style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
        >
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Box Breathing</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Calm your nervous system with structured breath • 4 min</p>
        </button>

        {/* Step Away Script */}
        <button
          onClick={() => setActiveModal("stepaway")}
          className="w-full rounded-xl p-4 text-left transition-all"
          style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
        >
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Step Away Script</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Exact words to remove yourself calmly • 1 min</p>
        </button>
      </div>

      {/* Modals */}
      {activeModal === "grounding" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-2xl p-5"
            style={{ background: C.offWhite, maxHeight: "90vh", overflowY: "auto" }}>
            <p className="font-serif font-bold text-lg mb-4" style={{ color: C.darkGreen }}>5-4-3-2-1 Grounding</p>
            <div className="space-y-2.5 mb-5">
              {GROUNDING_STEPS.map((step, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: grounding[i] ? "#EAF4EA" : C.white,
                    border: `1.5px solid ${grounding[i] ? C.midGreen : C.cream}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={grounding[i]}
                    onChange={() => toggleGroundingStep(i)}
                    className="mt-0.5 flex-shrink-0"
                    style={{ width: 16, height: 16, accentColor: C.midGreen }}
                  />
                  <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
                    {step.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                  </p>
                </label>
              ))}
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}
            >
              Done ✓
            </button>
          </div>
        </div>
      )}

      {activeModal === "breathing" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-2xl p-5"
            style={{ background: C.offWhite }}>
            <p className="font-serif font-bold text-lg mb-4" style={{ color: C.darkGreen }}>Box Breathing Exercise</p>
            
            <div className="rounded-xl p-6 mb-5 text-center" style={{ background: "#E8F4FF", border: "1px solid #B3DFF5" }}>
              <p className="text-xs font-bold mb-4 uppercase" style={{ color: "#1A5FAD" }}>Follow this pattern 4–5 times</p>
              
              <div className="space-y-3 mb-6">
                <div className="rounded-lg p-3" style={{ background: "#C8E6F5" }}>
                  <p className="text-xs font-bold" style={{ color: "#1A5FAD" }}>IN: 4 counts</p>
                  <p className="text-[10px] mt-1">Breathe in slowly through your nose</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "#B3DFF5" }}>
                  <p className="text-xs font-bold" style={{ color: "#1A5FAD" }}>HOLD: 4 counts</p>
                  <p className="text-[10px] mt-1">Keep the air in your lungs</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "#C8E6F5" }}>
                  <p className="text-xs font-bold" style={{ color: "#1A5FAD" }}>OUT: 4 counts</p>
                  <p className="text-[10px] mt-1">Exhale slowly through your mouth</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "#B3DFF5" }}>
                  <p className="text-xs font-bold" style={{ color: "#1A5FAD" }}>HOLD: 4 counts</p>
                  <p className="text-[10px] mt-1">Before you breathe in again</p>
                </div>
              </div>

              <p className="text-[11px] font-bold" style={{ color: "#1A5FAD" }}>Aim for 4–5 full cycles (16–20 minutes)</p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}
            >
              Done ✓
            </button>
          </div>
        </div>
      )}

      {activeModal === "stepaway" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-2xl p-5"
            style={{ background: C.offWhite }}>
            <p className="font-serif font-bold text-lg mb-4" style={{ color: C.darkGreen }}>Step Away Script</p>
            
            <div className="rounded-xl p-4 mb-5 flex items-start gap-3"
              style={{ background: "#FFF8E6", border: "1px solid #F5E6BF" }}>
              <span className="text-2xl flex-shrink-0">💬</span>
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: "#7A5200" }}>Say this exactly:</p>
                <p className="text-sm leading-relaxed font-serif italic" style={{ color: "#5A3A00" }}>
                  {STEP_AWAY_SCRIPT}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-5 text-xs">
              <div className="rounded-lg p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold mb-1" style={{ color: C.darkGreen }}>✓ Why this works:</p>
                <p style={{ color: C.mutedText }}>Gives you permission to leave, sets clear expectations, and protects the relationship.</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold mb-1" style={{ color: C.darkGreen }}>✓ After you say it:</p>
                <p style={{ color: C.mutedText }}>Actually leave the room. Go for a walk, do Box Breathing, or sit alone for 15 minutes.</p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}
            >
              Got it ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}