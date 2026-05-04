import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Users, FileText, Plus, Shield } from "lucide-react";

const ROLES = ["Counselor", "Caseworker", "CPS Worker", "Court Staff", "Mentor", "Behavioral Health Worker", "School Staff", "Therapist", "Juvenile Probation", "Other"];

export default function ProfessionalPortal() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ family_email: "", child_name: "", note: "", recommendation: "", professional_name: "", professional_role: "Counselor" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role === "admin" || u?.role === "professional") {
        base44.entities.ProfessionalNote.list("-created_date", 50).then(setNotes);
      }
    });
  }, []);

  async function handleSubmit() {
    if (!form.note.trim()) return;
    setSaving(true);
    const n = await base44.entities.ProfessionalNote.create(form);
    setNotes(prev => [n, ...prev]);
    setForm({ family_email: "", child_name: "", note: "", recommendation: "", professional_name: "", professional_role: "Counselor" });
    setShowForm(false);
    setSaving(false);
  }

  const isProOrAdmin = user?.role === "admin" || user?.role === "professional";

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <Shield size={18} color={C.lightGreen} />
        <p className="font-serif font-bold" style={{ color: C.cream }}>Professional Portal</p>
        {isProOrAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: C.gold, border: "none", color: C.darkGreen }}
          >
            <Plus size={13} /> Add Note
          </button>
        )}
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {/* Role info */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} color={C.lightGreen} />
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Agency & Professional Access</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            This portal is for counselors, CPS workers, courts, caseworkers, mentors, behavioral health workers, and school staff. Professionals can document notes, observations, and recommendations to support assigned families.
          </p>
        </div>

        {/* Access gate */}
        {!isProOrAdmin && (
          <div className="rounded-2xl p-5 text-center" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <Shield size={32} color={C.cream} className="mx-auto mb-3" />
            <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>Professional Access Required</p>
            <p className="text-xs mb-4" style={{ color: C.mutedText }}>
              Professional access is for counselors, CPS, courts, caseworkers, mentors, behavioral health workers, and approved school staff.
            </p>
            <div className="rounded-xl p-3.5 text-left" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold mb-1.5" style={{ color: C.darkGreen }}>To request professional access:</p>
              <ul className="text-xs space-y-1" style={{ color: C.mutedText }}>
                <li>• Include your agency name and role</li>
                <li>• Use your work email when possible</li>
                <li>• Contact the app administrator for approval</li>
                <li>• Access is assigned on a family-by-family basis</li>
              </ul>
            </div>
            <p className="text-[11px] mt-3" style={{ color: C.mutedText }}>
              Contact: <strong style={{ color: C.darkGreen }}>Misty Stonerock</strong> — Rooted 21 Program
            </p>
          </div>
        )}

        {/* Add note form */}
        {isProOrAdmin && showForm && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>New Professional Note</p>
            <div className="space-y-2.5">
              <input value={form.professional_name} onChange={e => setForm(f => ({ ...f, professional_name: e.target.value }))} placeholder="Your name" className="w-full rounded-xl px-3 py-2.5 text-sm font-sans" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
              <select value={form.professional_role} onChange={e => setForm(f => ({ ...f, professional_role: e.target.value }))} className="w-full rounded-xl px-3 py-2.5 text-sm font-sans" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <input value={form.family_email} onChange={e => setForm(f => ({ ...f, family_email: e.target.value }))} placeholder="Family email (optional)" className="w-full rounded-xl px-3 py-2.5 text-sm font-sans" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
              <input value={form.child_name} onChange={e => setForm(f => ({ ...f, child_name: e.target.value }))} placeholder="Child's first name (optional)" className="w-full rounded-xl px-3 py-2.5 text-sm font-sans" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
              <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Observation or note *" rows={3} className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
              <textarea value={form.recommendation} onChange={e => setForm(f => ({ ...f, recommendation: e.target.value }))} placeholder="Recommendation (optional)" rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border-none font-bold text-sm" style={{ background: C.cream, color: C.mutedText }}>Cancel</button>
                <button onClick={handleSubmit} disabled={saving || !form.note.trim()} className="flex-1 py-2.5 rounded-xl border-none font-bold text-sm" style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}>
                  {saving ? "Saving…" : "Submit Note"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes list */}
        {isProOrAdmin && notes.map(n => (
          <div key={n.id} className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C.midGreen }}>
                <FileText size={13} color="white" />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{n.professional_name || "Professional"}</p>
                <p className="text-[10px]" style={{ color: C.midGreen }}>{n.professional_role}</p>
              </div>
              {n.child_name && <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: C.cream, color: C.darkGreen }}>🧒 {n.child_name}</span>}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.darkGreen }}>{n.note}</p>
            {n.recommendation && (
              <div className="mt-2 rounded-lg px-3 py-2" style={{ background: C.offWhite, borderLeft: `3px solid ${C.gold}` }}>
                <p className="text-[11px] font-bold mb-0.5" style={{ color: C.brown }}>Recommendation</p>
                <p className="text-xs" style={{ color: C.darkText }}>{n.recommendation}</p>
              </div>
            )}
            <p className="text-[10px] mt-2" style={{ color: C.mutedText }}>{new Date(n.created_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}