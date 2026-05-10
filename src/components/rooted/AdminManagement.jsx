import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Shield, Trash2, Edit2, Plus, CheckCircle2, AlertCircle } from "lucide-react";

const PERMISSION_OPTIONS = [
  { value: "view_all_data", label: "View All Data" },
  { value: "view_signups", label: "View Signups & Waitlist" },
  { value: "view_activity", label: "View User Activity" },
  { value: "view_users", label: "View User Accounts" },
  { value: "manage_admins", label: "Manage Other Admins" },
  { value: "manage_codes", label: "Create Access Codes" },
  { value: "view_dashboard", label: "Access Admin Dashboard" },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.entities.AdminPermissions.list("-created_date", 100).then(list => {
      setAdmins(list);
      setLoading(false);
    });
  }, []);

  async function handleSavePermissions(adminId, newPermissions) {
    const admin = admins.find(a => a.id === adminId);
    await base44.entities.AdminPermissions.update(adminId, {
      permissions: newPermissions
    });
    setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, permissions: newPermissions } : a));
    setEditing(null);
  }

  async function handleDeleteAdmin(adminId) {
    if (!confirm("Remove this admin? They'll lose all access.")) return;
    await base44.entities.AdminPermissions.update(adminId, { is_active: false });
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading admins...</div>;
  }

  return (
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
  );
}