import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminCodeRedemption from "@/components/rooted/AdminCodeRedemption";

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

const GOLD = "#c9973a";
const GOLD_LIGHT = "#f0c86a";
const TEXT = "#f5e6c8";
const MUTED = "rgba(245,230,200,0.65)";
const CARD_BORDER = "rgba(201,151,58,0.3)";

const WHAT_WE_HELP = [
  { emoji: "⚖️", title: "Court & CPS", desc: "Know your rights. Track every date, document, and requirement." },
  { emoji: "🧠", title: "Behavior & Trauma", desc: "Real-time coaching when your child is dysregulated and you don't know what to do." },
  { emoji: "📋", title: "Case Plans", desc: "Break down court-ordered requirements into clear, checkable steps." },
  { emoji: "🤝", title: "Co-Parenting", desc: "Court-supervised messaging and documentation that protects you both." },
  { emoji: "🏥", title: "Medical & Meds", desc: "Track medications, appointments, and providers in one private place." },
  { emoji: "💙", title: "You Matter Too", desc: "Caregiver burnout is real. This app holds space for your wellbeing too." },
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
    if (!form.full_name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setLoading(true);
    setError("");
    await base44.entities.WaitlistSignup.create({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      family_type: form.family_type,
      message: form.message.trim(),
    });
    setSubmitted(true);
    setLoading(false);
    setCount(c => (c || 0) + 1);
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.09)",
    border: "1.5px solid rgba(201,151,58,0.35)",
    borderRadius: 10,
    padding: "13px 16px",
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--font-sans)",
  };

  const daysLeft = time.days;

  return (
    <div style={{
      background: `linear-gradient(160deg, #0a3d20 0%, #0c4f28 50%, #0a3d20 100%)`,
      minHeight: "100vh",
      fontFamily: "var(--font-sans)",
      color: TEXT,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Soft ambient glow — calming, not flashy */}
      <div style={{ position: "fixed", top: "5%", right: "-15%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,151,58,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "15%", left: "-15%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,107,58,0.18) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── NAV ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>🌿</span>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 20, color: TEXT }}>
            Rooted <span style={{ color: GOLD }}>21</span>
          </span>
        </div>
        <button
          onClick={() => base44.auth.redirectToLogin("/home")}
          style={{
            background: "rgba(201,151,58,0.15)",
            border: `1.5px solid ${CARD_BORDER}`,
            borderRadius: 8,
            color: GOLD_LIGHT,
            fontWeight: 700,
            fontSize: 13,
            padding: "8px 18px",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          Sign In
        </button>
      </div>

      {/* ── HERO — lead with empathy, not hype ── */}
      <div style={{ padding: "28px 22px 32px", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Rotating affirmation — quiet, present */}
        <div style={{
          background: "rgba(201,151,58,0.12)",
          border: `1px solid rgba(201,151,58,0.25)`,
          borderRadius: 50,
          padding: "8px 20px",
          display: "inline-block",
          marginBottom: 28,
          minHeight: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <p style={{ fontSize: 13, color: GOLD_LIGHT, fontStyle: "italic", margin: 0, transition: "opacity 0.5s" }}>
            "{TRUTHS[activeTruth]}"
          </p>
        </div>

        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 900,
          fontSize: "clamp(2rem, 8vw, 2.8rem)",
          lineHeight: 1.1,
          color: TEXT,
          marginBottom: 16,
          letterSpacing: "-0.5px",
        }}>
          You don't have to figure<br />this out alone.
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.7, color: MUTED, maxWidth: 360, margin: "0 auto 28px", fontWeight: 400 }}>
          Rooted 21 is a calm, private place for foster, adoptive, kinship, and biological parents navigating hard systems — court, CPS, trauma, and co-parenting.
        </p>

        {/* Opening June 10 — soft, not aggressive */}
        <div style={{
          background: "rgba(0,0,0,0.25)",
          border: `1.5px solid ${CARD_BORDER}`,
          borderRadius: 14,
          padding: "14px 20px",
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 8,
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 900, fontSize: 32, color: GOLD_LIGHT, lineHeight: 1, margin: 0 }}>{daysLeft}</p>
            <p style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>days</p>
          </div>
          <div style={{ width: 1, height: 40, background: CARD_BORDER }} />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: TEXT, margin: 0 }}>Opening June 10, 2026</p>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Join the waitlist — we'll let you know first</p>
          </div>
        </div>

        {count !== null && count > 0 && (
          <p style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>
            🌱 {count} families already on the list
          </p>
        )}
      </div>

      {/* ── FOUNDER'S NOTE — warm letter, not marketing ── */}
      <div style={{ margin: "0 16px 32px", position: "relative", zIndex: 1 }}>
        <div style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: 20,
          padding: "26px 22px",
          borderLeft: `5px solid ${GOLD}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.2)`,
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5a7a5a", marginBottom: 16 }}>
            A note from the founder
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#2a2a2a" }}>
            I built this because I know what it feels like to parent from fear — and to need something that actually understood my family's journey.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#2a2a2a", marginTop: 12 }}>
            Whether you're a foster parent, adoptive family, kinship caregiver, or biological parent navigating the system — you deserve real tools, not judgment. You deserve to feel <em>rooted</em>.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#2a2a2a", marginTop: 12 }}>
            This is built from lived experience, grounded in trauma science, and designed to meet you exactly where you are.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#1a4a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🌿</div>
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 18, fontStyle: "italic", color: "#1a4a2e", margin: 0 }}>Misty Stonerock</p>
              <p style={{ fontSize: 11, color: "#5a7a5a", marginTop: 2 }}>Founder, Rooted 21 Parenting Network</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHAT WE HELP WITH — need-first, not feature-first ── */}
      <div style={{ padding: "0 16px 32px", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, marginBottom: 6, textAlign: "center" }}>
          What Rooted 21 helps with
        </p>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 700,
          fontSize: "clamp(1.4rem, 5vw, 1.9rem)",
          color: TEXT,
          textAlign: "center",
          marginBottom: 20,
          lineHeight: 1.2,
        }}>
          Everything the system throws at you —<br />in one calm place
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {WHAT_WE_HELP.map((item) => (
            <div key={item.title} style={{
              background: "rgba(255,255,255,0.06)",
              border: `1.5px solid rgba(255,255,255,0.1)`,
              borderRadius: 16,
              padding: "16px 14px",
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{item.emoji}</div>
              <p style={{ fontWeight: 700, fontSize: 13, color: TEXT, marginBottom: 5 }}>{item.title}</p>
              <p style={{ fontSize: 12, lineHeight: 1.55, color: MUTED }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── JOIN — warm invitation, not a pitch ── */}
      <div style={{ margin: "0 16px 32px", position: "relative", zIndex: 1 }}>
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: `1.5px solid ${CARD_BORDER}`,
          borderRadius: 22,
          padding: "26px 20px",
        }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 800,
            fontSize: "clamp(1.5rem, 6vw, 2rem)",
            color: TEXT,
            marginBottom: 8,
            lineHeight: 1.15,
          }}>
            Save your spot
          </h2>
          <p style={{ fontSize: 14, color: MUTED, marginBottom: 22, lineHeight: 1.6 }}>
            We'll email you when we open. No spam. Just a heads up that your support is ready.
          </p>

          {submitted ? (
            <div style={{
              background: "rgba(26,74,46,0.45)",
              border: `1.5px solid rgba(45,106,69,0.5)`,
              borderRadius: 16,
              padding: "28px 20px",
              textAlign: "center",
            }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>🌱</p>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 20, color: TEXT, marginBottom: 8 }}>You're on the list.</p>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>We'll be in touch before June 10. Thank you for believing in this. It means everything.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Your name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="First and last name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@email.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Your family (optional)</label>
                <select
                  value={form.family_type}
                  onChange={e => setForm(f => ({ ...f, family_type: e.target.value }))}
                  style={{ ...inputStyle, color: "#fff" }}
                >
                  <option value="foster" style={{ color: "#000" }}>Foster Parent</option>
                  <option value="adoptive" style={{ color: "#000" }}>Adoptive Parent</option>
                  <option value="kinship" style={{ color: "#000" }}>Kinship Caregiver</option>
                  <option value="biological" style={{ color: "#000" }}>Biological Parent</option>
                  <option value="other" style={{ color: "#000" }}>Other / Professional</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Anything you want us to know? (optional)</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="What's been hardest for your family? What do you need most?"
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {error && (
                <p style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff9090" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: loading ? "rgba(201,151,58,0.35)" : `linear-gradient(135deg, ${GOLD}, #a07020)`,
                  border: "none",
                  borderRadius: 12,
                  color: "#1a1a1a",
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: loading ? "default" : "pointer",
                  boxShadow: loading ? "none" : `0 4px 20px rgba(201,151,58,0.35)`,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {loading ? "Saving your spot…" : "Yes, I want to be notified →"}
              </button>

              <p style={{ textAlign: "center", fontSize: 11, color: MUTED, marginTop: 4 }}>
                No spam. No selling your info. Ever.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── QUIET FOOTER ── */}
      <div style={{ borderTop: `1px solid rgba(201,151,58,0.2)`, padding: "20px 22px", display: "flex", gap: 0, position: "relative", zIndex: 1 }}>
        {[
          { label: "Sign In", action: () => base44.auth.redirectToLogin("/home") },
          { label: "Redeem Code", action: () => setShowCodeModal(true) },
          { label: "Admin Access", href: "/founder-access" },
        ].map((btn, i) => (
          btn.href ? (
            <a key={btn.label} href={btn.href} style={{
              flex: 1,
              padding: "12px 8px",
              background: "transparent",
              borderRight: i < 2 ? `1px solid rgba(201,151,58,0.2)` : "none",
              color: MUTED,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {btn.label}
            </a>
          ) : (
            <button key={btn.label} onClick={btn.action} style={{
              flex: 1,
              padding: "12px 8px",
              background: "transparent",
              borderRight: i < 2 ? `1px solid rgba(201,151,58,0.2)` : "none",
              border: "none",
              color: MUTED,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}>
              {btn.label}
            </button>
          )
        ))}
      </div>

      <div style={{ padding: "12px 22px 40px", display: "flex", gap: 20, justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1 }}>
        <a href="/survey" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Give Feedback</a>
        <a href="/legal-policy" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Terms & Privacy</a>
        <span style={{ fontSize: 11, color: MUTED }}>© {new Date().getFullYear()} Rooted 21</span>
      </div>

      {showCodeModal && (
        <AdminCodeRedemption onClose={() => setShowCodeModal(false)} onSuccess={() => setShowCodeModal(false)} />
      )}
    </div>
  );
}