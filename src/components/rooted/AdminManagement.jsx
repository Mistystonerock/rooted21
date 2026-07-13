import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Shield, Trash2, Edit2, Plus, CheckCircle2, AlertCircle, Copy, XCircle } from "lucide-react";
import CertificateGenerator from "@/components/admin/CertificateGenerator";

const PERMISSION_OPTIONS = [
  { value: "manage_local_resources", label: "Manage Local Resources" },
  { value: "update_verified_services", label: "Update Verified Services" },
  { value: "moderate_community", label: "Moderate Community Content" },
  { value: "assist_users", label: "Assist Users" },
  { value: "manage_assigned_county_resources", label: "Manage Assigned County Resources" },
  { value: "view_admin_dashboard", label: "Access Admin Dashboard" },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [newCodeName, setNewCodeName] = useState("");
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [activeTab, setActiveTab] = useState("codes");

  useEffect(() => {
    const safe = (p, fallback = []) => p.catch(() => fallback);
    Promise.all([
      safe(base44.entities.AdminPermissions.list("-created_date", 100)),
      safe(base44.entities.AdminAccessCode.list("-created_date", 100)),
    ]).then(([adminList, codeList]) => {
      setAdmins(adminList);
      setAccessCodes(codeList);
      setLoading(false);
    });
  }, []);

  async function handleSavePermissions(adminId, newPermissions) {
    const admin = admins.find(a => a.id === adminId);
    await base44.functions.invoke("manageAdminPermissions", {
      action: "update_permissions",
      adminPermissionId: adminId,
      permissions: newPermissions,
      assigned_counties: admin.assigned_counties || [],
      organization_id: admin.organization_id || "",
      organization_name: admin.organization_name || "",
      is_active: admin.is_active !== false,
    });
    setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, permissions: newPermissions } : a));
    setEditing(null);
  }

  async function handleDeleteAdmin(adminId) {
    if (!confirm("Remove this admin? They'll lose all access.")) return;
    await base44.functions.invoke("manageAdminPermissions", {
      action: "remove_admin",
      adminPermissionId: adminId,
    });
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  }

  async function handleGenerateCode() {
    setGenerating(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('generateAdminAccessCode', {
        created_for: newCodeName.trim() || null,
      });
      setAccessCodes(prev => [response.data, ...prev]);
      setNewCodeName("");
      setShowCodeForm(false);
    } catch (err) {
      setError("Failed to generate code. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevokeCode(codeId) {
    if (!confirm("Revoke this access code? It will no longer work.")) return;
    try {
      await base44.functions.invoke('revokeAdminAccessCode', { codeId });
      setAccessCodes(prev => prev.map(c => c.id === codeId ? { ...c, used: true, used_by: 'revoked' } : c));
    } catch (err) {
      setError("Failed to revoke code.");
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading admins...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: C.cream }}>
        {["codes", "admins", "certificates"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-xs font-bold capitalize border-b-2 transition-colors"
            style={{
              borderColor: activeTab === tab ? C.darkGreen : "transparent",
              color: activeTab === tab ? C.darkGreen : C.mutedText,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {tab === "codes" ? "🔑 Access Codes" : tab === "admins" ? "👥 Admin Permissions" : "🎓 Certificates"}
          </button>
        ))}
      </div>

      {activeTab === "codes" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: C.cream }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} color={C.midGreen} />
              <p className="font-bold" style={{ color: C.darkGreen }}>6-Digit Admin Access Codes</p>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
              Generate unique codes for professionals to redeem and gain admin access. Codes expire after 30 days.
            </p>
          </div>

          {!showCodeForm ? (
            <button
              onClick={() => setShowCodeForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed"
              style={{ borderColor: C.midGreen, background: "transparent", cursor: "pointer" }}
            >
              <Plus size={16} color={C.midGreen} />
              <span style={{ color: C.midGreen, fontWeight: 700, fontSize: 13 }}>Generate New Code</span>
            </button>
          ) : (
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>Created for (optional)</p>
              <input
                type="text"
                value={newCodeName}
                onChange={e => setNewCodeName(e.target.value)}
                placeholder="e.g., Sarah Johnson, Family Therapist"
                className="w-full px-3 py-2 rounded-lg text-sm mb-3 border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="flex-1 py-2 px-3 rounded-lg font-bold text-sm"
                  style={{ background: C.midGreen, color: "#fff", border: "none", cursor: "pointer", opacity: generating ? 0.6 : 1 }}
                >
                  {generating ? "Generating..." : "Generate Code"}
                </button>
                <button
                  onClick={() => { setShowCodeForm(false); setNewCodeName(""); }}
                  className="flex-1 py-2 px-3 rounded-lg font-bold text-sm"
                  style={{ background: C.offWhite, color: C.mutedText, border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {accessCodes.length === 0 ? (
            <p className="text-xs text-center" style={{ color: C.mutedText }}>No codes generated yet</p>
          ) : (
            <div className="space-y-2">
              {accessCodes.map(code => {
                const isExpired = new Date(code.expires_at) < new Date();
                const isRevoked = code.used && code.used_by === 'revoked';
                return (
                  <div key={code.id} className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-black tracking-wider" style={{ color: C.darkGreen, fontFamily: "monospace" }}>
                            {code.code}
                          </p>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="p-1.5 rounded-lg"
                            style={{ background: C.offWhite, border: "none", cursor: "pointer" }}
                            title="Copy code"
                          >
                            <Copy size={12} color={C.midGreen} />
                          </button>
                        </div>
                        {code.created_for && (
                          <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>For: {code.created_for}</p>
                        )}
                        <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>
                          Created {new Date(code.created_date).toLocaleDateString()} • 
                          Expires {new Date(code.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {isRevoked ? (
                          <span className="text-[9px] px-2 py-1 rounded-full font-bold" style={{ background: "#F4C9B8", color: "#B84C2A" }}>
                            REVOKED
                          </span>
                        ) : code.used ? (
                          <span className="text-[9px] px-2 py-1 rounded-full font-bold" style={{ background: C.offWhite, color: C.midGreen }}>
                            ✓ USED
                          </span>
                        ) : isExpired ? (
                          <span className="text-[9px] px-2 py-1 rounded-full font-bold" style={{ background: "#F4C9B8", color: "#B84C2A" }}>
                            EXPIRED
                          </span>
                        ) : (
                          <span className="text-[9px] px-2 py-1 rounded-full font-bold" style={{ background: "#E8F5E9", color: C.midGreen }}>
                            ACTIVE
                          </span>
                        )}
                        {!isRevoked && !code.used && !isExpired && (
                          <button
                            onClick={() => handleRevokeCode(code.id)}
                            className="p-1.5 rounded-lg"
                            style={{ background: "#FEF3EE", border: "none", cursor: "pointer" }}
                            title="Revoke code"
                          >
                            <XCircle size={12} color="#B84C2A" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "admins" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: C.cream }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} color={C.midGreen} />
              <p className="font-bold" style={{ color: C.darkGreen }}>Admin Permissions</p>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
              Control what each admin can access. Admins can only view and manage features you explicitly grant.
            </p>
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <AlertCircle size={14} color="#B84C2A" />
              <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
            </div>
          )}

          {admins.length === 0 ? (
            <p className="text-xs text-center" style={{ color: C.mutedText }}>No admins created yet</p>
          ) : (
            <div className="space-y-2">
              {admins.map(admin => (
            <div key={admin.id} className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{admin.admin_name}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>{admin.admin_email}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(editing === admin.id ? null : admin.id)}
                    className="p-1.5 rounded-lg hover:opacity-70"
                    style={{ background: C.offWhite, border: "none", cursor: "pointer" }}
                  >
                    <Edit2 size={12} color={C.midGreen} />
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="p-1.5 rounded-lg hover:opacity-70"
                    style={{ background: "#FEF3EE", border: "none", cursor: "pointer" }}
                  >
                    <Trash2 size={12} color="#B84C2A" />
                  </button>
                </div>
              </div>

              {editing === admin.id ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Permissions</p>
                  <div className="space-y-1">
                    {PERMISSION_OPTIONS.map(perm => (
                      <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={admin.permissions?.includes(perm.value) || false}
                          onChange={e => {
                            const newPerms = e.target.checked
                              ? [...(admin.permissions || []), perm.value]
                              : (admin.permissions || []).filter(p => p !== perm.value);
                            handleSavePermissions(admin.id, newPerms);
                          }}
                          style={{ accentColor: C.darkGreen }}
                        />
                        <p className="text-[10px]" style={{ color: C.darkGreen }}>{perm.label}</p>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {admin.permissions && admin.permissions.length > 0 ? (
                    admin.permissions.map(perm => (
                      <span key={perm} className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: C.offWhite, color: C.midGreen }}>
                        {PERMISSION_OPTIONS.find(p => p.value === perm)?.label || perm}
                      </span>
                    ))
                  ) : (
                    <p className="text-[10px]" style={{ color: C.mutedText }}>No permissions granted</p>
                  )}
                </div>
              )}
            </div>
          ))}
            </div>
          )}
          </div>
          )}

          {activeTab === "certificates" && (
          <CertificateGenerator />
          )}
          </div>
          );
          }