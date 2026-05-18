import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Copy, Trash2, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";

export default function AdminCodeManager() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({ created_for: "" });
  const [copied, setCopied] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadCodes();
    base44.auth.me().then(setUser);
  }, []);

  async function loadCodes() {
    setLoading(true);
    const allCodes = await base44.entities.AdminAccessCode.list("-created_date", 1000);
    setCodes(allCodes);
    setLoading(false);
  }

  async function handleGenerateCode(e) {
    e.preventDefault();
    if (!user?.email) return;

    setGenerating(true);
    try {
      await base44.functions.invoke("generateAdminAccessCode", {
        created_for: formData.created_for || undefined,
      });
      setFormData({ created_for: "" });
      setShowForm(false);
      await loadCodes();
    } catch (err) {
      console.error("Failed to generate code:", err);
    }
    setGenerating(false);
  }

  async function handleRevoke(codeId) {
    if (!confirm("Revoke this access code? This action cannot be undone.")) return;
    
    try {
      await base44.functions.invoke("revokeAdminAccessCode", { codeId });
      await loadCodes();
    } catch (err) {
      console.error("Failed to revoke code:", err);
    }
  }

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  const activeCodes = codes.filter(c => !c.used && new Date(c.expires_at) > new Date());
  const expiredCodes = codes.filter(c => c.used || new Date(c.expires_at) <= new Date());

  return (
    <div className="space-y-4">
      {/* Header with generate button */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>ADMIN ACCESS CODES</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
        >
          <Plus size={12} /> Generate New
        </button>
      </div>

      {/* Generate form */}
      {showForm && (
        <form onSubmit={handleGenerateCode} className="rounded-xl p-4" style={{ background: C.cream, border: `1px solid ${C.lightGreen}` }}>
          <input
            type="text"
            placeholder="Created for (optional, e.g., 'John - Social Worker')"
            value={formData.created_for}
            onChange={e => setFormData({ ...formData, created_for: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none mb-3"
            style={{ borderColor: C.lightGreen, background: "#fff" }}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={generating}
              className="flex-1 py-2 rounded-lg text-[10px] font-bold"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer", opacity: generating ? 0.5 : 1 }}
            >
              {generating ? "Generating..." : "Generate 6-Digit Code"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-lg text-[10px] font-bold border"
              style={{ background: "#fff", color: C.darkGreen, borderColor: C.lightGreen, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.darkGreen} transparent`, margin: "0 auto" }} />
        </div>
      ) : (
        <>
          {/* Active codes */}
          <div>
            <p className="text-[9px] font-bold mb-2" style={{ color: C.mutedText }}>ACTIVE ({activeCodes.length})</p>
            {activeCodes.length === 0 ? (
              <div className="text-center py-4" style={{ color: C.mutedText }}>
                <p className="text-[10px]">No active codes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCodes.map(c => {
                  const isExpiringSoon = new Date(c.expires_at) - new Date() < 7 * 24 * 60 * 60 * 1000;
                  return (
                    <div
                      key={c.id}
                      className="rounded-lg p-3 flex items-center justify-between"
                      style={{ background: "#fff", border: `1px solid ${isExpiringSoon ? "#f39c12" : C.lightGreen}` }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs font-mono font-bold" style={{ color: C.darkGreen, letterSpacing: "2px" }}>
                            {c.code}
                          </code>
                          {isExpiringSoon && <AlertCircle size={12} color="#f39c12" />}
                        </div>
                        <p className="text-[9px]" style={{ color: C.mutedText }}>
                          {c.created_for || "No label"} • {new Date(c.created_date).toLocaleDateString()}
                        </p>
                        <p className="text-[8px]" style={{ color: C.mutedText }}>
                          Expires {new Date(c.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(c.code)}
                          className="p-1.5 rounded-lg"
                          style={{ background: C.cream, border: "none", cursor: "pointer" }}
                          title="Copy code"
                        >
                          {copied === c.code ? (
                            <CheckCircle2 size={14} color={C.midGreen} />
                          ) : (
                            <Copy size={14} color={C.darkGreen} />
                          )}
                        </button>
                        <button
                          onClick={() => handleRevoke(c.id)}
                          className="p-1.5 rounded-lg"
                          style={{ background: "#fee", border: "none", cursor: "pointer" }}
                          title="Revoke code"
                        >
                          <Trash2 size={14} color="#c0392b" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expired codes */}
          {expiredCodes.length > 0 && (
            <div>
              <p className="text-[9px] font-bold mb-2" style={{ color: C.mutedText }}>REVOKED/EXPIRED ({expiredCodes.length})</p>
              <div className="space-y-2">
                {expiredCodes.slice(0, 5).map(c => (
                  <div key={c.id} className="rounded-lg p-3" style={{ background: "#f5f5f5", border: `1px solid ${C.cream}` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs font-mono font-bold" style={{ color: "#999", letterSpacing: "2px" }}>
                        {c.code}
                      </code>
                      {c.used && <CheckCircle2 size={12} color="#999" />}
                    </div>
                    <p className="text-[9px]" style={{ color: C.mutedText }}>
                      {c.created_for || "No label"}
                      {c.used_by && ` • Used by ${c.used_by}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}