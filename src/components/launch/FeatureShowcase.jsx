import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

const BG = "#0d2818";
const CARD = "#132d1f";
const GREEN = "#3db870";
const GOLD = "#c9973a";
const TEXT = "#f0e8d8";
const MUTED = "rgba(240,232,216,0.55)";

const SLIDES = [
  {
    emoji: "🌿",
    title: "Welcome to Rooted 21",
    subtitle: "Your private parenting command center",
    description: "Built for foster, adoptive, kinship, and biological parents navigating hard systems. Everything you need — in one calm, private place.",
    color: GREEN,
    accent: "rgba(61,184,112,0.12)",
    features: ["Private & secure", "Available 24/7", "Works on any device"],
  },
  {
    emoji: "🤖",
    title: "AI Parenting Coach",
    subtitle: "Real-time support, personalized to your family",
    description: "Talk through a meltdown in progress, get trauma-informed strategies, or just process a hard day. Your AI coach knows your child's history and gives real, specific guidance — not generic advice.",
    color: GOLD,
    accent: "rgba(201,151,58,0.12)",
    features: ["Trauma-informed responses", "Personalized to your child", "Available during a crisis"],
  },
  {
    emoji: "⚖️",
    title: "Case Management",
    subtitle: "Track every court date, document & deadline",
    description: "Never miss a court date again. Track your open cases, upload documents, manage your legal team, and see every milestone and deadline in one place.",
    color: "#7aaaee",
    accent: "rgba(122,170,238,0.12)",
    features: ["Court dates & deadlines", "Document storage", "Legal team contacts"],
  },
  {
    emoji: "📝",
    title: "Form & Paperwork Helper",
    subtitle: "Guided help — no legal jargon, just plain English",
    description: "Tell us your zip code and situation. We walk you through exactly which forms to file, what they mean, step-by-step instructions, and all the deadlines. Like having a knowledgeable friend in your corner.",
    color: "#7aaaee",
    accent: "rgba(122,170,238,0.12)",
    features: ["County-specific forms", "Plain language steps", "Deadline alerts"],
  },
  {
    emoji: "✅",
    title: "Case Plan Checklist",
    subtitle: "AI breaks down your court-ordered requirements",
    description: "Upload your case plan PDF. Our AI parses every requirement into a clear checklist with due dates, lets you upload proof of completion, and generates court-ready status reports.",
    color: GREEN,
    accent: "rgba(61,184,112,0.12)",
    features: ["AI document parsing", "Progress tracking", "Court-ready reports"],
  },
  {
    emoji: "🧠",
    title: "Behavior & Trauma Tools",
    subtitle: "Real-time coaching when your child is dysregulated",
    description: "Log behaviors, track triggers, spot patterns over time. Get in-the-moment de-escalation strategies and a full behavior analytics dashboard to share with therapists.",
    color: "#a09ef0",
    accent: "rgba(160,158,240,0.12)",
    features: ["Trigger tracking", "Behavior analytics", "Therapist-ready reports"],
  },
  {
    emoji: "🤝",
    title: "Co-Parent Portal",
    subtitle: "Court-supervised messaging that protects everyone",
    description: "Communicate with your co-parent through a court-monitored channel. Every message is logged, tamper-proof, and exportable for court. Conflict language checker included.",
    color: GREEN,
    accent: "rgba(61,184,112,0.12)",
    features: ["Court-admissible logs", "Conflict detection", "Exportable PDF"],
  },
  {
    emoji: "💊",
    title: "Medication Manager",
    subtitle: "Track prescriptions, doses & refills",
    description: "Never wonder if a dose was given. Log every medication, track administration, get refill reminders, and see how medication timing correlates with behavior patterns.",
    color: "#7aaaee",
    accent: "rgba(122,170,238,0.12)",
    features: ["Dose logging", "Refill reminders", "Behavior correlation"],
  },
  {
    emoji: "🔒",
    title: "Secure Document Vault",
    subtitle: "Store, share & protect critical documents",
    description: "Upload court orders, IEPs, medical records, and legal documents. Share them securely with your team using access codes. Every access is logged.",
    color: GOLD,
    accent: "rgba(201,151,58,0.12)",
    features: ["Encrypted storage", "Access code sharing", "Audit trail"],
  },
  {
    emoji: "👨‍👧",
    title: "Visitation Tracker",
    subtitle: "Log every visit for court documentation",
    description: "Track visits, no-shows, supervisor names, and how your child was before and after. Generate court-ready visitation reports in seconds.",
    color: GREEN,
    accent: "rgba(61,184,112,0.12)",
    features: ["Visit logging", "Child behavior notes", "Court-ready export"],
  },
  {
    emoji: "🌱",
    title: "Growth Insights",
    subtitle: "AI weekly reports on your family's progress",
    description: "Every week, our AI analyzes your check-ins, behavior logs, and journal entries to generate a personalized insight report — showing what's working, what's hard, and what to try next.",
    color: GREEN,
    accent: "rgba(61,184,112,0.12)",
    features: ["Weekly AI analysis", "Trend detection", "Actionable recommendations"],
  },
  {
    emoji: "🎓",
    title: "Live Classes & Education",
    subtitle: "Learn trauma-informed parenting from experts",
    description: "Join live parenting classes, access the education hub (FASD, RAD, attachment, grief, burnout), and earn completion certificates. Learn at your own pace.",
    color: GOLD,
    accent: "rgba(201,151,58,0.12)",
    features: ["Live group sessions", "Self-paced library", "Completion certificates"],
  },
  {
    emoji: "🤝",
    title: "Parent Community",
    subtitle: "Connect with parents who get it",
    description: "Post anonymously or openly in topic-based groups — foster care, court system, trauma parenting, wins, and more. You're not alone in this.",
    color: "#c080e0",
    accent: "rgba(192,128,224,0.12)",
    features: ["Anonymous posting", "Topic-based groups", "Peer matching"],
  },
  {
    emoji: "💙",
    title: "Caregiver Self-Care",
    subtitle: "You matter too",
    description: "Caregiver burnout is real. Track your own emotional state, read the burnout guide, use the sensory toolbox for regulation, and access crisis support for yourself — not just your child.",
    color: "#e07070",
    accent: "rgba(224,112,112,0.12)",
    features: ["Burnout guide", "Sensory toolbox", "Crisis support 988"],
  },
];

