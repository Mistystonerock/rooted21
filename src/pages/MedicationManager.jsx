import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, Pill, Clock, RefreshCw, ChevronRight, BarChart2, Trash2, Edit3 } from "lucide-react";
import MedBehaviorCorrelation from "@/components/medication/MedBehaviorCorrelation";
import DoseLogModal from "@/components/medication/DoseLogModal";

const FREQ_LABELS = {
  once_daily: "Once daily", twice_daily: "Twice daily",
  three_times_daily: "3x daily", as_needed: "As needed",
  weekly: "Weekly", other: "Other",
};

const TABS = ["Medications", "Dose Log", "Correlations"];

export default function MedicationManager() {
  const [user, setUser] = useState(null);
  const [medications, setMedications] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [logModal, setLogModal] = useState(null); // medication object to log a dose for
  const [form, setForm] = useState({
    child_name: "", medication_name: "", dosage: "", frequency: "once_daily",
    time_of_day: [], prescriber_name: "", prescriber_phone: "", pharmacy_name: "",
    pharmacy_phone: "", refill_date: "", reason: "", side_effects_to_watch: "", notes: "", is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [selectedChild, setSelectedChild] = useState("");

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const [meds, logs] = await Promise.all([
        base44.entities.MedicationRecord.filter({ parent_email: u.email }, "-created_date", 200),
        base44.entities.MedicationDoseLog.filter({ parent_email: u.email }, "-administered_date", 500),
      ]);
      setMedications(meds);
      setDoseLogs(logs);
      setLoading(false);
    });
  }, []);

  const childNames = [...new Set([...medications.map(m => m.child_name), ...doseLogs.map(d => d.child_name)].filter(Boolean))];

  async function handleSaveMed(e) {
    e.preventDefault();
    setSaving(true);
    // parent_email and sensitivity fields are set server-side; never sent from the client.
    if (editingMed) {
      const res = await base44.functions.invoke("updateMedicationRecord", { record_id: editingMed.id, ...form });
      if (res.data?.success) {
        setMedications(prev => prev.map(m => m.id === editingMed.id ? res.data.record : m));
      } else {
        alert(res.data?.error || "Could not update this medication.");
        setSaving(false);
        return;
      }
    } else {
      const res = await base44.functions.invoke("createMedicationRecord", { ...form });
      if (res.data?.success) {
        setMedications(prev => [res.data.record, ...prev]);
      } else {
        alert(res.data?.error || "Could not add this medication.");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setShowForm(false);
    setEditingMed(null);
    setForm({ child_name: "", medication_name: "", dosage: "", frequency: "once_daily", time_of_day: [], prescriber_name: "", prescriber_phone: "", pharmacy_name: "", pharmacy_phone: "", refill_date: "", reason: "", side_effects_to_watch: "", notes: "", is_active: true });
  }

  async function handleDelete(id) {
    if (!confirm("Remove this medication?")) return;
    const res = await base44.functions.invoke("deleteMedicationRecord", { record_id: id });
    if (res.data?.success) {
      setMedications(prev => prev.filter(m => m.id !== id));
    } else {
      alert(res.data?.error || "Could not remove this medication.");
    }
  }

  function openEdit(med) {
    setEditingMed(med);
    setForm({ ...med });
    setShowForm(true);
  }

  const filteredMeds = selectedChild ? medications.filter(m => m.child_name === selectedChild) : medications;
  const filteredLogs = selectedChild ? doseLogs.filter(d => d.child_name === selectedChild) : doseLogs;

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.08)", border: `1px solid ${C.cream}`,
    borderRadius: 8, padding: "9px 12px", color: C.cream, fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="💊 Medications" backTo="/dashboard" />
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="💊 Medication Manager" subtitle="Doses, logs & behavior links" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {/* Tabs */}
        <div style={{ display: "flex", background: C.darkGreen, borderRadius: 12, padding: 4, gap: 2 }}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                background: activeTab === i ? C.gold : "transparent", color: activeTab === i ? C.darkGreen : C.mutedText, border: "none" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Child filter */}
        {childNames.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setSelectedChild("")}
              style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
                background: !selectedChild ? C.gold : "rgba(255,255,255,0.08)", color: !selectedChild ? C.darkGreen : C.cream,
                border: `1px solid ${!selectedChild ? C.gold : "rgba(255,255,255,0.2)"}` }}>All</button>
            {childNames.map(name => (
              <button key={name} onClick={() => setSelectedChild(name)}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: selectedChild === name ? C.gold : "rgba(255,255,255,0.08)", color: selectedChild === name ? C.darkGreen : C.cream,
                  border: `1px solid ${selectedChild === name ? C.gold : "rgba(255,255,255,0.2)"}` }}>{name}</button>
            ))}
          </div>
        )}

        {/* ── TAB 0: Medications ── */}
        {activeTab === 0 && (
          <>
            <button onClick={() => { setShowForm(true); setEditingMed(null); }}
              style={{ width: "100%", padding: "12px", background: C.darkGreen, color: C.cream, fontWeight: 800, fontSize: 13, border: "none", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Plus size={16} /> Add Medication
            </button>

            {showForm && (
              <form onSubmit={handleSaveMed} style={{ background: C.darkGreen, borderRadius: 16, padding: 18, border: `1.5px solid rgba(201,151,58,0.4)` }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: C.cream, marginBottom: 14 }}>{editingMed ? "Edit Medication" : "New Medication"}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Child Name *</label>
                    <input required value={form.child_name} onChange={e => setForm(f => ({ ...f, child_name: e.target.value }))} placeholder="Child's name" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Medication Name *</label>
                    <input required value={form.medication_name} onChange={e => setForm(f => ({ ...f, medication_name: e.target.value }))} placeholder="e.g. Concerta" style={inp} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Dosage *</label>
                    <input required value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} placeholder="e.g. 18mg" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Frequency</label>
                    <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                      style={{ ...inp, appearance: "none" }}>
                      {Object.entries(FREQ_LABELS).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Prescribed For</label>
                  <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. ADHD, anxiety..." style={inp} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Prescriber Name</label>
                    <input value={form.prescriber_name} onChange={e => setForm(f => ({ ...f, prescriber_name: e.target.value }))} placeholder="Dr. Smith" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Prescriber Phone</label>
                    <input value={form.prescriber_phone} onChange={e => setForm(f => ({ ...f, prescriber_phone: e.target.value }))} placeholder="555-000-0000" style={inp} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Pharmacy</label>
                    <input value={form.pharmacy_name} onChange={e => setForm(f => ({ ...f, pharmacy_name: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Refill Date</label>
                    <input type="date" value={form.refill_date} onChange={e => setForm(f => ({ ...f, refill_date: e.target.value }))} style={inp} />
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Side Effects to Watch</label>
                  <input value={form.side_effects_to_watch} onChange={e => setForm(f => ({ ...f, side_effects_to_watch: e.target.value }))} style={inp} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inp, resize: "none" }} />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => { setShowForm(false); setEditingMed(null); }}
                    style={{ flex: 1, padding: 12, background: "rgba(255,255,255,0.1)", color: C.cream, border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={saving}
                    style={{ flex: 2, padding: 12, background: saving ? "rgba(201,151,58,0.4)" : C.gold, color: C.darkGreen, border: "none", borderRadius: 10, fontWeight: 800, cursor: saving ? "default" : "pointer" }}>
                    {saving ? "Saving..." : editingMed ? "Update" : "Add Medication"}
                  </button>
                </div>
              </form>
            )}

            {filteredMeds.length === 0 && !showForm && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>💊</p>
                <p style={{ fontWeight: 700, color: C.cream, fontSize: 14 }}>No medications yet</p>
                <p style={{ color: C.mutedText, fontSize: 12, marginTop: 6 }}>Add a medication above to start tracking doses</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredMeds.map(med => {
                const recentLogs = doseLogs.filter(d => d.medication_record_id === med.id).slice(0, 5);
                const givenCount = recentLogs.filter(d => d.given).length;
                return (
                  <div key={med.id} style={{ background: C.darkGreen, borderRadius: 16, padding: 16, border: `1.5px solid ${med.is_active ? "rgba(26,107,58,0.5)" : "rgba(255,255,255,0.1)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 15, color: C.cream }}>{med.medication_name}</p>
                        <p style={{ fontSize: 12, color: C.mutedText }}>{med.dosage} · {FREQ_LABELS[med.frequency]} · {med.child_name}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(med)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                          <Edit3 size={15} color={C.mutedText} />
                        </button>
                        <button onClick={() => handleDelete(med.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                          <Trash2 size={15} color="#B84C2A" />
                        </button>
                      </div>
                    </div>

                    {med.reason && <p style={{ fontSize: 11, color: C.lightGreen, marginBottom: 6 }}>For: {med.reason}</p>}
                    {med.prescriber_name && <p style={{ fontSize: 11, color: C.mutedText, marginBottom: 4 }}>Dr. {med.prescriber_name} {med.prescriber_phone && `· ${med.prescriber_phone}`}</p>}
                    {med.refill_date && <p style={{ fontSize: 11, color: C.gold }}>🔁 Refill: {med.refill_date}</p>}
                    {med.side_effects_to_watch && <p style={{ fontSize: 11, color: "#F08060", marginTop: 4 }}>⚠️ Watch: {med.side_effects_to_watch}</p>}

                    {recentLogs.length > 0 && (
                      <p style={{ fontSize: 10, color: C.mutedText, marginTop: 8 }}>
                        Last 5 logs: {givenCount}/{recentLogs.length} given
                      </p>
                    )}

                    <button onClick={() => setLogModal(med)}
                      style={{ marginTop: 12, width: "100%", padding: "10px", background: C.gold, color: C.darkGreen, fontWeight: 800, fontSize: 12, border: "none", borderRadius: 10, cursor: "pointer" }}>
                      + Log Today's Dose
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── TAB 1: Dose Log ── */}
        {activeTab === 1 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.mutedText }}>{filteredLogs.length} DOSE ENTRIES</p>
            {filteredLogs.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: C.mutedText, fontSize: 13 }}>No dose logs yet. Log a dose from the Medications tab.</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredLogs.map(log => (
                <div key={log.id} style={{ background: C.darkGreen, borderRadius: 14, padding: "12px 16px", border: `1.5px solid ${log.given ? "rgba(26,107,58,0.4)" : "rgba(184,76,42,0.4)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 13, color: C.cream }}>{log.medication_name}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                      background: log.given ? "rgba(26,107,58,0.3)" : "rgba(184,76,42,0.3)",
                      color: log.given ? C.lightGreen : "#F08060" }}>
                      {log.given ? "✅ Given" : "⏭ Skipped"}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: C.mutedText }}>{log.administered_date} {log.administered_time && `· ${log.administered_time}`} · {log.dosage} · {log.child_name}</p>
                  {log.time_of_day_slot && <p style={{ fontSize: 11, color: C.gold, marginTop: 3 }}>🕐 {log.time_of_day_slot.charAt(0).toUpperCase() + log.time_of_day_slot.slice(1)}</p>}
                  {log.skipped_reason && <p style={{ fontSize: 11, color: "#F08060", marginTop: 3 }}>Reason: {log.skipped_reason}</p>}
                  {log.side_effects_observed && <p style={{ fontSize: 11, color: "#F08060", marginTop: 3 }}>⚠️ {log.side_effects_observed}</p>}
                  {log.notes && <p style={{ fontSize: 11, color: C.mutedText, marginTop: 3 }}>📝 {log.notes}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TAB 2: Correlations ── */}
        {activeTab === 2 && (
          <MedBehaviorCorrelation user={user} childName={selectedChild || null} />
        )}

        <div className="pb-8" />
      </div>

      {logModal && (
        <DoseLogModal
          medication={logModal}
          user={user}
          onClose={() => setLogModal(null)}
          onSaved={() => {
            base44.entities.MedicationDoseLog.filter({ parent_email: user.email }, "-administered_date", 500).then(setDoseLogs);
          }}
        />
      )}
    </div>
  );
}