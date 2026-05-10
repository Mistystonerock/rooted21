import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, Trash2, CheckCircle, Circle, Upload } from "lucide-react";

const SERVICE_STATUSES = {
  not_started: { label: "Not Started", color: C.mutedText, bg: C.cream },
  in_progress: { label: "In Progress", color: C.brown, bg: "#FFF3E0" },
  completed: { label: "Completed", color: C.midGreen, bg: "#EAF4EA" },
};

const COMMON_SERVICES = [
  "Parenting Classes", "Substance Abuse Treatment", "Drug Testing",
  "Domestic Violence Program", "Mental Health Counseling", "Housing Stability",
  "Employment / Income Verification", "Visitation Compliance", "Home Study",
];

export default function ReunificationTracker() {
  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ child_name: "", case_number: "", caseworker_name: "", caseworker_email: "", court_date: "", target_reunification_date: "", notes: "", services: [] });
  const [saving, setSaving] = useState(false);
  const [activePlanId, setActivePlanId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.ReunificationPlan.filter({ parent_email: u.email }, "-created_date", 20).then(data => {
        setPlans(data);
        if (data.length > 0 && !activePlanId) setActivePlanId(data[0].id);
      });
    });
  }, []);

  function addService(name = "") {
    setForm(p => ({
      ...p,
      services: [...(p.services || []), { id: Date.now().toString(), name, provider: "", status: "not_started", completion_date: "", proof_url: "", notes: "" }]
    }));
  }

  function updateService(idx, key, val) {
    setForm(p => {
      const services = [...p.services];
      services[idx] = { ...services[idx], [key]: val };
      return { ...p, services };
    });
  }

  function removeService(idx) {
    setForm(p => ({ ...p, services: p.services.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    if (!form.child_name) return;
    setSaving(true);
    const created = await base44.entities.ReunificationPlan.create({ ...form, parent_email: user.email });
    setPlans(prev => [created, ...prev]);
    setActivePlanId(created.id);
    setShowForm(false);
    setSaving(false);
  }

  async function updateServiceStatus(plan, svcIdx, newStatus) {
    const services = [...(plan.services || [])];
    services[svcIdx] = { ...services[svcIdx], status: newStatus, completion_date: newStatus === "completed" ? new Date().toISOString().slice(0, 10) : services[svcIdx].completion_date };
    const updated = await base44.entities.ReunificationPlan.update(plan.id, { services });
    setPlans(prev => prev.map(p => p.id === plan.id ? updated : p));
  }

  async function handleDelete(id) {
    await base44.entities.ReunificationPlan.delete(id);
    setPlans(prev => prev.filter(p => p.id !== id));
    setActivePlanId(null);
  }

  const activePlan = plans.find(p => p.id === activePlanId);
  const completed = activePlan?.services?.filter(s => s.status === "completed").length || 0;
  const total = activePlan?.services?.length || 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Reunification Tracker" subtitle="Court-ordered service completion" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Plan selector */}
        {plans.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {plans.map(p => (
              <button key={p.id} onClick={() => setActivePlanId(p.id)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold"
                style={{
                  background: activePlanId === p.id ? C.darkGreen : C.white,
                  color: activePlanId === p.id ? "#fff" : C.darkGreen,
                  border: `1px solid ${activePlanId === p.id ? C.darkGreen : C.cream}`,
                  cursor: "pointer",
                }}>
                {p.child_name}
              </button>
            ))}
          </div>
        )}

        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            <Plus size={16} /> New Reunification Plan
          </button>
        )}

        {showForm && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>New Plan</p>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Child's name *" value={form.child_name} onChange={e => setForm(p => ({ ...p, child_name: e.target.value }))}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input placeholder="Case number" value={form.case_number} onChange={e => setForm(p => ({ ...p, case_number: e.target.value }))}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Caseworker name" value={form.caseworker_name} onChange={e => setForm(p => ({ ...p, caseworker_name: e.target.value }))}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input placeholder="Caseworker email" value={form.caseworker_email} onChange={e => setForm(p => ({ ...p, caseworker_email: e.target.value }))}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>NEXT COURT DATE</p>
                <input type="date" value={form.court_date} onChange={e => setForm(p => ({ ...p, court_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>TARGET DATE</p>
                <input type="date" value={form.target_reunification_date} onChange={e => setForm(p => ({ ...p, target_reunification_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>COURT-ORDERED SERVICES</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {COMMON_SERVICES.map(s => (
                  <button key={s} onClick={() => addService(s)}
                    className="px-2 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}`, cursor: "pointer" }}>
                    + {s}
                  </button>
                ))}
              </div>
              {form.services.map((svc, idx) => (
                <div key={svc.id} className="flex items-center gap-2 mb-1.5">
                  <input value={svc.name} onChange={e => updateService(idx, "name", e.target.value)}
                    placeholder="Service name" className="flex-1 px-2 py-1.5 rounded-lg text-xs border outline-none"
                    style={{ borderColor: C.cream, background: C.offWhite }} />
                  <button onClick={() => removeService(idx)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Trash2 size={12} color={C.mutedText} />
                  </button>
                </div>
              ))}
              <button onClick={() => addService()} className="text-xs font-bold mt-1"
                style={{ background: "none", border: "none", color: C.midGreen, cursor: "pointer" }}>
                + Add custom service
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                {saving ? "Saving…" : "Create Plan"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="py-2.5 px-4 rounded-xl font-bold text-sm"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Active plan view */}
        {activePlan && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
              <div className="flex justify-between mb-2">
                <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>{activePlan.child_name}'s Plan</p>
                <p className="font-bold text-sm" style={{ color: C.gold }}>{pct}%</p>
              </div>
              <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "#ffffff30" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.gold }} />
              </div>
              <p className="text-[11px]" style={{ color: C.lightGreen }}>{completed} of {total} services completed</p>
              <div className="flex gap-4 mt-3">
                {activePlan.court_date && <p className="text-[10px]" style={{ color: C.lightGreen }}>⚖️ Court: {activePlan.court_date}</p>}
                {activePlan.target_reunification_date && <p className="text-[10px]" style={{ color: C.lightGreen }}>🎯 Target: {activePlan.target_reunification_date}</p>}
              </div>
              {activePlan.caseworker_name && <p className="text-[10px] mt-1" style={{ color: C.lightGreen }}>Caseworker: {activePlan.caseworker_name}</p>}
            </div>

            {/* Services */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>COURT-ORDERED SERVICES</p>
              {(activePlan.services || []).map((svc, idx) => {
                const st = SERVICE_STATUSES[svc.status] || SERVICE_STATUSES.not_started;
                return (
                  <div key={svc.id || idx} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {svc.status === "completed"
                          ? <CheckCircle size={16} color={C.midGreen} />
                          : <Circle size={16} color={C.cream} />
                        }
                        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{svc.name}</p>
                      </div>
                      <select value={svc.status}
                        onChange={e => updateServiceStatus(activePlan, idx, e.target.value)}
                        className="text-[10px] font-bold px-2 py-1 rounded-full border-none outline-none cursor-pointer"
                        style={{ background: st.bg, color: st.color }}>
                        {Object.entries(SERVICE_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    {svc.completion_date && <p className="text-[10px] mt-1 ml-6" style={{ color: C.mutedText }}>Completed: {svc.completion_date}</p>}
                  </div>
                );
              })}
              {(activePlan.services || []).length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: C.mutedText }}>No services added yet.</p>
              )}
            </div>

            <button onClick={() => handleDelete(activePlan.id)}
              className="w-full py-2 rounded-xl text-xs font-bold"
              style={{ background: "#FEF3EE", color: "#B84C2A", border: "1px solid #F4C9B8", cursor: "pointer" }}>
              Delete This Plan
            </button>
          </div>
        )}
        <div className="pb-8" />
      </div>
    </div>
  );
}