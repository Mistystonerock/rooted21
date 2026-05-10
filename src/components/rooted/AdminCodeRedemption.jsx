import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AdminCodeRedemption({ onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRedeem(e) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    const response = await base44.functions.invoke("redeemAdminAccessCode", {
      code: code.trim().toUpperCase(),
    });

    if (response.data?.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        window.location.reload();
      }, 1500);
    } else {
      setError(response.data?.error || "Failed to redeem code");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: "#EAF4EA" }}>
            <CheckCircle2 size={24} color={C.midGreen} />
          </div>
          <h2 className="font-bold text-lg" style={{ color: C.darkGreen }}>Success! 🎉</h2>
          <p className="text-sm" style={{ color: C.mutedText }}>You're now an admin with full access to Rooted 21.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={20} color={C.darkGreen} />
            <h2 className="font-bold" style={{ color: C.darkGreen }}>Redeem Admin Code</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            <X size={18} color={C.mutedText} />
          </button>
        </div>

        <form onSubmit={handleRedeem} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
              ENTER CODE
            </label>
            <input
              type="text"
              placeholder="e.g., ABC12345"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none text-center font-mono"
              style={{ borderColor: C.cream, background: C.offWhite }}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <AlertCircle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px]" style={{ color: "#B84C2A" }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!code.trim() || loading}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: code.trim() ? C.darkGreen : C.cream,
              color: code.trim() ? "#fff" : C.mutedText,
              border: "none",
              cursor: code.trim() ? "pointer" : "default",
            }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Verifying...</>
            ) : (
              "Redeem Code"
            )}
          </button>
        </form>

        <p className="text-[10px] text-center" style={{ color: C.mutedText }}>
          Get a code from your founder account.
        </p>
      </div>
    </div>
  );
}