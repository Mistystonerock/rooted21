import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing and using Rooted 21, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you may not use our platform. These terms apply to all users, including parents, professionals, court staff, and other visitors. Rooted 21 Parenting Network LLC is a mission-driven parenting support company providing parenting support services.",
  },
  {
    title: "2. Use License",
    content: "We grant you a limited, non-exclusive, non-transferable license to access and use Rooted 21 for personal, non-commercial purposes only. You may not: reproduce, duplicate, copy, or sell any part of our platform; attempt to gain unauthorized access to our systems; use our platform for illegal activities or to harm others; or interfere with the functionality of our services. Violation of these terms may result in termination of your account without refund.",
  },
  {
    title: "3. User Accounts & Registration",
    content: "If you create an account, you are responsible for maintaining the confidentiality of your password and account information. You agree to provide accurate, complete information during registration. You are responsible for all activity under your account. If you suspect unauthorized access, notify us immediately at support@rooted21parenting.com. Users must be at least 18 years old or have parental consent to create an account.",
  },
  {
    title: "4. Court-Supervised Messaging",
    content: "If you use the Co-Parent Portal messaging feature, you acknowledge and agree that: (a) all messages are permanently recorded, timestamped, and tamper-evident; (b) messages may be used as evidence in Ohio family court proceedings (ORC §3109.04); (c) court-authorized personnel (judges, GALs, caseworkers, attorneys) may access your full message history at any time; (d) you cannot delete messages once sent; (e) threatening, harassing, or abusive messages are prohibited and may result in suspension and referral to law enforcement; (f) you consent to monitoring by Rooted 21 and court personnel.",
  },
  {
    title: "5. Child Data & Parental Authorization",
    content: "Under Ohio Revised Code §1349.09, you must be the authorized adult caregiver (parent, legal guardian, or court-ordered custodian) to enter child data on Rooted 21. You authorize us to collect, store, and process your child's personal information as described in our Privacy Policy. You represent that you have legal authority to provide this authorization. You may request deletion of child data at any time, except where retention is required by court order.",
  },
  {
    title: "6. Professional Use & Mandatory Reporting",
    content: "If you are a licensed therapist, caseworker, CASA, teacher, healthcare provider, or other professional, you retain all obligations under Ohio law, including mandatory reporting. You acknowledge that Rooted 21 is not a substitute for your professional judgment and that you are responsible for your own assessments, diagnoses, and recommendations. If you become aware of child abuse or neglect through our platform, you must report to the Ohio Child Abuse Hotline (1-855-OHIO-ABUSED) immediately. Rooted 21 will cooperate with all child protective services and law enforcement investigations.",
  },
  {
    title: "7. Disclaimer of Medical, Legal & Therapeutic Advice",
    content: "Rooted 21 provides educational parenting support only. Our content is NOT medical advice, mental health treatment, legal advice, or therapeutic services. You should not rely on our platform as a substitute for professional healthcare, legal counsel, or mental health services. Always consult a licensed physician, attorney, or therapist for medical, legal, or clinical decisions. In a crisis, call 911 or the 988 Suicide & Crisis Lifeline immediately.",
  },
  {
    title: "8. User-Generated Content",
    content: "You retain ownership of content you post (messages, journal entries, notes). By posting, you grant Rooted 21 a license to store, display, and process that content as needed to provide our services. You are responsible for the accuracy and legality of content you submit. You may not post content that is illegal, defamatory, threatening, abusive, or violates others' privacy or intellectual property rights. We reserve the right to remove content that violates these terms.",
  },
  {
    title: "9. Limitation of Liability",
    content: "Rooted 21 is provided 'as is' without warranties of any kind. We are not liable for indirect, incidental, special, or consequential damages, including lost profits or emotional distress. Our total liability is limited to the amount you have paid us in the past 12 months. Some jurisdictions do not allow limitation of liability, so this may not apply to you. In no event are we liable for decisions or actions you take based on information from our platform.",
  },
  {
    title: "10. Third-Party Links & Services",
    content: "Our platform may contain links to external websites and resources (mental health services, legal resources, community organizations). We do not endorse or control these third-party sites and are not responsible for their content, accuracy, or practices. Use of third-party services is at your own risk and subject to their terms. Always verify the legitimacy of external resources before using them.",
  },
  {
    title: "11. Intellectual Property",
    content: "All content on Rooted 21 — including text, graphics, logos, video, audio, and software — is owned by or licensed to Rooted 21. You may not reproduce, modify, or distribute our content without explicit written permission. Educational materials are provided for personal, non-commercial use only. Rooted 21 respects intellectual property rights and will respond to valid DMCA takedown notices.",
  },
  {
    title: "12. Termination of Access",
    content: "We reserve the right to suspend or terminate your account at any time, with or without cause. Reasons for termination include: violation of these terms, illegal activity, abuse of other users, or non-payment. Upon termination, you must stop using our platform. We will retain your data as required by law and as described in our Privacy Policy. Termination does not relieve you of obligations for past activity or applicable refunds.",
  },
  {
    title: "13. Modification of Terms",
    content: "We may update these Terms of Service at any time. Material changes will be communicated via email or prominent notice on our platform. Your continued use of Rooted 21 after updates are posted constitutes acceptance of the revised terms. If you do not agree with changes, you may request account deletion.",
  },
  {
    title: "14. Ohio Law Governance",
    content: "These Terms of Service are governed by the laws of the State of Ohio, without regard to conflict of laws principles. Any disputes shall be resolved in the state or federal courts of Ohio. You consent to the exclusive jurisdiction of Ohio courts. If any provision of these terms is found unenforceable, the remaining provisions will remain in effect.",
  },
  {
    title: "15. LLC Status & Donations",
    content: "Rooted 21 Parenting Network LLC accepts voluntary donations to support our mission of keeping this platform free for families. Please note that as an LLC, donations are not currently tax deductible. We intend to pursue nonprofit status in the future. Donations to Rooted 21 do not entitle you to ownership or voting rights in the company.",
  },
  {
    title: "16. Contact & Support",
    content: "For questions about these Terms of Service, contact: Rooted 21 | Legal Team | legal@rooted21parenting.com. For urgent safety or abuse reporting, contact the Ohio Child Abuse Hotline at 1-855-OHIO-ABUSED (24/7). For mental health crises, call or text 988.",
  },
];

