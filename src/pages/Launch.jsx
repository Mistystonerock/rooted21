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

function CountdownBlock({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56 }}>
      <div style={{
        background: "rgba(0,0,0,0.35)",
        border: "2px solid rgba(201,151,58,0.6)",
        borderRadius: 10,
        width: 60,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        fontWeight: 900,
        color: "#f5e6c8",
        letterSpacing: "-1px",
        boxShadow: "0 0 12px rgba(201,151,58,0.3)",
      }}>
        {String(value).padStart(2, "0")}
      </div>
      <p style={{ color: "rgba(245,230,200,0.7)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", marginTop: 5, textTransform: "uppercase" }}>
        {label}
      </p>
    </div>
  );
}

const PILLARS = [
  { emoji: "🧠", title: "Trauma-Informed", desc: "Tools grounded in attachment science and connection-based parenting for real families." },
  { emoji: "💙", title: "Foster/Adoptive", desc: "Built for foster, adoptive, kinship, and biological families navigating hard days." },
  { emoji: "🤝", title: "Community", desc: "A safe space for caregivers to connect, share, and grow together without judgment." },
  { emoji: "💰", title: "Affordable", desc: "Powerful resources accessible to every family regardless of income." },
];

const APP_FEATURES = [
  { emoji: "📚", label: "21-Lesson Curriculum" },
  { emoji: "🧠", label: "Parenting Coach" },
  { emoji: "📈", label: "Behavior Logs" },
  { emoji: "🎓", label: "Live Classes" },
  { emoji: "⚖️", label: "Case Management" },
  { emoji: "🔒", label: "Document Vault" },
  { emoji: "👨‍👧", label: "Visitation Tracker" },
  { emoji: "💊", label: "Medication Manager" },
  { emoji: "🚨", label: "Emergency Toolbox" },
  { emoji: "📞", label: "Team Contacts" },
  { emoji: "📋", label: "Incident Reports" },
  { emoji: "📖", label: "Education Hub" },
];

const FAMILY_TYPES = [
  { value: "foster", label: "Foster Parent" },
  { value: "adoptive", label: "Adoptive Parent" },
  { value: "kinship", label: "Kinship Caregiver" },
  { value: "biological", label: "Biological Parent" },
  { value: "other", label: "Other / Professional" },
];

const BG = "#0a3d20";
const BG2 = "#0d4f2a";
const GOLD = "#c9973a";
const GOLD_LIGHT = "#f0c86a";
const TEXT = "#f5e6c8";
const MUTED = "rgba(245,230,200,0.65)";
const CARD_BG = "rgba(0,0,0,0.3)";
const CARD_BORDER = "rgba(201,151,58,0.35)";
const GREEN_MID = "#1a6b3a";

