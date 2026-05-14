import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Copy, RefreshCw } from "lucide-react";

const ROLE_OPTIONS = ["Parent", "Professional", "Court Staff"];
const STATUS_STYLES = {
  active: { bg: "#EAF4EA", color: "#2F7D32" },
  used: { bg: "#EFEFEF", color: "#666666" },
  revoked: { bg: "#FDECEC", color: "#B42318" },
};

export default function BetaTesterCodeManager() {
  const [codes, setCodes] = useState([]);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadCodes(); }, []);

  async function loadCodes() {
    setLoading(true);
    const data = await base44.entities.BetaTesterCode.list("-created_date", 200);
    setCodes(data);
    setNoteDrafts(Object.fromEntries(data.map(code => [code.id, code.notes || ""])));
    setLoading(false);
  }

  async function generateCodes() {
    setGenerating(true);
    const response = await base44.functions.invoke("generateBetaTesterCodes", {});
    const newCodes = response.data?.codes || [];
    setCodes(prev => [...newCodes, ...prev]);
    setNoteDrafts(prev => ({ ...Object.fromEntries(newCodes.map(code => [code.id, code.notes || ""])), ...prev }));
    setGenerating(false);
  }

  async function updateCode(code, updates) {
    const updated = await base44.entities.BetaTesterCode.update(code.id, updates);
    setCodes(prev => prev.map(c => c.id === code.id ? updated : c));
  }

  async function revokeCode(code) {
    await updateCode(code, { status: "revoked" });
  }

  async function copyCode(code) {
    await navigator.clipboard.writeText(code);
  }

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>Beta Tester Codes</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.mutedText }}>Beta Tester Codes — Share these with trusted testers only. Each code can only be used once.</p>
        </div>
        <button onClick={generateCodes} disabled={generating} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2" style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: generating ? "default" : "pointer", opacity: generating ? 0.7 : 1 }}>
          <RefreshCw size={13} className={generating ? "animate-spin" : ""} /> Generate Beta Tester Codes
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: C.mutedText }}>Loading codes…</p>
      ) : codes.length === 0 ? (
        <div className="rounded-xl p-4 text-center" style={{ background: C.offWhite, border: `1px dashed ${C.cream}` }}>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No beta tester codes yet</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Generate 10 codes when you are ready to invite testers.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="text-[10px] font-bold" style={{ color: C.mutedText, borderBottom: `1px solid ${C.cream}` }}>
                <th className="py-2 pr-3">CODE</th>
                <th className="py-2 pr-3">WHO IT'S FOR</th>
                <th className="py-2 pr-3">ROLE</th>
                <th className="py-2 pr-3">STATUS</th>
                <th className="py-2 pr-3">EXPIRES</th>
                <th className="py-2 pr-3">USED BY</th>
                <th className="py-2 pr-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(code => {
                const style = STATUS_STYLES[code.status] || STATUS_STYLES.active;
                return (
                  <tr key={code.id} style={{ borderBottom: `1px solid ${C.cream}` }}>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold tracking-wider" style={{ color: C.darkGreen }}>{code.code}</span>
                        <button onClick={() => copyCode(code.code)} className="p-1 rounded-lg" style={{ background: C.cream, border: "none", cursor: "pointer" }} aria-label={`Copy ${code.code}`}>
                          <Copy size={12} color={C.darkGreen} />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={noteDrafts[code.id] ?? code.notes ?? ""}
                          onChange={e => setNoteDrafts(prev => ({ ...prev, [code.id]: e.target.value }))}
                          placeholder="Name or note"
                          className="w-full px-2 py-1.5 rounded-lg text-xs border outline-none"
                          style={{ borderColor: C.cream, background: C.offWhite }}
                        />
                        <button
                          onClick={() => updateCode(code, { notes: noteDrafts[code.id] ?? "" })}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
                          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
                        >
                          Save
                        </button>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <select value={code.tester_role || "Parent"} onChange={e => updateCode(code, { tester_role: e.target.value })} className="px-2 py-1.5 rounded-lg text-xs border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} disabled={code.status !== "active"}>
                        {ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="text-[10px] px-2 py-1 rounded-full font-bold capitalize" style={{ background: style.bg, color: style.color }}>{code.status}</span>
                    </td>
                    <td className="py-2 pr-3 text-xs" style={{ color: C.mutedText }}>{code.expires_at ? new Date(code.expires_at).toLocaleDateString() : "—"}</td>
                    <td className="py-2 pr-3 text-xs" style={{ color: C.mutedText }}>{code.used_by_email || "—"}</td>
                    <td className="py-2 pr-3">
                      {code.status === "active" && (
                        <button onClick={() => revokeCode(code)} className="px-2 py-1.5 rounded-lg text-[10px] font-bold" style={{ background: "#FDECEC", color: "#B42318", border: "1px solid #F8B4B4", cursor: "pointer" }}>
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}