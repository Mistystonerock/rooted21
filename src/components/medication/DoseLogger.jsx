import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Plus, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const TIMES = ["Morning", "Noon", "After School", "Evening", "Bedtime", "As Needed"];
const MOOD_EMOJIS = { 1: "😟", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

function RatingPicker({ value, onChange, label, color }) {
  return (
    <div>
      <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="flex-1 flex flex-col items-center py-1.5 rounded-lg text-lg transition-all"
            style={{
              background: value === n ? color + "22" : C.offWhite,
              border: `1.5px solid ${value === n ? color : C.cream}`,
              cursor: "pointer",
            }}
          >
            <span>{MOOD_EMOJIS[n]}</span>
            <span className="text-[9px] font-bold" style={{ color: value === n ? color : C.mutedText }}>{n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DoseLogger({ user, meds }) {
  const [doses, setDoses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    medication_id: "", time_of_day: "Morning", given: true,
    skipped_reason: "", behavior_before: null, behavior_after: null, notes: "",
    given_at: new Date().toISOString().slice(0, 16),
  });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) return;
    base44.entities.MedicationDose.filter({ parent_email: user.email }, "-given_at", 60).then(setDoses);
  }, [user]);

  const activeMeds = meds.filter(m => m.is_active);
  const selectedMed = activeMeds.find(m => m.id === form.medication_id);

  async function handleSave() {
    if (!form.medication_id) return;
    setSaving(true);
    const payload = {
      parent_email: user.email,
      child_name: selectedMed.child_name,
      medication_id: form.medication_id,
      medication_name: selectedMed.medication_name,
      dosage: selectedMed.dosage,
      given_at: new Date(form.given_at).toISOString(),
      time_of_day: form.time_of_day,
      given: form.given,
      skipped_reason: form.given ? "" : form.skipped_reason,
      behavior_before: form.behavior_before,
      behavior_after: form.behavior_after,
      notes: form.notes,
    };
    const created = await base44.entities.MedicationDose.create(payload);
    setDoses(prev => [created, ...prev]);
    setForm({
      medication_id: "", time_of_day: "Morning", given: true,
      skipped_reason: "", behavior_before: null, behavior_after: null, notes: "",
      given_at: new Date().toISOString().slice(0, 16),
    });
    setShowForm(false);
    setSaving(false);
  }

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  // Group doses by date
  const grouped = doses.reduce((acc, d) => {
    const date = new Date(d.given_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> Log a Dose
        </button>
      ) : (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Log Dose</p>

          <select
            value={form.medication_id}
            onChange={e => f("medication_id", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          >
            <option value="">Select medication *</option>
            {activeMeds.map(m => (
              <option key={m.id} value={m.id}>{m.medication_name} — {m.child_name} ({m.dosage})</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>DATE & TIME</p>
              <input
                type="datetime-local"
                value={form.given_at}
                onChange={e => f("given_at", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>TIME OF DAY</p>
              <select
                value={form.time_of_day}
                onChange={e => f("time_of_day", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              >
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Given or skipped */}
          <div>
            <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>WAS DOSE GIVEN?</p>
            <div className="flex gap-2">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => f("given", val)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs"
                  style={{
                    background: form.given === val ? (val ? "#EAF4EA" : "#FEF3EE") : C.offWhite,
                    border: `1.5px solid ${form.given === val ? (val ? C.midGreen : "#F4C9B8") : C.cream}`,
                    color: form.given === val ? (val ? C.midGreen : "#B84C2A") : C.mutedText,
                    cursor: "pointer",
                  }}
                >
                  {val ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {val ? "Given" : "Skipped"}
                </button>
              ))}
            </div>
            {!form.given && (
              <input
                placeholder="Reason skipped..."
                value={form.skipped_reason}
                onChange={e => f("skipped_reason", e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            )}
          </div>

          {form.given && (
            <>
              <RatingPicker value={form.behavior_before} onChange={v => f("behavior_before", v)} label="BEHAVIOR BEFORE DOSE" color={C.brown} />
              <RatingPicker value={form.behavior_after} onChange={v => f("behavior_after", v)} label="BEHAVIOR 1-2 HRS AFTER" color={C.midGreen} />
            </>
          )}

          <textarea
            placeholder="Any notes about this dose..."
            value={form.notes}
            onChange={e => f("notes", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.medication_id}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer", opacity: !form.medication_id ? 0.5 : 1 }}>
              {saving ? "Saving…" : "Save Dose"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="py-2.5 px-4 rounded-xl font-bold text-sm"
              style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dose history */}
      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-sm py-6" style={{ color: C.mutedText }}>No doses logged yet. Tap "Log a Dose" to start tracking.</p>
      )}

      {Object.entries(grouped).map(([date, dayDoses]) => (
        <div key={date}>
          <p className="text-[10px] font-bold mb-2 px-1" style={{ color: C.mutedText }}>{date.toUpperCase()}</p>
          <div className="space-y-2">
            {dayDoses.map(dose => (
              <div key={dose.id} className="rounded-xl overflow-hidden" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <button
                  onClick={() => setExpandedId(expandedId === dose.id ? null : dose.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{ background: "transparent", border: "none", cursor: "pointer" }}
                >
                  {dose.given
                    ? <CheckCircle2 size={16} color={C.midGreen} className="flex-shrink-0" />
                    : <XCircle size={16} color="#B84C2A" className="flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{dose.medication_name}</p>
                    <p className="text-[11px]" style={{ color: C.mutedText }}>
                      {dose.child_name} · {dose.dosage} · {dose.time_of_day} · {new Date(dose.given_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {dose.behavior_before && dose.behavior_after && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                        background: dose.behavior_after >= dose.behavior_before ? "#EAF4EA" : "#FEF3EE",
                        color: dose.behavior_after >= dose.behavior_before ? C.midGreen : "#B84C2A",
                      }}>
                        {dose.behavior_after >= dose.behavior_before ? "↑" : "↓"} {MOOD_EMOJIS[dose.behavior_after]}
                      </span>
                    )}
                    {expandedId === dose.id ? <ChevronUp size={14} color={C.mutedText} /> : <ChevronDown size={14} color={C.mutedText} />}
                  </div>
                </button>

                {expandedId === dose.id && (
                  <div className="px-4 pb-3 space-y-2 border-t" style={{ borderColor: C.cream }}>
                    {!dose.given && dose.skipped_reason && (
                      <p className="text-xs" style={{ color: "#B84C2A" }}>Skipped: {dose.skipped_reason}</p>
                    )}
                    {dose.behavior_before && (
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>BEFORE</p>
                          <p className="text-lg">{MOOD_EMOJIS[dose.behavior_before]} <span className="text-xs font-bold" style={{ color: C.darkGreen }}>{dose.behavior_before}/5</span></p>
                        </div>
                        {dose.behavior_after && (
                          <div>
                            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>AFTER</p>
                            <p className="text-lg">{MOOD_EMOJIS[dose.behavior_after]} <span className="text-xs font-bold" style={{ color: C.darkGreen }}>{dose.behavior_after}/5</span></p>
                          </div>
                        )}
                      </div>
                    )}
                    {dose.notes && <p className="text-xs" style={{ color: C.mutedText }}>{dose.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pb-4" />
    </div>
  );
}