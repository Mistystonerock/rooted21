import { useState } from "react";
import { Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const CONSENT_KEY = "rooted21_child_data_consent_v1";

export function hasChildDataConsent() {
  try {
    const s = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    return s?.accepted === true;
  } catch { return false; }
}

export function recordChildDataConsent(userEmail) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    accepted: true,
    email: userEmail,
    timestamp: new Date().toISOString(),
  }));
}

async function saveConsentToDatabase(userEmail, accepted) {
  try {
    await base44.functions.invoke("saveConsent", {
      consent_type: "child_data",
      accepted,
      consent_version: "1.0",
    });
  } catch (error) {
    console.error("Failed to save child data consent to database:", error);
  }
}

const DISCLOSURES = [
  {
    emoji: "📋",
    title: "ORC §1349.09 — Ohio Child Data Protection",
    body: "Under Ohio Revised Code §1349.09, Rooted 21 is required to obtain your explicit authorization before collecting, storing, or processing personal data about any child in your care.",
  },
  {
    emoji: "🧒",
    title: "What child data we collect",
    body: "Name, age, placement type, behavioral observations, known triggers, trauma history notes, coping tools, IEP/school information, care goals, and medication records — entered solely by you as the authorized adult caregiver.",
  },
  {
    emoji: "🔒",
    title: "How it is protected",
    body: "Child data is encrypted at rest (AES-256) and in transit (TLS 1.3). It is never sold, used for advertising, or shared with AI training datasets. It is only shared with professionals you explicitly authorize via access code.",
  },
  {
    emoji: "⚖️",
    title: "Court & legal access",
    body: "Data may be disclosed in response to a valid Ohio court order or subpoena. You will be notified unless prohibited by law. You may export or request deletion of all child data at any time.",
  },
  {
    emoji: "🗑️",
    title: "Your deletion rights",
    body: "You may request permanent deletion of all child profile data at any time by emailing mstonerock@rooted21parenting.com. Deletion is completed within 30 days.",
  },
];

export default function ChildDataConsentModal({ user, onAccept }) {
  const [checked, setChecked] = useState(false);

  async function handleAccept() {
    if (!checked) return;
    recordChildDataConsent(user?.email || "");
    await saveConsentToDatabase(user?.email || "", true);
    onAccept();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <div className="w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ background: C.offWhite, maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: C.darkGreen }}>
          <Shield size={20} color={C.gold} />
          <div className="flex-1">
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Ohio Child Data Authorization</p>
            <p className="text-[10px]" style={{ color: C.lightGreen }}>Required under ORC §1349.09 — one time</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
            Before you create or update a child's profile, Ohio law requires your explicit written authorization for how we collect and use that child's personal data.
          </p>

          <div className="space-y-2.5">
            {DISCLOSURES.map((d, i) => (
              <div key={i} className="flex gap-3 rounded-xl p-3"
                style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <span className="text-base flex-shrink-0">{d.emoji}</span>
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: C.darkGreen }}>{d.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{d.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl cursor-pointer"
            style={{ background: checked ? "#EAF4EA" : C.white, border: `1.5px solid ${checked ? C.midGreen : C.cream}` }}>
            <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
              style={{ width: 16, height: 16, accentColor: C.midGreen }} />
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
              <strong>I authorize Rooted 21</strong> to collect and process the child data I enter, as described above, in accordance with Ohio Revised Code §1349.09. I confirm I am the authorized adult caregiver for this child.
            </p>
          </label>

          <p className="text-[11px]" style={{ color: C.mutedText }}>
            Full details in our{" "}
            <Link to="/legal" style={{ color: C.midGreen, fontWeight: "bold" }}>Privacy Policy & Consent Forms</Link>.
          </p>

          <button onClick={handleAccept} disabled={!checked}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: checked ? C.darkGreen : C.cream,
              color: checked ? "#fff" : C.mutedText,
              border: "none", cursor: checked ? "pointer" : "default",
            }}>
            <CheckCircle2 size={16} />
            I Authorize — Continue to Child Profiles
          </button>
          <div className="pb-2" />
        </div>
      </div>
    </div>
  );
}