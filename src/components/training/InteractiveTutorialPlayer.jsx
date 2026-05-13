import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { C } from "@/lib/rooted-constants";
import { ArrowRight, HelpCircle, Pause, Play, RotateCcw, Volume2, X } from "lucide-react";

export default function InteractiveTutorialPlayer({ tutorial, onClose, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const step = tutorial.steps[stepIndex];
  const pct = useMemo(() => Math.round(((stepIndex + 1) / tutorial.steps.length) * 100), [stepIndex, tutorial.steps.length]);

  useEffect(() => {
    speak(step?.narration);
    return () => window.speechSynthesis?.cancel();
  }, [stepIndex, tutorial.section_id]);

  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1.02;
    utterance.volume = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopVoice() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function nextStep() {
    stopVoice();
    if (stepIndex < tutorial.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete?.(tutorial.section_id);
      onClose?.();
    }
  }

  function replay() {
    setStepIndex(0);
    speak(tutorial.steps[0]?.narration);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" style={{ background: "rgba(43, 64, 50, 0.42)", backdropFilter: "blur(12px)" }}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }} className="w-full max-w-[520px] rounded-[28px] overflow-hidden shadow-2xl" style={{ background: "rgba(255,255,255,0.82)", border: "1px solid rgba(255,255,255,0.72)", boxShadow: "0 28px 80px rgba(61,40,23,0.24)" }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.cream}` }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(107,157,110,0.14)" }}>{tutorial.emoji}</div>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: C.midGreen }}>GUIDED WALKTHROUGH</p>
              <h2 className="font-serif font-bold text-lg leading-tight" style={{ color: C.darkGreen }}>{tutorial.title}</h2>
            </div>
          </div>
          <button onClick={() => { stopVoice(); onClose?.(); }} className="rounded-full p-2" style={{ background: "rgba(255,255,255,0.75)", border: "none" }}><X size={18} color={C.mutedText} /></button>
        </div>

        <div className="px-4 pt-4">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: C.cream }}>
            <motion.div className="h-full rounded-full" style={{ background: C.midGreen }} initial={false} animate={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] font-bold mt-1" style={{ color: C.mutedText }}>Step {stepIndex + 1} of {tutorial.steps.length} · {pct}% complete</p>
        </div>

        <div className="p-4 grid gap-4">
          <div className="rounded-[24px] p-4 relative overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(250,246,241,0.95), rgba(245,237,226,0.72))", border: `1px solid ${C.cream}` }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 70% 20%, rgba(107,157,110,0.18), transparent 36%)" }} />
            <div className="relative space-y-3">
              <div className="h-12 rounded-2xl flex items-center px-3 gap-2" style={{ background: "rgba(255,255,255,0.82)", border: "1px solid rgba(255,255,255,0.9)" }}>
                <div className="w-8 h-8 rounded-full" style={{ background: C.midGreen }} />
                <div className="flex-1">
                  <div className="h-2 w-24 rounded-full" style={{ background: C.cream }} />
                  <div className="h-2 w-16 rounded-full mt-1" style={{ background: "rgba(166,124,82,0.2)" }} />
                </div>
              </div>
              <motion.div animate={{ boxShadow: ["0 0 0 0 rgba(107,157,110,0.0)", "0 0 0 12px rgba(107,157,110,0.18)", "0 0 0 0 rgba(107,157,110,0.0)"] }} transition={{ repeat: Infinity, duration: 1.8 }} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.92)", border: `2px solid ${C.midGreen}` }}>
                <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{step.title}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: C.mutedText }}>{step.prompt}</p>
              </motion.div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 rounded-2xl" style={{ background: "rgba(255,255,255,0.72)", border: `1px solid ${C.cream}` }} />
                <div className="h-16 rounded-2xl" style={{ background: "rgba(255,255,255,0.72)", border: `1px solid ${C.cream}` }} />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={stepIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.74)", border: `1px solid ${C.cream}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Volume2 size={15} color={C.midGreen} />
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{speaking ? "Voice narration playing" : "Voice narration"}</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.darkText }}>{step.narration}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-2">
            <button onClick={speaking ? stopVoice : () => speak(step.narration)} className="rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
              {speaking ? <Pause size={13} /> : <Play size={13} />} {speaking ? "Pause" : "Play"}
            </button>
            <button onClick={replay} className="rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
              <RotateCcw size={13} /> Replay
            </button>
            <Link to="/support-chat" className="ml-auto rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2" style={{ background: "#FFFBEE", color: "#7A5200", border: "1px solid #F4DFA0", textDecoration: "none" }}>
              <HelpCircle size={13} /> Need more help?
            </Link>
          </div>

          <div className="flex gap-2">
            {step.path && (
              <Link to={step.path} onClick={stopVoice} className="flex-1 rounded-2xl py-3 text-sm font-bold text-center" style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}>
                {step.button_label || "Open section"}
              </Link>
            )}
            <button onClick={nextStep} className="flex-1 rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>
              {stepIndex === tutorial.steps.length - 1 ? "Complete" : "Next step"} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}