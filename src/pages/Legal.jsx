import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { FileText, ScrollText, AlertTriangle, CheckCircle2, PenLine } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import DocumentSigningModal from "@/components/legal/DocumentSigningModal";

const SECTIONS = [
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "privacy", label: "Privacy Policy", icon: ScrollText },
  { id: "disclaimer", label: "Health & Safety Disclaimer", icon: AlertTriangle },
  { id: "consent", label: "Consent Forms", icon: CheckCircle2 },
];

const CONTENT = {
  terms: {
    title: "Terms of Service",
    updated: "Last updated: May 4, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content:
          "By accessing and using Rooted 21, you accept and agree to be bound by the terms of this agreement. If you do not agree to these terms, please do not use this service. These terms constitute a binding legal agreement between you and Rooted 21.",
      },
      {
        heading: "2. Use License & Intellectual Property",
        content:
          "Permission is granted to temporarily download one copy of the materials (information or software) on Rooted 21 for personal, non-commercial use only. This is a license, not a transfer of ownership. You may NOT: copy, modify, reverse engineer, or decompile the software or curriculum; use scrapers, bots, or automated tools to extract content; remove copyright, trademark, or proprietary notices; republish or sell the content; or create derivative works. All content, including lessons, assessments, therapeutic protocols, and branding are owned by Rooted 21, LLC and protected by copyright law. Unauthorized copying or redistribution is illegal and may result in civil and criminal penalties.",
      },
      {
        heading: "3. User Conduct & Prohibited Activities",
        content:
          "You agree not to: use Rooted 21 for unlawful purposes or in violation of any applicable laws; attempt to gain unauthorized access to the platform; interfere with platform operations; harass, abuse, or threaten other users; upload malicious code or content; or violate intellectual property rights. Any unauthorized use of content will be pursued to the fullest extent of the law, including DMCA takedown notices and civil litigation.",
      },
      {
        heading: "4. Limitation of Liability & Indemnification",
        content:
          "IN NO EVENT SHALL ROOTED 21 OR ITS OPERATORS BE LIABLE FOR: indirect, incidental, special, or consequential damages; loss of data, profits, or business opportunity; or damages from unauthorized access or data breaches beyond our reasonable control. Your sole remedy is refund of subscription fees. By using Rooted 21, you indemnify and hold harmless the platform from any claims arising from your use, breach of these terms, or violation of law.",
      },
      {
        heading: "5. Warranty Disclaimer & Service 'AS-IS'",
        content:
          "THE PLATFORM IS PROVIDED 'AS-IS' WITHOUT WARRANTY OF ANY KIND. ROOTED 21 DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant that: the platform will be uninterrupted or error-free; all content is accurate or complete; or your use will meet your expectations.",
      },
      {
        heading: "6. External Links & Third-Party Content",
        content:
          "Rooted 21 is not responsible for external links, third-party services (Twilio, Stripe), or linked content. We do not endorse external sites. Your use of third-party services is governed by their own terms and privacy policies.",
      },
      {
        heading: "7. Modification & Termination of Service",
        content:
          "Rooted 21 may revise these terms, modify features, or terminate the service at any time with 30 days' notice. Continued use after modification indicates acceptance. We may suspend or terminate accounts that violate these terms or engage in illegal activity.",
      },
      {
        heading: "8. Dispute Resolution & Arbitration",
        content:
          "Any dispute arising from these terms shall be resolved through binding arbitration under JAMS rules. You waive the right to a jury trial or class action. Arbitration shall be conducted in English and governed by Ohio law. Each party bears its own legal costs unless arbitration rules provide otherwise.",
      },
      {
        heading: "9. Severability",
        content:
          "If any provision of these terms is found invalid, that provision shall be severed and the remainder shall remain in effect.",
      },
      {
        heading: "10. Contact & Notices",
        content:
          "Legal notices should be sent to: mstonerock@rooted21parenting.com. By using this platform, you consent to electronic service of documents.",
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: May 4, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        content:
          "We collect: (a) Information you provide: name, email, phone, child profile, behavioral observations, goals, journal entries, health notes; (b) Usage data: login activity, check-in logs, feature usage, session duration; (c) Device info: IP address, browser type, device ID; (d) Payment info: processed securely through Stripe (we do not store credit card numbers). All personally identifiable information is encrypted.",
      },
      {
        heading: "2. How We Use Your Information",
        content:
          "Your information is used to: provide, maintain, and improve Rooted 21; send notifications and reminders; create personalized insights and behavioral reports; connect you with assigned professionals; comply with legal and regulatory obligations; prevent fraud or misuse; and analyze platform usage to enhance features.",
      },
      {
        heading: "3. Sensitive Data: Children's Information",
        content:
          "Rooted 21 processes sensitive information about children (names, ages, behavioral health, traumatic history). Parents/guardians are responsible for ensuring this information is accurate and necessary. We do NOT sell, share, or use child data for marketing. Child data is shared with professionals ONLY via explicit access code consent, which you can revoke anytime.",
      },
      {
        heading: "4. Professional Data Sharing",
        content:
          "When you provide a professional with an access code, you explicitly consent to share your complete family profile, behavioral data, notes, and assessments with that specific person. You control access and can revoke it immediately. Professionals must maintain confidentiality and comply with HIPAA and applicable laws.",
      },
      {
        heading: "5. Data Security & Encryption",
        content:
          "We use industry-standard protections: AES-256 encryption at rest, TLS 1.2+ encryption in transit, secure API authentication, access controls, and regular security audits. However, no online system is 100% secure. We are not liable for breaches from unauthorized access, server compromise, or third-party vulnerability beyond our reasonable control.",
      },
      {
        heading: "6. Data Retention & Deletion",
        content:
          "Active account data is retained indefinitely while your account is active. Upon account deletion, personal and child data is removed within 30 days. Backup copies may take up to 90 days to fully purge. Aggregated, anonymized analytics are retained indefinitely and cannot identify you.",
      },
      {
        heading: "7. Third-Party Service Providers",
        content:
          "We use: Twilio (SMS delivery), Stripe (payments), Base44 (hosting/database). These providers have access to limited data necessary for their service. We do NOT sell personal data to advertisers or data brokers. Your information is never shared for marketing purposes.",
      },
      {
        heading: "8. Your Privacy Rights",
        content:
          "You have the right to: access your data; correct inaccurate information; delete your account and data (subject to legal holds); opt out of non-critical notifications. To exercise these rights, email mstonerock@rooted21parenting.com.",
      },
      {
        heading: "9. Policy Changes & Legal Compliance",
        content:
          "We may update this policy. Significant changes will trigger email notification. Continued use indicates acceptance. Rooted 21 complies with FERPA (educational records), state behavioral health laws, and applicable data protection regulations.",
      },
      {
        heading: "10. Contact & Data Requests",
        content:
          'Email mstonerock@rooted21parenting.com or contact through the app. For legal requests (subpoenas, warrants), we will notify you unless legally prohibited. Data requests are fulfilled within 45 days.',
      },
    ],
  },

  disclaimer: {
    title: "Health & Safety Disclaimer",
    updated: "Last updated: May 4, 2026",
    sections: [
      {
        heading: "⚠️ IMPORTANT: NOT A MEDICAL SERVICE",
        content:
          "Rooted 21 is an educational and behavioral support tool designed to complement professional mental health care. It is NOT a substitute for professional medical, psychological, or psychiatric treatment. The information and features provided are not intended to diagnose, treat, cure, or prevent any disease or mental health condition.",
      },
      {
        heading: "1. Professional Guidance Required",
        content:
          "This platform is designed to support families working with therapists, counselors, caseworkers, or other qualified professionals. Do not use Rooted 21 as your only source of parenting guidance. Always consult with qualified professionals about your child's behavioral or mental health concerns.",
      },
      {
        heading: "2. Crisis Resources",
        content:
          "If you or your child are experiencing a mental health crisis: Call or text 988 (Suicide & Crisis Lifeline) for immediate support available 24/7. If there is imminent danger, call 911 immediately. These resources are available at any time from anywhere in the app.",
      },
      {
        heading: "3. No Emergency Service",
        content:
          "Rooted 21 does not provide emergency mental health services. In case of suicidal thoughts, self-harm, or any emergency, immediately call 911 or go to the nearest emergency room.",
      },
      {
        heading: "4. AI-Powered Coaching Limitations",
        content:
          "The AI-powered crisis guidance and support suggestions are based on best practices in trauma-informed parenting and TBRI®, but are not personalized medical advice. The AI may not account for unique medical, psychological, or situational factors. Always verify suggestions with your professional care team.",
      },
      {
        heading: "5. Data and Monitoring",
        content:
          "Rooted 21 tracks behavioral data and patterns for your personal awareness and to share with your care team. This tracking is not medical monitoring and should not replace regular check-ins with your professionals.",
      },
      {
        heading: "6. No Liability for Outcomes",
        content:
          "ROOTED 21 IS NOT LIABLE for any outcomes, behavioral changes (positive or negative), emotional impacts, or consequences resulting from use of this app. We provide educational support only. Any negative outcomes, therapeutic harm, or dependency on platform guidance are not the responsibility of Rooted 21. You assume all risk related to use.",
      },
      {
        heading: "7. No Doctor-Patient or Therapist-Client Relationship",
        content:
          "Use of Rooted 21 does NOT create a medical, therapeutic, counseling, or fiduciary relationship. You do not have a duty of care or confidentiality from Rooted 21. Professionals integrated into the platform (therapists, caseworkers) create their own separate professional relationships with you outside of this app.",
      },
      {
        heading: "8. Parental Responsibility & Guardianship",
        content:
          "You represent that you are the biological parent, adoptive parent, legal guardian, or authorized caregiver of the child whose information is entered. You assume FULL LEGAL RESPONSIBILITY for your child's care, safety, medical decisions, and wellbeing. Rooted 21 is a tool only—not a substitute for professional judgment, parental oversight, or legal guardianship responsibilities.",
      },
      {
        heading: "9. Assumption of Risk",
        content:
          "By using Rooted 21, you acknowledge: (a) the risks of AI-generated advice; (b) the limitations of digital mental health support; (c) that you understand when to seek immediate professional help; and (d) that you accept all consequences of relying on this app's features. YOU ASSUME ALL RISK.",
      },
      {
        heading: "10. No Replacement for Emergency Services",
        content:
          "Rooted 21 does NOT replace emergency mental health services, crisis intervention, or medical treatment. If you or your child experience suicidal thoughts, self-harm, abuse, or medical emergency, YOU MUST immediately call 911, text 988, or go to an emergency room. Failure to seek emergency care is YOUR responsibility, not Rooted 21's.",
      },
      {
        heading: "11. Acknowledgment & Binding Agreement",
        content:
          "By using Rooted 21, you certify that you: (a) have read all health disclaimers; (b) understand Rooted 21 is not medical care; (c) accept all liability and risk; (d) will seek professional care when needed; and (e) release Rooted 21 from liability for outcomes. This is a binding legal waiver.",
      },
    ],
  },

  consent: {
    title: "Consent Forms",
    updated: "Last updated: May 4, 2026",
    sections: [
      {
        heading: "CONSENT TO USE ROOTED 21",
        content:
          "I understand that Rooted 21 is an educational and behavioral support platform, not a medical or mental health treatment service. I acknowledge that I have read the Health & Safety Disclaimer above and understand the limitations and risks of using this app.",
      },
      {
        heading: "CONSENT TO DATA COLLECTION & STORAGE",
        content:
          "I consent to Rooted 21 collecting and securely storing information about my family, including: check-in data, behavioral observations, goals, lesson progress, journal entries, and contact information. I understand this data may be used to generate personalized insights, trends, and reports for sharing with my care team.",
      },
      {
        heading: "CONSENT TO SHARE DATA WITH PROFESSIONALS",
        content:
          "I understand that I control who can access my family's data through the access code system. When I provide a professional with an access code, I am explicitly consenting to share my family's data with that person. I can revoke this access at any time by removing the professional's connection in the app.",
      },
      {
        heading: "CONSENT TO USE AI-POWERED FEATURES",
        content:
          "I understand that Rooted 21 uses AI technology to provide crisis guidance, behavioral insights, and personalized suggestions. I acknowledge that AI-generated advice is not personalized medical advice and should be verified with my professional care team.",
      },
      {
        heading: "CONSENT TO NOTIFICATIONS",
        content:
          "I consent to receive SMS and email notifications from Rooted 21, including reminders, check-in prompts, and important app updates. I can opt out of non-critical notifications in my settings at any time.",
      },
      {
        heading: "PARENTAL ACKNOWLEDGMENT",
        content:
          "I confirm that I am the parent or legal guardian of the child whose information is being entered into Rooted 21. I assume full responsibility for my family's use of this app and understand that Rooted 21 is a support tool, not a replacement for professional care.",
      },
      {
        heading: "CRISIS RESOURCES ACKNOWLEDGMENT",
        content:
          "I acknowledge that I am aware of crisis resources including the 988 Suicide & Crisis Lifeline and that I understand how to access emergency services. I take responsibility for using these resources if needed.",
      },
    ],
  },
};

