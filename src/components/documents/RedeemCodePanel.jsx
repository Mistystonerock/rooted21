import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { KeyRound, Loader2, CheckCircle2, Eye, Download } from "lucide-react";

const CATEGORY_META = {
  court_order: { emoji: "⚖️", label: "Court Order" },
  iep: { emoji: "🏫", label: "IEP" },
  medical: { emoji: "🏥", label: "Medical" },
  legal: { emoji: "📜", label: "Legal" },
  school: { emoji: "📚", label: "School" },
  therapy: { emoji: "💙", label: "Therapy" },
  financial: { emoji: "💰", label: "Financial" },
  other: { emoji: "📄", label: "Other" },
};

export default function RedeemCodePanel({ onRedeemed }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("redeemDocumentAccessCode", { code: code.trim() });
      setResult(res.data);
      if (onRedeemed) onRedeemed();
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid or expired code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const meta = result ? (CATEGORY_META[result.document?.category] || CATEGORY_META.other) : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.midGreen}`, background: "#fff" }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: C.midGreen }}>
        <KeyRound size={14} color="#fff" />
        <p className="font-bold text-xs" style={{ color: "#fff" }}>Redeem Document Access Code</p>
      </div>

      <div className="p-4 space-y-3">
        {!result ? (
          <>
            <p className="text-[11px]" style={{ color: C.mutedText }}>
              Enter a personal access code sent to your email to view a shared document.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ABCD-1234"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyPress={e => e.key === "Enter" && handleRedeem()}
                maxLength={9}
                className="flex-1 px-3 py-2.5 rounded-xl border outline-none text-sm font-mono tracking-widest"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
              <button
                onClick={handleRedeem}
                disabled={loading || !code.trim()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1"
                style={{
                  background: code.trim() && !loading ? C.darkGreen : C.cream,
                  color: code.trim() && !loading ? "#fff" : C.mutedText,
                  border: "none", cursor: code.trim() && !loading ? "pointer" : "default",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Unlock"}
              </button>
            </div>
            {error && (
              <p className="text-[11px] font-bold" style={{ color: "#DC2626" }}>{error}</p>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} color={C.midGreen} />
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Access granted!</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: C.offWhite }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                <div>
                  <p className="font-bold text-xs" style={{ color: C.darkGreen }}>{result.document.title}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>
                    {meta.label}{result.document.child_name ? ` · ${result.document.child_name}` : ""} · Shared by {result.grantedBy}
                  </p>
                </div>
              </div>
              {result.document.description && (
                <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>{result.document.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(result.document.file_url, "_blank")}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-xs"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Eye size={13} /> View
              </button>
              <button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = result.document.file_url;
                  a.download = result.document.file_name || result.document.title;
                  a.click();
                }}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-xs"
                style={{ background: C.midGreen, color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Download size={13} /> Download
              </button>
            </div>
            <button
              onClick={() => { setResult(null); setCode(""); }}
              className="w-full py-2 rounded-xl text-xs font-bold"
              style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
            >
              Redeem Another Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}