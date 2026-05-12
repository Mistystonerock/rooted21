import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";

const BG = "#0d2818";
const CARD = "#132d1f";
const BORDER = "rgba(247,232,198,0.45)";
const TEXT = "#F7E8C6";
const MUTED = "#E6D8B8";

const SECTIONS = [
  {
    id: "privacy",
    title: "Privacy Policy",
    content: `Last Updated: May 2026

1. DATA WE COLLECT
Rooted 21 collects behavioral logs, family notes, medication records, court documents, and communication data to provide trauma-informed parenting support. We store your data in encrypted databases.

2. HOW WE USE YOUR DATA
We use your information to:
- Deliver personalized parenting guidance and behavioral analytics
- Generate court-ready reports and case documentation
- Train AI support models (with your explicit consent)
- Comply with court orders and child welfare agency requests
- Improve app functionality and accessibility

3. WHO WE SHARE DATA WITH
- Court-ordered professionals (caseworkers, judges, attorneys) — only with your permission or court order
- Co-parents in your partnerships — only what's relevant to shared custody
- Third-party services (Stripe for billing, Supabase for storage) under strict data agreements
- Law enforcement — only when legally required

We NEVER sell your data to marketers, researchers, or advertisers.

4. YOUR DATA RIGHTS
You can:
- Request a full export of your data within 30 days
- Delete your account and associated data (except court-mandated records)
- Update or correct information anytime
- Opt out of AI training (affects personalization but maintains core features)

5. DATA RETENTION
Family data is retained for 7 years after case closure (required for legal appeals and future proceedings). After deletion requests, we purge records within 90 days except where legally required.

6. SECURITY
We use AES-256 encryption for data at rest, TLS for data in transit, and mandatory 2FA for professional accounts. Breach notification occurs within 72 hours of discovery.`,
  },
  {
    id: "terms",
    title: "Terms of Service",
    content: `Last Updated: May 2026

1. ACCEPTANCE OF TERMS
By using Rooted 21, you agree to these terms. If you disagree, do not use the app.

2. USER ELIGIBILITY
- You must be 18+ or a legal guardian to create an account
- Professional users must hold valid credentials in their stated field
- Court-involved users agree to comply with court orders regarding data use

3. ACCEPTABLE USE
You agree NOT to:
- Manipulate or falsify behavioral logs, medications, or court documents
- Share login credentials or allow unauthorized access
- Use the app to evade court orders or hide information from professionals
- Post abusive content toward other users
- Attempt to reverse-engineer or access unauthorized data

4. PROFESSIONAL LIABILITY LIMITS
Rooted 21 provides SUPPORT ONLY — not therapy, legal advice, or medical treatment. Professionals must verify all recommendations with child specialists and attorneys before implementation.

5. LIMITATION OF LIABILITY
Rooted 21 is provided "as is." We are not liable for:
- Decisions made based on app guidance (consult professionals)
- Data loss (maintain backup records)
- Service interruptions (court deadlines require manual backup filing)
- Third-party data breaches

6. DISPUTE RESOLUTION
Disputes are resolved through binding arbitration in Ohio under Ohio law, except where court injunctions override.

7. MODIFICATIONS
We may update these terms with 30 days' notice. Continued use after updates constitutes acceptance.`,
  },
  {
    id: "mandated-reporter",
    title: "Mandated Reporter Disclaimer",
    content: `Last Updated: May 2026

⚠️ CRITICAL LEGAL NOTICE FOR PROFESSIONALS

1. MANDATORY REPORTING OBLIGATION
If you are a professional using Rooted 21 (therapist, caseworker, educator, medical provider, judge), you maintain your LEGAL OBLIGATION to report suspected child abuse or neglect to authorities.

Rooted 21 does NOT replace mandatory reporting. If you observe indicators of abuse or neglect:
- Report immediately to Ohio child protective services (1-855-OH-CHILD)
- Do NOT wait for app reminders or analysis
- Document the report in both Rooted 21 AND official channels

2. ROOTED 21'S RESPONSIBILITY
- We provide behavioral tracking tools, NOT abuse detection
- Our AI analysis is informational only and may miss warning signs
- You remain the accountable professional

3. LIABILITY
Failing to report suspected abuse to authorities is a felony in Ohio. Rooted 21 does not fulfill this legal requirement. Use the app as documentation backup only.

4. RECORD RETENTION FOR COURT
Keep concurrent records outside Rooted 21. If the app fails, court-ordered documentation must exist independently.`,
  },
  {
    id: "data-retention",
    title: "Data Retention & Deletion Policy",
    content: `Last Updated: May 2026

1. RETENTION PERIODS
- Active Case Data: Retained indefinitely while case is open
- Closed Case Data: Retained for 7 years (statute of limitations for appeals)
- Deleted Account Data: Purged within 90 days (except court-mandated records)
- Behavioral Logs: 5 years from date created
- Court Documents: Until legal hold is released
- AI Training Data: Only if you explicitly opted in; deleted on request

2. LEGAL HOLDS
If your case is under appeal or ongoing legal proceedings, we will not delete data even if you request it. You will be notified of legal hold status.

3. DELETION REQUESTS
Email: privacy@rooted21.app
Include: Your account email, case ID (if applicable), specific records to delete
Timeline: We respond within 30 days; deletion occurs within 90 days

4. BACKUP & COMPLIANCE
We maintain encrypted backups for disaster recovery. Backups containing your data are retained for 30 days post-deletion per industry standards.

5. COURT-ORDERED RETENTION
Data subpoenaed by courts, child welfare agencies, or law enforcement will be retained per the retention order regardless of deletion requests.`,
  },
  {
    id: "accessibility",
    title: "Accessibility Statement",
    content: `Last Updated: May 2026

Rooted 21 is committed to digital accessibility for all users, including those with disabilities. We comply with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.

1. ACCESSIBLE FEATURES
✓ Mobile-first responsive design (all screen sizes)
✓ ARIA labels and semantic HTML
✓ Keyboard navigation (no mouse required)
✓ High-contrast text (#F7E8C6 on dark green backgrounds)
✓ Screen reader compatibility (tested with NVDA, JAWS)
✓ Alternative text for all images and icons
✓ Captions for video content
✓ Adjustable font sizes (browser zoom supported)

2. KNOWN LIMITATIONS
- Some third-party integrations (Stripe, Supabase dashboards) may have accessibility gaps
- PDF court reports inherit accessibility from jsPDF (we are working to improve)
- Real-time voice features require working microphone/speaker

3. ACCESSIBILITY FEEDBACK
Found an accessibility issue? Email: accessibility@rooted21.app
Include: Device, browser, specific feature, impact on your use
We respond within 5 business days.

4. ASSISTIVE TECHNOLOGY
We support:
- Screen readers (NVDA, JAWS, VoiceOver)
- Voice control (iOS Siri, Android Voice Assistant)
- High-contrast modes
- Text-to-speech browser extensions

5. ONGOING COMPLIANCE
We audit accessibility quarterly and update based on user feedback. Accessibility is not optional — it's a core design principle.`,
  },
  {
    id: "education-disclaimer",
    title: "Educational Support Disclaimer",
    content: `Last Updated: May 2026

⚠️ IMPORTANT: WHAT ROOTED 21 IS AND IS NOT

1. ROOTED 21 IS:
✓ Educational parenting guidance based on trauma-informed best practices
✓ Behavioral tracking and analytics tools
✓ Documentation support for court and professional teams
✓ Peer support and resource connection platform
✓ A supplement to professional care

2. ROOTED 21 IS NOT:
✗ Therapy (behavioral or family)
✗ Medical or psychiatric treatment
✗ Legal advice or legal representation
✗ A substitute for professional consultation
✗ An emergency response system
✗ A crisis prevention guarantee

3. PROFESSIONAL CONSULTATION REQUIRED
Before implementing any strategy from Rooted 21:
- Consult with your child's therapist, psychiatrist, or behavioral specialist
- Discuss with your caseworker or court-appointed professional
- Verify recommendations align with your child's specific needs
- Do not override professional guidance based on app suggestions

4. LIMITATIONS OF AI GUIDANCE
Our AI analysis is based on aggregate patterns, not your child's unique history. It may:
- Miss important context
- Suggest strategies already tried
- Lack awareness of new medications or diagnoses
- Generate false positives or negatives

Always prioritize professional judgment over AI recommendations.

5. CRISIS & EMERGENCY
Rooted 21 is NOT an emergency service. If your child is in immediate danger:
- Call 911
- If mental health crisis: Call or text 988 (Suicide & Crisis Lifeline)
- If abuse/neglect suspected: Call 1-855-OH-CHILD (Ohio child services)`,
  },
];

