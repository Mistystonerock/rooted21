import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Copy, Trash2, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

export default function AdminCodeGenerator() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ created_for: "" });
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  async function fetchCodes() {
    setLoading(true);
    const list = await base44.entities.AdminAccessCode.list("-created_date", 100);
    setCodes(list);
    setLoading(false);
  }

  async function handleCreate() {
    if (!newForm.created_for.trim()) return;
    
    setCreating(true);
    const response = await base44.functions.invoke("createOwnerAccessCode", {
      created_for: newForm.created_for.trim(),
    });
    
    if (response.data?.success) {
      setCodes(prev => [response.data.code, ...prev]);
      setNewForm({ created_for: "" });
    }
    setCreating(false);
  }

  async function handleDelete(codeId) {
    if (!confirm("Delete this code?")) return;
    await base44.entities.AdminAccessCode.delete(codeId);
    setCodes(prev => prev.filter(c => c.id !== codeId));
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Generator form */}
      <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
        <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>GENERATE NEW ADMIN CODE</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Name or email (e.g., 'Jane from Ohio')"
            value={newForm.created_for}
            onChange={e => setNewForm({ created_for: e.target.value })}
            className="flex-1 px-3 py-2 rounded-lg text-xs border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newForm.created_for.trim()}
            className="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1"
            style={{
              background: newForm.created_for.trim() ? C.darkGreen : C.cream,
              color: newForm.created_for.trim() ? "#fff" : C.mutedText,
              border: "none",
              cursor: newForm.created_for.trim() ? "pointer" : "default",
            }}
          >
            {creating ? <Loader2 size={12} className="animate-spin" /> : "Generate"}
          </button>
        </div>
      </div>

      {/* Codes list */}
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>
          {codes.length} ACTIVE CODE{codes.length !== 1 ? "S" : ""}
        </p>
        <button
          onClick={fetchCodes}
          disabled={loading}
          className="p-1 rounded-lg"
          style={{ background: C.cream, border: "none", cursor: "pointer" }}
        >
          <RefreshCw size={12} color={C.mutedText} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs" style={{ color: C.mutedText }}>No codes generated yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {codes.map(code => {
            const daysLeft = Math.ceil((new Date(code.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
            const isExpired = daysLeft <= 0;
            const isUsed = code.used;

            return (
              <div
                key={code.id}
                className="rounded-xl p-3 flex items-start justify-between gap-2"
                style={{
                  background: isExpired ? "#FEF3EE" : isUsed ? "#EAF4EA" : "#fff",
                  border: `1px solid ${isExpired ? "#F4C9B8" : isUsed ? C.midGreen + "55" : C.cream}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono font-bold text-sm" style={{ color: C.darkGreen }}>
                      {code.code}
                    </code>
                    {isUsed && <CheckCircle2 size={14} color={C.midGreen} />}
                  </div>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>
                    {code.created_for || "No name"} • {new Date(code.created_date).toLocaleDateString()}
                  </p>
                  {isUsed && (
                    <p className="text-[9px] mt-1" style={{ color: C.midGreen }}>
                      ✓ Used by {code.used_by} on {new Date(code.used_at).toLocaleDateString()}
                    </p>
                  )}
                  {!isExpired && !isUsed && (
                    <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>
                      Expires in {daysLeft} days
                    </p>
                  )}
                  {isExpired && (
                    <p className="text-[9px] mt-1" style={{ color: "#B84C2A" }}>
                      Expired
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!isUsed && !isExpired && (
                    <button
                      onClick={() => copyCode(code.code)}
                      className="p-1.5 rounded-lg"
                      style={{ background: C.cream, border: "none", cursor: "pointer" }}
                    >
                      <Copy size={12} color={copied === code.code ? C.midGreen : C.mutedText} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(code.id)}
                    className="p-1.5 rounded-lg hover:opacity-70"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    <Trash2 size={12} color={C.mutedText} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}