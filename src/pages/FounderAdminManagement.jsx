import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, Trash2, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';

const BG = '#0d2818';
const CARD = '#132d1f';
const BORDER = 'rgba(247,232,198,0.45)';
const TEXT = '#F7E8C6';
const MUTED = '#E6D8B8';
const GREEN = '#48D17A';
const GOLD = '#c9973a';

const ADMIN_PERMISSIONS = {
  moderate_content: { label: 'Moderate Content', desc: 'Flag and manage community posts' },
  view_assigned_users: { label: 'View Assigned Users', desc: 'See families assigned to this admin' },
  help_families: { label: 'Help Families', desc: 'Answer support tickets and FAQs' },
  upload_resources: { label: 'Upload Resources', desc: 'Add and manage support resources' },
  review_surveys: { label: 'Review Surveys', desc: 'View user feedback and surveys' },
};

const FOUNDER_ONLY = {
  create_admin_codes: { label: 'Create Admin Codes', desc: 'Generate new admin invitations' },
  remove_admins: { label: 'Remove Admins', desc: 'Revoke admin access and codes' },
  view_analytics: { label: 'View Analytics', desc: 'See user growth and engagement data' },
  manage_permissions: { label: 'Manage Permissions', desc: 'Update what each admin can do' },
  view_system_logs: { label: 'View System Logs', desc: 'Monitor all platform activity' },
  approve_agencies: { label: 'Approve Agencies', desc: 'Verify and approve new organizations' },
  manage_legal: { label: 'Manage Legal Documents', desc: 'Update policies and disclaimers' },
  control_app_settings: { label: 'Control App Settings', desc: 'Manage global feature flags and config' },
};

