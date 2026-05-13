import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const GOLD = "#c9973a";
const TEXT = "#f5e6c8";
const MUTED = "rgba(245,230,200,0.65)";
const CARD_BG = "rgba(0,0,0,0.85)";
const BORDER = "rgba(201,151,58,0.4)";

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

    const trimmed = code.trim().toUpperCase();
    const isAuthed = await base44.auth.isAuthenticated();

    if (!isAuthed) {
      // Save code and redirect to login — code will be redeemed after login
      localStorage.setItem(trimmed.length === 8 ? "pending_beta_code" : "pending_admin_code", trimmed);
      base44.auth.redirectToLogin("/home");
      return;
    }

    const response = trimmed.length === 8
      ? await base44.functions.invoke("redeemBetaTesterCode", { code: trimmed })
      : await base44.functions.invoke("redeemAdminAccessCode", { code: trimmed });

    if (response.data?.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        window.location.reload();
      }, 1500);
    } else {
      setError(response.data?.error || "Invalid or expired code");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
          style={{ background: CARD_BG, border: `2px solid ${GOLD}` }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "rgba(201,151,58,0.2)" }}>
            <CheckCircle2 size={24} color={GOLD} />
          </div>
          <h2 className="font-bold text-lg" style={{ color: TEXT }}>You're in! 🎉</h2>
          <p className="text-sm" style={{ color: MUTED }}>Your Rooted 21 access is now active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl p-6 max-w-sm w-full space-y-4"
        style={{ background: CARD_BG, border: `2px solid ${BORDER}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={20} color={GOLD} />
            <h2 className="font-bold" style={{ color: TEXT }}>Redeem Access Code</h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} color={MUTED} />
          </button>
        </div>

        <form onSubmit={handleRedeem} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: MUTED }}>
              ENTER YOUR CODE
            </label>
            <input
              type="text"
              placeholder="e.g., ABC12345"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-3 rounded-xl text-base border outline-none text-center font-mono tracking-widest"
              style={{
                borderColor: BORDER,
                background: "rgba(255,255,255,0.08)",
                color: TEXT,
              }}
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg" style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)" }}>
              <AlertCircle size={14} color="#ff9090" className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px]" style={{ color: "#ff9090" }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!code.trim() || loading}
            style={{
              width: "100%",
              padding: "14px",
              background: code.trim() ? `linear-gradient(135deg, ${GOLD}, #a07020)` : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 10,
              color: code.trim() ? "#1a1a1a" : MUTED,
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: code.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Verifying...</>
            ) : (
              "Continue with Code"
            )}
          </button>
        </form>

        <p className="text-[10px] text-center" style={{ color: MUTED }}>
          If you're not logged in, you'll be asked to sign in first.
        </p>
      </div>
    </div>
  );
}