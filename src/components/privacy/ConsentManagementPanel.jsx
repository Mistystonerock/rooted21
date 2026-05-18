import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ClipboardCheck } from "lucide-react";

const consentTypes = [
  ["ai", "AI support tools"],
  ["child_data", "Child and family records"],
  ["coparenting_messages", "Co-parenting messages"]
];

export default function ConsentManagementPanel({ user }) {
  const [consents, setConsents] = useState([]);

  useEffect(() => {
    if (user?.email) base44.entities.Consent.filter({ user_email: user.email }, "-timestamp", 50).then(setConsents);
  }, [user?.email]);

  async function recordConsent(type, accepted) {
    const created = await base44.entities.Consent.create({ user_email: user.email, consent_type: type, accepted, consent_version: "2026.05", timestamp: new Date().toISOString(), notes: accepted ? "User accepted in Privacy Center" : "User declined in Privacy Center" });
    setConsents(prev => [created, ...prev]);
  }

  function latest(type) {
    return consents.find(item => item.consent_type === type);
  }

  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <p className="flex items-center gap-2 font-serif text-base font-bold" style={{ color: C.darkGreen }}><ClipboardCheck size={16} /> Consent management</p>
      <p className="mt-1 text-xs" style={{ color: C.mutedText }}>You can change consent choices. We keep a timestamped history for accountability.</p>
      <div className="mt-3 space-y-2">
        {consentTypes.map(([type, label]) => {
          const item = latest(type);
          return (
            <div key={type} className="rounded-xl p-3" style={{ background: C.offWhite }}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-black" style={{ color: C.darkGreen }}>{label}</p>
                  <p className="text-[11px]" style={{ color: C.mutedText }}>{item ? (item.accepted ? "Accepted" : "Declined") : "Not set"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => recordConsent(type, true)} className="rounded-lg px-2 py-1 text-[11px] font-black" style={{ background: C.midGreen, color: C.white, border: "none" }}>Allow</button>
                  <button onClick={() => recordConsent(type, false)} className="rounded-lg px-2 py-1 text-[11px] font-black" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>Decline</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}