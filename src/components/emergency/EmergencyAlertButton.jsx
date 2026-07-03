import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { AlertTriangle, Loader2, CheckCircle2, Users, X } from "lucide-react";

/**
 * One-touch emergency alert button.
 * Props:
 *   childName  — optional child name context
 *   caseId     — optional case ID to attach the note to
 *   caseName   — optional case display name
 *   variant    — "full" (large hero button) | "compact" (smaller inline)
 */
const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function EmergencyAlertButton({ variant = "full" }) {
  const [step, setStep] = useState("idle"); // idle | confirm | sending | done | error
  const [situation, setSituation] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("high");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    setStep("sending");
    setErrorMsg("");
    const response = await base44.functions.invoke("sendSosSupportMessage", {
      message: situation.trim() || "Emergency — immediate assistance needed",
      urgency_level: urgency,
      gps_coordinates: null,
      manual_location: location.trim() || null,
      location_shared: false,
    });

    if (response.data?.success) {
      setResult(response.data);
      setStep("done");
    } else {
      setErrorMsg(response.data?.error || "Failed to send alert. Please call 911 directly.");
      setStep("error");
    }
  }

  function reset() {
    setStep("idle");
    setSituation("");
    setLocation("");
    setUrgency("high");
    setResult(null);
    setErrorMsg("");
  }

  // ── IDLE: the trigger button ──────────────────────────────────
  if (step === "idle") {
    return variant === "compact" ? (
      <button
        onClick={() => setStep("confirm")}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:opacity-90"
        style={{ background: "#C0392B", color: "#fff", border: "none", cursor: "pointer" }}
      >
        <AlertTriangle size={14} /> Emergency Alert
      </button>
    ) : (
      <button
        onClick={() => setStep("confirm")}
        className="w-full py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-95"
        style={{
          background: "linear-gradient(135deg, #C0392B 0%, #96281B 100%)",
          color: "#fff", border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(192,57,43,0.4)",
        }}
      >
        <AlertTriangle size={22} />
        Send Emergency Alert to My Team
      </button>
    );
  }

  // ── CONFIRM MODAL ─────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="w-full max-w-[420px] rounded-2xl overflow-hidden" style={{ background: "#fff" }}>
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #C0392B 0%, #96281B 100%)" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} color="#fff" />
              <p className="font-bold text-sm" style={{ color: "#fff" }}>Send Emergency Alert</p>
            </div>
            <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={18} color="rgba(255,255,255,0.7)" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
              This will <strong>immediately send an in-app alert</strong> to your approved support team and save an SOS incident to your record.
            </p>

            {/* Urgency */}
            <div>
              <label className="block text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>
                HOW URGENT IS THIS?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {URGENCY_OPTIONS.map((u) => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setUrgency(u.value)}
                    className="py-2 rounded-xl text-xs font-bold"
                    style={{
                      background: urgency === u.value ? "#C0392B" : C.offWhite,
                      color: urgency === u.value ? "#fff" : C.mutedText,
                      border: `1.5px solid ${urgency === u.value ? "#C0392B" : C.cream}`,
                      cursor: "pointer",
                    }}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Situation */}
            <div>
              <label className="block text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>
                DESCRIBE THE SITUATION (optional — helps your team respond)
              </label>
              <textarea
                value={situation}
                onChange={e => setSituation(e.target.value)}
                placeholder="e.g. Child is in immediate danger, aggressive episode in progress, CPS arriving unannounced…"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-xs border outline-none resize-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>
                YOUR CURRENT LOCATION (optional)
              </label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. 123 Main St, Columbus OH or Home"
                className="w-full px-3 py-2.5 rounded-xl text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>

            {/* Crisis reminder */}
            <div className="rounded-xl p-3 flex gap-2" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <AlertTriangle size={13} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
              <p className="text-[10px]" style={{ color: "#B84C2A" }}>
                <strong>Immediate danger?</strong> Call <strong>911</strong> first. Mental health crisis: <strong>988</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={reset}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSend}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "#C0392B", color: "#fff", border: "none", cursor: "pointer" }}>
                <AlertTriangle size={15} /> Send Alert Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SENDING ───────────────────────────────────────────────────
  if (step === "sending") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="rounded-2xl p-8 text-center space-y-3" style={{ background: "#fff", maxWidth: 280 }}>
          <Loader2 size={32} className="animate-spin mx-auto" color="#C0392B" />
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Sending emergency alert…</p>
          <p className="text-xs" style={{ color: C.mutedText }}>Notifying your support team via SMS</p>
        </div>
      </div>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────
  if (step === "done" && result) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="w-full max-w-[420px] rounded-2xl overflow-hidden" style={{ background: "#fff" }}>
          <div className="px-5 py-4" style={{ background: "#1A6B2A" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} color="#fff" />
              <p className="font-bold text-sm" style={{ color: "#fff" }}>Alert Sent Successfully</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="rounded-xl p-3" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}40` }}>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{result.confirmation_message}</p>
            </div>
            <p className="text-[10px]" style={{ color: C.mutedText }}>Sent at {result.timestamp}</p>

            <div className="rounded-xl p-3 flex gap-2" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <AlertTriangle size={13} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
              <p className="text-[10px]" style={{ color: "#B84C2A" }}>
                If this is a life-threatening emergency, call <strong>911</strong> immediately.
              </p>
            </div>

            <button onClick={reset}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="w-full max-w-[340px] rounded-2xl p-5 space-y-4" style={{ background: "#fff" }}>
          <p className="font-bold text-sm" style={{ color: "#C0392B" }}>Alert failed to send</p>
          <p className="text-xs" style={{ color: C.mutedText }}>{errorMsg}</p>
          <div className="flex gap-3">
            <button onClick={reset}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}>
              Close
            </button>
            <button onClick={() => setStep("confirm")}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "#C0392B", color: "#fff", border: "none", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}