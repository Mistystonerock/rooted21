import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { base44 } from "@/api/base44Client";

export function hasMandatoryReporterAck(userEmail) {
  try {
    const key = `rooted21_mandatory_reporter_ack_${userEmail}`;
    const s = JSON.parse(localStorage.getItem(key) || "null");
    return s?.acknowledged === true;
  } catch {
    return false;
  }
}

export function recordMandatoryReporterAck(userEmail) {
  const key = `rooted21_mandatory_reporter_ack_${userEmail}`;
  localStorage.setItem(key, JSON.stringify({
    acknowledged: true,
    email: userEmail,
    timestamp: new Date().toISOString(),
  }));
}

async function saveMandatoryReporterAckToDatabase(userEmail) {
  try {
    await base44.functions.invoke("saveConsent", {
      consent_type: "mandatory_reporter",
      accepted: true,
      consent_version: "1.0",
    });
  } catch (error) {
    console.error("Failed to save mandatory reporter acknowledgment:", error);
  }
}

const TERMS = [
  {
    emoji: "⚖️",
    title: "Legal Obligation",
    body: "As a professional (therapist, caseworker, educator, medical provider, judge), you are a mandatory reporter under Ohio law.",
  },
  {
    emoji: "📋",
    title: "ORC §2151.421",
    body: "You must report suspected child abuse or neglect to Ohio child protective services or law enforcement — regardless of where you observe it.",
  },
  {
    emoji: "🚨",
    title: "This Platform Does NOT Replace Reporting",
    body: "Using Rooted 21 does not satisfy your mandatory reporting obligation. You must still call 1-855-OH-CHILD or local authorities directly.",
  },
  {
    emoji: "🔍",
    title: "Your Professional Judgment Rules",
    body: "If you observe indicators of abuse or neglect in this platform, you remain responsible for making the report. Do not delay reporting while using the app.",
  },
];

export default function MandatoryReporterModal({ user, onAcknowledge }) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAcknowledge() {
    if (!checked) return;
    setLoading(true);
    recordMandatoryReporterAck(user?.email || "");
    await saveMandatoryReporterAckToDatabase(user?.email || "");
    setLoading(false);
    onAcknowledge();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ background: C.offWhite, maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #b84c2a 0%, #8a3620 100%)" }}
        >
          <AlertTriangle size={20} color={C.cream} />
          <div className="flex-1">
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
              Mandatory Reporter Notice
            </p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.8)" }}>
              Required acknowledgment under Ohio law
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div
            className="rounded-xl p-3 flex gap-2 items-start"
            style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}
          >
            <AlertTriangle size={13} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-bold" style={{ color: "#B84C2A" }}>
              You are using Rooted 21 as a professional. This notice outlines your legal obligations under Ohio law.
            </p>
          </div>

          <div className="space-y-2.5">
            {TERMS.map((term, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl p-3"
                style={{ background: C.white, border: `1px solid ${C.cream}` }}
              >
                <span className="text-base flex-shrink-0">{term.emoji}</span>
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: C.darkGreen }}>
                    {term.title}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
                    {term.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl p-3 flex gap-2 items-start"
            style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
          >
            <AlertTriangle size={13} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
              <strong>Report suspected abuse immediately:</strong> Call 1-855-OH-CHILD (Ohio Child Protective Services) or 911. Do not wait. Do not delay.
            </p>
          </div>

          {/* Acknowledgment checkbox */}
          <label
            className="flex items-start gap-3 p-3 rounded-xl cursor-pointer"
            style={{
              background: checked ? "#EAF4EA" : C.white,
              border: `1.5px solid ${checked ? C.midGreen : C.cream}`,
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
              style={{ width: 16, height: 16, accentColor: C.midGreen }}
            />
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
              <strong>I acknowledge</strong> that I am a mandatory reporter under Ohio law (ORC §2151.421) and understand that using this platform does not satisfy my reporting obligations. I will report suspected abuse or neglect directly to authorities.
            </p>
          </label>

          <p className="text-[10px]" style={{ color: C.mutedText }}>
            This acknowledgment will be recorded and retained per our privacy policy.
          </p>

          {/* Action button */}
          <button
            onClick={handleAcknowledge}
            disabled={!checked || loading}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: checked && !loading ? C.darkGreen : C.cream,
              color: checked && !loading ? "#fff" : C.mutedText,
              border: "none",
              cursor: checked && !loading ? "pointer" : "default",
            }}
          >
            <CheckCircle2 size={15} />
            {loading ? "Saving acknowledgment..." : "I Acknowledge — Continue"}
          </button>

          <div className="pb-2" />
        </div>
      </div>
    </div>
  );
}