export default function Launch() {
  const time = useCountdown();
  const [form, setForm] = useState({ full_name: "", email: "", zip_code: "", family_type: "foster", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  useEffect(() => {
    base44.entities.WaitlistSignup.list("-created_date", 1000).then(list => setCount(list.length)).catch(() => {});
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
      city: form.zip_code.trim(),
      family_type: form.family_type,
      message: form.message.trim(),
    });
    setSubmitted(true);
    setLoading(false);
    setCount(c => (c || 0) + 1);
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(201,151,58,0.3)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      background: `linear-gradient(160deg, #0a3d20 0%, #0d5c2a 40%, #0a3d20 100%)`,
      minHeight: "100vh",
      fontFamily: "var(--font-sans)",
      color: TEXT,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative glow orbs */}
      <div style={{ position: "fixed", top: "10%", right: "-10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,151,58,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "20%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,107,58,0.3) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── TOP NAV ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 20, color: TEXT }}>
            Rooted <span style={{ color: GOLD }}>21</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 4, flexDirection: "column", cursor: "pointer" }}>
          <div style={{ width: 22, height: 2, background: MUTED, borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: MUTED, borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: MUTED, borderRadius: 2 }} />
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{ padding: "20px 20px 28px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>
          Countdown Timer
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "flex-start", marginBottom: 20 }}>
          <CountdownBlock value={time.days} label="Days" />
          <span style={{ color: GOLD, fontSize: 28, fontWeight: 300, marginTop: 14 }}>:</span>
          <CountdownBlock value={time.hours} label="Hrs" />
          <span style={{ color: GOLD, fontSize: 28, fontWeight: 300, marginTop: 14 }}>:</span>
          <CountdownBlock value={time.minutes} label="Mins" />
          <span style={{ color: GOLD, fontSize: 28, fontWeight: 300, marginTop: 14 }}>:</span>
          <CountdownBlock value={time.seconds} label="Ros" />
        </div>

        {count !== null && (
          <div style={{
            display: "inline-block",
            background: "rgba(201,151,58,0.15)",
            border: `1.5px solid ${GOLD}`,
            borderRadius: 50,
            padding: "6px 18px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: GOLD_LIGHT,
            marginBottom: 24,
          }}>
            {count} Families on Waitlist
          </div>
        )}

        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 900,
          fontSize: "clamp(2rem, 8vw, 3rem)",
          lineHeight: 1.05,
          color: TEXT,
          textTransform: "uppercase",
          letterSpacing: "-0.5px",
          marginBottom: 0,
        }}>
          The Future of<br />
          <span style={{ color: GOLD }}>Support</span> is Coming
        </h1>
      </div>

      {/* ── FOUNDER'S NOTE ── */}
      <div style={{ margin: "0 16px 28px", position: "relative", zIndex: 1 }}>
        <div style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 20,
          padding: "20px 18px",
          border: `2px solid ${GOLD}`,
          boxShadow: `0 8px 32px rgba(201,151,58,0.25)`,
          position: "relative",
        }}>
          {/* Gold corner stars */}
          <span style={{ position: "absolute", top: 10, right: 14, fontSize: 16, color: GOLD }}>✦</span>
          <span style={{ position: "absolute", top: 10, left: 14, fontSize: 16, color: GOLD }}>✦</span>

          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 90, height: 90, borderRadius: 16, flexShrink: 0, overflow: "hidden",
              border: `3px solid ${GOLD}`,
              boxShadow: `0 4px 16px rgba(201,151,58,0.3)`,
            }}>
              <img
                src="https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/8a296e40d_generated_image.png"
                alt="Misty"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a4a2e", marginBottom: 6 }}>
                Founder's Note
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.65, color: "#2a2a2a" }}>
                Dear Misty,<br /><br />
                I am sharing expert stories that have been built on news around faithful community. We raise personal support and services as well as with trauma-informed community stories happening.<br /><br />
                We acknowledge and appreciate the note of our app to show themselves as a community and consistent members as a community.
              </p>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 17, color: "#1a4a2e", marginTop: 12 }}>
                Sincerely,<br />
                <span style={{ fontSize: 22, fontStyle: "italic" }}>Misty</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MISSION ── */}
      <div style={{ padding: "0 20px 28px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>
          Mission
        </p>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 900,
          fontSize: "clamp(1.7rem, 7vw, 2.4rem)",
          textTransform: "uppercase",
          lineHeight: 1.08,
          color: TEXT,
          letterSpacing: "-0.5px",
        }}>
          Every Family<br />Deserves Support —<br />Wherever They Are
        </h2>
      </div>

      {/* ── FOUR PILLARS ── */}
      <div style={{ padding: "0 16px 28px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {PILLARS.map((p, i) => (
            <div key={p.title} style={{
              background: i % 2 === 0
                ? "linear-gradient(135deg, rgba(26,74,46,0.8), rgba(10,61,32,0.9))"
                : "linear-gradient(135deg, rgba(201,151,58,0.25), rgba(26,74,46,0.8))",
              border: `1.5px solid ${i % 2 === 0 ? "rgba(255,255,255,0.15)" : CARD_BORDER}`,
              borderRadius: 16,
              padding: "18px 14px",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{p.emoji}</div>
              <p style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", color: i % 2 === 1 ? GOLD_LIGHT : TEXT, marginBottom: 6 }}>{p.title}</p>
              <p style={{ fontSize: 11, lineHeight: 1.5, color: MUTED }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHAT'S INSIDE ── */}
      <div style={{ padding: "0 16px 28px", position: "relative", zIndex: 1 }}>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 800,
          fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
          color: TEXT,
          marginBottom: 18,
          textAlign: "center",
        }}>
          What's Inside the App
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {APP_FEATURES.map(f => (
            <div key={f.label} style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 14,
              padding: "14px 10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 6,
              backdropFilter: "blur(8px)",
            }}>
              <span style={{ fontSize: 22 }}>{f.emoji}</span>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: TEXT, lineHeight: 1.3 }}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── JOIN THE MOVEMENT ── */}
      <div style={{ margin: "0 16px 28px", position: "relative", zIndex: 1 }}>
        <div style={{
          background: "rgba(0,0,0,0.4)",
          border: `1.5px solid ${CARD_BORDER}`,
          borderRadius: 20,
          padding: "24px 18px",
          backdropFilter: "blur(12px)",
        }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 7vw, 2.4rem)",
            color: TEXT,
            marginBottom: 20,
            lineHeight: 1.05,
          }}>
            Join the<br />Movement
          </h2>

          {submitted ? (
            <div style={{
              background: "rgba(26,74,46,0.5)",
              border: `1px solid rgba(45,106,69,0.6)`,
              borderRadius: 14,
              padding: "28px 20px",
              textAlign: "center",
            }}>
              <p style={{ fontSize: 28, marginBottom: 10 }}>🌱</p>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 18, color: TEXT, marginBottom: 8 }}>You're on the list!</p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>We'll email you the moment Rooted 21 opens on June 10. Thank you for believing in this mission.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4 }}>Name</label>
                  <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4 }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4 }}>Your Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us about your family..."
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {error && (
                <p style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#ff9090", marginBottom: 10 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading ? "rgba(201,151,58,0.4)" : `linear-gradient(135deg, ${GOLD}, #a07020)`,
                  border: "none",
                  borderRadius: 10,
                  color: "#1a1a1a",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: loading ? "default" : "pointer",
                  boxShadow: loading ? "none" : `0 4px 20px rgba(201,151,58,0.4)`,
                }}
              >
                {loading ? "Saving your spot..." : "Join the Movement"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── FOOTER BUTTONS ── */}
      <div style={{
        display: "flex",
        gap: 0,
        borderTop: `1px solid rgba(201,151,58,0.3)`,
        position: "relative",
        zIndex: 1,
      }}>
        {[
          { label: "Sign In", action: () => base44.auth.redirectToLogin("/home") },
          { label: "Redeem Code", action: () => setShowCodeModal(true) },
          { label: "Create Codes", href: "/founder-access" },
        ].map((btn, i) => (
          btn.href ? (
            <a key={btn.label} href={btn.href} style={{
              flex: 1,
              padding: "18px 8px",
              background: "rgba(0,0,0,0.35)",
              borderRight: i < 2 ? `1px solid rgba(201,151,58,0.3)` : "none",
              color: TEXT,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}>
              {btn.label}
            </a>
          ) : (
            <button key={btn.label} onClick={btn.action} style={{
              flex: 1,
              padding: "18px 8px",
              background: "rgba(0,0,0,0.35)",
              borderRight: i < 2 ? `1px solid rgba(201,151,58,0.3)` : "none",
              border: "none",
              color: TEXT,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}>
              {btn.label}
            </button>
          )
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: "20px 20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 16, color: TEXT }}>
          Rooted <span style={{ color: GOLD }}>21</span>
        </span>
        <p style={{ fontSize: 10, color: MUTED }}>© {new Date().getFullYear()} Rooted 21</p>
      </div>
      <div style={{ padding: "0 20px 32px", display: "flex", gap: 16, justifyContent: "center", position: "relative", zIndex: 1 }}>
        <a href="/survey" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Give Feedback</a>
        <a href="/legal-policy" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Terms & Privacy</a>
      </div>

      {showCodeModal && (
        <AdminCodeRedemption onClose={() => setShowCodeModal(false)} onSuccess={() => setShowCodeModal(false)} />
      )}
    </div>
  );
}