export default function LegalAndDisclaimers() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <MobileHeader
        title="Legal & Disclaimers"
        subtitle="Transparency & compliance"
        backTo="/home"
      />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED }}>
            Rooted 21 is committed to transparency. These policies outline how we protect your data, what we can and cannot do, and your rights as a user.
          </p>
        </div>

        <div style={{ space: 2 }}>
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpanded(expanded === section.id ? null : section.id)}
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
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>
                  {section.title}
                </h3>
                <ChevronDown
                  size={20}
                  color={TEXT}
                  style={{
                    transition: "transform 0.2s",
                    transform: expanded === section.id ? "rotate(180deg)" : "rotate(0deg)",
                    flexShrink: 0,
                  }}
                />
              </button>

              {expanded === section.id && (
                <div
                  style={{
                    borderTop: `1px solid ${BORDER}`,
                    padding: "16px",
                    maxHeight: "60vh",
                    overflowY: "auto",
                  }}
                >
                  <div style={{ fontSize: 12, lineHeight: 1.75, color: MUTED, whiteSpace: "pre-wrap" }}>
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 14, padding: 16, marginTop: 20, marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#FF6B5A", marginBottom: 8 }}>
            ⚠️ Questions or Concerns?
          </p>
          <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
            Email: legal@rooted21.app
            <br />
            For urgent matters, contact our compliance team within 48 hours.
          </p>
        </div>

        <div style={{ pb: 20 }} />
      </div>
    </div>
  );
}