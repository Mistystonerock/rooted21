import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

const BG = "#0b1f12";
const CARD = "#12271a";
const BORDER = "rgba(255,255,255,0.08)";
const GREEN = "#3db870";
const GOLD = "#c9973a";
const TEXT = "#f0e8d8";
const MUTED = "rgba(240,232,216,0.55)";

const STEPS = [
  {
    id: "zip",
    question: "What's your zip code?",
    hint: "We use this to find the right county court forms and local resources.",
    type: "text",
    placeholder: "e.g. 43215",
    key: "zip_code",
  },
  {
    id: "role",
    question: "What best describes you?",
    hint: "This helps us find the right forms for your situation.",
    type: "choice",
    key: "role",
    options: [
      { value: "foster", label: "🏠 Foster Parent", sub: "Licensed or provisional foster care" },
      { value: "adoptive", label: "💙 Adoptive Parent", sub: "Adoption in progress or finalized" },
      { value: "kinship", label: "👨‍👩‍👧 Kinship Caregiver", sub: "Grandparent, aunt/uncle, relative" },
      { value: "biological", label: "🌱 Biological Parent", sub: "Birth parent with open case" },
      { value: "other", label: "👤 Other / Not Sure", sub: "" },
    ],
  },
  {
    id: "goal",
    question: "What are you trying to do?",
    hint: "Pick the one that fits best right now.",
    type: "choice",
    key: "goal",
    options: [
      { value: "custody", label: "⚖️ Get or Protect Custody", sub: "Emergency or standard custody filing" },
      { value: "cps_case", label: "📋 Navigate a CPS Case", sub: "Open investigation or ongoing case" },
      { value: "school_iep", label: "🎓 Get School Support (IEP/504)", sub: "Special education, accommodations" },
      { value: "visitation", label: "👨‍👧 Set Up or Change Visitation", sub: "Visit schedule, supervised visits" },
      { value: "reunification", label: "🏡 Work Toward Reunification", sub: "Get your child back home" },
      { value: "adoption", label: "💙 Finalize Adoption", sub: "Adoption petition and process" },
      { value: "guardianship", label: "🛡️ File for Guardianship", sub: "Legal guardianship of a child" },
      { value: "rights", label: "📖 Understand My Rights", sub: "Know what the system can/can't do" },
    ],
  },
  {
    id: "open_case",
    question: "Do you already have an open court or CPS case?",
    hint: "This changes which forms you need and how urgent things are.",
    type: "choice",
    key: "open_case",
    options: [
      { value: "yes_court", label: "✅ Yes — active court case", sub: "" },
      { value: "yes_cps", label: "📋 Yes — open CPS investigation", sub: "" },
      { value: "both", label: "⚖️ Both court and CPS", sub: "" },
      { value: "no", label: "❌ No open cases yet", sub: "" },
      { value: "not_sure", label: "🤷 Not sure", sub: "" },
    ],
  },
  {
    id: "urgency",
    question: "How urgent is your situation?",
    hint: "Some forms have 24–72 hour deadlines. We want to make sure you don't miss them.",
    type: "choice",
    key: "urgency",
    options: [
      { value: "emergency", label: "🚨 Emergency — happening right now", sub: "Child removed, court date this week" },
      { value: "soon", label: "⏰ Urgent — need help within days", sub: "Upcoming deadline or court date" },
      { value: "planning", label: "📅 Planning ahead", sub: "No immediate deadline" },
      { value: "learning", label: "📚 Just learning / researching", sub: "No active case yet" },
    ],
  },
];

export default function FormHelperWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleChoice(value) {
    const updated = { ...answers, [current.key]: value };
    setAnswers(updated);
    if (isLast) {
      onComplete(updated);
    } else {
      setDirection(1);
      setStep(s => s + 1);
    }
  }

  function handleTextNext() {
    if (!answers[current.key]?.trim()) return;
    if (isLast) {
      onComplete(answers);
    } else {
      setDirection(1);
      setStep(s => s + 1);
    }
  }

  function handleBack() {
    setDirection(-1);
    setStep(s => s - 1);
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= step ? GREEN : BORDER,
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: MUTED, textAlign: "right" }}>Step {step + 1} of {STEPS.length}</p>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.22 }}
        >
          {/* Question card */}
          <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: "24px 20px", marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.25rem", color: TEXT, lineHeight: 1.2, marginBottom: 8 }}>
              {current.question}
            </p>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{current.hint}</p>
          </div>

          {/* Text input */}
          {current.type === "text" && (
            <div className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder={current.placeholder}
                value={answers[current.key] || ""}
                onChange={e => setAnswers(a => ({ ...a, [current.key]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleTextNext()}
                style={{
                  width: "100%", background: CARD, border: `1.5px solid ${BORDER}`,
                  borderRadius: 14, padding: "14px 16px", color: "#fff", fontSize: 16,
                  fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleTextNext}
                disabled={!answers[current.key]?.trim()}
                style={{
                  width: "100%", padding: "14px", background: answers[current.key]?.trim() ? GREEN : `${GREEN}40`,
                  border: "none", borderRadius: 14, color: "#0b1f12", fontWeight: 800,
                  fontSize: 15, cursor: answers[current.key]?.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "var(--font-sans)",
                }}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Choice options */}
          {current.type === "choice" && (
            <div className="space-y-2">
              {current.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChoice(opt.value)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: answers[current.key] === opt.value ? `${GREEN}18` : CARD,
                    border: `1.5px solid ${answers[current.key] === opt.value ? GREEN : BORDER}`,
                    borderRadius: 14, padding: "13px 16px", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: TEXT }}>{opt.label}</p>
                    {opt.sub && <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{opt.sub}</p>}
                  </div>
                  <ChevronRight size={14} color={MUTED} style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={handleBack}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: MUTED, fontSize: 13, fontWeight: 600, padding: "4px 0" }}
        >
          <ChevronLeft size={14} /> Back
        </button>
      )}
    </div>
  );
}