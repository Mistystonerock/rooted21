import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Shield, CheckCircle2, X } from "lucide-react";

export default function AccessCodeEntry({ onLinked, onDismiss }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [linkedPro, setLinkedPro] = useState(null);

  async function handleSubmit() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length < 4) return;

    setStatus("loading");
    setErrorMsg("");

    // Look up the code
    const results = await base44.entities.AccessCode.filter({ code: trimmed });
    const record = results[0];

    if (!record) {
      setStatus("error");
      setErrorMsg("Code not found. Please check and try again.");
      return;
    }

    if (record.used) {
      setStatus("error");
      setErrorMsg("This code has already been used.");
      return;
    }

    const now = new Date();
    if (new Date(record.expires_at) < now) {
      setStatus("error");
      setErrorMsg("This code has expired. Ask your professional for a new one.");
      return;
    }

    // Get current user
    const user = await base44.auth.me();

    // Mark code as used
    await base44.entities.AccessCode.update(record.id, {
      used: true,
      used_by_email: user.email,
    });

    // Create or update the AssignedFamily link
    const existing = await base44.entities.AssignedFamily.filter({
      family_email: user.email,
      professional_email: record.professional_email,
    });

    if (existing.length === 0) {
      await base44.entities.AssignedFamily.create({
        family_email: user.email,
        family_name: record.family_name || "",
        professional_email: record.professional_email,
        professional_role: record.professional_role || "Other",
        status: "active",
      });
    }

    setLinkedPro({
      name: record.professional_name || record.professional_email,
      role: record.professional_role,
    });
    setStatus("success");
    if (onLinked) onLinked(record);
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
        <CheckCircle2 size={36} color={C.midGreen} className="mx-auto mb-2" />
        <p className="font-serif font-bold text-base mb-1" style={{ color: C.darkGreen }}>
          You're connected!
        </p>
        <p className="text-xs mb-3" style={{ color: C.mutedText }}>
          Your account is now linked to{" "}
          <strong style={{ color: C.darkGreen }}>{linkedPro?.name}</strong>
          {linkedPro?.role ? ` (${linkedPro.role})` : ""}.
        </p>
        <button
          onClick={onDismiss}
          className="px-5 py-2.5 rounded-xl font-bold text-sm border-none"
          style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}`, boxShadow: "0 4px 20px rgba(47,75,58,.10)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Shield size={18} color={C.midGreen} />
        <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>
          Enter Professional Access Code
        </p>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-auto p-1 rounded-lg" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={16} color={C.mutedText} />
          </button>
        )}
      </div>
      <p className="text-xs mb-3" style={{ color: C.mutedText }}>
        If a counselor, caseworker, or other professional gave you a code, enter it below to link your account and share your progress with them.
      </p>

      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        placeholder="e.g. A3X7K2"
        maxLength={10}
        className="w-full rounded-xl px-3 py-3 text-center text-lg font-bold tracking-widest font-sans mb-2"
        style={{
          border: `2px solid ${status === "error" ? "#B84C2A" : C.cream}`,
          background: C.offWhite,
          color: C.darkGreen,
          letterSpacing: "0.2em",
        }}
      />

      {status === "error" && (
        <p className="text-xs font-bold mb-2" style={{ color: "#B84C2A" }}>⚠️ {errorMsg}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!code.trim() || status === "loading"}
        className="w-full py-3 rounded-xl font-bold text-sm border-none transition-all"
        style={{
          background: code.trim() ? C.darkGreen : C.cream,
          color: code.trim() ? C.white : C.mutedText,
          cursor: code.trim() ? "pointer" : "default",
        }}
      >
        {status === "loading" ? "Verifying…" : "Link My Account"}
      </button>
    </div>
  );
}