import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, Trash2, FileText, AlertTriangle, CheckCircle } from "lucide-react";

const INCIDENT_TYPES = [
  { value: "school_restraint", label: "School Restraint", emoji: "🏫" },
  { value: "police_contact", label: "Police Contact", emoji: "🚔" },
  { value: "runaway", label: "Runaway", emoji: "🏃" },
  { value: "hospitalization", label: "Hospitalization", emoji: "🏥" },
  { value: "self_harm", label: "Self-Harm", emoji: "⚠️" },
  { value: "aggression", label: "Aggression", emoji: "👊" },
  { value: "property_damage", label: "Property Damage", emoji: "💥" },
  { value: "other", label: "Other", emoji: "📋" },
];

const BLANK = {
  child_name: "", incident_type: "other",
  incident_date: "", incident_time: "", location: "",
  what_led_up: "", description: "", parent_response: "",
  others_present: "", injuries: "",
  caseworker_notified: false, school_notified: false,
  police_report_number: "", hospital_name: "",
  follow_up_actions: "", status: "draft",
};

export default function IncidentReportBuilder() {
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.IncidentReport.filter({ parent_email: u.email }, "-incident_date", 100).then(setReports);
    });
  }, []);

  async function handleSave(status = "draft") {
    if (!form.child_name || !form.incident_date || !form.description) return;
    setSaving(true);
    const created = await base44.entities.IncidentReport.create({ ...form, status, parent_email: user.email });
    setReports(prev => [created, ...prev]);
    setForm(BLANK);
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id) {
    await base44.entities.IncidentReport.delete(id);
    setReports(prev => prev.filter(r => r.id !== id));
  }

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  const statusStyle = {
    draft: { bg: C.cream, color: C.mutedText, label: "Draft" },
    submitted: { bg: "#EAF4EA", color: C.midGreen, label: "Submitted" },
    filed: { bg: "#EEF0FF", color: "#4A5CD0", label: "Filed" },
  };

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Incident Reports" subtitle="Document critical events for court & CPS" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Warning */}
        <div className="rounded-xl p-3 flex gap-2" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <AlertTriangle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
            In any immediate danger, call <strong>911</strong> first. Self-harm crisis? Call/text <strong>988</strong>.
            Use this tool to document incidents after safety is secured.
          </p>
        </div>

        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            <Plus size={16} /> New Incident Report
          </button>
        )}

        {showForm && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Document Incident</p>

            <input placeholder="Child's name *" value={form.child_name} onChange={e => f("child_name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <div>
              <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>INCIDENT TYPE *</p>
              <div className="grid grid-cols-2 gap-2">
                {INCIDENT_TYPES.map(t => (
                  <button key={t.value} onClick={() => f("incident_type", t.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-left"
                    style={{
                      background: form.incident_type === t.value ? C.darkGreen : C.offWhite,
                      color: form.incident_type === t.value ? "#fff" : C.darkGreen,
                      border: `1px solid ${form.incident_type === t.value ? C.darkGreen : C.cream}`,
                      cursor: "pointer",
                    }}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={form.incident_date} onChange={e => f("incident_date", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input type="time" value={form.incident_time} onChange={e => f("incident_time", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <input placeholder="Location" value={form.location} onChange={e => f("location", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <textarea placeholder="What led up to this? (Context / triggers)" value={form.what_led_up} onChange={e => f("what_led_up", e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <textarea placeholder="Full description of what happened *" value={form.description} onChange={e => f("description", e.target.value)} rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <textarea placeholder="How did you respond?" value={form.parent_response} onChange={e => f("parent_response", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <input placeholder="Others present (names / roles)" value={form.others_present} onChange={e => f("others_present", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <input placeholder="Any injuries (describe or 'none')" value={form.injuries} onChange={e => f("injuries", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <div className="space-y-2">
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>NOTIFICATIONS</p>
              <label className="flex items-center gap-2 text-sm" style={{ color: C.darkGreen }}>
                <input type="checkbox" checked={form.caseworker_notified} onChange={e => f("caseworker_notified", e.target.checked)} />
                Caseworker notified
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: C.darkGreen }}>
                <input type="checkbox" checked={form.school_notified} onChange={e => f("school_notified", e.target.checked)} />
                School notified
              </label>
            </div>

            {form.incident_type === "police_contact" && (
              <input placeholder="Police report number" value={form.police_report_number} onChange={e => f("police_report_number", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            )}

            {form.incident_type === "hospitalization" && (
              <input placeholder="Hospital name" value={form.hospital_name} onChange={e => f("hospital_name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            )}

            <textarea placeholder="Follow-up actions planned" value={form.follow_up_actions} onChange={e => f("follow_up_actions", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <div className="flex gap-2">
              <button onClick={() => handleSave("draft")} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
                Save Draft
              </button>
              <button onClick={() => handleSave("submitted")} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                {saving ? "Saving…" : "Submit Report"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="py-2.5 px-3 rounded-xl font-bold text-xs"
                style={{ background: C.offWhite, color: C.mutedText, border: `1px solid ${C.cream}`, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reports list */}
        <div className="space-y-3">
          {reports.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: C.mutedText }}>No incident reports yet.</p>
          )}
          {reports.map(r => {
            const typeInfo = INCIDENT_TYPES.find(t => t.value === r.incident_type);
            const st = statusStyle[r.status] || statusStyle.draft;
            return (
              <div key={r.id} className="rounded-xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeInfo?.emoji}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{r.child_name}</p>
                      <p className="text-[11px]" style={{ color: C.mutedText }}>{typeInfo?.label} • {r.incident_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    <button onClick={() => handleDelete(r.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <Trash2 size={14} color={C.mutedText} />
                    </button>
                  </div>
                </div>
                {r.description && (
                  <p className="text-[11px] mt-2 leading-relaxed line-clamp-2" style={{ color: C.mutedText }}>{r.description}</p>
                )}
                <div className="flex gap-3 mt-2">
                  {r.caseworker_notified && <span className="text-[10px] flex items-center gap-0.5" style={{ color: C.midGreen }}><CheckCircle size={10} /> Caseworker</span>}
                  {r.school_notified && <span className="text-[10px] flex items-center gap-0.5" style={{ color: C.midGreen }}><CheckCircle size={10} /> School</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}