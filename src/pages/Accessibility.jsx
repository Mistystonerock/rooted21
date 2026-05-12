import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BG = "#060d08";
const CARD = "#0c1610";
const BORDER = "rgba(74, 222, 128, 0.25)";
const TEXT = "#e5e5e5";
const MUTED = "#a0a0a0";
const GREEN = "#4ade80";

export default function Accessibility() {
  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a3d20 0%, #0d5c2a 100%)", borderBottom: `1px solid ${BORDER}`, padding: "16px" }}>
        <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 10, color: GREEN, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
          <ChevronLeft size={18} /> Back
        </Link>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
          Accessibility Statement
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: MUTED, marginBottom: 24 }}>
          Rooted 21 is committed to ensuring digital accessibility for all users, including those with disabilities.
        </p>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            ♿ Accessible Features
          </h2>
          <ul style={{ fontSize: 13, lineHeight: 1.8, color: MUTED, marginLeft: 20 }}>
            <li>Mobile-first responsive design (all screen sizes)</li>
            <li>ARIA labels and semantic HTML on all interactive elements</li>
            <li>Full keyboard navigation (no mouse required)</li>
            <li>High-contrast text on dark backgrounds</li>
            <li>Screen reader compatibility (NVDA, JAWS, VoiceOver)</li>
            <li>Alternative text for all images and icons</li>
            <li>Captions for video content</li>
            <li>Adjustable font sizes (browser zoom + in-app control)</li>
            <li>Skip-to-content link on every page</li>
          </ul>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            🔍 Standards Compliance
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: MUTED, marginBottom: 12 }}>
            Rooted 21 conforms to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standard, ensuring our app is usable by everyone.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: MUTED }}>
            We conduct quarterly accessibility audits and update based on user feedback.
          </p>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            🛠️ Assistive Technology Support
          </h2>
          <ul style={{ fontSize: 13, lineHeight: 1.8, color: MUTED, marginLeft: 20 }}>
            <li>Screen readers: NVDA, JAWS, VoiceOver</li>
            <li>Voice control: iOS Siri, Android Voice Assistant</li>
            <li>High-contrast modes and dark theme</li>
            <li>Text-to-speech browser extensions</li>
            <li>Captions and transcripts for media</li>
          </ul>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            🐛 Report an Issue
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: MUTED, marginBottom: 12 }}>
            Found an accessibility issue? We want to know so we can fix it.
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>
            Email: accessibility@rooted21.app
          </p>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>
            Include: Device, browser, specific feature, and impact on your use. We respond within 5 business days.
          </p>
        </div>

        <div style={{ background: "rgba(74, 222, 128, 0.08)", border: `1px solid ${GREEN}40`, borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 12, lineHeight: 1.7, color: MUTED, margin: 0 }}>
            Accessibility is not optional—it's a core principle of Rooted 21. We are committed to continuous improvement and welcome your feedback.
          </p>
        </div>
      </div>
    </div>
  );
}