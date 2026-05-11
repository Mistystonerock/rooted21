import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Copy, CheckCircle2, Lock, Trash2, Plus, Loader2 } from "lucide-react";

export default function FounderAccessPortal() {
  const [user, setUser] = useState(null);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newCodeFor, setNewCodeFor] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
    if (!authed) {
      base44.auth.redirectToLogin("/founder-access");
        return;
      }

      base44.auth.me().then(u => {
        setUser(u);
        if (u?.role !== "admin" && u?.role !== "founder") {
          setLoading(false);
          return;
        }
        base44.entities.AdminAccessCode.list("-created_date", 100).then(list => {
          setCodes(list);
          setLoading(false);
        });
      });
    });
  }, []);

  async function generateCode() {
   if (!newCodeFor.trim()) return;
   setGenerating(true);

   const response = await base44.functions.invoke("createOwnerAccessCode", {
     professional_name: newCodeFor.trim(),
     professional_email: `admin-${Date.now()}@rooted21.internal`,
   });

   if (response.data?.code) {
     // Create local code record to display
     const newCode = {
       id: `temp-${Date.now()}`,
       code: response.data.code,
       created_for: newCodeFor.trim(),
       created_date: new Date().toISOString(),
       used: false,
     };
     setCodes(prev => [newCode, ...prev]);
     setNewCodeFor("");
   }
   setGenerating(false);
  }

  async function deleteCode(codeId) {
    if (!confirm("Delete this code?")) return;
    await base44.entities.AdminAccessCode.delete(codeId);
    setCodes(prev => prev.filter(c => c.id !== codeId));
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Founder Access" backTo="/" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "founder") {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Founder Access" backTo="/" />
        <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
          <Lock size={32} color={C.darkGreen} className="mx-auto mb-3" />
          <p className="font-bold" style={{ color: C.darkGreen }}>Founder access only</p>
          <p className="text-sm mt-2" style={{ color: C.mutedText }}>You need admin privileges to create access codes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="🔐 Founder Access" subtitle="Generate admin codes" backTo="/" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Hero */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-bold text-sm" style={{ color: C.cream }}>Create Admin Access Codes</p>
          <p className="text-xs mt-1" style={{ color: C.lightGreen }}>Generate 30-day codes for team members to become admins</p>
        </div>

        {/* Generate code form */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <label className="text-[10px] font-bold block" style={{ color: C.mutedText }}>NAME OR EMAIL (optional)</label>
          <input
            type="text"
            placeholder="e.g., Sarah Johnson"
            value={newCodeFor}
            onChange={e => setNewCodeFor(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />
          <button
            onClick={generateCode}
            disabled={generating}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: C.darkGreen,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? (
              <><Loader2 size={16} className="animate-spin" /> Generating...</>
            ) : (
              <><Plus size={16} /> Generate New Code</>
            )}
          </button>
        </div>

        {/* Codes list */}
        <div>
          <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>
            ACTIVE CODES ({codes.filter(c => !c.used).length})
          </p>
          {codes.length === 0 ? (
            <div className="text-center py-6 rounded-xl" style={{ background: C.cream }}>
              <p className="text-xs" style={{ color: C.mutedText }}>No codes generated yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {codes.map(code => (
                <div
                  key={code.id}
                  className="rounded-xl p-3"
                  style={{
                    background: code.used ? C.offWhite : "#fff",
                    border: `1px solid ${C.cream}`,
                    opacity: code.used ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-sm" style={{ color: C.darkGreen }}>
                          {code.code}
                        </p>
                        {code.used && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#EAF4EA", color: C.midGreen }}>
                            ✓ Used
                          </span>
                        )}
                        {!code.used && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: C.cream, color: C.brown }}>
                            Active
                          </span>
                        )}
                      </div>
                      {code.created_for && (
                        <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>For: {code.created_for}</p>
                      )}
                      <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                        {new Date(code.created_date).toLocaleDateString()}
                        {code.used_at && ` • Used ${new Date(code.used_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!code.used && (
                        <button
                          onClick={() => copyCode(code.code)}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            background: copied === code.code ? "#EAF4EA" : C.cream,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {copied === code.code ? (
                            <CheckCircle2 size={14} color={C.midGreen} />
                          ) : (
                            <Copy size={14} color={C.midGreen} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="p-2 rounded-lg"
                        style={{ background: C.cream, border: "none", cursor: "pointer" }}
                      >
                        <Trash2 size={14} color={C.mutedText} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
          <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
            <strong>How it works:</strong> Generate a code, share it with your team member, and they can use it on the login page to become an admin with full access to all features.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}