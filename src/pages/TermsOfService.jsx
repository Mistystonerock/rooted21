import { ChevronDown } from "lucide-react";
import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";

const BG = "#0d2818";
const CARD = "#132d1f";
const BORDER = "rgba(247,232,198,0.45)";
const TEXT = "#F7E8C6";
const MUTED = "#E6D8B8";

export default function TermsOfService() {
  const [expanded, setExpanded] = useState(null);

  const sections = [
    {
      id: "safety-first",
      title: "Safety, Privacy, and Trust",
      content: "Rooted 21 is designed to feel emotionally safe. You agree to use the platform in ways that respect privacy, consent, and family safety.\n\nAvailable trust features may include survivor mode, quick exit, fake screen redirect, PIN-protected vault tools, privacy controls, data export, account deletion requests, consent tracking, and release-of-information tracking.\n\nThese tools support privacy and documentation, but they do not replace emergency services, legal advice, medical care, or professional safety planning.",
    },
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: "By accessing or using Rooted 21, you agree to be bound by these Terms of Service.\n\nIf you do not agree to these terms:\n• Do not create an account\n• Do not use the app\n• Contact us for questions: legal@rooted21.app\n\nThese terms apply to all users: parents, professionals, admins, and founders.",
    },
    {
      id: "eligibility",
      title: "2. User Eligibility",
      content: "You may use Rooted 21 if:\n\n✓ You are 18 years or older\n✓ You are a legal guardian or parent\n✓ You are acting as an authorized professional (if applicable)\n✓ You comply with all applicable laws\n✓ You have not violated these terms previously\n\nProfessional users (therapists, caseworkers, etc.) must:\n✓ Hold valid credentials in your stated field\n✓ Maintain professional liability insurance\n✓ Follow your professional code of ethics\n✓ Disclose conflicts of interest",
    },
    {
      id: "use",
      title: "3. Acceptable Use Policy",
      content: "You agree NOT to:\n\n✗ Create false or fraudulent entries (behavioral logs, medications, documents)\n✗ Share login credentials or allow unauthorized access\n✗ Use the app to evade court orders or hide information from professionals\n✗ Post abusive, threatening, or harassing content\n✗ Violate anyone's privacy or consent\n✗ Attempt to access unauthorized data\n✗ Use the app for illegal purposes\n✗ Interfere with app functionality or security\n✗ Reverse-engineer or copy proprietary code\n✗ Use bots or automation (except authorized integrations)\n\nViolations may result in account suspension or termination.",
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property",
      content: "All content, curriculum, features, tools, materials, text, images, and technology within the Rooted 21 platform are the exclusive property of Rooted 21 Parenting Network LLC. Users may not copy, reproduce, distribute, modify, or create derivative works from any part of this platform without prior written permission from Rooted 21 Parenting Network LLC. Rooted 21 is a trademark pending registration with the United States Patent and Trademark Office.",
    },
    {
      id: "liability",
      title: "5. Liability Limitations",
      content: "ROOTED 21 IS PROVIDED \"AS IS\" — WE ARE NOT LIABLE FOR:\n\n✗ Decisions or actions based on app guidance\n✗ Data loss (maintain your own backups)\n✗ Service interruptions or downtime\n✗ Third-party service failures (Stripe, Supabase, etc.)\n✗ Court deadlines missed due to app issues\n✗ Outcomes of parenting strategies suggested by the app\n✗ Failures of AI analysis or recommendations\n✗ Security breaches despite our best efforts\n\nYou use Rooted 21 at your own risk. Always consult professionals for critical decisions.",
    },
    {
      id: "warranty",
      title: "6. No Warranty",
      content: "Rooted 21 makes NO warranties, express or implied:\n\n• Not guaranteed to be error-free\n• Not guaranteed to meet your specific needs\n• Not guaranteed to be continuously available\n• AI recommendations are informational only\n• App features may change or be discontinued\n\nWe do not warrant that:\n• Information is accurate or complete\n• The app will solve your family's challenges\n• Strategies will work for your child\n• Court documents will be accepted\n\nProfessionals: Always verify app recommendations with clinical judgment and professional expertise.",
    },
    {
      id: "termination",
      title: "7. Termination & Suspension",
      content: "We may suspend or terminate your account if:\n\n• You violate these terms\n• You engage in fraud or illegal activity\n• You violate someone's privacy or safety\n• You fail to pay subscription fees\n• You create multiple accounts to evade restrictions\n• We are required by law\n\nUpon termination:\n✓ You lose access immediately\n✓ Your data is retained per our Data Retention Policy\n✓ You may request a data export\n✓ Court-ordered data remains accessible to authorities\n\nYou may request account deletion anytime (email: legal@rooted21.app).",
    },
    {
      id: "dispute",
      title: "8. Dispute Resolution",
      content: "If you have a dispute with Rooted 21:\n\n1. FIRST: Email legal@rooted21.app with details\n   (We respond within 30 days)\n\n2. MEDIATION: If unresolved, we may propose mediation\n   (Both parties can agree to binding arbitration)\n\n3. ARBITRATION: If mediation fails, disputes are resolved through binding arbitration in Ohio under Ohio law\n   • Costs split between parties\n   • Binding and final\n   • No class action lawsuits\n\n4. COURT: You may pursue legal action in Ohio courts if arbitration fails\n   • Only option if court injunction applies\n   • Subject to Ohio jurisdiction",
    },
    {
      id: "modifications",
      title: "9. Changes to Terms",
      content: "We may update these Terms of Service at any time.\n\nWhen we make changes:\n✓ We post updates on this page\n✓ Major changes trigger email notification\n✓ You have 30 days to review\n✓ Continued use = acceptance of new terms\n\nIf you disagree with updated terms:\n• Stop using the app\n• Request account deletion\n• Your data will be handled per our Data Retention Policy",
    },
    {
      id: "contact",
      title: "10. Contact Us",
      content: "For questions about these Terms:\n\n📧 Email: legal@rooted21.app\n⏰ Response: Within 30 days\n\nFor urgent legal matters:\n🏛️ Contact our legal team\n\nLast Updated: May 2026",
    },
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <MobileHeader title="Terms of Service" subtitle="Your rights and responsibilities" backTo="/" />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED }}>
            These Terms explain how Rooted 21 should be used safely, respectfully, and with privacy, consent, and trauma-informed care in mind.
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
            Email: legal@rooted21.app
          </p>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}