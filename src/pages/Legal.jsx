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
  { id: "consent", label: "Consent Forms", icon: CheckCircle2 },
  { id: "tbri", label: "Terminology Guide", icon: AlertTriangle },
];

const CONTENT = {
  terms: {
    title: "Terms of Service",
    updated: "Last updated: May 10, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms & User Roles",
        content:
          "By accessing Rooted 21, you agree to these terms. This platform serves three user roles: (a) Parents/Caregivers — biological parents, adoptive parents, foster parents, kinship caregivers, and legal guardians; (b) Professionals — licensed therapists, counselors, caseworkers, coaches, and advocates who access family data via professional access codes; (c) Court Staff — judges, attorneys, guardians ad litem, and court-appointed monitors who access designated case data through court-authorized credentials. Each role carries different access rights and responsibilities defined herein.",
      },
      {
        heading: "2. Platform License & Permitted Use",
        content:
          "All curriculum content, lesson materials, behavioral frameworks, AI coaching logic, branding, and proprietary parenting methodology on Rooted 21 are owned by Rooted 21, LLC. You are granted a limited, non-exclusive, non-transferable license to use the platform for personal or professional support purposes only. You may NOT: copy, redistribute, sublicense, or sell any content; reproduce curriculum materials for group use without written authorization; use automated tools to extract platform data; or create competing derivative works. Violations may result in immediate account termination.",
      },
      {
        heading: "3. Co-Parent Portal — Supervised Messaging Terms",
        content:
          "The Co-Parent Portal facilitates court-supervised communication between co-parents. By using this feature: (a) You acknowledge that ALL messages sent through the Co-Parent Portal are logged, stored, and may be reviewed by court-authorized monitors and legal representatives; (b) You agree not to send threatening, harassing, or abusive messages; (c) You understand that message logs may be subpoenaed or submitted as evidence in family court proceedings; (d) Messages cannot be deleted by users once sent; (e) Court staff assigned to your case may access message history at any time without prior notice; (f) Use of this portal constitutes consent to monitoring. Do not use this feature if you do not consent to court oversight.",
      },
      {
        heading: "4. Professional Directory — Liability Disclaimer",
        content:
          "Rooted 21 provides a Professional Directory as an informational resource only. Rooted 21 does NOT: verify, endorse, license, or credential any professional listed; guarantee the accuracy of professional credentials, certifications, or specializations; assume liability for outcomes of consultations or services rendered by listed professionals; or create any employment or agency relationship with listed professionals. All professionals are independent practitioners. Parents are solely responsible for verifying credentials, licensure, and fit before engaging any professional. Rooted 21 expressly disclaims all liability for professional misconduct, negligence, or harm arising from connections made through the directory.",
      },
      {
        heading: "5. Limitation of Liability & Liability Cap",
        content:
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, ROOTED 21'S TOTAL AGGREGATE LIABILITY FOR ANY CLAIM ARISING FROM USE OF THE PLATFORM SHALL NOT EXCEED THE GREATER OF: (a) $100.00 USD; or (b) the total subscription fees paid by the claimant in the 3 months preceding the claim. Rooted 21 is NOT liable for: indirect, incidental, punitive, or consequential damages; loss of data, income, or business opportunity; emotional distress or therapeutic harm; outcomes of professional relationships facilitated by the platform; or unauthorized access to your account. This limitation applies even if Rooted 21 has been advised of the possibility of such damages.",
      },
      {
        heading: "6. Court Staff Access & Data Obligations",
        content:
          "Court staff authorized to access Rooted 21 data agree to: use data solely for official court proceedings; maintain strict confidentiality of all family data; comply with applicable court rules, state law, and federal privacy regulations; not share access credentials; and report any unauthorized access immediately to mstonerock@rooted21parenting.com. Rooted 21 reserves the right to audit court staff access logs and revoke access for misuse.",
      },
      {
        heading: "7. Professional Access Code Terms",
        content:
          "Professionals who receive access codes from families agree to: use data only for direct service to that family; maintain HIPAA-compliant records management; not share family data with third parties without explicit consent; comply with their professional licensing standards; and immediately notify Rooted 21 if their access is no longer appropriate. Access codes may be revoked by the parent at any time. Professionals may not use platform data for research, training AI models, or any purpose beyond direct client care.",
      },
      {
        heading: "8. Indemnification",
        content:
          "You agree to indemnify, defend, and hold harmless Rooted 21, LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including attorneys' fees) arising from: your use of the platform; your violation of these terms; your violation of any law or third-party rights; content you submit; or your relationship with any professional, co-parent, or court party facilitated through the platform.",
      },
      {
        heading: "9. Dispute Resolution & Governing Law",
        content:
          "All disputes shall be resolved through binding arbitration under JAMS rules, conducted in English, governed by Ohio law, in the jurisdiction of Franklin County, Ohio. You waive rights to jury trial and class action participation. Each party bears its own legal costs unless arbitration rules provide otherwise. Claims must be brought within 1 year of the event giving rise to the claim.",
      },
      {
        heading: "10. Modifications, Termination & Contact",
        content:
          "Rooted 21 may update these terms with 30 days' notice via email or in-app notification. Continued use constitutes acceptance. We may suspend or terminate accounts for violations. Legal notices: mstonerock@rooted21parenting.com.",
      },
    ],
  },

  privacy: {
    title: "Privacy Policy (HIPAA + COPPA Aligned)",
    updated: "Last updated: May 10, 2026",
    sections: [
      {
        heading: "Overview & Regulatory Framework",
        content:
          "This Privacy Policy governs the collection, use, and protection of personal information by Rooted 21, LLC. We are committed to compliance with: HIPAA (Health Insurance Portability and Accountability Act) — for health-related behavioral data; COPPA (Children's Online Privacy Protection Act) — for data involving children under 13; FERPA (Family Educational Rights and Privacy Act) — for educational records; and CCPA (California Consumer Privacy Act) — for California residents. This platform is designed for adults (18+) acting as parents or caregivers. Children do not directly create accounts or submit data.",
      },
      {
        heading: "1. Data We Collect & HIPAA-Aligned Handling",
        content:
          "We collect: (a) Parent/Caregiver Data: name, email, phone, location (optional), payment info via Stripe; (b) Child Profile Data (entered by parent): name, age, placement type, behavioral observations, triggers, trauma history notes, medical/therapy notes, school accommodations — this data is treated as Protected Health Information (PHI) under HIPAA-aligned practices; (c) Usage Data: login activity, feature access logs, session duration; (d) Communication Data: Co-Parent Portal messages, team messages, check-in notes. PHI is encrypted at rest (AES-256) and in transit (TLS 1.3). We do not store payment card numbers — all payments are processed by Stripe.",
      },
      {
        heading: "2. COPPA Compliance — Children's Data",
        content:
          "Rooted 21 does not permit children under 13 to create accounts or directly submit data. Child profile information is entered ONLY by the parent or legal guardian (the verified adult account holder). We comply with COPPA by: requiring adult account verification; not collecting data directly from children; not using child profile data for advertising or marketing; not sharing child data without explicit verifiable parental consent; and providing parents with full rights to access, correct, and delete their child's data at any time. Parents may request complete deletion of child profile data by emailing mstonerock@rooted21parenting.com.",
      },
      {
        heading: "3. How We Use Your Data",
        content:
          "Child and family data is used ONLY to: deliver platform features (AI coaching, behavior reports, care calendar); generate personalized insights for the parent's own use; share with professionals ONLY when the parent grants explicit access via access code; and comply with valid legal obligations (court orders, subpoenas). We do NOT use child behavioral data to train AI models, advertise, sell to third parties, or conduct research without explicit opt-in consent.",
      },
      {
        heading: "4. Professional & Court Staff Data Access",
        content:
          "Professionals (therapists, caseworkers, coaches) may access family data only when a parent provides an access code. This access is logged, auditable, and revocable at any time. Court staff may access designated case data through court-authorized credentials only. All authorized data access is recorded in an audit log. Professionals must comply with their professional licensing standards and HIPAA. Court access is governed by applicable court orders and state law.",
      },
      {
        heading: "5. Data Security Standards",
        content:
          "Security measures include: AES-256 encryption at rest; TLS 1.3 encryption in transit; role-based access controls; access code authentication for professional data sharing; audit logs for all data access events; and regular security reviews. No system is 100% secure. In the event of a data breach affecting your PHI, we will notify you within 60 days as required by applicable law.",
      },
      {
        heading: "6. Data Retention & Deletion Rights",
        content:
          "Active account data is retained while your account is active. Upon account deletion request: personal and child data is removed within 30 days; backup systems purge within 90 days; court-ordered data holds may delay deletion. You have the right to: request a copy of your data; correct inaccurate information; delete your account and data; and restrict certain processing. Submit requests to mstonerock@rooted21parenting.com — fulfilled within 45 days.",
      },
      {
        heading: "7. Third-Party Service Providers",
        content:
          "We share limited data with: Stripe (payment processing — no card numbers stored by us); Twilio (SMS delivery — phone numbers only); Base44 (hosting and database infrastructure). These providers are contractually bound to protect your data and may not use it for their own purposes. We do NOT sell, rent, or trade personal or child data to any third party for commercial purposes.",
      },
      {
        heading: "8. California Residents — CCPA Rights",
        content:
          "California residents have the right to: know what personal information we collect and how it is used; request deletion of personal information; opt out of the sale of personal information (we do not sell personal information); non-discrimination for exercising privacy rights; and request disclosure of data shared with third parties in the past 12 months. To exercise CCPA rights, email mstonerock@rooted21parenting.com with subject line 'CCPA Request.' We will respond within 45 days.",
      },
      {
        heading: "9. Co-Parent Portal Privacy",
        content:
          "Messages sent through the Co-Parent Portal are stored and accessible to court-authorized monitors. Do not send messages through the Co-Parent Portal that you would not want seen in a court proceeding. Message logs may be subpoenaed. This is by design — the portal exists to provide a transparent, court-supervised communication channel for the protection of all parties, especially children.",
      },
      {
        heading: "10. Policy Updates & Contact",
        content:
          "Material changes to this policy will be communicated by email and in-app notification with 30 days' notice. Continued use constitutes acceptance. For privacy questions, data requests, or to report a concern: mstonerock@rooted21parenting.com.",
      },
    ],
  },

  consent: {
    title: "Consent Forms (3-in-1)",
    updated: "Last updated: May 10, 2026",
    sections: [
      {
        heading: "— CONSENT FORM 1 OF 3 —",
        content: "CO-PARENT PORTAL MONITORING CONSENT",
      },
      {
        heading: "What You Are Consenting To",
        content:
          "By using the Co-Parent Portal, I understand and consent to the following: ALL messages I send and receive through the Co-Parent Portal are recorded and stored permanently in the Rooted 21 system. These messages may be reviewed at any time by court-authorized monitors, guardians ad litem, assigned caseworkers, attorneys of record, and any other court-designated personnel with access to my case.",
      },
      {
        heading: "Court Evidence Acknowledgment",
        content:
          "I understand that Co-Parent Portal message logs may be subpoenaed or submitted as exhibits in family court proceedings without additional consent. I acknowledge that my messages in this portal constitute an official record and that I should communicate accordingly. I agree not to use this portal to send threatening, harassing, manipulative, or abusive messages.",
      },
      {
        heading: "No Deletion Rights",
        content:
          "I understand that I cannot delete messages once sent through the Co-Parent Portal. Message history is retained for the duration of the active case and may be archived thereafter per court order. I accept this as a condition of using supervised co-parenting communication through this platform.",
      },
      {
        heading: "— CONSENT FORM 2 OF 3 —",
        content: "COURT STAFF MONITORING AUTHORIZATION",
      },
      {
        heading: "What Court Staff May Access",
        content:
          "I, as the parent or legal guardian on this account, authorize court staff who have been granted credentials by a court of competent jurisdiction to access the following data related to my case: Co-Parent Portal message history; case file summaries and notes shared with my care team; case task and milestone records; meeting request and scheduling records; and any documents I have designated as shared with court staff.",
      },
      {
        heading: "What Court Staff Cannot Access",
        content:
          "Court staff are NOT authorized to access: my private journal entries (marked private); my personal billing information; my AI chat history from the general support chat; or any documents I have marked as private/personal only. I understand that court staff access is limited to case-relevant shared data and does not include my private personal records.",
      },
      {
        heading: "Audit Trail",
        content:
          "I understand that all court staff access to my data is logged with a timestamp and user identifier in the system's audit trail. I may request an access log at any time by emailing mstonerock@rooted21parenting.com.",
      },
      {
        heading: "— CONSENT FORM 3 OF 3 —",
        content: "CHILD PROFILE DATA USE AUTHORIZATION",
      },
      {
        heading: "Parental Authorization for Child Data Processing",
        content:
          "I confirm that I am the biological parent, adoptive parent, legal guardian, or court-authorized caregiver of the child(ren) whose information I am entering into Rooted 21. I have legal authority to authorize the collection and processing of this child's personal and behavioral data.",
      },
      {
        heading: "What Child Data Is Collected & How It Is Used",
        content:
          "I authorize Rooted 21 to collect and process the following child data I enter: name, age, placement type, behavioral observations, emotional regulation patterns, known triggers, trauma history notes, coping tools, school/IEP information, and care goals. This data is used ONLY to: generate AI-assisted parenting insights for my personal use; create behavioral trend reports I can share with my care team; and support professionals I explicitly authorize via access code.",
      },
      {
        heading: "COPPA Acknowledgment & Parental Control",
        content:
          "I understand that my child does not have an account and does not directly submit any data. All child information is entered by me as the authorized adult. I have the right to access, correct, and permanently delete my child's data at any time by submitting a request to mstonerock@rooted21parenting.com. I understand that child data is never sold, used for advertising, or shared with third parties without my explicit consent.",
      },
      {
        heading: "Professional Sharing of Child Data",
        content:
          "I understand that child profile data will ONLY be shared with professionals I explicitly authorize by providing them with a Rooted 21 access code. I can revoke professional access at any time in the app. I acknowledge that any professional I authorize is responsible for maintaining the confidentiality of my child's data under their own professional licensing and HIPAA obligations.",
      },
    ],
  },

  tbri: {
    title: "Trauma-Informed Terminology Guide",
    updated: "Last updated: May 10, 2026",
    sections: [
      {
        heading: "Why This Guide Exists",
        content:
          "Rooted 21 uses trauma-informed and attachment-based parenting language throughout the platform. This guide outlines the approved terminology used in our curriculum, directory, and coaching features so that all content remains consistent, clear, and legally sound.",
      },
      {
        heading: "Core Terminology We Use",
        content:
          "Rooted 21 uses: 'trauma-informed parenting' (general contexts); 'attachment-based parenting' (relationship and connection contexts); 'trust-based parenting' (informal coaching contexts); 'Empowerment Strategies' for building felt safety and autonomy; 'Connection-First Strategies' for relational attunement; 'Behavior Guidance Strategies' for addressing challenging behaviors.",
      },
      {
        heading: "Curriculum Language Standards",
        content:
          "In lesson and coaching content, Rooted 21 uses: 'trauma-informed care trained' for professional descriptions; 'trauma-informed parenting coach' for coaching roles; 'trust-building and regulation techniques' for practical strategies; 'trauma-informed parenting principles' for conceptual frameworks. All language is original to Rooted 21 or in general public use.",
      },
      {
        heading: "Professional Directory Tags",
        content:
          "Rooted 21 directory tags use original, descriptive language: 'Trauma-Informed Care'; 'Attachment-Based Therapy'; 'Trust-Based Parenting Support'; 'Regulation-Focused Coaching'. Professionals may describe their own training background in their personal bios using their own words. Rooted 21 does not verify, endorse, or warrant any professional's stated certifications.",
      },
      {
        heading: "What Professionals May Self-Describe",
        content:
          "Licensed professionals and coaches may describe their own training and credentials in their profile bios in their own words. These are the professional's own factual statements and are not claims made by Rooted 21. Rooted 21 does not verify, endorse, or warrant any professional's stated background or certifications.",
      },
      {
        heading: "AI Chat & Coaching Language",
        content:
          "In AI-generated responses and coaching features, Rooted 21 uses: 'trauma-informed parenting approach'; 'trust-building parenting strategies'; 'regulation-first parenting'; 'connection before correction' (general principle in common usage); 'felt safety and nurture' for attunement. All AI language is based on Rooted 21's own framework and publicly available parenting research.",
      },
      {
        heading: "App UI & Navigation Labels",
        content:
          "All UI labels use Rooted 21's own terminology: 'Trauma-Informed Practice Goal'; 'Parenting Principle in Focus'; 'Regulation Habits'; 'Trust-Building Habits'; 'trauma-informed parenting' in all taglines. The Weekly Habits tracker uses descriptive labels (e.g., 'Got curious and playful today') rather than framework-specific names.",
      },
      {
        heading: "Rooted 21 Methodology Statement",
        content:
          "Rooted 21's curriculum is built on Rooted 21's own trauma-informed parenting framework, drawing from publicly available attachment science, developmental research, and best practices in trauma-sensitive care. Our approach is inspired by the broader field of trauma-informed parenting and is original to Rooted 21, LLC.",
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

// Docs that support signing (tbri is a reference guide, not a consent form)
const SIGNABLE_DOCS = ["terms", "privacy", "consent"];

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
        subtitle="Terms, Privacy, Consent & Terminology"
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

          {/* Terminology guide note */}
          {activeTab === "tbri" && (
            <div className="rounded-xl p-4 mt-6 flex gap-3" style={{ background: "#FEF9EC", border: "1px solid #E8C96A" }}>
              <AlertTriangle size={14} color="#B87A0A" className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px]" style={{ color: "#7A5200" }}>
                <strong>Note:</strong> This is an internal reference guide, not a legal consent form. No signature is required for this document.
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