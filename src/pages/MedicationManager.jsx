import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, Pill, Trash2, Phone, AlertCircle } from "lucide-react";

const BLANK = {
  child_name: "", medication_name: "", dosage: "",
  frequency: "once_daily", time_of_day: [],
  prescriber_name: "", prescriber_phone: "",
  pharmacy_name: "", pharmacy_phone: "",
  refill_date: "", reason: "", side_effects_to_watch: "", notes: "",
};

const TIMES = ["Morning", "Noon", "After School", "Evening", "Bedtime", "As Needed"];
const FREQ_LABELS = {
  once_daily: "Once daily", twice_daily: "Twice daily",
  three_times_daily: "3x daily", as_needed: "As needed",
  weekly: "Weekly", other: "Other",
};

export default function MedicationManager() {
  const [meds, setMeds] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.MedicationRecord.filter({ parent_email: u.email }, "-created_date", 100).then(setMeds);
    });
  }, []);

  async function handleSave() {
    if (!form.child_name || !form.medication_name || !form.dosage) return;
    setSaving(true);
    const created = await base44.entities.MedicationRecord.create({ ...form, parent_email: user.email, is_active: true });
    setMeds(prev => [created, ...prev]);
    setForm(BLANK);
    setShowForm(false);
    setSaving(false);
  }

  async function toggleActive(med) {
    const updated = await base44.entities.MedicationRecord.update(med.id, { is_active: !med.is_active });
    setMeds(prev => prev.map(m => m.id === med.id ? updated : m));
  }

  async function handleDelete(id) {
    await base44.entities.MedicationRecord.delete(id);
    setMeds(prev => prev.filter(m => m.id !== id));
  }

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  function toggleTime(t) {
    setForm(p => ({
      ...p,
      time_of_day: p.time_of_day.includes(t) ? p.time_of_day.filter(x => x !== t) : [...p.time_of_day, t]
    }));
  }

  const filtered = meds.filter(m => activeOnly ? m.is_active : !m.is_active);

  const today = new Date();
  const soonRefills = meds.filter(m => m.is_active && m.refill_date &&
    Math.ceil((new Date(m.refill_date) - today) / (1000 * 60 * 60 * 24)) <= 7 &&
    Math.ceil((new Date(m.refill_date) - today) / (1000 * 60 * 60 * 24)) >= 0
  );

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Medication Manager" subtitle="Track prescriptions & refills" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">

        {/* Refill alert */}
        {soonRefills.length > 0 && (
          <div className="rounded-xl p-3 flex gap-3 items-start" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
            <AlertCircle size={16} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>Refill Due Soon</p>
              {soonRefills.map(m => (
                <p key={m.id} className="text-[11px]" style={{ color: "#B84C2A" }}>
                  {m.medication_name} ({m.child_name}) — refill by {m.refill_date}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Add button */}
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            <Plus size={16} /> Add Medication
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>New Medication</p>

            <input placeholder="Child's name *" value={form.child_name} onChange={e => f("child_name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Medication name *" value={form.medication_name} onChange={e => f("medication_name", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input placeholder="Dosage (e.g. 10mg) *" value={form.dosage} onChange={e => f("dosage", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <select value={form.frequency} onChange={e => f("frequency", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
              {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            <div>
              <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>TIME OF DAY</p>
              <div className="flex flex-wrap gap-2">
                {TIMES.map(t => (
                  <button key={t} onClick={() => toggleTime(t)}
                    className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: form.time_of_day.includes(t) ? C.midGreen : C.offWhite,
                      color: form.time_of_day.includes(t) ? "#fff" : C.darkGreen,
                      border: `1px solid ${form.time_of_day.includes(t) ? C.midGreen : C.cream}`,
                      cursor: "pointer",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <input placeholder="Reason / prescribed for" value={form.reason} onChange={e => f("reason", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Prescriber name" value={form.prescriber_name} onChange={e => f("prescriber_name", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input placeholder="Prescriber phone" value={form.prescriber_phone} onChange={e => f("prescriber_phone", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Pharmacy name" value={form.pharmacy_name} onChange={e => f("pharmacy_name", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input placeholder="Pharmacy phone" value={form.pharmacy_phone} onChange={e => f("pharmacy_phone", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>REFILL DATE</p>
                <input type="date" value={form.refill_date} onChange={e => f("refill_date", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              </div>
            </div>

            <textarea placeholder="Side effects to watch for..." value={form.side_effects_to_watch} onChange={e => f("side_effects_to_watch", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <textarea placeholder="Additional notes..." value={form.notes} onChange={e => f("notes", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="py-2.5 px-4 rounded-xl font-bold text-sm"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Toggle */}
        <div className="flex gap-2">
          {["Active", "Inactive"].map((label, i) => (
            <button key={label} onClick={() => setActiveOnly(i === 0)}
              className="flex-1 py-2 rounded-xl text-xs font-bold"
              style={{
                background: (i === 0) === activeOnly ? C.darkGreen : C.cream,
                color: (i === 0) === activeOnly ? "#fff" : C.darkGreen,
                border: "none", cursor: "pointer"
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: C.mutedText }}>No {activeOnly ? "active" : "inactive"} medications.</p>
          )}
          {filtered.map(med => (
            <div key={med.id} className="rounded-xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Pill size={16} color={C.midGreen} />
                  <div>
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{med.medication_name}</p>
                    <p className="text-[11px]" style={{ color: C.mutedText }}>{med.child_name} • {med.dosage} • {FREQ_LABELS[med.frequency]}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(med)}
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: med.is_active ? "#EAF4EA" : C.cream, color: med.is_active ? C.midGreen : C.mutedText, border: "none", cursor: "pointer" }}>
                    {med.is_active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => handleDelete(med.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Trash2 size={14} color={C.mutedText} />
                  </button>
                </div>
              </div>

              {med.time_of_day?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {med.time_of_day.map(t => (
                    <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.offWhite, color: C.darkGreen }}>⏰ {t}</span>
                  ))}
                </div>
              )}

              {med.reason && <p className="text-[11px] mb-1" style={{ color: C.mutedText }}>Reason: {med.reason}</p>}

              {med.refill_date && (
                <p className="text-[11px] mb-1" style={{ color: new Date(med.refill_date) <= new Date(today.getTime() + 7 * 86400000) ? "#B84C2A" : C.mutedText }}>
                  🔄 Refill by: {med.refill_date}
                </p>
              )}

              {med.side_effects_to_watch && (
                <p className="text-[11px] mb-1" style={{ color: "#B84C2A" }}>⚠️ Watch for: {med.side_effects_to_watch}</p>
              )}

              <div className="flex gap-4 mt-2">
                {med.prescriber_phone && (
                  <a href={`tel:${med.prescriber_phone}`} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.midGreen, textDecoration: "none" }}>
                    <Phone size={10} /> Dr. {med.prescriber_name || "Prescriber"}
                  </a>
                )}
                {med.pharmacy_phone && (
                  <a href={`tel:${med.pharmacy_phone}`} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.midGreen, textDecoration: "none" }}>
                    <Phone size={10} /> {med.pharmacy_name || "Pharmacy"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}