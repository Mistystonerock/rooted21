import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminCodeRedemption from "@/components/rooted/AdminCodeRedemption";
import FeatureShowcase from "@/components/launch/FeatureShowcase";
import FoundersNote from "@/components/launch/FoundersNote";
import DonationPanel from "@/components/launch/DonationPanel";
import QuickPageSearch from "@/components/launch/QuickPageSearch";
import { Sparkles, ChevronRight } from "lucide-react";

const LAUNCH_DATE = new Date("2026-07-10T09:00:00-04:00");

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

const BG = "#faf6f1";
const CARD = "#ffffff";
const CARD2 = "#f5ede2";
const BORDER = "rgba(120,85,60,0.2)";
const GREEN = "#6b9d6e";
const GOLD = "#a67c52";
const TEXT = "#5a3d28";
const MUTED = "#8b6f54";

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
  const [form, setForm] = useState({ full_name: "", email: "", family_type: "foster", message: "", beta_code: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeTruth, setActiveTruth] = useState(0);
  const [deletedMessage, setDeletedMessage] = useState("");

  useEffect(() => {
    const message = localStorage.getItem("account_deleted_message");
    if (message) {
      setDeletedMessage(message);
      localStorage.removeItem("account_deleted_message");
    }
    base44.entities.WaitlistSignup.list("-created_date", 1000).then(list => setCount(list.length)).catch(() => {});
    const t = setInterval(() => setActiveTruth(n => (n + 1) % TRUTHS.length), 4000);
    return () => clearInterval(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) { setError("Please enter your name and email."); return; }
    setLoading(true); setError("");

    const betaCode = form.beta_code.trim().toUpperCase();
    if (betaCode) {
      try {
        await base44.functions.invoke("validateBetaTesterCode", { code: betaCode });
        localStorage.setItem("pending_beta_code", betaCode);
        base44.auth.redirectToLogin("/home");
        return;
      } catch {
        setError("This code is not valid. Please contact Misty at rooted21parenting.com for access.");
        setLoading(false);
        return;
      }
    }

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
    <div id="top" style={{ background: BG, minHeight: "100vh", fontFamily: "var(--font-sans)", color: TEXT, overflowX: "hidden" }}>

      {/* Ambient glows - root/growth aesthetic */}
      <div style={{ position: "fixed", top: "-10%", right: "-20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,157,110,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "10%", left: "-20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(166,124,82,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <QuickPageSearch />

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
          style={{ background: CARD, border: `1.5px solid ${GREEN}`, borderRadius: 10, color: GREEN, fontWeight: 700, fontSize: 13, padding: "9px 18px", cursor: "pointer" }}
        >
          Sign In
        </button>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 1 }}>
        {deletedMessage && (
          <div style={{ background: "#EAF4EA", border: `1.5px solid ${GREEN}40`, color: TEXT, borderRadius: 14, padding: "12px 14px", margin: "8px 0 14px", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
            {deletedMessage}
          </div>
        )}

        {/* ── HERO ── */}
        <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
          {/* Rotating affirmation pill */}
          <div style={{ background: CARD, border: `1px solid ${GREEN}30`, borderRadius: 50, padding: "7px 18px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 22, minHeight: 34 }}>
            <p style={{ fontSize: 12, color: "#48D17A", fontStyle: "italic", margin: 0 }}>"{TRUTHS[activeTruth]}"</p>
          </div>

          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "clamp(1.9rem, 8vw, 2.6rem)", lineHeight: 1.1, color: TEXT, marginBottom: 14, letterSpacing: "-0.5px" }}>
            You don't have to figure<br />this out alone.
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 340, margin: "0 auto 24px", fontWeight: 400 }}>
            Rooted 21 is a calm, private place for foster, adoptive, kinship, and biological parents navigating hard systems.
          </p>

          {/* Countdown */}
          <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 14, padding: "14px 20px", display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 900, fontSize: 34, color: GREEN, lineHeight: 1, margin: 0 }}>{time.days}</p>
              <p style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>days</p>
            </div>
            <div style={{ width: 1, height: 40, background: BORDER }} />
            <div style={{ textAlign: "left" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: TEXT, margin: 0 }}>Opening July 10, 2026</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Join the waitlist — we'll let you know first</p>
            </div>
          </div>

          {count !== null && count > 0 && (
           <p style={{ fontSize: 12, color: TEXT, marginTop: 8 }}>🌱 {count} families already on the list</p>
          )}
        </div>

        {/* ── FOUNDER'S NOTE ── */}
        <div id="founders-note" style={{ scrollMarginTop: 90 }}>
          <FoundersNote />
        </div>

        {/* ── DONATIONS ── */}
        <div id="donations" style={{ scrollMarginTop: 90 }}>
          <DonationPanel />
        </div>

        {/* ── APP TOUR ── */}
        <div id="app-tour" style={{ marginBottom: 28, scrollMarginTop: 90 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, marginBottom: 6, textAlign: "center" }}>See it in action</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.3rem, 5vw, 1.7rem)", color: TEXT, textAlign: "center", marginBottom: 18, lineHeight: 1.25 }}>
            Everything inside Rooted 21
          </h2>
          <FeatureShowcase />
        </div>

        {/* ── WHAT WE HELP WITH ── */}
        <div id="what-we-help" style={{ marginBottom: 28, scrollMarginTop: 90 }}>
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
        <div id="waitlist" style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: "24px 18px", marginBottom: 28, scrollMarginTop: 90 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(1.4rem, 6vw, 1.8rem)", color: TEXT, marginBottom: 6, lineHeight: 1.15 }}>Save your spot</h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.65 }}>
            We'll email you when we open. No spam. Just a heads up that your support is ready.
          </p>

          {submitted ? (
            <div style={{ background: `rgba(107,157,110,0.08)`, border: `1.5px solid ${GREEN}30`, borderRadius: 14, padding: "28px 20px", textAlign: "center" }}>
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
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>Have a Beta Access Code? Enter it here for full program access.</label>
                <input type="text" value={form.beta_code} onChange={e => setForm(f => ({ ...f, beta_code: e.target.value.toUpperCase() }))} placeholder="Optional beta code" maxLength={8} style={{ ...inp, textTransform: "uppercase", letterSpacing: "0.08em" }} />
              </div>

              {error && <p style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#c85a3a" }}>{error}</p>}

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", background: loading ? `${GREEN}50` : GREEN, border: "none", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading ? "default" : "pointer", boxShadow: loading ? "none" : `0 4px 20px ${GREEN}30`, fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? "Saving your spot…" : (<><Sparkles size={15} /> Yes, notify me when we open</>)}
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: MUTED, marginTop: 2 }}>No spam. No selling your info. Ever.</p>
            </form>
          )}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div id="footer-actions" style={{ background: CARD, borderRadius: 16, overflow: "hidden", marginBottom: 16, border: `1px solid ${BORDER}`, scrollMarginTop: 90 }}>
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
          <a href="/survey" style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>Give Feedback</a>
          <a href="/legal-disclaimers" style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>Legal & Disclaimers</a>
          <span style={{ fontSize: 11, color: MUTED }}>Rooted 21 Parenting Network LLC — Chillicothe, Ross County, Ohio — A mission-driven company dedicated to serving families at low or no cost</span>
        </div>

      </div>

      {showCodeModal && <AdminCodeRedemption onClose={() => setShowCodeModal(false)} onSuccess={() => setShowCodeModal(false)} />}
    </div>
  );
}