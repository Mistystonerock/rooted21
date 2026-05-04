import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Shield, Users, Plus, Search, RefreshCw } from "lucide-react";
import FamilyCard from "@/components/professional/FamilyCard";
import FamilyDetail from "@/components/professional/FamilyDetail";

const ROLES = ["Counselor", "Caseworker", "CPS Worker", "Court Staff", "Mentor", "Behavioral Health Worker", "School Staff", "Therapist", "Juvenile Probation", "Other"];

export default function ProfessionalPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState([]);
  const [familyData, setFamilyData] = useState({}); // { [family_email]: { checkins, lessons, goals, notes } }
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [search, setSearch] = useState("");
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({ family_email: "", family_name: "", child_name: "", professional_role: "Counselor" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      if (u?.role === "admin" || u?.role === "professional") {
        await loadFamilies(u);
      }
      setLoading(false);
    });
  }, []);

  async function loadFamilies(u) {
    const query = u.role === "admin" ? {} : { professional_email: u.email };
    const assigned = await base44.entities.AssignedFamily.filter(query, "-created_date", 100);
    setFamilies(assigned);

    // Load data for each family in parallel
    const dataMap = {};
    await Promise.all(assigned.map(async fam => {
      const email = fam.family_email;
      const [checkins, lessons, goals, notes] = await Promise.all([
        base44.entities.CheckIn.filter({ created_by: email }, "-created_date", 60).catch(() => []),
        base44.entities.LessonProgress.filter({ created_by: email }).catch(() => []),
        base44.entities.Goal.filter({ created_by: email }).catch(() => []),
        base44.entities.ProfessionalNote.filter({ family_email: email }, "-created_date", 20).catch(() => []),
      ]);
      dataMap[email] = { checkins, lessons, goals, notes };
    }));
    setFamilyData(dataMap);
  }

  async function handleAssign() {
    if (!assignForm.family_email.trim()) return;
    setSaving(true);
    const f = await base44.entities.AssignedFamily.create({
      ...assignForm,
      professional_email: user.email,
      status: "active",
    });
    setFamilies(prev => [f, ...prev]);
    setFamilyData(prev => ({ ...prev, [f.family_email]: { checkins: [], lessons: [], goals: [], notes: [] } }));
    setAssignForm({ family_email: "", family_name: "", child_name: "", professional_role: "Counselor" });
    setShowAssignForm(false);
    setSaving(false);
  }

  const isProOrAdmin = user?.role === "admin" || user?.role === "professional";

  const filtered = families.filter(f => {
    const q = search.toLowerCase();
    return (
      f.family_name?.toLowerCase().includes(q) ||
      f.family_email?.toLowerCase().includes(q) ||
      f.child_name?.toLowerCase().includes(q)
    );
  });

  // ── DETAIL VIEW ──
  if (selectedFamily) {
    const data = familyData[selectedFamily.family_email] || {};
    return (
      <FamilyDetail
        family={selectedFamily}
        checkins={data.checkins || []}
        lessons={data.lessons || []}
        goals={data.goals || []}
        notes={data.notes || []}
        user={user}
        onBack={() => setSelectedFamily(null)}
        onNoteSaved={() => {
          // refresh notes for this family
          base44.entities.ProfessionalNote.filter({ family_email: selectedFamily.family_email }, "-created_date", 20)
            .then(notes => setFamilyData(prev => ({
              ...prev,
              [selectedFamily.family_email]: { ...prev[selectedFamily.family_email], notes }
            })));
        }}
      />
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <Shield size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Professional Portal</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Rooted 21 · TBRI® Dashboard</p>
        </div>
        {isProOrAdmin && (
          <button
            onClick={() => setShowAssignForm(true)}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
            style={{ background: C.gold, border: "none", color: C.darkGreen }}
          >
            <Plus size={13} /> Add Family
          </button>
        )}
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-4 space-y-3">

        {/* Access gate */}
        {!loading && !isProOrAdmin && (
          <div className="rounded-2xl p-5 text-center" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <Shield size={32} color={C.cream} className="mx-auto mb-3" />
            <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>Professional Access Required</p>
            <p className="text-xs mb-4" style={{ color: C.mutedText }}>
              This dashboard is for therapists, CPS workers, caseworkers, court staff, and behavioral health professionals assigned to families in the HALO program.
            </p>
            <div className="rounded-xl p-3.5 text-left" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold mb-1.5" style={{ color: C.darkGreen }}>To request access:</p>
              <ul className="text-xs space-y-1" style={{ color: C.mutedText }}>
                <li>• Contact the program administrator with your agency and role</li>
                <li>• Use your professional work email</li>
                <li>• Access is assigned on a family-by-family basis</li>
              </ul>
            </div>
            <p className="text-[11px] mt-3" style={{ color: C.mutedText }}>
              Contact: <strong style={{ color: C.darkGreen }}>Misty Stonerock</strong> — HALO Project Program
            </p>
          </div>
        )}

        {loading && isProOrAdmin === undefined && (
          <div className="text-center py-10">
            <div className="w-7 h-7 border-4 border-t-transparent rounded-full mx-auto animate-spin" style={{ borderColor: `${C.cream} transparent ${C.cream} ${C.cream}` }} />
          </div>
        )}

        {isProOrAdmin && (
          <>
            {/* Assign family form */}
            {showAssignForm && (
              <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
                <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Assign a Family</p>
                <div className="space-y-2.5">
                  <input
                    value={assignForm.family_email}
                    onChange={e => setAssignForm(f => ({ ...f, family_email: e.target.value }))}
                    placeholder="Family email address *"
                    type="email"
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                    style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                  />
                  <input
                    value={assignForm.family_name}
                    onChange={e => setAssignForm(f => ({ ...f, family_name: e.target.value }))}
                    placeholder="Family name (e.g. Smith Family)"
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                    style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                  />
                  <input
                    value={assignForm.child_name}
                    onChange={e => setAssignForm(f => ({ ...f, child_name: e.target.value }))}
                    placeholder="Child's first name"
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                    style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                  />
                  <select
                    value={assignForm.professional_role}
                    onChange={e => setAssignForm(f => ({ ...f, professional_role: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                    style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                  >
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAssignForm(false)} className="flex-1 py-2.5 rounded-xl border-none font-bold text-sm" style={{ background: C.cream, color: C.mutedText }}>Cancel</button>
                    <button onClick={handleAssign} disabled={saving || !assignForm.family_email.trim()} className="flex-1 py-2.5 rounded-xl border-none font-bold text-sm" style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}>
                      {saving ? "Assigning…" : "Assign Family"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary bar */}
            {families.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Assigned", value: families.length },
                  { label: "Active", value: families.filter(f => f.status === "active").length },
                  { label: "Completed", value: families.filter(f => f.status === "completed").length },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                    <p className="text-xl font-extrabold" style={{ color: C.darkGreen }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: C.mutedText }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            {families.length > 3 && (
              <div className="relative">
                <Search size={14} color={C.mutedText} className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search families…"
                  className="w-full rounded-xl pl-8 pr-3 py-2.5 text-sm font-sans"
                  style={{ border: `1.5px solid ${C.cream}`, background: C.white }}
                />
              </div>
            )}

            {/* Family cards */}
            {filtered.length === 0 && !showAssignForm && (
              <div className="text-center py-12 rounded-2xl" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
                <Users size={28} color={C.cream} className="mx-auto mb-2" />
                <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No families assigned yet</p>
                <p className="text-xs mt-1 mb-3" style={{ color: C.mutedText }}>Add a family to begin monitoring their progress.</p>
                <button onClick={() => setShowAssignForm(true)} className="text-xs font-bold px-4 py-2 rounded-lg border-none" style={{ background: C.darkGreen, color: C.white }}>
                  + Assign First Family
                </button>
              </div>
            )}

            <div className="space-y-3">
              {filtered.map(fam => {
                const data = familyData[fam.family_email] || {};
                return (
                  <FamilyCard
                    key={fam.id}
                    family={fam}
                    checkins={data.checkins || []}
                    lessons={data.lessons || []}
                    onClick={() => setSelectedFamily(fam)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}