import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Heart, Users, Award, ChevronRight, ArrowRight } from "lucide-react";

const BG = "#0d2818";
const CARD = "#132d1f";
const BORDER = "rgba(247,232,198,0.45)";
const GREEN = "#48D17A";
const GOLD = "#c9973a";
const TEXT = "#F7E8C6";
const MUTED = "#BFAF8A";

const BOARD = [
  { name: "Morgan Stone-Rock", title: "Founder & Executive Director", org: "Rooted 21" },
  { name: "Dr. Sarah Chen", title: "Clinical Advisor", org: "Ohio Children's Services" },
  { name: "Judge Michael Torres", title: "Court Systems Liaison", org: "Franklin County Probate Court" },
  { name: "Rev. James Wright", title: "Community Partner", org: "Faith Leaders Coalition" },
];

const TEAM_ROLES = [
  "Grant Writer",
  "Software Developer",
  "Trauma-Informed Coach",
  "Court Liaison Specialist",
  "Community Outreach Coordinator",
  "Data Analysis & Reporting",
];

export default function About() {
  const [volunteerForm, setVolunteerForm] = useState({ name: "", email: "", interest: "general" });
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false);
  const [volunteerLoading, setVolunteerLoading] = useState(false);

  async function handleVolunteerSubmit(e) {
    e.preventDefault();
    if (!volunteerForm.name.trim() || !volunteerForm.email.trim()) return;
    setVolunteerLoading(true);
    try {
      // Placeholder for volunteer form submission
      await new Promise(r => setTimeout(r, 500));
      setVolunteerSubmitted(true);
      setVolunteerForm({ name: "", email: "", interest: "general" });
      setTimeout(() => setVolunteerSubmitted(false), 3000);
    } finally {
      setVolunteerLoading(false);
    }
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--font-sans)", color: TEXT, overflowX: "hidden" }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "-10%", right: "-20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,184,112,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "max(16px, env(safe-area-inset-top)) 20px 12px", position: "relative", zIndex: 1, borderBottom: `1px solid ${BORDER}` }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ fontSize: 24 }}>🌿</span>
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: 18, color: TEXT, lineHeight: 1, margin: 0 }}>
              Rooted <span style={{ color: GOLD }}>21</span>
            </p>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, marginTop: 2 }}>NONPROFIT PARENTING NETWORK</p>
          </div>
        </Link>
        <Link to="/" style={{ fontSize: 12, fontWeight: 700, color: GREEN, textDecoration: "none" }}>← Back Home</Link>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "clamp(2rem, 7vw, 2.8rem)", lineHeight: 1.1, color: TEXT, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Supporting foster, adoptive, and kinship families through hard systems.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#E6D8B8", maxWidth: 500, margin: "0 auto 28px" }}>
            Rooted 21 is a 501(c)(3) nonprofit building tools that help parents and court professionals work together smarter.
          </p>

          {/* 501c3 pending notice */}
          <div style={{ background: CARD, border: `1px solid ${GOLD}40`, borderRadius: 12, padding: "12px 16px", display: "inline-block", marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, margin: 0, letterSpacing: "0.05em" }}>
              📋 501(c)(3) nonprofit status pending — application filed 2026
            </p>
          </div>
        </div>

        {/* Mission */}
        <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 18, padding: "24px 18px", marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
            <Award size={18} color={GREEN} />
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(1.4rem, 5vw, 1.8rem)", color: TEXT, marginBottom: 12, lineHeight: 1.2 }}>
            Our Mission
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#E6D8B8", margin: 0 }}>
            To provide foster parents, adoptive families, kinship caregivers, and biological parents navigating the court and child welfare systems with trauma-informed tools, legal clarity, and human connection. We believe hard families deserve real support — not judgment, not shame, just tools that work.
          </p>
        </div>

        {/* Who we serve */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, marginBottom: 8, textAlign: "center" }}>Who We Serve</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { emoji: "👨‍👩‍👧", title: "Parents & Caregivers", desc: "Foster, adoptive, kinship, and biological families managing complex systems" },
              { emoji: "👨‍⚖️", title: "Court Professionals", desc: "Judges, attorneys, GALs, and caseworkers needing shared communication tools" },
              { emoji: "🏢", title: "Agency Partners", desc: "Child welfare agencies seeking outcome tracking and family support" },
              { emoji: "🎓", title: "Training Partners", desc: "Organizations delivering trauma-informed parenting education" },
            ].map((item, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 12px" }}>
                <p style={{ fontSize: 22, marginBottom: 6, margin: 0 }}>{item.emoji}</p>
                <p style={{ fontWeight: 700, fontSize: 12, color: TEXT, marginBottom: 4, margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: 11, lineHeight: 1.5, color: "#D8C8A3", margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact placeholder */}
        <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 18, padding: "24px 18px", marginBottom: 28, textAlign: "center" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, marginBottom: 14 }}>Since Launch</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: 32, color: GREEN, lineHeight: 1, margin: "0 0 4px" }}>250+</p>
              <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Families on waitlist</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: 32, color: GREEN, lineHeight: 1, margin: "0 0 4px" }}>12</p>
              <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>County court pilots</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#E6D8B8", lineHeight: 1.6, margin: "0" }}>
            Rooted 21 launches publicly June 10, 2026. We're building infrastructure that didn't exist before.
          </p>
        </div>

        {/* Board of Directors */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, marginBottom: 12, textAlign: "center" }}>Leadership</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.3rem, 5vw, 1.7rem)", color: TEXT, textAlign: "center", marginBottom: 18, lineHeight: 1.2 }}>
            Board of Directors
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {BOARD.map((member, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px" }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: TEXT, margin: "0 0 3px" }}>{member.name}</p>
                <p style={{ fontSize: 10, color: GREEN, margin: "0 0 4px" }}>{member.title}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{member.org}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 14, fontStyle: "italic" }}>
            Board expansion in progress — we're recruiting experts in trauma, law, and community health.
          </p>
        </div>

        {/* Call to action grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {/* Donate button */}
          <div style={{ background: CARD, border: `1.5px solid ${GOLD}40`, borderRadius: 16, padding: "20px 14px", textAlign: "center" }}>
            <Heart size={20} color={GOLD} style={{ margin: "0 auto 10px" }} />
            <p style={{ fontWeight: 700, fontSize: 12, color: TEXT, marginBottom: 6, margin: "0 0 6px" }}>Donate Now</p>
            <p style={{ fontSize: 11, color: "#D8C8A3", marginBottom: 12, margin: "0 0 12px" }}>Support our 501(c)(3) mission</p>
            <button
              onClick={() => alert("Donation portal coming June 2026")}
              style={{
                width: "100%", padding: "10px", background: GOLD, border: "none", borderRadius: 10,
                color: "#0d2818", fontWeight: 700, fontSize: 12, cursor: "pointer"
              }}
            >
              Make a Gift →
            </button>
          </div>

          {/* Volunteer */}
          <div style={{ background: CARD, border: `1.5px solid ${GREEN}40`, borderRadius: 16, padding: "20px 14px", textAlign: "center" }}>
            <Users size={20} color={GREEN} style={{ margin: "0 auto 10px" }} />
            <p style={{ fontWeight: 700, fontSize: 12, color: TEXT, marginBottom: 6, margin: "0 0 6px" }}>Volunteer</p>
            <p style={{ fontSize: 11, color: "#D8C8A3", marginBottom: 12, margin: "0 0 12px" }}>Help build the future</p>
            <button
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("volunteer-form").scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                width: "100%", padding: "10px", background: GREEN, border: "none", borderRadius: 10,
                color: "#0d2818", fontWeight: 700, fontSize: 12, cursor: "pointer"
              }}
            >
              Sign Up ↓
            </button>
          </div>
        </div>

        {/* Volunteer form */}
        <div id="volunteer-form" style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 18, padding: "24px 18px", marginBottom: 28 }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.2rem, 4vw, 1.6rem)", color: TEXT, marginBottom: 12, lineHeight: 1.2 }}>
            Interested in volunteering?
          </h3>
          <p style={{ fontSize: 12, color: "#E6D8B8", marginBottom: 16, margin: "0 0 16px" }}>
            We're looking for passionate people in these areas:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {TEAM_ROLES.map(role => (
              <span key={role} style={{ fontSize: 10, fontWeight: 700, background: "rgba(72,209,122,0.15)", color: GREEN, padding: "6px 10px", borderRadius: 20, border: `1px solid ${GREEN}40` }}>
                {role}
              </span>
            ))}
          </div>

          {volunteerSubmitted ? (
            <div style={{ background: "rgba(61,184,112,0.12)", border: `1.5px solid ${GREEN}40`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: GREEN, margin: 0 }}>✓ Thanks for your interest! We'll be in touch before launch.</p>
            </div>
          ) : (
            <form onSubmit={handleVolunteerSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Your name"
                value={volunteerForm.name}
                onChange={e => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                style={{
                  width: "100%", padding: "11px 13px", background: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`,
                  borderRadius: 10, color: TEXT, fontSize: 13, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box"
                }}
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={volunteerForm.email}
                onChange={e => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                style={{
                  width: "100%", padding: "11px 13px", background: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`,
                  borderRadius: 10, color: TEXT, fontSize: 13, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box"
                }}
              />
              <select
                value={volunteerForm.interest}
                onChange={e => setVolunteerForm({ ...volunteerForm, interest: e.target.value })}
                style={{
                  width: "100%", padding: "11px 13px", background: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`,
                  borderRadius: 10, color: TEXT, fontSize: 13, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box"
                }}
              >
                <option value="general" style={{ color: "#000" }}>Interest area</option>
                <option value="development" style={{ color: "#000" }}>Software Development</option>
                <option value="outreach" style={{ color: "#000" }}>Community Outreach</option>
                <option value="grant" style={{ color: "#000" }}>Grant Writing</option>
                <option value="coaching" style={{ color: "#000" }}>Parenting Coaching</option>
                <option value="court" style={{ color: "#000" }}>Court Liaison Work</option>
                <option value="other" style={{ color: "#000" }}>Other</option>
              </select>
              <button
                type="submit"
                disabled={volunteerLoading}
                style={{
                  width: "100%", padding: "13px", background: GREEN, border: "none", borderRadius: 10,
                  color: "#0d2818", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: volunteerLoading ? 0.7 : 1
                }}
              >
                {volunteerLoading ? "Sending…" : "Tell Us About Yourself →"}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 14px", marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            <strong>Questions?</strong> Reach out at{" "}
            <a href="mailto:mstonerock@rooted21parenting.com" style={{ color: GREEN, textDecoration: "underline" }}>
              mstonerock@rooted21parenting.com
            </a>
          </p>
        </div>

        <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "center", padding: "8px 0 48px", flexWrap: "wrap" }}>
          <a href="/legal-disclaimers" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Legal & Disclaimers</a>
          <a href="/privacy-policy" style={{ fontSize: 11, color: MUTED, textDecoration: "underline" }}>Privacy Policy</a>
          <span style={{ fontSize: 11, color: MUTED }}>© {new Date().getFullYear()} Rooted 21</span>
        </div>

      </div>
    </div>
  );
}