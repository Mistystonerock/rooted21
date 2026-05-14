import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import TreeLogo from "@/components/rooted/TreeLogo";

const LAST_UPDATED = "May 11, 2026";
const COMPANY = "Rooted 21 Parenting Network LLC";
const STATE = "Ohio";
const CONTACT_EMAIL = "admin@rooted21parenting.com";

export default function LegalPolicy() {
  return (
    <div className="min-h-screen font-sans" style={{ background: C.offWhite }}>
      <MobileHeader title="Legal & Privacy" subtitle="Terms of Use & Privacy Policy" backTo="/" />

      <div className="max-w-[680px] mx-auto px-5 py-8 space-y-8">

        {/* Header */}
        <div className="text-center">
          <TreeLogo size={40} />
          <h1 className="font-serif font-bold text-2xl mt-3" style={{ color: C.darkGreen }}>
            Terms of Use & Privacy Policy
          </h1>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>
            Last Updated: {LAST_UPDATED}
          </p>
          <div className="mt-3 inline-block px-4 py-1.5 rounded-full text-[11px] font-bold"
            style={{ background: C.cream, color: C.brown }}>
            Governed by the Laws of the State of Ohio
          </div>
        </div>

        {/* Intro */}
        <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="text-sm leading-relaxed" style={{ color: "#3a3028" }}>
            Welcome to <strong>{COMPANY}</strong> ("Rooted 21," "we," "us," or "our"). These Terms of Use and Privacy Policy govern your access to and use of our mobile application, website, and related services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these terms.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "#3a3028" }}>
            This Platform is intended for <strong>adults (18 years of age or older)</strong> who are acting as parents, caregivers, foster parents, adoptive parents, kinship caregivers, or related professionals. Children do not directly create accounts or submit personal data through this Platform.
          </p>
        </div>

        {/* Section 1 */}
        <Section title="1. Governing Law & Jurisdiction">
          <p>These Terms are governed by and construed in accordance with the laws of the <strong>State of Ohio</strong>, without regard to its conflict of law provisions. Any disputes arising from or related to your use of this Platform shall be subject to the exclusive jurisdiction of the state and federal courts located in <strong>Ohio</strong>.</p>
          <p className="mt-2">Applicable Ohio statutes include but are not limited to:</p>
          <ul className="mt-2 space-y-1 list-disc pl-5 text-sm" style={{ color: "#3a3028" }}>
            <li><strong>Ohio Revised Code (ORC) Chapter 1347</strong> – Personal Information Systems</li>
            <li><strong>ORC § 1349.19</strong> – Data Breach Notification Requirements</li>
            <li><strong>ORC § 1349.191 & 1349.192</strong> – Safe Harbor for Data Security</li>
            <li><strong>Ohio Consumer Sales Practices Act (OCSPA), ORC § 1345</strong> – Consumer Protection</li>
          </ul>
        </Section>

        {/* Section 2 */}
        <Section title="2. Eligibility & Account Use">
          <p>You must be at least <strong>18 years old</strong> to create an account and use this Platform. By registering, you represent and warrant that you meet this requirement. This Platform is designed exclusively for adults acting in a parenting or caregiving capacity.</p>
          <p className="mt-2">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access.</p>
        </Section>

        {/* Section 3 */}
        <Section title="3. Privacy Policy & Data Collection">
          <p className="font-bold" style={{ color: C.darkGreen }}>What We Collect</p>
          <p className="mt-1">We collect information you voluntarily provide, including:</p>
          <ul className="mt-1 space-y-1 list-disc pl-5">
            <li>Name and email address (for account creation)</li>
            <li>City/location (optional, for local resource matching)</li>
            <li>Family type and caregiving role</li>
            <li>Case-related notes, documents, and records you choose to store</li>
            <li>App usage and interaction data for platform improvement</li>
          </ul>

          <p className="font-bold mt-4" style={{ color: C.darkGreen }}>Children's Data</p>
          <p className="mt-1">Our Platform does not knowingly collect personal information directly from children. Any information about children (such as names used in case notes) is entered solely by the adult caregiver account holder and is protected under their account privacy.</p>

          <p className="font-bold mt-4" style={{ color: C.darkGreen }}>How We Use Your Data</p>
          <ul className="mt-1 space-y-1 list-disc pl-5">
            <li>To provide and improve Platform features</li>
            <li>To personalize your experience and recommendations</li>
            <li>To send service-related communications</li>
            <li>To comply with applicable legal obligations</li>
          </ul>

          <p className="font-bold mt-4" style={{ color: C.darkGreen }}>We Do Not Sell Your Data</p>
          <p className="mt-1">We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
        </Section>

        {/* Section 4 */}
        <Section title="4. Data Security (Ohio ORC § 1349.191)">
          <p>We take reasonable and appropriate measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. We maintain a written data security program consistent with <strong>Ohio's Data Protection Act (ORC § 1349.191 and § 1349.192)</strong>, which provides safe harbor protections for businesses that implement recognized cybersecurity frameworks.</p>
          <p className="mt-2">In the event of a data breach involving your personal information, we will notify you as required under <strong>ORC § 1349.19</strong> within the timeframes prescribed by Ohio law.</p>
        </Section>

        {/* Section 5 */}
        <Section title="5. Data Retention & Deletion">
          <p>You may request deletion of your account and associated personal data at any time by contacting us at <strong>{CONTACT_EMAIL}</strong>. We will process deletion requests within 30 days, subject to any legal obligations that require us to retain certain records.</p>
        </Section>

        {/* Section 6 */}
        <Section title="6. Disclaimer of Professional Advice">
          <p>The content, tools, and resources provided through Rooted 21 are for <strong>educational and informational purposes only</strong>. Nothing on this Platform constitutes legal, medical, psychological, or professional advice. You should always consult a qualified professional for advice specific to your situation.</p>
          <p className="mt-2">Rooted 21 is not a licensed mental health provider, legal services organization, or child welfare agency.</p>
        </Section>

        {/* Section 7 */}
        <Section title="7. Limitation of Liability">
          <p>To the maximum extent permitted by Ohio law, {COMPANY} and its officers, employees, and agents shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Platform.</p>
          <p className="mt-2">Our total liability to you for any claim arising under these Terms shall not exceed the amount you paid to use the Platform in the 12 months preceding the claim.</p>
        </Section>

        {/* Section 8 */}
        <Section title="8. Consumer Protection (OCSPA)">
          <p>We are committed to fair and honest practices in compliance with the <strong>Ohio Consumer Sales Practices Act (ORC § 1345)</strong>. If you believe we have engaged in an unfair, deceptive, or unconscionable consumer sales practice, you may file a complaint with the <strong>Ohio Attorney General's Office</strong> at <a href="https://www.ohioattorneygeneral.gov" target="_blank" rel="noopener noreferrer" style={{ color: C.midGreen }}>ohioattorneygeneral.gov</a>.</p>
        </Section>

        {/* Section 9 */}
        <Section title="9. Changes to These Terms">
          <p>We reserve the right to update these Terms at any time. We will notify registered users of material changes via email or in-app notification. Continued use of the Platform after changes become effective constitutes your acceptance of the revised Terms.</p>
        </Section>

        {/* Section 10 */}
        <Section title="10. Contact Us">
          <p>If you have questions, concerns, or requests regarding these Terms or your data, please contact us:</p>
          <div className="mt-3 rounded-xl p-4" style={{ background: C.offWhite }}>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{COMPANY}</p>
            <p className="text-sm mt-1" style={{ color: "#3a3028" }}>State of Incorporation / Operations: <strong>Ohio</strong></p>
            <p className="text-sm" style={{ color: "#3a3028" }}>Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: C.midGreen }}>{CONTACT_EMAIL}</a></p>
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center pb-8 pt-2">
          <p className="text-[10px]" style={{ color: C.mutedText }}>
            © {new Date().getFullYear()} {COMPANY}. All rights reserved. | Governed by Ohio Law
          </p>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
      <h2 className="font-serif font-bold text-base mb-3" style={{ color: C.darkGreen }}>{title}</h2>
      <div className="text-sm leading-relaxed space-y-1" style={{ color: "#3a3028" }}>
        {children}
      </div>
    </div>
  );
}