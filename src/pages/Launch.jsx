import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminCodeRedemption from "@/components/rooted/AdminCodeRedemption";
import { Sparkles, ChevronRight } from "lucide-react";

const LAUNCH_DATE = new Date("2026-06-10T09:00:00-04:00");

function useCountdown() {
  const [time, setTime] = useState(() => getTimeLeft());
  function getTimeLeft() {
    const diff = LAUNCH_DATE - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      launched: false,
    };
  }
  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

const BG = "#0d2818";
const CARD = "#132d1f";
const CARD2 = "#162f21";
const BORDER = "rgba(255,255,255,0.08)";
const GREEN = "#3db870";
const GOLD = "#c9973a";
const TEXT = "#f0e8d8";
const MUTED = "rgba(240,232,216,0.55)";

const WHAT_WE_HELP = [
  { emoji: "⚖️", title: "Court & CPS", desc: "Know your rights. Track every date, document, and requirement." },
  { emoji: "🧠", title: "Behavior & Trauma", desc: "Real-time coaching when your child is dysregulated." },
  { emoji: "📋", title: "Case Plans", desc: "Break down court-ordered requirements into clear steps." },
  { emoji: "🤝", title: "Co-Parenting", desc: "Court-supervised messaging that protects you both." },
  { emoji: "🏥", title: "Medical & Meds", desc: "Track medications, appointments, and providers." },
  { emoji: "💙", title: "You Matter Too", desc: "Caregiver burnout is real. This holds space for you too." },
];

const TRUTHS = [
  "You don't have to navigate this alone.",
  "Fear is not a parenting strategy — but neither is shame.",
  "You are your child's greatest advocate.",
  "Hard families deserve real tools, not judgment.",
];

