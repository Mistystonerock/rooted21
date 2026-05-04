import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, FileText, ScrollText, AlertTriangle, CheckCircle2 } from "lucide-react";

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
          "By accessing and using Rooted 21, you accept and agree to be bound by the terms of this agreement. If you do not agree to these terms, please do not use this service.",
      },
      {
        heading: "2. Use License",
        content:
          "Permission is granted to temporarily download one copy of the materials (information or software) on Rooted 21 for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software contained on Rooted 21; remove any copyright or other proprietary notations from the materials; transfer the materials to another person or \"mirror\" the materials on any other server.",
      },
      {
        heading: "3. Disclaimer",
        content:
          "The materials on Rooted 21 are provided 'as is'. Rooted 21 makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
      },
      {
        heading: "4. Limitations",
        content:
          "In no event shall Rooted 21 or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Rooted 21, even if Rooted 21 or a representative has been notified orally or in writing of the possibility of such damage.",
      },
      {
        heading: "5. Accuracy of Materials",
        content:
          "The materials appearing on Rooted 21 could include technical, typographical, or photographic errors. Rooted 21 does not warrant that any of the materials on its website are accurate, complete, or current. Rooted 21 may make changes to the materials contained on its website at any time without notice.",
      },
      {
        heading: "6. Links",
        content:
          "Rooted 21 has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Rooted 21 of the site. Use of any such linked website is at the user's own risk.",
      },
      {
        heading: "7. Modifications",
        content:
          "Rooted 21 may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.",
      },
      {
        heading: "8. Governing Law",
        content:
          "These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
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
          "We collect information you provide directly, such as your name, email, phone number, and child profile information. We also collect information about your usage of the app, including check-ins, goals, lessons completed, and journal entries. All data is encrypted and stored securely.",
      },
      {
        heading: "2. How We Use Your Information",
        content:
          "Your information is used to: provide and improve the Rooted 21 service; send notifications about your progress and account; connect you with assigned professionals via secure messaging; generate personalized insights and reports; and comply with legal obligations.",
      },
      {
        heading: "3. Data Sharing with Professionals",
        content:
          "Only when you explicitly grant access via an access code does a professional (therapist, caseworker, counselor) gain permission to view your family's data. You control exactly which professionals have access and can revoke access at any time.",
      },
      {
        heading: "4. Data Security",
        content:
          "We implement industry-standard security measures to protect your personal information, including encryption at rest and in transit, regular security audits, and limited access controls. However, no method of transmission over the internet is 100% secure.",
      },
      {
        heading: "5. Data Retention",
        content:
          "Your data is retained for as long as your account is active. Upon account deletion, personal data is removed within 30 days, though aggregated analytics may be retained indefinitely.",
      },
      {
        heading: "6. Third-Party Services",
        content:
          "We use third-party services (SMS notifications via Twilio, email services) to deliver certain features. These services are bound by their own privacy policies. We do not sell or rent your personal information to third parties.",
      },
      {
        heading: "7. Children's Privacy",
        content:
          "Parents/guardians are responsible for managing account data. We do not knowingly collect information directly from children. All data collected about children is managed by their parent or legal guardian.",
      },
      {
        heading: "8. Your Rights",
        content:
          "You have the right to access, correct, or delete your personal data at any time. Contact support to exercise these rights. Residents of certain states/regions may have additional privacy rights.",
      },
      {
        heading: "9. Contact Us",
        content:
          'If you have questions about our privacy practices, please contact us at privacy@rooted21.org or through the contact form in the app.',
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
          "Rooted 21 is provided 'as is' without warranty. We are not liable for any outcomes, improvements, or worsening of your child's behavior or your parenting situation resulting from use of this app.",
      },
      {
        heading: "7. Parental Responsibility",
        content:
          "Parents and guardians remain fully responsible for their child's care, safety, and wellbeing. Use of Rooted 21 does not create a therapeutic or fiduciary relationship between you and Rooted 21.",
      },
      {
        heading: "8. Acknowledgment",
        content:
          "By using Rooted 21, you acknowledge that you have read and understand these disclaimers and accept responsibility for any decisions made based on information provided by this app.",
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

export default function Legal() {
  const [activeTab, setActiveTab] = useState("terms");
  const activeDoc = CONTENT[activeTab];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* HEADER */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard">
          <ChevronLeft size={20} color={C.cream} />
        </Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
            Legal Documents
          </p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>
            Terms, Privacy, Disclaimers & Consent
          </p>
        </div>
      </div>

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

          {/* Consent Checkbox (only for consent tab) */}
          {activeTab === "consent" && (
            <div className="rounded-xl p-4 mt-6" style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` }}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4"
                  style={{ accentColor: C.darkGreen }}
                />
                <span className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
                  I acknowledge that I have read and agree to all consent forms, understand the limitations of Rooted 21, and take responsibility for my family's use of this app.
                </span>
              </label>
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
    </div>
  );
}