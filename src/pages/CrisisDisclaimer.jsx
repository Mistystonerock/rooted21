import MobileHeader from "@/components/mobile/MobileHeader";

const BG = "#0d2818";
const CARD = "#132d1f";
const BORDER = "rgba(247,232,198,0.45)";
const TEXT = "#F7E8C6";
const MUTED = "#E6D8B8";
const RED = "#FF6B5A";

export default function CrisisDisclaimer() {
  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <MobileHeader title="Crisis Disclaimer" subtitle="When to seek immediate help" backTo="/" />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px" }}>
        {/* Critical Warning */}
        <div style={{ background: "rgba(192,57,43,0.15)", border: "2px solid #c0392b", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 900, color: RED, margin: 0 }}>
            ⚠️ CRISIS DISCLAIMER
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: RED, marginTop: 10, fontWeight: 600 }}>
            Rooted 21 is NOT an emergency service. If your child or anyone is in immediate danger, call 911 right now.
          </p>
        </div>

        {/* Emergency Numbers */}
        <div style={{ background: CARD, border: `1.5px solid #c0392b`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 12 }}>IMMEDIATE CRISIS — CALL NOW:</p>
          <div style={{ space: 2 }}>
            {[
              { num: "911", desc: "Immediate danger, violence, weapons, severe injury" },
              { num: "988", desc: "Suicide or mental health crisis (call or text)" },
              { num: "1-855-OH-CHILD", desc: "Child abuse or neglect suspected" },
              { num: "Crisis Text Line", desc: "Text HOME to 741741 (available 24/7)" },
            ].map((item) => (
              <div key={item.num} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#FF8070", margin: "0 0 4px 0" }}>
                  {item.num}
                </p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What Rooted 21 Is NOT */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            What Rooted 21 Is NOT
          </h2>
          <div style={{ space: 1 }}>
            {[
              "An emergency response system",
              "A substitute for 911 or crisis hotlines",
              "Therapy or psychiatric treatment",
              "Crisis prevention guaranteed",
              "A monitoring system that alerts authorities",
              "A replacement for professional supervision",
              "A suicide prevention guarantee",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ color: RED, fontWeight: 700 }}>✗</span>
                <span style={{ fontSize: 12, color: MUTED }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Situations */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            When to Call 911 or 988
          </h2>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.75 }}>
            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: TEXT }}>Call 911 if:</strong>
            </p>
            <ul style={{ margin: "0 0 12px 16px", paddingLeft: 0 }}>
              <li>Your child is actively suicidal or expressing intent to harm themselves</li>
              <li>Your child is in violent crisis or being physically aggressive</li>
              <li>Your child has access to weapons or means of self-harm</li>
              <li>Someone is threatening harm to your child</li>
              <li>Your child is experiencing severe medical emergency</li>
            </ul>

            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: TEXT }}>Call or text 988 if:</strong>
            </p>
            <ul style={{ margin: "0 0 12px 16px", paddingLeft: 0 }}>
              <li>Your child is expressing hopelessness or wanting to "not exist"</li>
              <li>Your child is withdrawn, isolated, or showing sudden personality changes</li>
              <li>You are having thoughts of harming yourself or your child</li>
              <li>You need to talk to someone about mental health concerns</li>
              <li>You're in crisis but no immediate danger</li>
            </ul>

            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: TEXT }}>Call 1-855-OH-CHILD if:</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>You suspect child abuse or neglect</li>
              <li>Your child has unexplained injuries</li>
              <li>Your child discloses abuse by a caregiver</li>
              <li>You are concerned about a child's safety</li>
            </ul>
          </div>
        </div>

        {/* Limitations of Rooted 21 */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            Limitations of Rooted 21 Crisis Support
          </h2>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.75 }}>
            <p>
              Rooted 21 can provide <strong style={{ color: TEXT }}>educational strategies</strong> and <strong style={{ color: TEXT }}>connection to resources</strong>, but:
            </p>
            <ul style={{ margin: "12px 0", paddingLeft: 16 }}>
              <li>We cannot provide real-time crisis intervention</li>
              <li>We cannot monitor your child's safety</li>
              <li>We cannot make clinical assessments</li>
              <li>We cannot replace professional emergency services</li>
              <li>Our AI analysis may not catch all warning signs</li>
              <li>Strategies may not work for your child's specific situation</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              <strong style={{ color: TEXT }}>If you have doubts,</strong> always seek immediate professional help.
            </p>
          </div>
        </div>

        {/* Mandated Reporters */}
        <div style={{ background: "rgba(201,151,58,0.08)", border: "1px solid rgba(201,151,58,0.3)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
            For Professionals & Mandated Reporters
          </h2>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.75 }}>
            <p>
              If you are a therapist, caseworker, teacher, or medical provider using Rooted 21:
            </p>
            <p style={{ marginTop: 12, fontWeight: 600, color: "#c9973a" }}>
              YOU MAINTAIN YOUR LEGAL OBLIGATION TO REPORT SUSPECTED ABUSE IMMEDIATELY.
            </p>
            <ul style={{ margin: "12px 0", paddingLeft: 16 }}>
              <li>Do NOT wait for app reminders or AI analysis</li>
              <li>Report immediately to 1-855-OH-CHILD</li>
              <li>Document the report in both Rooted 21 AND official channels</li>
              <li>Failing to report is a felony in Ohio</li>
              <li>Use Rooted 21 as documentation backup only</li>
            </ul>
          </div>
        </div>

        {/* Parent Self-Care */}
        <div style={{ background: "rgba(61,184,112,0.08)", border: "1px solid rgba(61,184,112,0.2)", borderRadius: 14, padding: 16, marginBottom: 40 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#48D17A", marginBottom: 12 }}>
            Take Care of Yourself Too
          </h2>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.75 }}>
            <p>
              If you're in crisis or having thoughts of harming yourself:
            </p>
            <ul style={{ margin: "12px 0", paddingLeft: 16 }}>
              <li>Call 988 (Suicide & Crisis Lifeline)</li>
              <li>Text HOME to 741741</li>
              <li>Call your therapist or psychiatrist</li>
              <li>Go to your nearest emergency room</li>
              <li>Tell someone you trust how you're feeling</li>
            </ul>
            <p style={{ marginTop: 12, fontWeight: 600, color: TEXT }}>
              Your mental health matters. You cannot pour from an empty cup. Get help.
            </p>
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}