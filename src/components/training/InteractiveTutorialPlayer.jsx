import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { C } from "@/lib/rooted-constants";
import { ArrowDown, ArrowRight, HelpCircle, Pause, Play, RotateCcw, Volume2, X } from "lucide-react";

function getTargetRect(targetElementId) {
  if (!targetElementId) return null;
  const el = document.getElementById(targetElementId.replace("#", ""));
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function chooseWarmVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return voices.find(v => /female|samantha|victoria|karen|zira|susan|ava|allison|serena/i.test(`${v.name} ${v.voiceURI}`)) || voices.find(v => /en-US|en_/i.test(v.lang)) || voices[0];
}

export default function InteractiveTutorialPlayer({ tutorial, onClose, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [targetClicked, setTargetClicked] = useState(false);
  const step = tutorial.steps[stepIndex];
  const pct = useMemo(() => Math.round(((stepIndex + 1) / tutorial.steps.length) * 100), [stepIndex, tutorial.steps.length]);

  useEffect(() => {
    setTargetClicked(false);
    window.speechSynthesis?.cancel();
    const targetId = step?.targetElementId;
    const target = targetId ? document.getElementById(targetId.replace("#", "")) : null;

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }

    const timer = setTimeout(() => {
      setTargetRect(getTargetRect(targetId));
      speak(step?.narration);
    }, target ? 650 : 100);

    const updateRect = () => setTargetRect(getTargetRect(targetId));
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      window.speechSynthesis?.cancel();
    };
  }, [stepIndex, tutorial.section_id]);

  useEffect(() => {
    if (!step?.requiresClick || !step?.targetElementId) return;
    const target = document.getElementById(step.targetElementId.replace("#", ""));
    if (!target) return;

    const handleTargetClick = () => {
      setTargetClicked(true);
      stopVoice();
      setTimeout(nextStep, 250);
    };

    target.addEventListener("click", handleTargetClick, { once: true, capture: true });
    return () => target.removeEventListener("click", handleTargetClick, { capture: true });
  }, [stepIndex, step?.requiresClick, step?.targetElementId]);

  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 1.08;
    utterance.volume = 0.95;
    const voice = chooseWarmVoice();
    if (voice) utterance.voice = voice;
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
    setTimeout(() => speak(tutorial.steps[0]?.narration), 100);
  }

  const spotlight = targetRect ? {
    top: Math.max(targetRect.top - 10, 8),
    left: Math.max(targetRect.left - 10, 8),
    width: targetRect.width + 20,
    height: targetRect.height + 20,
  } : null;
  const cardTop = spotlight ? Math.min(window.innerHeight - 270, spotlight.top + spotlight.height + 24) : null;
  const cardAbove = spotlight && cardTop > window.innerHeight - 300;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0" style={{ background: "rgba(17, 24, 18, 0.68)", backdropFilter: "blur(3px)" }} />

      {spotlight && (
        <>
          <motion.div
            className="absolute rounded-[24px] pointer-events-none"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, boxShadow: ["0 0 0 9999px rgba(17,24,18,0.68), 0 0 0 0 rgba(107,157,110,0.0)", "0 0 0 9999px rgba(17,24,18,0.68), 0 0 0 16px rgba(107,157,110,0.22)", "0 0 0 9999px rgba(17,24,18,0.68), 0 0 0 0 rgba(107,157,110,0.0)"] }}
            transition={{ boxShadow: { repeat: Infinity, duration: 1.7 } }}
            style={{ ...spotlight, border: `3px solid ${C.midGreen}`, background: "rgba(255,255,255,0.02)" }}
          />
          <motion.div
            className="absolute"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
            style={{ top: cardAbove ? spotlight.top - 34 : spotlight.top + spotlight.height + 6, left: spotlight.left + Math.min(spotlight.width / 2, 220) - 14 }}
          >
            <ArrowDown size={28} color="#ffffff" style={{ transform: cardAbove ? "rotate(180deg)" : "none", filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.35))" }} />
          </motion.div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-3 right-3 pointer-events-auto"
        style={{ top: spotlight ? (cardAbove ? Math.max(12, spotlight.top - 250) : Math.min(window.innerHeight - 260, spotlight.top + spotlight.height + 42)) : "50%", transform: spotlight ? "none" : "translateY(-50%)" }}
      >
        <div className="mx-auto max-w-[500px] rounded-[28px] overflow-hidden shadow-2xl" style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(255,255,255,0.76)", backdropFilter: "blur(18px)", boxShadow: "0 28px 80px rgba(0,0,0,0.28)" }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.cream}` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: "rgba(107,157,110,0.14)" }}>{tutorial.emoji}</div>
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: C.midGreen }}>STEP-BY-STEP GUIDE</p>
                <h2 className="font-serif font-bold text-base leading-tight" style={{ color: C.darkGreen }}>{tutorial.title}</h2>
              </div>
            </div>
            <button onClick={() => { stopVoice(); onClose?.(); }} className="rounded-full p-2" style={{ background: "rgba(255,255,255,0.8)", border: "none" }}><X size={18} color={C.mutedText} /></button>
          </div>

          <div className="px-4 pt-4">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: C.cream }}><motion.div className="h-full rounded-full" style={{ background: C.midGreen }} initial={false} animate={{ width: `${pct}%` }} /></div>
            <p className="text-[10px] font-bold mt-1" style={{ color: C.mutedText }}>Step {stepIndex + 1} of {tutorial.steps.length} · {pct}% complete</p>
          </div>

          <div className="p-4 space-y-3">
            <AnimatePresence mode="wait">
              <motion.div key={stepIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 size={15} color={C.midGreen} />
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{speaking ? "Warm voice narration playing" : "Warm voice narration"}</p>
                </div>
                <p className="text-base font-bold" style={{ color: C.darkGreen }}>{step.title}</p>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: C.darkText }}>{step.narration}</p>
                <div className="mt-3 rounded-2xl p-3" style={{ background: step.requiresClick ? "#FFFBEE" : C.offWhite, border: step.requiresClick ? "1px solid #F4DFA0" : `1px solid ${C.cream}` }}>
                  <p className="text-xs font-bold" style={{ color: step.requiresClick ? "#7A5200" : C.mutedText }}>
                    {step.requiresClick ? "Click this button to continue." : step.prompt}
                  </p>
                  {step.requiresClick && <p className="text-[11px] mt-1" style={{ color: "#7A5200" }}>{step.prompt}</p>}
                  {targetClicked && <p className="text-[11px] mt-1 font-bold" style={{ color: C.midGreen }}>Great job — moving to the next step.</p>}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 flex-wrap">
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
              {step.path && !step.requiresClick && (
                <Link to={step.path} onClick={stopVoice} className="flex-1 rounded-2xl py-3 text-sm font-bold text-center" style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}>
                  {step.button_label || "Open section"}
                </Link>
              )}
              <button onClick={nextStep} disabled={step.requiresClick && !targetClicked} className="flex-1 rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2" style={{ background: step.requiresClick && !targetClicked ? C.cream : C.darkGreen, color: step.requiresClick && !targetClicked ? C.mutedText : "#fff", border: "none" }}>
                {step.requiresClick ? "Waiting for click" : stepIndex === tutorial.steps.length - 1 ? "Complete" : "Next step"} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}