function DocumentSection({ docId, heading, content }) {
  return (
    <div className="space-y-4">
      {CONTENT[docId].sections.map((section, i) => (
        <div key={i} className="border-b pb-4 last:border-b-0" style={{ borderColor: C.cream }}>
          <h3 className="font-bold text-sm mb-2" style={{ color: C.darkGreen }}>
            {section.heading}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
}

// Docs that support signing
const SIGNABLE_DOCS = ["terms", "privacy", "disclaimer", "consent"];

export default function Legal() {
  const [activeTab, setActiveTab] = useState("terms");
  const [signingDoc, setSigningDoc] = useState(null);
  const [user, setUser] = useState(null);
  const [signedDocs, setSignedDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rooted21_signed_docs") || "[]"); } catch { return []; }
  });
  const activeDoc = CONTENT[activeTab];

  useState(() => { base44.auth.me().then(setUser); }, []);

  function handleSigned(docId) {
    const updated = [...new Set([...signedDocs, docId])];
    setSignedDocs(updated);
    localStorage.setItem("rooted21_signed_docs", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Legal Documents"
        subtitle="Terms, Privacy, Disclaimers & Consent"
        backTo="/dashboard"
      />

      <div className="max-w-[540px] mx-auto px-4 py-5">
        {/* TABS */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
                style={{
                  background: activeTab === section.id ? C.darkGreen : C.cream,
                  color: activeTab === section.id ? C.cream : C.mutedText,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Icon size={12} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* DOCUMENT CONTENT */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          {/* Title & Updated Date */}
          <div className="pb-4 border-b" style={{ borderColor: C.cream }}>
            <h2 className="font-serif font-bold text-lg mb-1" style={{ color: C.darkGreen }}>
              {activeDoc.title}
            </h2>
            <p className="text-[10px]" style={{ color: C.mutedText }}>
              {activeDoc.updated}
            </p>
          </div>

          {/* Sections */}
          <DocumentSection docId={activeTab} />

          {/* Sign button for signable docs */}
          {SIGNABLE_DOCS.includes(activeTab) && (
            <div className="mt-6">
              {signedDocs.includes(activeTab) ? (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
                  <CheckCircle2 size={18} color={C.midGreen} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Signed & Saved</p>
                    <p className="text-[10px]" style={{ color: C.mutedText }}>This document has been signed and saved to your file repository.</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSigningDoc(activeTab)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
                >
                  <PenLine size={16} /> Review & Sign Document
                </button>
              )}
            </div>
          )}

          {/* Info Banner */}
          {activeTab === "disclaimer" && (
            <div className="rounded-xl p-4 mt-6 flex gap-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <AlertTriangle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px]" style={{ color: "#B84C2A" }}>
                <strong>CRITICAL:</strong> In crisis? Call or text <strong>988</strong> anytime. In immediate danger, call <strong>911</strong>.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="rounded-xl p-4 text-center mt-5" style={{ background: C.cream }}>
          <p className="text-xs" style={{ color: C.mutedText }}>
            These legal documents are binding. By using Rooted 21, you acknowledge reading and accepting these terms.
          </p>
        </div>

        <div className="pb-8" />
      </div>

      {signingDoc && (
        <DocumentSigningModal
          document={CONTENT[signingDoc]}
          user={user}
          onClose={() => setSigningDoc(null)}
          onSigned={() => handleSigned(signingDoc)}
        />
      )}
    </div>
  );
}