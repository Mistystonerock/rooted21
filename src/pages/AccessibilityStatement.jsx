import { ChevronDown } from "lucide-react";
import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";

const BG = "#060d08";
const CARD = "#0c1610";
const BORDER = "rgba(74, 222, 128, 0.25)";
const TEXT = "#e5e5e5";
const MUTED = "#a0a0a0";
const GREEN = "#4ade80";

const SECTIONS = [
  {
    id: "wcag",
    title: "WCAG 2.1 Compliance",
    content: `Rooted 21 is designed and tested to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. This means the app is accessible to users with a wide range of disabilities, including visual, auditory, motor, and cognitive impairments.

Key commitments:
✓ Keyboard navigation: Every interactive element can be accessed without a mouse
✓ Screen reader support: Compatible with NVDA, JAWS, and VoiceOver
✓ Color contrast: Text meets minimum contrast ratios for readability
✓ Focus indicators: Clear visual feedback when navigating with keyboard
✓ Semantic HTML: Proper structure for assistive technology interpretation`,
  },
  {
    id: "visual",
    title: "Visual Accessibility",
    content: `Text & Contrast:
✓ All body text is at least 14px (WCAG AA minimum is 12px)
✓ Text-to-background contrast is 4.5:1 or higher for normal text
✓ Important UI elements have 3:1 minimum contrast
✓ No information is conveyed by color alone

Zoom & Scaling:
✓ The app supports browser zoom up to 200%
✓ Mobile font size adjustment available in Settings
✓ Responsive design works across all screen sizes

Images & Icons:
✓ All images have descriptive alt text
✓ Icons are paired with text labels or aria-labels
✓ No decorative images clutter the interface`,
  },
  {
    id: "motor",
    title: "Motor & Input Accessibility",
    content: `Keyboard Navigation:
✓ Tab key navigates through all interactive elements in logical order
✓ Enter/Space activates buttons and toggles
✓ Escape closes modals and dropdowns
✓ No keyboard traps — you can always tab away

Touch & Click Targets:
✓ All buttons are at least 44×44px (WCAG minimum)
✓ Links and form controls are easily tappable on mobile
✓ Voice control compatible (iOS Siri, Android Voice Assistant)
✓ Eye-gaze technology supported through standard browser APIs`,
  },
  {
    id: "auditory",
    title: "Auditory Accessibility",
    content: `Video & Audio:
✓ All video content includes captions or transcripts
✓ Audio-only instructions are accompanied by text alternatives
✓ Sound is never the only way to convey information
✓ Visual indicators accompany audio alerts

Notifications:
✓ App notifications include visual, text, and (optional) audio cues
✓ No autoplaying audio on page load
✓ Users control volume and notification timing`,
  },
  {
    id: "cognitive",
    title: "Cognitive & Neurological Accessibility",
    content: `Clear Language:
✓ Content uses plain English, not medical jargon
✓ Instructions are step-by-step and easy to follow
✓ Navigation is consistent across all pages
✓ No time limits on forms or tasks

Focus & Distraction:
✓ Modal dialogs clearly indicate they're active
✓ Loading states inform users when content is processing
✓ No flashing or flickering content (safe for photosensitive users)
✓ Predictable behavior — no unexpected navigation changes`,
  },
  {
    id: "features",
    title: "Accessibility Features",
    content: `Font Size Adjustment:
✓ Go to Settings > Accessibility to increase font size
✓ Choose from Normal, Large, or Extra Large
✓ Setting is saved across all sessions
✓ Applies to all text in the app

High Contrast Mode:
✓ Available through your device's system settings
✓ App automatically adapts to contrast preferences
✓ Green accent color meets 4.5:1 contrast minimum

Screen Reader Support:
✓ ARIA labels identify all buttons and interactive elements
✓ Form fields have associated labels
✓ Status updates are announced in real time
✓ Complex layouts are properly structured`,
  },
  {
    id: "feedback",
    title: "Report an Accessibility Issue",
    content: `Found something that doesn't work for you? We want to know.

Email: accessibility@rooted21.app
Include:
- Device and browser you're using
- Specific feature that's inaccessible
- What you were trying to do
- What stopped you

We respond within 5 business days and prioritize fixes based on impact and frequency of reports.

No issue is too small. Accessibility is not optional — it's core to Rooted 21's design.`,
  },
];

export default function AccessibilityStatement() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <MobileHeader
        title="Accessibility"
        subtitle="Designed for everyone"
        backTo="/home"
      />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px" }}>
        {/* Intro Card */}
        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 13, lineHeight: 1.65, color: TEXT, margin: 0 }}>
            Rooted 21 is designed for everyone. Whether you use a screen reader,
            keyboard navigation, voice control, or large fonts — this app should
            work for you.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() =>
                  setExpanded(expanded === section.id ? null : section.id)
                }
                style={{
                  width: "100%",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                aria-expanded={expanded === section.id}
                aria-controls={`${section.id}-content`}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>
                  {section.title}
                </h3>
                <ChevronDown
                  size={20}
                  color={TEXT}
                  style={{
                    transition: "transform 0.2s",
                    transform:
                      expanded === section.id ? "rotate(180deg)" : "rotate(0deg)",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
              </button>

              {expanded === section.id && (
                <div
                  id={`${section.id}-content`}
                  style={{
                    borderTop: `1px solid ${BORDER}`,
                    padding: "16px",
                    maxHeight: "60vh",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      lineHeight: 1.75,
                      color: MUTED,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Card */}
        <div
          style={{
            background: "rgba(74, 222, 128, 0.08)",
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: 16,
            marginTop: 20,
            marginBottom: 40,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: GREEN, marginBottom: 8, margin: 0 }}>
            ♿ Questions?
          </p>
          <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            Email: accessibility@rooted21.app
            <br />
            We respond within 5 business days.
          </p>
        </div>
      </div>
    </div>
  );
}