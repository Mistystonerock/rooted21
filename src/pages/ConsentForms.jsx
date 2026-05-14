import { useMemo, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import DocumentSigningModal from "@/components/legal/DocumentSigningModal";
import LegalFormTemplateCard from "@/components/forms/LegalFormTemplateCard";
import ReleaseInfoFields from "@/components/forms/ReleaseInfoFields";
import { AlertTriangle, FileCheck2, ShieldCheck } from "lucide-react";

const TEMPLATES = [
  {
    id: "release_information",
    title: "Release of Information Authorization",
    description: "Authorize a provider, agency, school, attorney, or case team member to share specified records.",
    sections: [
      ["Authorization", "I authorize the releasing party named above to disclose the information identified in this form to the recipient named above for the stated purpose."],
      ["Information Covered", "This release is limited to the specific records or information listed in the form details, unless otherwise required by law."],
      ["Expiration and Revocation", "This authorization expires on the listed expiration date. I understand I may revoke this authorization in writing, except where action has already been taken in reliance on it."],
      ["Acknowledgment", "I understand that signing this form allows the named parties to exchange the authorized information for care coordination, case planning, legal preparation, or court-related documentation."],
    ],
  },
  {
    id: "court_team_consent",
    title: "Court / Case Team Consent Form",
    description: "Consent to share relevant case progress information with court-connected professionals or case team members.",
    sections: [
      ["Consent", "I consent to the sharing of relevant case progress, service participation, communication summaries, and supporting documentation with the authorized court or case team recipient named above."],
      ["Scope", "This consent is limited to information reasonably necessary for case review, service coordination, reunification planning, permanency planning, or court preparation."],
      ["Limits", "This form does not authorize disclosure beyond the recipient, purpose, and information described in the form details."],
      ["Acknowledgment", "I understand this document should be reviewed before use and may need to be accepted by the receiving agency, provider, or court."],
    ],
  },
  {
    id: "school_medical_release",
    title: "School / Medical Records Release",
    description: "Authorize exchange of school, IEP, medical, therapy, medication, or appointment records.",
    sections: [
      ["Authorization", "I authorize the school, medical provider, therapist, or agency named above to release the listed records for the child named in this form."],
      ["Records Included", "Records may include the specific school, IEP, medical, therapy, medication, attendance, appointment, or care coordination information listed in the form details."],
      ["Purpose", "The purpose of this release is to support care coordination, court preparation, case planning, and child welfare documentation."],
      ["Expiration", "This authorization remains valid until the listed expiration date unless revoked in writing earlier."],
    ],
  },
  {
    id: "platform_data_consent",
    title: "Rooted 21 Data Sharing Consent",
    description: "Consent to share selected Rooted 21 records, reports, checklists, and communication logs.",
    sections: [
      ["Consent to Share Platform Records", "I consent to sharing selected Rooted 21 records with the authorized recipient named above."],
      ["Records Included", "Shared records may include selected case plan checklist progress, signed documents, care calendar entries, communication audit logs, and court-ready summaries identified by me."],
      ["User Control", "I understand that I control which records are generated, exported, signed, or shared from my account."],
      ["Acknowledgment", "I understand this consent supports documentation and coordination, and I should consult legal counsel before submitting records to court."],
    ],
  },
];

function buildDocument(template, values) {
  const detailSections = [
    { heading: "Parent / Caregiver", content: values.parentName || "Not provided" },
    { heading: "Child", content: values.childName || "Not provided" },
    { heading: "Releasing Party", content: values.releasingParty || "Not provided" },
    { heading: "Authorized Recipient", content: values.recipientParty || "Not provided" },
    { heading: "Purpose", content: values.purpose || "Care coordination, case planning, legal preparation, or court-related documentation." },
    { heading: "Authorized Information", content: values.authorizedInfo || "Relevant records and documentation selected by the signer." },
    { heading: "Expiration Date", content: values.expirationDate || "Not specified" },
  ];

  return {
    title: template.title,
    sections: [
      ...detailSections,
      ...template.sections.map(([heading, content]) => ({ heading, content })),
      { heading: "Important Notice", content: "This form is a preparation and documentation tool. Requirements may vary by agency, court, provider, and jurisdiction. Review with legal counsel before submission." },
    ],
  };
}

export default function ConsentForms() {
  const [user, setUser] = useState(null);
  const [selectedId, setSelectedId] = useState("release_information");
  const [showSigning, setShowSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [values, setValues] = useState({
    parentName: "",
    childName: "",
    releasingParty: "",
    recipientParty: "",
    purpose: "",
    authorizedInfo: "",
    expirationDate: "",
  });

  useEffect(() => {
    base44.auth.me().then(me => {
      setUser(me);
      setValues(prev => ({ ...prev, parentName: me.full_name || me.email }));
    });
  }, []);

  const selectedTemplate = useMemo(() => TEMPLATES.find(t => t.id === selectedId) || TEMPLATES[0], [selectedId]);
  const document = useMemo(() => buildDocument(selectedTemplate, values), [selectedTemplate, values]);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Consent & Release Forms" subtitle="Fill, preview, sign, and save" backTo="/dashboard" />
      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">
        <section className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} color="#fff" />
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase" style={{ color: C.cream }}>Secure legal documentation</p>
              <h1 className="font-serif font-bold text-2xl mt-1" style={{ color: "#fff" }}>Consent and release forms</h1>
            </div>
          </div>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.cream }}>Create signed consent forms and release of information authorizations, then store copies in Secure Documents.</p>
        </section>

        <div className="rounded-xl p-3.5 flex gap-3" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <AlertTriangle size={15} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>These templates help prepare records but may not replace agency- or court-required forms. Review before submitting.</p>
        </div>

        {signed && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
            <FileCheck2 size={20} color={C.midGreen} />
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Signed form saved to Secure Documents.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[360px_1fr] gap-4 items-start">
          <div className="space-y-3">
            {TEMPLATES.map(template => (
              <LegalFormTemplateCard
                key={template.id}
                template={template}
                selected={selectedId === template.id}
                onSelect={() => setSelectedId(template.id)}
              />
            ))}
          </div>

          <div className="space-y-4">
            <ReleaseInfoFields values={values} onChange={setValues} />
            <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Preview: {document.title}</p>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {document.sections.map((section, index) => (
                  <div key={index} className="pb-3" style={{ borderBottom: `1px solid ${C.cream}` }}>
                    <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{section.heading}</p>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.darkText }}>{section.content}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowSigning(true)}
                className="w-full rounded-xl py-3 mt-4 text-sm font-bold"
                style={{ background: C.darkGreen, color: "#fff", border: "none" }}
              >
                Sign & save form
              </button>
            </div>
          </div>
        </div>
        <div className="pb-8" />
      </main>

      {showSigning && (
        <DocumentSigningModal
          document={document}
          user={user}
          onClose={() => setShowSigning(false)}
          onSigned={() => setSigned(true)}
        />
      )}
    </div>
  );
}