export default function TermsOfServicePage() {
  const [expanded, setExpanded] = useState({});

  function toggleSection(i) {
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div style={{ background: C.offWhite, minHeight: "100vh", paddingBottom: 40, paddingTop: "max(16px, env(safe-area-inset-top))" }}>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 16px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28, marginTop: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: C.midGreen, textTransform: "uppercase", marginBottom: 8 }}>
            Legal
          </p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "clamp(1.6rem, 6vw, 2rem)", color: C.darkGreen, lineHeight: 1.15, marginBottom: 12 }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 13, color: C.mutedText, lineHeight: 1.65 }}>
            Last updated: May 12, 2026
          </p>
        </div>

        <div style={{ background: C.white, border: `1.5px solid ${C.gold}30`, borderRadius: 14, padding: 14, marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.darkGreen, margin: "0 0 6px 0" }}>
            ⚖️ Legal Compliance
          </p>
          <p style={{ fontSize: 11, color: C.mutedText, margin: 0, lineHeight: 1.6 }}>
            These Terms of Service reflect our commitment to operating as a mission-driven parenting support company under Ohio law. We comply with ORC §3109.04 (family court), ORC §1349.09 (child data), and all mandatory reporting requirements.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SECTIONS.map((sec, i) => (
            <button
              key={i}
              onClick={() => toggleSection(i)}
              style={{
                background: C.white,
                border: `1px solid ${C.cream}`,
                borderRadius: 12,
                padding: 14,
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fafaf8"}
              onMouseLeave={(e) => e.currentTarget.style.background = C.white}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, justifyContent: "space-between" }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: C.darkGreen, margin: 0, flex: 1 }}>
                  {sec.title}
                </p>
                <ChevronDown
                  size={16}
                  color={C.mutedText}
                  style={{
                    transform: expanded[i] ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
              </div>

              {expanded[i] && (
                <p style={{ fontSize: 12, color: C.mutedText, lineHeight: 1.75, marginTop: 12, margin: "12px 0 0 0" }}>
                  {sec.content}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Footer contact */}
        <div style={{ background: C.darkGreen, borderRadius: 14, padding: 16, marginTop: 28, textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.cream, margin: "0 0 6px 0" }}>
            Questions about our Terms?
          </p>
          <p style={{ fontSize: 11, color: C.lightGreen, margin: 0 }}>
            Email us at{" "}
            <a href="mailto:legal@rooted21parenting.com" style={{ color: C.gold, fontWeight: 700, textDecoration: "none" }}>
              legal@rooted21parenting.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}