export default function Launch() {
  const time = useCountdown();
  const [form, setForm] = useState({ full_name: "", email: "", family_type: "foster", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeTruth, setActiveTruth] = useState(0);

  useEffect(() => {
    base44.entities.WaitlistSignup.list("-created_date", 1000).then(list => setCount(list.length)).catch(() => {});
    const t = setInterval(() => setActiveTruth(n => (n + 1) % TRUTHS.length), 4000);
    return () => clearInterval(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) { setError("Please enter your name and email."); return; }
    setLoading(true); setError("");
    await base44.entities.WaitlistSignup.create({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      family_type: form.family_type,
      message: form.message.trim(),
    });
    setSubmitted(true); setLoading(false);
    setCount(c => (c || 0) + 1);
  }

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.07)", border: `1.5px solid rgba(255,255,255,0.12)`,
    borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "var(--font-sans)",
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--font-sans)", color: TEXT, overflowX: "hidden" }}>

      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "-10%", right: "-20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,184,112,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "10%", left: "-20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,151,58,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── NAV ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "max(18px, env(safe-area-inset-top)) 20px 14px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🌿</span>
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: 20, color: TEXT, lineHeight: 1 }}>
              Rooted <span style={{ color: GOLD }}>21</span>
            </p>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, marginTop: 2 }}>PARENTING NETWORK</p>
          </div>
        </div>
        <button
          onClick={() => base44.auth.redirectToLogin("/home")}
          style={{ background: CARD, border: `1px solid ${GREEN}50`, borderRadius: 10, color: GREEN, fontWeight: 700, fontSize: 13, padding: "9px 18px", cursor: "pointer" }}
        >
          Sign In
        </button>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
          {/* Rotating affirmation pill */}
          <div style={{ background: CARD, border: `1px solid ${GREEN}30`, borderRadius: 50, padding: "7px 18px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 22, minHeight: 34 }}>
            <p style={{ fontSize: 12, color: GREEN, fontStyle: "italic", margin: 0 }}>"{TRUTHS[activeTruth]}"</p>
          </div>

          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "clamp(1.9rem, 8vw, 2.6rem)", lineHeight: 1.1, color: TEXT, marginBottom: 14, letterSpacing: "-0.5px" }}>
            You don't have to figure<br />this out alone.
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 340, margin: "0 auto 24px", fontWeight: 400 }}>
            Rooted 21 is a calm, private place for foster, adoptive, kinship, and biological parents navigating hard systems.
          </p>

          {/* Countdown */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 20px", display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 900, fontSize: 34, color: GREEN, lineHeight: 1, margin: 0 }}>{time.days}</p>
              <p style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>days</p>
            </div>
            <div style={{ width: 1, height: 40, background: BORDER }} />
            <div style={{ textAlign: "left" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: TEXT, margin: 0 }}>Opening June 10, 2026</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Join the waitlist — we'll let you know first</p>
            </div>
          </div>

          {count !== null && count > 0 && (
            <p style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>🌱 {count} families already on the list</p>
          )}
        </div>

        {/* ── FOUNDER'S NOTE ── */}
        <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)", marginBottom: 28 }}>

          {/* Photo — full width on mobile */}
          <div style={{ width: "100%", height: 280, overflow: "hidden", position: "relative" }}>
            <img
              src="https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/657094531_5061CC5C-2841-45A8-A3F9-073AC259189A.png"
              alt="Misty Stonerock"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%", display: "block" }}
            />
            {/* Gradient fade into content below */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(transparent, #0d2c1a)" }} />
          </div>

          {/* Content */}
          <div style={{ background: "#0d2c1a", padding: "24px 22px 28px" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "2rem", color: "#f0e8d8", lineHeight: 1.1, marginBottom: 10 }}>
              Founder's Note
            </p>
            <div style={{ width: 32, height: 3, background: GOLD, marginBottom: 24, borderRadius: 2 }} />

            {[
              {
                heading: "MY WHY",
                body: "Rooted 21 was born from my own journey—navigating trauma, systems, and the fight to break generational cycles. I created this platform so no parent has to feel alone, overwhelmed, or unheard.",
              },
              {
                heading: "OUR MISSION",
                body: "To empower parents and families with real-time support, practical tools, and a community that walks with you through every season. We blend education, behavioral support, and connection to help you build a stronger, rooted foundation for your family.",
              },
              {
                heading: "OUR PROMISE",
                body: "We lead with compassion, respect, and real solutions. Your privacy, your story, and your family's well-being will always be at the heart of everything we do.",
              },
            ].map((s, i) => (
              <div key={s.heading} style={{ marginBottom: i < 2 ? 20 : 0 }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: GOLD, marginBottom: 8, textTransform: "uppercase" }}>{s.heading}</p>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(240,232,216,0.85)" }}>{s.body}</p>
                {i < 2 && <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", marginTop: 20 }} />}
              </div>
            ))}

            {/* Logo mark */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
              <span style={{ fontSize: 22 }}>🌿</span>
              <div>
                <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: 16, color: "#f0e8d8", lineHeight: 1 }}>
                  Rooted <span style={{ color: GOLD }}>21</span>
                </p>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, marginTop: 3 }}>PARENTING NETWORK</p>
              </div>
            </div>
          </div>

          {/* Bottom: quote + signature */}
          <div style={{ background: "#e8e0d0", padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flex: 1 }}>
              <span style={{ fontSize: 32, lineHeight: 0.8, color: "#3a6a4a", fontFamily: "Georgia, serif", flexShrink: 0, marginTop: 4 }}>"</span>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "#1a2a1a", fontStyle: "italic" }}>
                Healing our past.<br />
                Strengthening our present.<br />
                Building their future.
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 17, color: "#1a2a1a", marginBottom: 4 }}>Misty Stonerock</p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#5a7a5a", textTransform: "uppercase" }}>Founder</p>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.07em", color: "#5a7a5a", textTransform: "uppercase" }}>Rooted 21 Parenting Network</p>
            </div>
          </div>
        </div>

        {/* ── WHAT WE HELP WITH ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, marginBottom: 6, textAlign: "center" }}>What Rooted 21 helps with</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.3rem, 5vw, 1.7rem)", color: TEXT, textAlign: "center", marginBottom: 18, lineHeight: 1.25 }}>
            Everything the system throws at you —<br />in one calm place
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {WHAT_WE_HELP.map(item => (
              <div key={item.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 12px" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{item.emoji}</div>
                <p style={{ fontWeight: 700, fontSize: 13, color: TEXT, marginBottom: 5 }}>{item.title}</p>
                <p style={{ fontSize: 11, lineHeight: 1.55, color: MUTED }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── JOIN WAITLIST ── */}
        <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: "24px 18px", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(1.4rem, 6vw, 1.8rem)", color: TEXT, marginBottom: 6, lineHeight: 1.15 }}>Save your spot</h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.65 }}>
            We'll email you when we open. No spam. Just a heads up that your support is ready.
          </p>

          {submitted ? (
            <div style={{ background: "rgba(61,184,112,0.12)", border: `1.5px solid ${GREEN}40`, borderRadius: 14, padding: "28px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>🌱</p>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 20, color: TEXT, marginBottom: 8 }}>You're on the list.</p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>We'll be in touch before June 10. Thank you for believing in this.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Your name</label>
                <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="First and last name" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Email address</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Your family (optional)</label>
                <select value={form.family_type} onChange={e => setForm(f => ({ ...f, family_type: e.target.value }))} style={{ ...inp, color: "#fff" }}>
                  <option value="foster" style={{ color: "#000" }}>Foster Parent</option>
                  <option value="adoptive" style={{ color: "#000" }}>Adoptive Parent</option>
                  <option value="kinship" style={{ color: "#000" }}>Kinship Caregiver</option>
                  <option value="biological" style={{ color: "#000" }}>Biological Parent</option>
                  <option value="other" style={{ color: "#000" }}>Other / Professional</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Anything you want us to know? (optional)</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What's been hardest for your family?" rows={3} style={{ ...inp, resize: "none" }} />
              </div>

              {error && <p style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#ff9090" }}>{error}</p>}

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", background: loading ? `${GREEN}50` : GREEN, border: "none", borderRadius: 12, color: "#0d2818", fontWeight: 800, fontSize: 15, cursor: loading ? "default" : "pointer", boxShadow: loading ? "none" : `0 4px 20px ${GREEN}40`, fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? "Saving your spot…" : (<><Sparkles size={15} /> Yes, notify me when we open</>)}
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: MUTED, marginTop: 2 }}>No spam. No selling your info. Ever.</p>
            </form>
          )}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div style={{ background: CARD, borderRadius: 16, overflow: "hidden", marginBottom: 16, border: `1px solid ${BORDER}` }}>
          {[
            { label: "Sign In", action: () => base44.auth.redirectToLogin("/home") },
            { label: "Redeem Access Code", action: () => setShowCodeModal(true) },
            { label: "Admin Access", href: "/founder-access" },
          ].map((btn, i) => (
            btn.href ? (
              <a key={btn.label} href={btn.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none", color: MUTED, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                {btn.label} <ChevronRight size={14} color={MUTED} />
              </a>
            ) : (
              <button key={btn.label} onClick={btn.action} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 18px", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none", background: "none", border: "none", color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                {btn.label} <ChevronRight size={14} color={MUTED} />
              </button>
            )
          ))}
        </div>

        <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "center", padding: "8px 0 40px" }}>
          <a href="/survey" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Give Feedback</a>
          <a href="/legal-policy" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Terms & Privacy</a>
          <span style={{ fontSize: 11, color: MUTED }}>© {new Date().getFullYear()} Rooted 21</span>
        </div>

      </div>

      {showCodeModal && <AdminCodeRedemption onClose={() => setShowCodeModal(false)} onSuccess={() => setShowCodeModal(false)} />}
    </div>
  );
}