export default function FeatureShowcase() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const SLIDE_DURATION = 5000; // ms per slide
  const TICK = 50;

  useEffect(() => {
    if (playing) {
      progressRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setCurrent(c => (c + 1) % SLIDES.length);
            return 0;
          }
          return p + (TICK / SLIDE_DURATION) * 100;
        });
      }, TICK);
    }
    return () => clearInterval(progressRef.current);
  }, [playing, current]);

  function goTo(i) {
    setCurrent(i);
    setProgress(0);
  }

  function prev() { goTo((current - 1 + SLIDES.length) % SLIDES.length); }
  function next() { goTo((current + 1) % SLIDES.length); }

  const slide = SLIDES[current];

  return (
    <div style={{ borderRadius: 24, overflow: "hidden", border: `1.5px solid rgba(255,255,255,0.08)`, boxShadow: "0 12px 60px rgba(0,0,0,0.6)" }}>

      {/* Header bar — like a video player */}
      <div style={{ background: "#090f0b", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Rooted 21 — App Tour</p>
        </div>
        <p style={{ fontSize: 10, color: MUTED }}>{current + 1}/{SLIDES.length}</p>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.08)", position: "relative" }}>
        <motion.div
          style={{ height: "100%", background: slide.color, position: "absolute", left: 0, top: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0 }}
        />
      </div>

      {/* Slide content */}
      <div style={{ background: CARD, minHeight: 320, padding: "28px 24px 24px", position: "relative", overflow: "hidden" }}>

        {/* Ambient glow */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${slide.color}18 0%, transparent 70%)`, pointerEvents: "none" }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {/* Emoji */}
            <div style={{ fontSize: 52, marginBottom: 14, lineHeight: 1 }}>{slide.emoji}</div>

            {/* Title */}
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "1.45rem", color: TEXT, lineHeight: 1.15, marginBottom: 4 }}>
              {slide.title}
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, color: slide.color, marginBottom: 14, letterSpacing: "0.03em" }}>
              {slide.subtitle}
            </p>

            {/* Description */}
            <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(240,232,216,0.82)", marginBottom: 18 }}>
              {slide.description}
            </p>

            {/* Feature pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {slide.features.map(f => (
                <div key={f} style={{ background: slide.accent, border: `1px solid ${slide.color}40`, borderRadius: 20, padding: "5px 12px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: slide.color }}>✓ {f}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={{ background: "#0a1a10", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={prev} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft size={16} color={MUTED} />
        </button>

        <button
          onClick={() => setPlaying(p => !p)}
          style={{ width: 36, height: 36, borderRadius: 10, background: GREEN, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {playing ? <Pause size={14} color="#0a1a10" /> : <Play size={14} color="#0a1a10" />}
        </button>

        <button onClick={next} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={16} color={MUTED} />
        </button>

        {/* Dot indicators — scrollable strip */}
        <div style={{ flex: 1, overflowX: "auto", display: "flex", gap: 5, alignItems: "center", scrollbarWidth: "none" }}>
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                flexShrink: 0, width: i === current ? 20 : 6, height: 6, borderRadius: 99,
                background: i === current ? slide.color : "rgba(255,255,255,0.15)",
                border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}