import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminCodeRedemption from "@/components/rooted/AdminCodeRedemption";
import TreeLogo from "@/components/rooted/TreeLogo";

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
    <div className="flex flex-col items-center">
      <div style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
        borderRadius: 12,
        width: 64,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 26,
        fontWeight: 800,
        color: "#fff",
        fontFamily: "var(--font-sans)",
        letterSpacing: "-1px",
      }}>
        {String(value).padStart(2, "0")}
      </div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginTop: 6, textTransform: "uppercase" }}>
        {label}
      </p>
    </div>
  );
}

const PILLARS = [
  { emoji: "🧠", title: "Trauma-Informed", desc: "Trauma-informed tools grounded in attachment science and real-world parenting." },
  { emoji: "💙", title: "Foster/Adoptive", desc: "Built for foster, adoptive, kinship, and biological families navigating hard days." },
  { emoji: "🤝", title: "Community", desc: "Community connection and safe space for caregivers without judgment." },
  { emoji: "💰", title: "Affordable", desc: "Affordable resources and support accessible to every family." },
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

const BG = "#0a0a0a";
const CARD_BG = "rgba(255,255,255,0.05)";
const CARD_BORDER = "rgba(255,255,255,0.1)";
const GREEN = "#1a4a2e";
const GREEN_BRIGHT = "#2d6a45";
const GREEN_GLOW = "rgba(45,106,69,0.35)";
const GOLD = "#c9973a";
const TEXT = "#f0ece4";
const MUTED = "rgba(240,236,228,0.5)";

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
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--font-sans)", color: TEXT }}>

      {/* ── TOP NAV ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TreeLogo size={28} />
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 18, color: TEXT }}>
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
      <div style={{ padding: "40px 20px 32px", textAlign: "center", position: "relative" }}>
        {/* Glow blob */}
        <div style={{
          position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,74,46,0.4) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {count !== null && (
          <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, position: "relative", zIndex: 1 }}>
            {count} Families on Waitlist
          </p>
        )}

        {/* Countdown */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "flex-start", marginBottom: 36, position: "relative", zIndex: 1 }}>
          <CountdownBlock value={time.days} label="Days" />
          <span style={{ color: MUTED, fontSize: 24, fontWeight: 300, marginTop: 16 }}>:</span>
          <CountdownBlock value={time.hours} label="Hours" />
          <span style={{ color: MUTED, fontSize: 24, fontWeight: 300, marginTop: 16 }}>:</span>
          <CountdownBlock value={time.minutes} label="Min" />
          <span style={{ color: MUTED, fontSize: 24, fontWeight: 300, marginTop: 16 }}>:</span>
          <CountdownBlock value={time.seconds} label="Sec" />
        </div>

        {/* Big headline */}
        <h1 style={{
          fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(2.4rem, 9vw, 3.5rem)",
          lineHeight: 1.05, color: "#fff", textTransform: "uppercase", letterSpacing: "-1px",
          marginBottom: 8, position: "relative", zIndex: 1,
        }}>
          The Future of<br />
          <span style={{ color: "#fff" }}>Support</span>
        </h1>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.1rem, 4vw, 1.4rem)", color: MUTED, fontStyle: "italic", position: "relative", zIndex: 1 }}>
          is coming
        </p>
      </div>

      {/* ── FOUNDER'S NOTE ── */}
      <div style={{ margin: "0 16px 28px", borderRadius: 16, overflow: "hidden", border: `1px solid ${CARD_BORDER}`, background: CARD_BG, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", gap: 14, padding: "18px 18px 14px" }}>
          {/* Avatar placeholder */}
          <div style={{
            width: 80, height: 80, borderRadius: 12, flexShrink: 0, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>
            <img src="https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/6dea8f834_generated_image.png" alt="Misty" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD, marginBottom: 4 }}>
              Founder's Note
            </p>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(240,236,228,0.75)" }}>
              Dear community,<br /><br />
              Our journey begins to enter community and explore every one bold trauma-informed path of healing and support to help one another. We coordinate our community and create with teams and connections that compassion matters wherever they are.<br /><br />
              We are the bonds that hold communities and connections and our world together and help parents preserve healthy futures.
            </p>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 15, color: TEXT, marginTop: 10 }}>
              Sincerely,<br />Misty
            </p>
          </div>
        </div>
      </div>

      {/* ── MISSION STATEMENT ── */}
      <div style={{
        margin: "0 16px 28px", borderRadius: 16, padding: "28px 22px",
        background: `radial-gradient(ellipse at center, rgba(26,74,46,0.5) 0%, rgba(10,10,10,0.8) 70%)`,
        border: `1px solid rgba(45,106,69,0.3)`,
        textAlign: "center",
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GREEN_BRIGHT, marginBottom: 14 }}>
          Mission
        </p>
        <h2 style={{
          fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.5rem, 6vw, 2.2rem)",
          textTransform: "uppercase", lineHeight: 1.1, color: "#fff", letterSpacing: "-0.5px",
        }}>
          Every Family<br />Deserves Support —<br />Wherever They Are.
        </h2>
      </div>

      {/* ── FOUR PILLARS ── */}
      <div style={{ padding: "0 16px 28px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, marginBottom: 8, textAlign: "center" }}>
          Four Pillars
        </p>
        <h2 style={{
          fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.6rem, 7vw, 2rem)",
          textTransform: "uppercase", color: "#fff", textAlign: "center", marginBottom: 18,
        }}>
          Our Foundation
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {PILLARS.map(p => (
            <div key={p.title} style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 14,
              padding: "16px 14px",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{p.emoji}</div>
              <p style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: TEXT, marginBottom: 6 }}>{p.title}</p>
              <p style={{ fontSize: 11, lineHeight: 1.5, color: MUTED }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHAT'S INSIDE ── */}
      <div style={{ padding: "0 16px 28px" }}>
        <h2 style={{
          fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.3rem, 5vw, 1.7rem)",
          textTransform: "uppercase", color: "#fff", marginBottom: 16,
        }}>
          What's Inside the App
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {APP_FEATURES.map(f => (
            <div key={f.label} style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 12,
              padding: "14px 12px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              backdropFilter: "blur(8px)",
            }}>
              <span style={{ fontSize: 18 }}>{f.emoji}</span>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: TEXT, lineHeight: 1.3 }}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WAITLIST FORM ── */}
      <div style={{ padding: "0 16px 28px" }}>
        <h2 style={{
          fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.6rem, 7vw, 2.2rem)",
          textTransform: "uppercase", color: "#fff", marginBottom: 20,
        }}>
          Join the Movement
        </h2>

        {submitted ? (
          <div style={{
            background: `rgba(26,74,46,0.3)`, border: `1px solid rgba(45,106,69,0.5)`,
            borderRadius: 16, padding: "32px 20px", textAlign: "center",
          }}>
            <p style={{ fontSize: 28, marginBottom: 12 }}>🌱</p>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>You're on the list!</p>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>We'll email you the moment Rooted 21 opens on June 10. Thank you for believing in this mission.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
            borderRadius: 16, padding: "20px 16px", backdropFilter: "blur(12px)",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: 6 }}>Name</label>
                <input
                  type="text" value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Full name" style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: 6 }}>Email</label>
                <input
                  type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@email.com" style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: 6 }}>Zip Code</label>
                <input
                  type="text" inputMode="numeric" maxLength={5} value={form.zip_code}
                  onChange={e => setForm(f => ({ ...f, zip_code: e.target.value.replace(/\D/g, "") }))}
                  placeholder="e.g. 44107" style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: 6 }}>Family Type</label>
                <select value={form.family_type} onChange={e => setForm(f => ({ ...f, family_type: e.target.value }))} style={{ ...inputStyle, appearance: "none" }}>
                  {FAMILY_TYPES.map(t => <option key={t.value} value={t.value} style={{ background: "#1a1a1a" }}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: 6 }}>Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Tell us about your family..."
                rows={3}
                style={{ ...inputStyle, resize: "none" }}
              />
            </div>

            {error && (
              <p style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#ff7b7b", marginBottom: 12 }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(45,106,69,0.5)" : `linear-gradient(135deg, ${GREEN_BRIGHT}, #1a4a2e)`,
                border: `1px solid rgba(45,106,69,0.6)`,
                borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 13,
                letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: loading ? "default" : "pointer",
                boxShadow: loading ? "none" : `0 0 20px ${GREEN_GLOW}`,
              }}
            >
              {loading ? "Saving your spot..." : "Submit"}
            </button>
          </form>
        )}
      </div>

      {/* ── FOOTER ACTIONS ── */}
      <div style={{ padding: "0 16px 16px", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { label: "Sign In", action: () => base44.auth.redirectToLogin("/home") },
          { label: "Redeem Code", action: () => setShowCodeModal(true) },
          { label: "Create Codes", href: "/founder-access" },
        ].map(btn => (
          btn.href ? (
            <a key={btn.label} href={btn.href} style={{
              padding: "10px 20px", borderRadius: 50, fontSize: 12, fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.2)", color: TEXT, textDecoration: "none",
              background: "rgba(255,255,255,0.06)", letterSpacing: "0.05em",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              {btn.label}
            </a>
          ) : (
            <button key={btn.label} onClick={btn.action} style={{
              padding: "10px 20px", borderRadius: 50, fontSize: 12, fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.2)", color: TEXT, cursor: "pointer",
              background: "rgba(255,255,255,0.06)", letterSpacing: "0.05em",
            }}>
              {btn.label}
            </button>
          )
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: "24px 20px 40px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 16, color: TEXT }}>
          Rooted <span style={{ color: GOLD }}>21</span>
        </span>
        <p style={{ fontSize: 10, color: MUTED }}>© {new Date().getFullYear()} Rooted 21. All rights reserved.</p>
      </div>

      {/* Links */}
      <div style={{ padding: "0 20px 32px", display: "flex", gap: 12, justifyContent: "center" }}>
        <a href="/survey" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Give Feedback</a>
        <a href="/legal-policy" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Terms & Privacy</a>
      </div>

      {showCodeModal && (
        <AdminCodeRedemption onClose={() => setShowCodeModal(false)} onSuccess={() => setShowCodeModal(false)} />
      )}
    </div>
  );
}