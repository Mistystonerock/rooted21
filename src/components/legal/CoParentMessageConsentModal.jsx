import { useState } from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { Link } from "react-router-dom";

const CONSENT_KEY = "rooted21_coparent_msg_consent_v1";

export function hasCoParentMessageConsent() {
  try {
    const s = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    return s?.accepted === true;
  } catch { return false; }
}

export function recordCoParentMessageConsent(userEmail) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    accepted: true,
    email: userEmail,
    timestamp: new Date().toISOString(),
  }));
}

const TERMS = [
  {
    emoji: "⚖️",
    title: "All messages are court-admissible records",
    body: "Every message you send through the Co-Parent Portal is permanently logged, timestamped, and cryptographically hashed for tamper detection. These records may be submitted as evidence in Ohio family court proceedings under ORC §3109.04 without further consent.",
  },
  {
    emoji: "👁️",
    title: "Court staff may review at any time",
    body: "Judges, guardians ad litem, CASA volunteers, attorneys of record, and court-authorized caseworkers assigned to your case may access the full message history at any time — with or without prior notice to you.",
  },
  {
    emoji: "🔒",
    title: "Messages cannot be deleted",
    body: "You cannot edit or delete any message once sent. The permanent record exists to protect all parties — especially the child.",
  },
  {
    emoji: "🚫",
    title: "Prohibited content",
    body: "Threatening, harassing, manipulative, abusive, or intimidating messages are prohibited and may be flagged for immediate court review. Violations may result in account suspension and referral to law enforcement.",
  },
  {
    emoji: "📋",
    title: "Consent to monitoring",
    body: "By using this messaging portal, you explicitly consent to monitoring by Rooted 21 and authorized court personnel. This is a supervised communication channel, not a private chat.",
  },
  {
    emoji: "🔏",
    title: "SHA-256 tamper-proof audit log",
    body: "Each message is independently hashed and stored in an immutable audit log (MessageAuditLog). Any attempt to alter a message will be detectable by comparing hash values.",
  },
];

export default function CoParentMessageConsentModal({ user, onAccept, onDecline }) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const allChecked = checked1 && checked2;

  function handleAccept() {
    if (!allChecked) return;
    recordCoParentMessageConsent(user?.email || "");
    onAccept();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}>
      <div className="w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ background: C.offWhite, maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: C.darkGreen }}>
          <ShieldCheck size={20} color={C.gold} />
          <div className="flex-1">
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
              Co-Parent Portal — Consent to Monitoring
            </p>
            <p className="text-[10px]" style={{ color: C.lightGreen }}>
              Required before you can send messages · ORC §3109.04
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="rounded-xl p-3 flex gap-2 items-start"
            style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
            <AlertTriangle size={13} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-bold" style={{ color: "#B84C2A" }}>
              This is a court-supervised communication channel. All messages are permanently recorded and may be used as evidence in family court.
            </p>
          </div>

          <div className="space-y-2.5">
            {TERMS.map((t, i) => (
              <div key={i} className="flex gap-3 rounded-xl p-3"
                style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <span className="text-base flex-shrink-0">{t.emoji}</span>
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: C.darkGreen }}>{t.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{t.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dual checkboxes for extra legal weight */}
          <label className="flex items-start gap-3 p-3 rounded-xl cursor-pointer"
            style={{ background: checked1 ? "#EAF4EA" : C.white, border: `1.5px solid ${checked1 ? C.midGreen : C.cream}` }}>
            <input type="checkbox" checked={checked1} onChange={e => setChecked1(e.target.checked)}
              className="mt-0.5 flex-shrink-0" style={{ width: 16, height: 16, accentColor: C.midGreen }} />
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
              <strong>I understand</strong> that all messages I send through this portal are permanently recorded, court-admissible, and may be reviewed by authorized court personnel at any time.
            </p>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl cursor-pointer"
            style={{ background: checked2 ? "#EAF4EA" : C.white, border: `1.5px solid ${checked2 ? C.midGreen : C.cream}` }}>
            <input type="checkbox" checked={checked2} onChange={e => setChecked2(e.target.checked)}
              className="mt-0.5 flex-shrink-0" style={{ width: 16, height: 16, accentColor: C.midGreen }} />
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
              <strong>I consent to monitoring</strong> of this communication channel by Rooted 21 and court-authorized parties as a condition of using the Co-Parent Portal.
            </p>
          </label>

          <p className="text-[11px]" style={{ color: C.mutedText }}>
            Full terms in our{" "}
            <Link to="/legal" style={{ color: C.midGreen, fontWeight: "bold" }}>Terms of Service — Section 3</Link>.
          </p>

          <div className="flex gap-3">
            <button onClick={onDecline}
              className="flex-1 py-3 rounded-xl font-bold text-sm"
              style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleAccept} disabled={!allChecked}
              className="flex-[2] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: allChecked ? C.darkGreen : C.cream,
                color: allChecked ? "#fff" : C.mutedText,
                border: "none", cursor: allChecked ? "pointer" : "default",
              }}>
              <CheckCircle2 size={15} />
              I Consent — Enter Messaging
            </button>
          </div>
          <div className="pb-2" />
        </div>
      </div>
    </div>
  );
}