export default function FounderAdminManagement() {
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('generate');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newCode, setNewCode] = useState(null);
  const [codeForm, setCodeForm] = useState({
    created_for: '',
    expiration_days: 30,
    permissions: Object.keys(ADMIN_PERMISSIONS),
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const me = await base44.auth.me();
      setUser(me);

      // Check if founder
      if (me?.role !== 'admin') {
        setLoading(false);
        return;
      }

      // Load admins and codes
      const [adminsList, codesList] = await Promise.all([
        base44.entities.AdminPermissions.list('-created_date', 100),
        base44.entities.AdminAccessCode.list('-created_date', 100),
      ]);

      setAdmins(adminsList.filter(a => a.is_active));
      setCodes(codesList.filter(c => !c.used && new Date(c.expires_at) > new Date()));
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function generateCode() {
    if (!codeForm.created_for.trim()) {
      alert('Please enter a name or email for this code');
      return;
    }

    setGeneratingCode(true);
    try {
      const response = await base44.functions.invoke('generateAdminAccessCode', {
        created_for: codeForm.created_for,
        expiration_days: codeForm.expiration_days,
      });

      setNewCode(response.data);
      setShowCodeModal(true);
      setCodes([response.data, ...codes]);
      setCodeForm({
        created_for: '',
        expiration_days: 30,
        permissions: Object.keys(ADMIN_PERMISSIONS),
      });
    } catch (err) {
      alert('Error generating code: ' + err.message);
    } finally {
      setGeneratingCode(false);
    }
  }

  async function revokeCode(codeId) {
    if (!confirm('Revoke this code? It cannot be used after revocation.')) return;
    try {
      await base44.functions.invoke('revokeAdminAccessCode', { code_id: codeId });
      setCodes(codes.filter(c => c.id !== codeId));
    } catch (err) {
      alert('Error revoking code: ' + err.message);
    }
  }

  async function removeAdmin(adminEmail) {
    if (!confirm(`Remove ${adminEmail} as admin?`)) return;
    try {
      await base44.entities.AdminPermissions.update(
        admins.find(a => a.admin_email === adminEmail)?.id,
        { is_active: false }
      );
      setAdmins(admins.filter(a => a.admin_email !== adminEmail));
    } catch (err) {
      alert('Error removing admin: ' + err.message);
    }
  }

  if (loading) {
    return <div style={{ background: BG, minHeight: '100vh', padding: '20px' }}>Loading...</div>;
  }

  if (user?.role !== 'admin') {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Lock size={48} color={GOLD} style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Founder Access Only</p>
        <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', maxWidth: 300 }}>
          This page is restricted to Rooted 21 founders.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 40 }}>
      <MobileHeader
        title="Admin Management"
        subtitle="Role hierarchy & access control"
        backTo="/profile"
      />

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px' }}>
        {/* Role Hierarchy Overview */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: '#48D17A', marginBottom: 12, textTransform: 'uppercase' }}>
            🏛️ Role Hierarchy
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Founder Box */}
            <div
              style={{
                background: CARD,
                border: `2px solid ${GOLD}`,
                borderRadius: 14,
                padding: '14px',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 800, color: GOLD, marginBottom: 8 }}>👑 Founder</p>
              <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
                <p style={{ fontWeight: 600, color: TEXT, marginBottom: 4 }}>You have all powers:</p>
                <ul style={{ margin: '0 0 0 16px', paddingLeft: 0 }}>
                  {Object.entries(FOUNDER_ONLY).map(([key, perm]) => (
                    <li key={key} style={{ fontSize: 10, marginBottom: 3 }}>{perm.label}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Admin Box */}
            <div
              style={{
                background: CARD,
                border: `1.5px solid ${GREEN}40`,
                borderRadius: 14,
                padding: '14px',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 800, color: GREEN, marginBottom: 8 }}>🛡️ Admin</p>
              <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
                <p style={{ fontWeight: 600, color: TEXT, marginBottom: 4 }}>Limited access:</p>
                <ul style={{ margin: '0 0 0 16px', paddingLeft: 0 }}>
                  {Object.entries(ADMIN_PERMISSIONS).map(([key, perm]) => (
                    <li key={key} style={{ fontSize: 10, marginBottom: 3 }}>{perm.label}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Critical Restrictions */}
          <div
            style={{
              background: 'rgba(231,76,60,0.08)',
              border: '1px solid rgba(231,76,60,0.2)',
              borderRadius: 12,
              padding: '12px',
              marginTop: 12,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6B5A', marginBottom: 6 }}>🔒 Admins CANNOT:</p>
            <ul style={{ fontSize: 10, color: MUTED, margin: '0 0 0 16px', paddingLeft: 0 }}>
              <li>Create other admins</li>
              <li>Access founder controls</li>
              <li>Access financial/legal backend</li>
              <li>Delete founder data</li>
            </ul>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: `1px solid ${BORDER}`, paddingBottom: 12 }}>
          {[
            { id: 'generate', label: '🔐 Generate Code' },
            { id: 'active', label: `📋 Active Codes (${codes.length})` },
            { id: 'admins', label: `👥 Admins (${admins.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 14px',
                background: activeTab === tab.id ? `${GREEN}25` : 'transparent',
                border: `1.5px solid ${activeTab === tab.id ? GREEN : BORDER}`,
                borderRadius: 10,
                color: activeTab === tab.id ? GREEN : MUTED,
                fontWeight: 700,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Generate Code */}
        {activeTab === 'generate' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 14, padding: '16px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 14 }}>Generate Admin Code</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5 }}>
                    Name or Email
                  </label>
                  <input
                    type="text"
                    value={codeForm.created_for}
                    onChange={e => setCodeForm({ ...codeForm, created_for: e.target.value })}
                    placeholder="e.g., Sarah Smith or sarah@example.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      color: TEXT,
                      fontSize: 12,
                      boxSizing: 'border-box',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 5 }}>
                    Code Expires In (days)
                  </label>
                  <select
                    value={codeForm.expiration_days}
                    onChange={e => setCodeForm({ ...codeForm, expiration_days: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      color: TEXT,
                      fontSize: 12,
                      boxSizing: 'border-box',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 8 }}>Admin Permissions</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(ADMIN_PERMISSIONS).map(([key, perm]) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={codeForm.permissions.includes(key)}
                          onChange={e => {
                            if (e.target.checked) {
                              setCodeForm({ ...codeForm, permissions: [...codeForm.permissions, key] });
                            } else {
                              setCodeForm({ ...codeForm, permissions: codeForm.permissions.filter(p => p !== key) });
                            }
                          }}
                          style={{ marginTop: 3 }}
                        />
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT, margin: 0 }}>{perm.label}</p>
                          <p style={{ fontSize: 10, color: MUTED, margin: '2px 0 0' }}>{perm.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={generateCode}
                disabled={generatingCode || !codeForm.created_for.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: generatingCode || !codeForm.created_for.trim() ? `${GREEN}50` : GREEN,
                  border: 'none',
                  borderRadius: 10,
                  color: '#0d2818',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: generatingCode || !codeForm.created_for.trim() ? 'default' : 'pointer',
                }}
              >
                {generatingCode ? 'Generating...' : '🔐 Generate Code'}
              </button>
            </div>
          </div>
        )}

        {/* TAB: Active Codes */}
        {activeTab === 'active' && (
          <div style={{ marginBottom: 20 }}>
            {codes.length === 0 ? (
              <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', padding: '20px' }}>No active codes</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {codes.map(code => (
                  <div
                    key={code.id}
                    style={{
                      background: CARD,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: TEXT, fontFamily: 'monospace', marginBottom: 4 }}>
                        {code.code}
                      </p>
                      <p style={{ fontSize: 10, color: MUTED }}>
                        For: {code.created_for}
                      </p>
                      <p style={{ fontSize: 10, color: '#c9973a', marginTop: 2 }}>
                        Expires: {new Date(code.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(code.code);
                        alert('Code copied to clipboard');
                      }}
                      style={{
                        background: `${GREEN}25`,
                        border: `1px solid ${GREEN}40`,
                        borderRadius: 8,
                        padding: '8px',
                        color: GREEN,
                        cursor: 'pointer',
                        marginRight: 6,
                      }}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => revokeCode(code.id)}
                      style={{
                        background: 'rgba(231,76,60,0.15)',
                        border: '1px solid rgba(231,76,60,0.3)',
                        borderRadius: 8,
                        padding: '8px',
                        color: '#FF6B5A',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Admins */}
        {activeTab === 'admins' && (
          <div style={{ marginBottom: 20 }}>
            {admins.length === 0 ? (
              <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', padding: '20px' }}>No admins yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {admins.map(admin => (
                  <div
                    key={admin.id}
                    style={{
                      background: CARD,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 800, color: TEXT, margin: 0 }}>{admin.admin_name}</p>
                        <p style={{ fontSize: 11, color: MUTED, margin: '2px 0 0' }}>{admin.admin_email}</p>
                      </div>
                      <button
                        onClick={() => removeAdmin(admin.admin_email)}
                        style={{
                          background: 'rgba(231,76,60,0.15)',
                          border: '1px solid rgba(231,76,60,0.3)',
                          borderRadius: 8,
                          padding: '6px 10px',
                          color: '#FF6B5A',
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Revoke
                      </button>
                    </div>
                    <p style={{ fontSize: 10, color: MUTED, margin: '0 0 8px' }}>
                      Created: {new Date(admin.created_date).toLocaleDateString()}
                    </p>
                    {admin.permissions?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {admin.permissions.map(perm => (
                          <span
                            key={perm}
                            style={{
                              fontSize: 9,
                              background: `${GREEN}20`,
                              color: GREEN,
                              padding: '3px 8px',
                              borderRadius: 5,
                              fontWeight: 600,
                            }}
                          >
                            {ADMIN_PERMISSIONS[perm]?.label || perm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Generated Modal */}
      {showCodeModal && newCode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 50,
          }}
          onClick={() => setShowCodeModal(false)}
        >
          <div
            style={{
              width: '100%',
              background: CARD,
              borderTop: `2px solid ${GREEN}`,
              borderRadius: '20px 20px 0 0',
              padding: '24px 20px',
              maxHeight: '90vh',
              overflowY: 'auto',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 28, margin: '0 0 8px' }}>✅</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: TEXT, margin: 0 }}>Code Generated</p>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `2px solid ${GREEN}`,
                borderRadius: 14,
                padding: '20px',
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 11, color: MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Admin Code
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: GREEN,
                  fontFamily: 'monospace',
                  margin: '0 0 14px',
                  letterSpacing: '0.1em',
                }}
              >
                {newCode.code}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newCode.code);
                  alert('Copied to clipboard');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: GREEN,
                  border: 'none',
                  borderRadius: 8,
                  color: '#0d2818',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <Copy size={12} style={{ marginRight: 6, display: 'inline' }} /> Copy Code
              </button>
            </div>

            <div style={{ fontSize: 12, lineHeight: 1.7, color: MUTED }}>
              <p style={{ fontWeight: 700, color: TEXT, marginBottom: 8 }}>⏰ Expires:</p>
              <p style={{ margin: '0 0 12px' }}>{new Date(newCode.expires_at).toLocaleDateString()}</p>

              <p style={{ fontWeight: 700, color: TEXT, marginBottom: 8 }}>📋 Share with:</p>
              <p style={{ margin: '0 0 12px' }}>{newCode.created_for}</p>

              <p style={{ fontWeight: 700, color: '#c9973a', marginBottom: 8, marginTop: 16 }}>🔒 Important:</p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Code expires after one use</li>
                <li>Share via secure channel only</li>
                <li>You can revoke unused codes anytime</li>
                <li>All activity is logged</li>
              </ul>
            </div>

            <button
              onClick={() => setShowCodeModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: `1.5px solid ${BORDER}`,
                borderRadius: 10,
                color: TEXT,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}