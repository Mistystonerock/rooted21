import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Copy, CheckCircle2, X, RefreshCw } from "lucide-react";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function GenerateCodeModal({ family, user, onClose }) {
  const [code, setCode] = useState(null);
  const [expiryDays, setExpiryDays] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    const newCode = generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    await base44.entities.AccessCode.create({
      code: newCode,
      professional_email: user.email,
      professional_name: user.full_name || user.email,
      professional_role: family.professional_role || "Other",
      family_name: family.family_name || "",
      expires_at: expiresAt.toISOString(),
      used: false,
    });

    setCode(newCode);
    setGenerating(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: C.white, boxShadow: "0 8px 40px rgba(0,0,0,.18)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>
            Generate Access Code
          </p>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.mutedText} />
          </button>
        </div>

        {family && (
          <p className="text-xs mb-4 rounded-xl px-3 py-2" style={{ background: C.offWhite, color: C.mutedText }}>
            For: <strong style={{ color: C.darkGreen }}>{family.family_name || family.family_email}</strong>
            {family.child_name ? ` · ${family.child_name}` : ""}
          </p>
        )}

        {!code ? (
          <>
            <div className="mb-4">
              <p className="text-xs font-bold mb-1.5" style={{ color: C.darkGreen }}>Code expires after:</p>
              <div className="flex gap-2">
                {[3, 7, 14, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setExpiryDays(d)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border-none transition-all"
                    style={{
                      background: expiryDays === d ? C.darkGreen : C.cream,
                      color: expiryDays === d ? C.white : C.mutedText,
                      cursor: "pointer",
                    }}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 rounded-xl font-bold text-sm border-none"
              style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}
            >
              {generating ? "Generating…" : "Generate Code"}
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xs mb-2" style={{ color: C.mutedText }}>Share this code with the family:</p>
            <div
              className="rounded-2xl py-5 px-4 mb-3 font-bold text-3xl tracking-[0.25em]"
              style={{ background: C.offWhite, color: C.darkGreen, border: `2px dashed ${C.midGreen}`, letterSpacing: "0.25em" }}
            >
              {code}
            </div>
            <p className="text-[11px] mb-4" style={{ color: C.mutedText }}>
              Expires in <strong>{expiryDays} days</strong>. Parent enters this in the app under "Enter Access Code."
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-none"
                style={{ background: copied ? C.midGreen : C.cream, color: copied ? C.white : C.darkGreen, cursor: "pointer" }}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => { setCode(null); setCopied(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-none"
                style={{ background: C.offWhite, color: C.mutedText, cursor: "pointer", border: `1px solid ${C.cream}` }}
              >
                <RefreshCw size={14} />
                New Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}