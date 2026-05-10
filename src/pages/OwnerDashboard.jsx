import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { C } from '@/lib/rooted-constants';
import {
  ChevronLeft, Copy, CheckCircle2, Loader2, Plus, Trash2,
  Users, CreditCard, Key, Search, ChevronDown, ChevronUp, AlertTriangle, Check
} from 'lucide-react';

const OWNER_EMAIL = 'mstonerock@rooted21parenting.com';
const ROLES = ["Counselor", "Caseworker", "CPS Worker", "Court Staff", "Mentor", "Behavioral Health Worker", "School Staff", "Therapist", "Juvenile Probation", "Other"];
const USER_ROLES = ["user", "admin", "court_staff", "professional"];
const SUB_STATUSES = ["trial", "active", "past_due", "canceled"];
const ACCOUNT_TYPES = ["private", "professional", "agency"];

// ── WAITLIST TAB ──────────────────────────────────────────────────────────────
function WaitlistTab() {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.WaitlistSignup.list('-created_date', 500).then(s => { setSignups(s); setLoading(false); });
  }, []);

  const filtered = signups.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );

  const byType = signups.reduce((acc, s) => {
    acc[s.family_type] = (acc[s.family_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
        <p className="font-serif font-bold text-sm mb-3" style={{ color: C.cream }}>🌱 Launch Waitlist</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-2xl font-extrabold" style={{ color: '#fff' }}>{signups.length}</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Signups</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-2xl font-extrabold" style={{ color: '#fff' }}>{[...new Set(signups.map(s => s.city).filter(Boolean))].length}</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Cities</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-2xl font-extrabold" style={{ color: '#fff' }}>{signups.filter(s => s.notified_at_launch).length}</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Notified</p>
          </div>
        </div>
        {Object.keys(byType).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(byType).map(([type, count]) => (
              <span key={type} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
                {type}: {count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: '#fff', border: `1.5px solid ${C.cream}` }}>
        <Search size={15} color={C.mutedText} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or city…"
          className="flex-1 py-3 text-sm bg-transparent outline-none" style={{ color: C.darkGreen }} />
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 size={20} className="mx-auto animate-spin" color={C.midGreen} /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: '#fff', border: `1px dashed ${C.cream}` }}>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No signups yet</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Share the launch page to start collecting waitlist signups.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold" style={{ color: C.mutedText }}>{filtered.length} SIGNUPS</p>
          {filtered.map(s => (
            <div key={s.id} className="rounded-xl p-3.5" style={{ background: '#fff', border: `1px solid ${C.cream}` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{s.full_name}</p>
                  <p className="text-[11px]" style={{ color: C.mutedText }}>{s.email}</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {s.city && <span className="text-[10px]" style={{ color: C.mutedText }}>📍 {s.city}</span>}
                    {s.family_type && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: C.cream, color: C.darkGreen }}>{s.family_type}</span>}
                  </div>
                  {s.message && <p className="text-[11px] mt-1.5 italic leading-snug" style={{ color: '#3a3028' }}>"{s.message}"</p>}
                </div>
                <p className="text-[10px] flex-shrink-0" style={{ color: C.mutedText }}>
                  {new Date(s.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ACCESS CODES TAB ─────────────────────────────────────────────────────────
function AccessCodesTab() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [formData, setFormData] = useState({ professional_email: '', professional_name: '', professional_role: 'Counselor' });

  const loadCodes = async () => {
    const all = await base44.entities.AccessCode.list('-created_date', 100);
    setCodes(all);
    setLoading(false);
  };

  useEffect(() => { loadCodes(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.professional_email || !formData.professional_name) return;
    setGenerating(true);
    await base44.functions.invoke('createOwnerAccessCode', formData);
    setFormData({ professional_email: '', professional_name: '', professional_role: 'Counselor' });
    setShowForm(false);
    await loadCodes();
    setGenerating(false);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      {showForm ? (
        <form onSubmit={handleGenerate} className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
          <h3 className="font-bold text-sm" style={{ color: C.darkGreen }}>Generate New Code</h3>
          <input type="email" value={formData.professional_email} onChange={e => setFormData(f => ({ ...f, professional_email: e.target.value }))} placeholder="Professional email" required className="w-full rounded-lg px-3 py-2.5 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
          <input type="text" value={formData.professional_name} onChange={e => setFormData(f => ({ ...f, professional_name: e.target.value }))} placeholder="Professional name" required className="w-full rounded-lg px-3 py-2.5 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
          <select value={formData.professional_role} onChange={e => setFormData(f => ({ ...f, professional_role: e.target.value }))} className="w-full rounded-lg px-3 py-2.5 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg font-bold text-sm" style={{ background: C.cream, color: C.mutedText, border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={generating} className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1" style={{ background: C.darkGreen, color: C.white, border: 'none', cursor: 'pointer', opacity: generating ? 0.7 : 1 }}>
              {generating ? <Loader2 size={13} className="animate-spin" /> : 'Generate'}
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2" style={{ background: C.darkGreen, color: C.white, border: 'none', cursor: 'pointer' }}>
          <Plus size={14} /> Generate New Code
        </button>
      )}

      {loading ? (
        <div className="text-center py-8"><Loader2 size={20} className="mx-auto animate-spin" color={C.midGreen} /></div>
      ) : codes.length === 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: C.white, border: `1px dashed ${C.cream}` }}>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No codes yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold" style={{ color: C.mutedText }}>CODES ({codes.filter(c => !c.used).length} active)</p>
          {codes.map(code => (
            <div key={code.id} className="rounded-lg p-3.5 flex items-center gap-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <div className="flex-1 min-w-0">
                <div className="font-mono font-bold text-base" style={{ color: C.darkGreen }}>{code.code}</div>
                <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>{code.professional_name} · {code.professional_role}</p>
                {code.used && <p className="text-[11px]" style={{ color: '#B84C2A' }}>✓ Used by {code.used_by_email}</p>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleCopy(code.code)} aria-label="Copy code" className="p-2 rounded-lg" style={{ background: C.cream, border: 'none', cursor: 'pointer' }}>
                  {copied === code.code ? <CheckCircle2 size={14} color={C.midGreen} /> : <Copy size={14} color={C.mutedText} />}
                </button>
                <button onClick={() => base44.entities.AccessCode.delete(code.id).then(loadCodes)} aria-label="Delete code" className="p-2 rounded-lg" style={{ background: C.cream, border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={14} color="#B84C2A" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── USER MANAGEMENT TAB ───────────────────────────────────────────────────────
function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    base44.entities.User.list('-created_date', 200).then(u => { setUsers(u); setLoading(false); });
  }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId);
    await base44.entities.User.update(userId, { role: newRole });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setSaving(null);
    setSaved(userId);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <Search size={15} color={C.mutedText} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 py-3 text-sm bg-transparent outline-none"
          style={{ color: C.darkGreen }}
        />
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 size={20} className="mx-auto animate-spin" color={C.midGreen} /></div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold" style={{ color: C.mutedText }}>{filtered.length} USERS</p>
          {filtered.map(u => (
            <div key={u.id} className="rounded-xl overflow-hidden" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              {/* Row */}
              <button
                onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: C.darkGreen, color: C.cream }}>
                  {u.full_name?.[0] || u.email?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: C.darkGreen }}>{u.full_name || '(no name)'}</p>
                  <p className="text-[11px] truncate" style={{ color: C.mutedText }}>{u.email}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: `${C.midGreen}20`, color: C.midGreen }}>{u.role || 'user'}</span>
                {expanded === u.id ? <ChevronUp size={14} color={C.mutedText} /> : <ChevronDown size={14} color={C.mutedText} />}
              </button>

              {/* Expanded controls */}
              {expanded === u.id && (
                <div className="px-4 pb-4 pt-1 border-t space-y-3" style={{ borderColor: C.cream }}>
                  <div>
                    <p className="text-xs font-bold mb-1.5" style={{ color: C.mutedText }}>CHANGE ROLE</p>
                    <div className="flex flex-wrap gap-2">
                      {USER_ROLES.map(role => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(u.id, role)}
                          disabled={saving === u.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: u.role === role ? C.darkGreen : C.cream,
                            color: u.role === role ? C.cream : C.darkGreen,
                            border: 'none',
                            cursor: 'pointer',
                            opacity: saving === u.id ? 0.6 : 1,
                          }}
                        >
                          {u.role === role && saved === u.id ? <Check size={11} className="inline mr-1" /> : null}
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px]" style={{ color: C.mutedText }}>Joined: {new Date(u.created_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SUBSCRIPTION MANAGEMENT TAB ───────────────────────────────────────────────
function SubscriptionTab() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    base44.entities.Subscription.list('-created_date', 200).then(s => { setSubs(s); setLoading(false); });
  }, []);

  const filtered = subs.filter(s =>
    s.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = async (subId, fields) => {
    setSaving(subId);
    await base44.entities.Subscription.update(subId, fields);
    setSubs(prev => prev.map(s => s.id === subId ? { ...s, ...fields } : s));
    setSaving(null);
    setSaved(subId);
    setTimeout(() => setSaved(null), 2000);
  };

  const statusColor = (status) => {
    if (status === 'active') return C.midGreen;
    if (status === 'trial') return C.gold;
    if (status === 'canceled') return '#B84C2A';
    return C.mutedText;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl px-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <Search size={15} color={C.mutedText} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email…"
          className="flex-1 py-3 text-sm bg-transparent outline-none"
          style={{ color: C.darkGreen }}
        />
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 size={20} className="mx-auto animate-spin" color={C.midGreen} /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: C.white, border: `1px dashed ${C.cream}` }}>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No subscriptions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold" style={{ color: C.mutedText }}>{filtered.length} SUBSCRIPTIONS</p>
          {filtered.map(sub => (
            <div key={sub.id} className="rounded-xl overflow-hidden" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              {/* Row */}
              <button
                onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: C.darkGreen }}>{sub.user_email}</p>
                  <p className="text-[11px]" style={{ color: C.mutedText }}>{sub.account_type} plan</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: `${statusColor(sub.status)}20`, color: statusColor(sub.status) }}>{sub.status}</span>
                {expanded === sub.id ? <ChevronUp size={14} color={C.mutedText} /> : <ChevronDown size={14} color={C.mutedText} />}
              </button>

              {/* Expanded controls */}
              {expanded === sub.id && (
                <div className="px-4 pb-4 pt-1 border-t space-y-3" style={{ borderColor: C.cream }}>
                  {saved === sub.id && (
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: C.midGreen }}>
                      <Check size={12} /> Saved
                    </div>
                  )}

                  {/* Status override */}
                  <div>
                    <p className="text-xs font-bold mb-1.5" style={{ color: C.mutedText }}>STATUS OVERRIDE</p>
                    <div className="flex flex-wrap gap-2">
                      {SUB_STATUSES.map(s => (
                        <button
                          key={s}
                          onClick={() => handleUpdate(sub.id, { status: s })}
                          disabled={saving === sub.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{
                            background: sub.status === s ? C.darkGreen : C.cream,
                            color: sub.status === s ? C.cream : C.darkGreen,
                            border: 'none', cursor: 'pointer',
                            opacity: saving === sub.id ? 0.6 : 1,
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account type override */}
                  <div>
                    <p className="text-xs font-bold mb-1.5" style={{ color: C.mutedText }}>ACCOUNT TYPE</p>
                    <div className="flex flex-wrap gap-2">
                      {ACCOUNT_TYPES.map(t => (
                        <button
                          key={t}
                          onClick={() => handleUpdate(sub.id, { account_type: t })}
                          disabled={saving === sub.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{
                            background: sub.account_type === t ? C.midGreen : C.cream,
                            color: sub.account_type === t ? C.white : C.darkGreen,
                            border: 'none', cursor: 'pointer',
                            opacity: saving === sub.id ? 0.6 : 1,
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Danger: cancel */}
                  {sub.status !== 'canceled' && (
                    <button
                      onClick={() => handleUpdate(sub.id, { status: 'canceled', cancel_at_period_end: true })}
                      disabled={saving === sub.id}
                      className="w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                      style={{ background: '#FEF3EE', color: '#B84C2A', border: '1px solid #F4C9B8', cursor: 'pointer' }}
                    >
                      <AlertTriangle size={12} /> Cancel Subscription
                    </button>
                  )}

                  <p className="text-[10px]" style={{ color: C.mutedText }}>
                    Stripe ID: {sub.stripe_subscription_id || 'none'} · Trial ends: {sub.trial_end_date ? new Date(sub.trial_end_date).toLocaleDateString() : '—'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN OWNER DASHBOARD ──────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('waitlist');

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  if (!user) return null;

  if (user.email !== OWNER_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="text-center">
          <p className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>Owner Access Only</p>
          <p className="text-sm mt-2" style={{ color: C.mutedText }}>This dashboard is restricted to the platform owner.</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'waitlist', label: 'Waitlist', icon: <span style={{ fontSize: 14 }}>🌱</span> },
    { id: 'codes', label: 'Access Codes', icon: <Key size={14} /> },
    { id: 'users', label: 'Users', icon: <Users size={14} /> },
    { id: 'subs', label: 'Subscriptions', icon: <CreditCard size={14} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen, paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <Link to="/dashboard" aria-label="Go back" className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, background: '#ffffff18' }}>
          <ChevronLeft size={20} color={C.cream} />
        </Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Owner Dashboard</p>
          <p className="text-[11px]" style={{ color: C.lightGreen }}>Account & subscription management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 sticky z-10" style={{ background: C.white, borderBottom: `1px solid ${C.cream}`, top: 60 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: tab === t.id ? C.darkGreen : 'transparent',
              color: tab === t.id ? C.cream : C.mutedText,
              border: 'none', cursor: 'pointer',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4">
        {tab === 'waitlist' && <WaitlistTab />}
        {tab === 'codes' && <AccessCodesTab />}
        {tab === 'users' && <UserManagementTab />}
        {tab === 'subs' && <SubscriptionTab />}
        <div className="pb-8" />
      </div>
    </div>
  );
}