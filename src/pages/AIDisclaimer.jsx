import MobileHeader from "@/components/mobile/MobileHeader";

const BG = "#0d2818";
const CARD = "#132d1f";
const BORDER = "rgba(247,232,198,0.45)";
const TEXT = "#F7E8C6";
const MUTED = "#E6D8B8";

export default function AIDisclaimer() {
  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <MobileHeader title="AI Disclaimer" subtitle="What our AI can and cannot do" backTo="/" />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px" }}>
        {/* Overview */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED }}>
            Rooted 21 uses AI to provide educational guidance, pattern analysis, and resource suggestions. AI is a tool to assist, not replace, professional judgment.
          </p>
        </div>

        {/* What AI Can Do */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            What Rooted 21 AI CAN Do
          </h2>
          <div style={{ space: 2 }}>
            {[
              "Suggest educational strategies based on your logged patterns",
              "Identify behavioral triggers (e.g., 'Most meltdowns happen after school')",
              "Recommend resources based on your location and needs",
              "Generate talking points for conversations with professionals",
              "Help you prepare for meetings or court dates",
              "Analyze trends in your behavioral logs",
              "Suggest calming or regulation strategies",
              "Connect you to peer support and education",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ color: "#48D17A", fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 12, color: MUTED }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What AI CANNOT Do */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            What Rooted 21 AI CANNOT Do
          </h2>
          <div style={{ space: 2 }}>
            {[
              "Provide therapy or psychiatric treatment",
              "Diagnose mental health or developmental disorders",
              "Prescribe medications or medical advice",
              "Make legal recommendations or provide legal advice",
              "Predict your child's future behavior with certainty",
              "Replace professional clinical judgment",
              "Monitor your child in real-time",
              "Detect abuse or neglect (that's a professional responsibility)",
              "Guarantee any specific outcomes",
              "Make decisions for your family",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ color: "#FF6B5A", fontWeight: 700 }}>✗</span>
                <span style={{ fontSize: 12, color: MUTED }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How AI Works */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            How Rooted 21 AI Works
          </h2>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.75 }}>
            <p style={{ marginBottom: 12 }}>
              Rooted 21 AI analyzes patterns based on:
            </p>
            <ul style={{ margin: "0 0 12px 16px", paddingLeft: 0 }}>
              <li>Your logged behavioral observations</li>
              <li>Medication administration records</li>
              <li>Daily mood and regulation check-ins</li>
              <li>Lesson completion and progress</li>
              <li>Educational content you've engaged with</li>
            </ul>

            <p style={{ marginBottom: 12 }}>
              AI limitations:
            </p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>Only sees data YOU provide (may be incomplete)</li>
              <li>Lacks awareness of recent life events or medication changes</li>
              <li>Cannot account for individual circumstances</li>
              <li>May identify false patterns in small data sets</li>
              <li>Gets better with more data (but still not clinical)</li>
            </ul>
          </div>
        </div>

        {/* Accuracy & Errors */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            AI Accuracy & Errors
          </h2>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.75 }}>
            <p>
              Rooted 21 AI is <strong style={{ color: TEXT }}>NOT 100% accurate.</strong> It may:
            </p>
            <ul style={{ margin: "12px 0", paddingLeft: 16 }}>
              <li>Suggest strategies you've already tried</li>
              <li>Miss important context or nuance</li>
              <li>Generate false positives ("This might be ADHD" when it's not)</li>
              <li>Fail to catch warning signs</li>
              <li>Recommend resources that don't match your needs</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              <strong style={{ color: TEXT }}>Always verify AI suggestions with a professional</strong> before implementing them with your child.
            </p>
          </div>
        </div>

        {/* Data Privacy & Training */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            AI Training & Your Data
          </h2>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.75 }}>
            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: TEXT }}>Your data is NOT automatically used to train AI.</strong>
            </p>
            <p style={{ marginBottom: 12 }}>
              We only use your data for AI training if:
            </p>
            <ul style={{ margin: "0 0 12px 16px", paddingLeft: 0 }}>
              <li>You explicitly opt in during onboarding</li>
              <li>Your data is de-identified (names removed)</li>
              <li>You can opt out anytime in Settings</li>
            </ul>

            <p>
              <strong style={{ color: TEXT }}>If you opt out:</strong> AI insights may be less personalized, but all core features work normally.
            </p>
          </div>
        </div>

        {/* Professional Consultation */}
        <div style={{ background: "rgba(61,184,112,0.08)", border: "1px solid rgba(61,184,112,0.2)", borderRadius: 14, padding: 16, marginBottom: 40 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#48D17A", marginBottom: 12 }}>
            Always Consult a Professional
          </h2>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.75 }}>
            <p>
              Before implementing ANY strategy suggested by Rooted 21 AI:
            </p>
            <ul style={{ margin: "12px 0", paddingLeft: 16 }}>
              <li>Talk to your child's therapist or psychiatrist</li>
              <li>Discuss with your caseworker or court-appointed professional</li>
              <li>Verify it aligns with your child's specific needs</li>
              <li>Check for conflicts with other treatments</li>
              <li>Don't override professional guidance</li>
            </ul>
            <p style={{ marginTop: 12, fontWeight: 600, color: TEXT }}>
              AI is a tool. Professional judgment is the foundation.
            </p>
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}