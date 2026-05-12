import { ChevronDown } from "lucide-react";
import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";

const BG = "#0d2818";
const CARD = "#132d1f";
const BORDER = "rgba(247,232,198,0.45)";
const TEXT = "#F7E8C6";
const MUTED = "#E6D8B8";

export default function PrivacyPolicy() {
  const [expanded, setExpanded] = useState(null);

  const sections = [
    {
      id: "collection",
      title: "1. Information We Collect",
      content: "Rooted 21 collects:\n\n• Account info: Name, email, phone, role\n• Family data: Child profiles, behavioral logs, medical records, case documents\n• Communication: Messages, journal entries, notes\n• Usage: Pages visited, features used, timestamps\n• Device: Browser type, OS, IP address (for security)\n\nWe collect only what you provide or what's necessary to deliver the service.",
    },
    {
      id: "use",
      title: "2. How We Use Your Data",
      content: "We use your information to:\n\n✓ Deliver personalized parenting guidance and AI insights\n✓ Generate court-ready reports and documentation\n✓ Provide communication and coordination between co-parents and professionals\n✓ Track behavioral patterns and emotional trends\n✓ Send reminders (with your consent)\n✓ Comply with court orders and child welfare requests\n✓ Improve app functionality and user experience\n✓ Investigate security issues or violations\n\nWe do NOT use your data to:\n✗ Train commercial AI models without explicit consent\n✗ Sell information to advertisers or marketers\n✗ Profile you for discrimination or exclusion",
    },
    {
      id: "sharing",
      title: "3. Who We Share Data With",
      content: "We share data ONLY when:\n\n• You explicitly authorize it (e.g., sharing with therapist)\n• Court orders require it (subpoena, custody proceedings)\n• Your co-parent needs relevant information (only their shared child's data)\n• Third-party services need it to operate (Stripe for billing, Supabase for storage)\n• Law enforcement requests it legally\n\nWe NEVER:\n✗ Sell your data to third parties\n✗ Share without your permission (except legal requirements)\n✗ Give data to advertisers, researchers, or marketers\n✗ Use data for profiling or targeting",
    },
    {
      id: "rights",
      title: "4. Your Data Rights",
      content: "You have the right to:\n\n✓ Access: Request a copy of all your data\n✓ Export: Download your data in a portable format\n✓ Correct: Update or fix inaccurate information\n✓ Delete: Request deletion (with limitations noted below)\n✓ Opt-out: Disable certain features (AI analysis, SMS reminders, etc.)\n✓ Privacy: Know exactly what we collect and how we use it\n\nTo exercise these rights, email: privacy@rooted21.app",
    },
    {
      id: "retention",
      title: "5. Data Retention",
      content: "We retain data as follows:\n\n• Active Cases: Kept indefinitely while case is open\n• Closed Cases: 7 years (statute of limitations for legal appeals)\n• Deleted Accounts: Purged within 90 days (except legal holds)\n• Court Documents: Until legal hold is released\n• Behavioral Logs: 5 years from creation date\n• Backups: 30 days after deletion (for disaster recovery)\n\nData may be retained longer if:\n• You have an active or pending case\n• There is a court order or legal hold\n• Law enforcement requests it\n• You ask us to keep it",
    },
    {
      id: "security",
      title: "6. Security & Protection",
      content: "We protect your data with:\n\n✓ AES-256 encryption (data at rest)\n✓ TLS encryption (data in transit)\n✓ Secure database access (limited staff)\n✓ Two-factor authentication (professional accounts)\n✓ Regular security audits\n✓ Breach notification (within 72 hours)\n✓ Encrypted backups\n✓ Zero-knowledge storage for sensitive documents\n\nWhile we take security seriously, no system is 100% secure. Keep your password private and enable 2FA.",
    },
    {
      id: "children",
      title: "7. Children's Privacy",
      content: "Rooted 21 is designed for parents/guardians and professionals, NOT for children directly.\n\n• If your child's data is in Rooted 21, it's because YOU added it\n• Children do NOT have direct accounts or login access\n• We do not collect data from children\n• Parents retain full control of child's information\n• We comply with COPPA (Children's Online Privacy Protection Act)\n\nIf your child gains access to your account, contact us immediately.",
    },
    {
      id: "international",
      title: "8. International Data",
      content: "Rooted 21 is currently U.S.-based (Ohio) and complies with U.S. privacy laws.\n\nIf you use Rooted 21 from outside the U.S.:\n• Your data may be transferred to U.S. servers\n• U.S. privacy laws apply (not GDPR, etc.)\n• You consent to this transfer by using the app\n\nInternational users have the same data rights (access, deletion, etc.). Contact privacy@rooted21.app for international requests.",
    },
    {
      id: "changes",
      title: "9. Policy Changes",
      content: "We may update this Privacy Policy. We will:\n\n✓ Post updates on this page with the date\n✓ Send email notification for major changes\n✓ Allow 30 days for you to review before changes take effect\n\nContinued use after updates means you accept the new policy. If you disagree, you may delete your account.",
    },
    {
      id: "contact",
      title: "10. Contact Us",
      content: "For privacy questions or concerns:\n\n📧 Email: privacy@rooted21.app\n⏰ Response time: Within 30 days\n\nFor complaints or disputes:\n🏛️ Contact your state's Attorney General\n\nLast Updated: May 2026",
    },
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <MobileHeader title="Privacy Policy" subtitle="How we protect your data" backTo="/" />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED }}>
            At Rooted 21, your privacy is fundamental. We only collect data necessary to serve families, and we never sell or misuse it.
          </p>
        </div>

        <div className="space-y-2">
          {sections.map((section) => (
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

        <div style={{ background: "rgba(61,184,112,0.08)", border: "1px solid rgba(61,184,112,0.2)", borderRadius: 14, padding: 16, marginTop: 20, marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#48D17A", marginBottom: 8 }}>
            ✓ Questions?
          </p>
          <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
            Email: privacy@rooted21.app
          </p>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}