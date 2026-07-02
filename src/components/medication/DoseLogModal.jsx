import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const TIME_SLOTS = [
  { value: "morning", label: "Morning", hint: "6–10 AM" },
  { value: "midday", label: "Midday", hint: "10 AM–1 PM" },
  { value: "afternoon", label: "Afternoon", hint: "1–5 PM" },
  { value: "evening", label: "Evening", hint: "5–8 PM" },
  { value: "night", label: "Night", hint: "8 PM–12 AM" },
];

export default function DoseLogModal({ medication, user, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    administered_date: today,
    administered_time: "",
    time_of_day_slot: "morning",
    given: true,
    skipped_reason: "",
    notes: "",
    side_effects_observed: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // parent_email, child, medication + sensitivity fields are set server-side from the medication record.
    const res = await base44.functions.invoke("createMedicationDoseLog", {
      medication_record_id: medication.id,
      ...form,
    });
    setSaving(false);
    if (res.data?.success) {
      onSaved();
      onClose();
    } else {
      alert(res.data?.error || "Could not save this dose log.");
    }
  }

  const inp = {
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${C.cream}`,
    borderRadius: 8,
    padding: "9px 12px",
    color: C.cream,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: C.darkGreen, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, margin: "0 auto", padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: C.cream }}>Log Dose — {medication.medication_name}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} color={C.cream} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: C.mutedText, marginBottom: 16 }}>{medication.dosage} · {medication.child_name}</p>

        {/* Given / Skipped toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[true, false].map(v => (
            <button key={String(v)} onClick={() => setForm(f => ({ ...f, given: v }))}
              style={{ flex: 1, padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
                background: form.given === v ? (v ? C.midGreen : "#B84C2A") : "rgba(255,255,255,0.08)",
                color: C.cream, border: `1.5px solid ${form.given === v ? (v ? C.midGreen : "#B84C2A") : C.cream}` }}>
              {v ? "✅ Given" : "⏭ Skipped"}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Date</label>
            <input type="date" value={form.administered_date}
              onChange={e => setForm(f => ({ ...f, administered_date: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Time (optional)</label>
            <input type="time" value={form.administered_time}
              onChange={e => setForm(f => ({ ...f, administered_time: e.target.value }))} style={inp} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 6 }}>Time of Day</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TIME_SLOTS.map(s => (
              <button key={s.value} onClick={() => setForm(f => ({ ...f, time_of_day_slot: s.value }))}
                style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: form.time_of_day_slot === s.value ? C.gold : "rgba(255,255,255,0.08)",
                  color: form.time_of_day_slot === s.value ? C.darkGreen : C.cream,
                  border: `1px solid ${form.time_of_day_slot === s.value ? C.gold : "rgba(255,255,255,0.2)"}` }}>
                {s.label} <span style={{ fontWeight: 400, opacity: 0.7 }}>{s.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {!form.given && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Reason skipped</label>
            <input value={form.skipped_reason} onChange={e => setForm(f => ({ ...f, skipped_reason: e.target.value }))}
              placeholder="e.g. child refused, forgot..." style={inp} />
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Side effects observed</label>
          <input value={form.side_effects_observed} onChange={e => setForm(f => ({ ...f, side_effects_observed: e.target.value }))}
            placeholder="e.g. appetite loss, drowsiness..." style={inp} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.mutedText, display: "block", marginBottom: 4 }}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Any additional observations..." rows={2}
            style={{ ...inp, resize: "none" }} />
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ width: "100%", padding: 14, background: saving ? "rgba(201,151,58,0.4)" : C.gold,
            color: C.darkGreen, fontWeight: 800, fontSize: 13, border: "none", borderRadius: 10, cursor: saving ? "default" : "pointer" }}>
          {saving ? "Saving..." : "Save Dose Log"}
        </button>
      </div>
    </div>
  );
}