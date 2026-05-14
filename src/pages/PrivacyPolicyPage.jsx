import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const SECTIONS = [
  {
    title: "1. Who We Are",
    content: "Rooted 21 Parenting Network LLC is a mission-driven parenting support company dedicated to providing trauma-informed resources, coaching, and community connection to foster families, adoptive families, kinship caregivers, and biological parents navigating complex systems (CPS, family court, behavioral health). Our mission is to reduce parental isolation and increase access to evidence-based parenting support.",
  },
  {
    title: "2. Data We Collect",
    content: "We collect personal information you voluntarily provide, including: your full name, email address, role (parent, professional, court staff), children's names and ages, behavioral observations and trauma history notes, medical and medication records, court case information, school/IEP documents, and communication with other parents or professionals through our platform. We do NOT collect payment information directly — that is processed through our payment processor (Stripe). We automatically collect your IP address, browser type, and interaction logs for security and improvement purposes.",
  },
  {
    title: "3. How We Use Your Data",
    content: "We use your information to: provide parenting coaching and resources tailored to your family's needs; facilitate court-supervised co-parenting communication; generate case summaries and court-ready reports; analyze patterns in behavior and medication adherence; send you reminders for legal deadlines and appointments; improve our platform through usage analytics; and comply with court orders and legal obligations. We do NOT use your data for advertising, marketing to third parties, or AI training datasets.",
  },
  {
    title: "4. Ohio Law Compliance (ORC §1349.09)",
    content: "We comply with Ohio Revised Code §1349.09, which governs the protection of student data. Though Rooted 21 is not a school operator, we treat child data with the same protective standards. Under ORC §1349.09, we obtain explicit written authorization before collecting personal information about any child in your care. You retain full rights to access, review, amend, and request deletion of your child's data. Rooted 21 will not sell, lease, or trade child data, and will not use it for purposes other than those disclosed at the time of collection.",
  },
  {
    title: "5. Data Retention & Deletion",
    content: "We retain your account data for as long as you use Rooted 21, plus 3 years after your last login to comply with legal hold requirements. Co-parenting messages and court-related documents are retained indefinitely unless you request deletion (they may be discoverable in family court proceedings). Case plans, behavioral logs, and medication records are retained for 3 years. You may request complete deletion of your account and associated data at any time by emailing privacy@rooted21parenting.com. We will confirm deletion within 30 days, except where retention is required by court order or law.",
  },
  {
    title: "6. Data Security",
    content: "Your data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3. We use industry-standard security practices including role-based access control, audit logging of all data access, and multi-factor authentication for sensitive accounts. Co-parenting messages and court exports are cryptographically hashed to prevent tampering. However, no system is 100% secure. If we experience a data breach affecting your information, we will notify you within 48 hours.",
  },
  {
    title: "7. Sharing Your Data",
    content: "We will NOT share your data with third parties except: (a) with professionals you explicitly authorize via access code (therapists, caseworkers, court staff); (b) as required by valid court order, subpoena, or legal obligation; (c) with our service providers (Stripe for payments, Twilio for calls, hosting providers) under strict confidentiality agreements; (d) if you are a mandatory reporter and disclose child abuse/neglect to us, we are required by Ohio law to report to child protective services. You will be notified of compelled disclosures unless prohibited by law.",
  },
  {
    title: "8. Mandatory Reporter Notice for Professionals",
    content: "If you are a teacher, healthcare provider, therapist, caseworker, CASA, or other mandated reporter accessing Rooted 21 through a professional account: you retain all mandatory reporting obligations under Ohio Revised Code §5153.31. If you become aware of child abuse, neglect, or sexual abuse through information on our platform, you are required to report to the Ohio Child Abuse Hotline (1-855-OHIO-ABUSED) or local law enforcement immediately. Rooted 21 will comply with all requests for data related to a valid child abuse investigation.",
  },
  {
    title: "9. Your Privacy Rights",
    content: "You have the right to: (1) Access all data we hold about you or your child within 30 days of request; (2) Correct inaccurate or incomplete information; (3) Request deletion of your account and associated data (subject to legal holds); (4) Receive a portable copy of your data in a standard format; (5) Opt out of optional analytics and research participation. To exercise any of these rights, email privacy@rooted21parenting.com with your full name, email, and specific request.",
  },
  {
    title: "10. Children's Privacy",
    content: "Rooted 21 is not directed at children under age 18. We do not knowingly collect personal information from children. If we become aware that a child has provided information directly to us, we will delete that information immediately and notify the parent/guardian. All child data on Rooted 21 is entered and controlled by you, the authorized adult caregiver.",
  },
  {
    title: "11. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by email or by posting a prominent notice on our platform. Your continued use of Rooted 21 after changes are posted constitutes your acceptance of the revised policy.",
  },
  {
    title: "12. Contact Us",
    content: "For questions about this Privacy Policy, to request access to your data, or to exercise your privacy rights, contact: Rooted 21 Parenting Network LLC | Privacy Team | privacy@rooted21parenting.com. We will respond to all privacy requests within 30 days. For urgent privacy or security concerns, please contact mstonerock@rooted21parenting.com.",
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 13, color: C.mutedText, lineHeight: 1.65 }}>
            Last updated: May 12, 2026
          </p>
        </div>

        <div style={{ background: C.white, border: `1.5px solid ${C.gold}30`, borderRadius: 14, padding: 14, marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.darkGreen, margin: "0 0 6px 0" }}>
            🌿 Mission-Driven Company
          </p>
          <p style={{ fontSize: 11, color: C.mutedText, margin: 0, lineHeight: 1.6 }}>
            Rooted 21 Parenting Network LLC is a mission-driven parenting support company. This Privacy Policy reflects our commitment to protecting family data and complying with Ohio law, particularly ORC §1349.09 (student/child data protection).
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
            Questions about your privacy?
          </p>
          <p style={{ fontSize: 11, color: C.lightGreen, margin: 0 }}>
            Email us at{" "}
            <a href="mailto:privacy@rooted21parenting.com" style={{ color: C.gold, fontWeight: 700, textDecoration: "none" }}>
              privacy@rooted21parenting.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}