import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminAccessCodeModal({ onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRedeem(e) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a code");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const response = await base44.functions.invoke("adminAccessCodeHandler", { code: code.trim().toUpperCase() });
    
    if (response.data?.success) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/founder-dashboard";
      }, 2000);
    } else {
      setError(response.data?.message || "Invalid or expired code");
    }
    
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full rounded-t-3xl p-5" style={{ background: C.offWhite }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>
            {success ? "Welcome! 🎉" : "Admin Access Code"}
          </h2>
          {!success && (
            <button onClick={onClose} className="p-1" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <X size={20} color={C.mutedText} />
            </button>
          )}
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#EAF4EA" }}>
              <CheckCircle2 size={24} color={C.midGreen} />
            </div>
            <p className="text-sm" style={{ color: "#3a3028" }}>Your admin access is activated. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="space-y-3">
            <p className="text-xs" style={{ color: C.mutedText }}>
              Enter the 8-character code from your founder to access the admin dashboard.
            </p>
            
            <input
              type="text"
              placeholder="E.g., ABC12345"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none font-mono text-center text-lg tracking-widest"
              style={{ borderColor: C.cream, background: C.offWhite }}
            />

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FEF3EE", color: "#B84C2A" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
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
                "Unlock Admin Access"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}