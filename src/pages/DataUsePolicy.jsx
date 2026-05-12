import { ChevronDown } from "lucide-react";
import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";

const BG = "#0d2818";
const CARD = "#132d1f";
const BORDER = "rgba(247,232,198,0.45)";
const TEXT = "#F7E8C6";
const MUTED = "#E6D8B8";

export default function DataUsePolicy() {
  const [expanded, setExpanded] = useState(null);

  const sections = [
    {
      id: "overview",
      title: "1. Data Use Overview",
      content: "Rooted 21 collects data to:\n\n✓ Deliver personalized parenting support\n✓ Generate court-ready reports\n✓ Identify behavioral patterns\n✓ Improve app functionality\n✓ Provide analytics and insights\n\nWe use data ethically and transparently. You control what data we collect and how we use it.",
    },
    {
      id: "behavioral-logs",
      title: "2. Behavioral Logs",
      content: "What we do with your behavioral logs:\n\n✓ Store securely in encrypted database\n✓ Analyze for patterns and triggers\n✓ Generate trend reports\n✓ Suggest regulation strategies\n✓ Export to professionals (with your permission)\n✓ Use for court documentation\n✓ Track long-term progress\n\nWe do NOT:\n✗ Share with third parties without permission\n✗ Use for research without consent\n✗ Store unencrypted copies\n✗ Export without your approval",
    },
    {
      id: "documents",
      title: "3. Court Documents & Records",
      content: "How we handle legal documents:\n\n✓ Store in secure, encrypted storage\n✓ Maintain version history for appeals\n✓ Generate certified PDFs for court\n✓ Keep records for 7 years (legal hold)\n✓ Share only to authorized professionals\n✓ Comply with discovery requests\n\nCourt documents are:\n✗ Never deleted (except legal hold release)\n✗ Never shared publicly\n✗ Subject to mandatory retention\n✗ Protected under attorney-client privilege (if applicable)",
    },
    {
      id: "analytics",
      title: "4. Analytics & Insights",
      content: "What we analyze:\n\n✓ Your app usage patterns\n✓ Feature engagement\n✓ Content preferences\n✓ Progress toward goals\n✓ Lesson completion rates\n\nAnalytics help us:\n✓ Improve the app\n✓ Identify what's working\n✓ Suggest personalized content\n✓ Fix broken features\n\nWe do NOT:\n✗ Share analytics with third parties\n✗ Use for marketing purposes\n✗ Identify you personally in analytics\n✗ Sell insights to other companies",
    },
    {
      id: "communications",
      title: "5. Messages & Communications",
      content: "How we handle your private communications:\n\n✓ Store securely between co-parents\n✓ Maintain audit trail for court disputes\n✓ Encrypt in transit and at rest\n✓ Allow you to export full conversations\n\nMessages are:\n✗ Never accessible to staff without warrant\n✗ Never used for training AI without consent\n✗ Never shared except in court order\n✗ Deleted only if you request account deletion",
    },
    {
      id: "medical-data",
      title: "6. Medical & Medication Data",
      content: "How we handle sensitive health information:\n\n✓ Store with highest encryption (HIPAA-level)\n✓ Limit access to authorized users only\n✓ Maintain medication refill reminders\n✓ Track dosage administration\n✓ Export to healthcare providers\n✓ Generate medication summaries for court\n\nMedication data is:\n✗ Never shared without permission\n✗ Never used for insurance claims (without consent)\n✗ Protected under health privacy laws\n✗ Retained for 5 years from date created",
    },
    {
      id: "ai-training",
      title: "7. AI Training & Machine Learning",
      content: "How your data improves AI (with consent):\n\nOPT-IN PROCESS:\n1. We ask permission during signup\n2. You can opt out anytime in Settings\n3. Opting out does NOT delete existing data\n4. Data is de-identified before training\n\nIF YOU OPT IN:\n✓ Data helps improve AI insights\n✓ You remain anonymous\n✓ AI learns from aggregated patterns\n✓ You can opt out anytime\n\nIF YOU OPT OUT:\n✓ AI still works for you personally\n✓ But may be less personalized\n✓ Helps maintain privacy preferences",
    },
    {
      id: "third-party",
      title: "8. Third-Party Services",
      content: "Services that have access to your data:\n\nSTRIPE (Billing):\n✓ Encrypted payment processing\n✓ Billing information only\n✓ No behavioral data\n\nSUPABASE (Database):\n✓ Encrypted storage\n✓ Limited staff access\n✓ Regular security audits\n\nTWILIO (SMS Reminders):\n✓ Phone number only\n✓ Message content not logged\n✓ No data retention\n\nEMAIL SERVICE:\n✓ Communication delivery only\n✓ Not stored on email servers\n✓ Deleted after delivery\n\nAll third parties are bound by strict data agreements.",
    },
    {
      id: "court-requests",
      title: "9. Court Orders & Legal Requests",
      content: "If we receive a legal request:\n\n✓ We comply with valid subpoenas\n✓ We notify you when legally permitted\n✓ We provide only what's required\n✓ We retain evidence per court order\n✓ We maintain audit trail of all access\n\nLegal holds:\n✓ Data retained indefinitely during legal hold\n✓ Cannot be deleted until hold is released\n✓ Access logged for accountability",
    },
    {
      id: "deletion",
      title: "10. Data Deletion & Exports",
      content: "Your rights:\n\nEXPORT:\n✓ Request download of all your data\n✓ Available in portable format (JSON, CSV)\n✓ Processing within 30 days\n✓ Email: privacy@rooted21.app\n\nDELETION:\n✓ Request deletion of your account\n✓ Data deleted within 90 days\n✓ Exception: Legal holds remain\n✓ Court documents retained per law\n✓ Backups purged after 30 days\n\nYou can delete anytime, but court-required data will be retained.",
    },
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <MobileHeader title="Data Use Policy" subtitle="How we use your information" backTo="/" />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED }}>
            This policy explains exactly how Rooted 21 uses your data. We're transparent about collection, analysis, and sharing.
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
            ✓ Questions about your data?
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