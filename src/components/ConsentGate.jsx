import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const CONSENT_KEY = "rooted21_consent_signed";

const CONSENT_ITEMS = [
  {
    heading: "I understand Rooted 21 is educational support, NOT medical care",
    body: "This app is not a substitute for professional mental health treatment, therapy, or emergency services.",
  },
  {
    heading: "I consent to data collection & secure storage",
    body: "Rooted 21 will securely store my family's information, check-ins, goals, and behavioral data to provide personalized support.",
  },
  {
    heading: "I control who sees my family's data",
    body: "When I share an access code with a professional, I am explicitly consenting to share my family's data with that person. I can revoke access at any time.",
  },
  {
    heading: "I consent to AI-powered features",
    body: "Rooted 21 uses AI to provide guidance and insights. This is not personalized medical advice — I will verify suggestions with my professional care team.",
  },
  {
    heading: "I am the parent or legal guardian of any child I add",
    body: "I take full responsibility for my family's use of this app and understand it is a support tool, not a replacement for professional care.",
  },
  {
    heading: "I know how to reach emergency help",
    body: "In a crisis: call or text 988 (Suicide & Crisis Lifeline) or 911 for immediate danger.",
  },
];

export function hasSignedConsent() {
  return localStorage.getItem(CONSENT_KEY) === "true";
}

export default function ConsentGate({ children }) {
  const [signed, setSigned] = useState(hasSignedConsent);
  const [checked, setChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleAgree() {
    if (!checked) return;
    localStorage.setItem(CONSENT_KEY, "true");
    setSubmitted(true);
    setTimeout(() => setSigned(true), 600);
  }

  if (signed) return children;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-y-auto"
      style={{ background: C.offWhite }}
    >
      <div className="max-w-[520px] mx-auto w-full px-4 py-8 space-y-5">

        {/* Header */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🌳</p>
          <p className="font-serif font-bold text-lg" style={{ color: C.cream }}>
            Welcome to Rooted 21
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Before you begin, please review and sign our consent agreement. This only takes a moment.
          </p>
        </div>

        {/* Consent items */}
        <div className="space-y-2.5">
          {CONSENT_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-4 flex gap-3"
              style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}
            >
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5"
                style={{ background: C.cream, color: C.darkGreen }}
              >
                {i + 1}
              </div>
              <div>
                <p className="font-bold text-xs leading-snug mb-0.5" style={{ color: C.darkGreen }}>
                  {item.heading}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Crisis banner */}
        <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <AlertTriangle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px]" style={{ color: "#B84C2A" }}>
            In crisis? Call or text <strong>988</strong> anytime. In immediate danger, call <strong>911</strong>.
          </p>
        </div>

        {/* Checkbox */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#fff", border: `1.5px solid ${checked ? C.midGreen : C.cream}` }}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 flex-shrink-0"
              style={{ accentColor: C.darkGreen }}
            />
            <span className="text-xs leading-relaxed font-bold" style={{ color: C.darkGreen }}>
              I have read and agree to all of the above. I understand Rooted 21 is a parenting support tool and not a medical service. I am the parent or legal guardian responsible for my family's use of this app.
            </span>
          </label>
        </div>

        {/* Sign button */}
        <button
          onClick={handleAgree}
          disabled={!checked || submitted}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all"
          style={{
            background: checked ? C.darkGreen : C.cream,
            color: checked ? "#fff" : C.mutedText,
            border: "none",
            cursor: checked ? "pointer" : "default",
            opacity: submitted ? 0.7 : 1,
          }}
        >
          {submitted ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Consent Signed — Entering App…
            </span>
          ) : (
            "✅ I Agree — Enter Rooted 21"
          )}
        </button>

        <p className="text-center text-[10px]" style={{ color: C.mutedText }}>
          Questions? Email mstonerock@rooted21parenting.com
        </p>

        <div className="pb-6" />
      </div>
    </div>
  );
}