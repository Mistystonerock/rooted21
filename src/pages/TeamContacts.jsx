import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, Trash2, Phone, Mail, MessageSquare } from "lucide-react";

const ROLES = [
  { value: "caseworker", label: "Caseworker", emoji: "👤" },
  { value: "casa", label: "CASA Volunteer", emoji: "🏠" },
  { value: "gal", label: "Guardian ad Litem", emoji: "⚖️" },
  { value: "therapist", label: "Therapist", emoji: "🧠" },
  { value: "attorney", label: "Attorney", emoji: "📋" },
  { value: "school_counselor", label: "School Counselor", emoji: "🏫" },
  { value: "teacher", label: "Teacher", emoji: "📚" },
  { value: "doctor", label: "Doctor / Specialist", emoji: "🏥" },
  { value: "judge", label: "Judge", emoji: "⚖️" },
  { value: "court_clerk", label: "Court Clerk", emoji: "🏛️" },
  { value: "supervisor", label: "Supervisor", emoji: "👔" },
  { value: "other", label: "Other", emoji: "📞" },
];

const BLANK = { name: "", role: "caseworker", agency: "", phone: "", email: "", fax: "", best_time_to_call: "", notes: "", child_name: "" };

export default function TeamContacts() {
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.TeamContact.filter({ parent_email: u.email }, "name", 200).then(setContacts);
    });
  }, []);

  async function handleSave() {
    if (!form.name || !form.role) return;
    setSaving(true);
    const created = await base44.entities.TeamContact.create({ ...form, parent_email: user.email });
    setContacts(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(BLANK);
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id) {
    await base44.entities.TeamContact.delete(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  const roleMap = Object.fromEntries(ROLES.map(r => [r.value, r]));

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.agency?.toLowerCase().includes(search.toLowerCase()) || c.child_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || c.role === filterRole;
    return matchSearch && matchRole;
  });

  const grouped = filtered.reduce((acc, c) => {
    const role = roleMap[c.role]?.label || "Other";
    if (!acc[role]) acc[role] = [];
    acc[role].push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Team Contacts" subtitle="Your personal support directory" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <input
          placeholder="Search contacts…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
          style={{ borderColor: C.cream, background: C.white }}
        />

        {/* Role filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterRole("all")}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: filterRole === "all" ? C.darkGreen : C.cream, color: filterRole === "all" ? "#fff" : C.darkGreen, border: "none", cursor: "pointer" }}>
            All
          </button>
          {ROLES.map(r => (
            <button key={r.value} onClick={() => setFilterRole(r.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: filterRole === r.value ? C.darkGreen : C.cream, color: filterRole === r.value ? "#fff" : C.darkGreen, border: "none", cursor: "pointer" }}>
              {r.emoji} {r.label}
            </button>
          ))}
        </div>

        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            <Plus size={16} /> Add Contact
          </button>
        )}

        {showForm && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>New Contact</p>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Full name *" value={form.name} onChange={e => f("name", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <select value={form.role} onChange={e => f("role", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Agency / Organization" value={form.agency} onChange={e => f("agency", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input placeholder="Which child?" value={form.child_name} onChange={e => f("child_name", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Phone" value={form.phone} onChange={e => f("phone", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input placeholder="Email" value={form.email} onChange={e => f("email", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Fax (optional)" value={form.fax} onChange={e => f("fax", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input placeholder="Best time to call" value={form.best_time_to_call} onChange={e => f("best_time_to_call", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <textarea placeholder="Notes (e.g. prefers text, has voicemail issues)" value={form.notes} onChange={e => f("notes", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                {saving ? "Saving…" : "Save Contact"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="py-2.5 px-4 rounded-xl font-bold text-sm"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Contacts grouped by role */}
        {Object.keys(grouped).length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: C.mutedText }}>No contacts yet. Add your caseworker, therapist, CASA, and more.</p>
        )}

        {Object.entries(grouped).map(([role, roleContacts]) => (
          <div key={role}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>{role.toUpperCase()}</p>
            <div className="space-y-2">
              {roleContacts.map(c => {
                const roleInfo = roleMap[c.role];
                return (
                  <div key={c.id} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{roleInfo?.emoji}</span>
                        <div>
                          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{c.name}</p>
                          {c.agency && <p className="text-[11px]" style={{ color: C.mutedText }}>{c.agency}</p>}
                          {c.child_name && <p className="text-[10px]" style={{ color: C.midGreen }}>For: {c.child_name}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <Trash2 size={14} color={C.mutedText} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                          style={{ background: "#EAF4EA", color: C.midGreen, textDecoration: "none" }}>
                          <Phone size={10} /> {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                          style={{ background: C.offWhite, color: C.darkGreen, textDecoration: "none" }}>
                          <Mail size={10} /> Email
                        </a>
                      )}
                      {c.phone && (
                        <a href={`sms:${c.phone}`} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                          style={{ background: C.offWhite, color: C.darkGreen, textDecoration: "none" }}>
                          <MessageSquare size={10} /> Text
                        </a>
                      )}
                    </div>

                    {c.best_time_to_call && <p className="text-[10px] mt-1.5" style={{ color: C.mutedText }}>⏰ Best time: {c.best_time_to_call}</p>}
                    {c.fax && <p className="text-[10px]" style={{ color: C.mutedText }}>📠 Fax: {c.fax}</p>}
                    {c.notes && <p className="text-[10px] mt-1 italic" style={{ color: C.mutedText }}>{c.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="pb-8" />
      </div>
    </div>
  );
}