import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import MonthlyConsistencyReport from "@/components/visitation/MonthlyConsistencyReport";

const EMOTIONS = ["calm", "anxious", "excited", "upset", "withdrawn"];
const VISIT_TYPES = ["parent", "sibling", "relative", "other"];

const BLANK = {
  child_name: "", visit_type: "parent", visitor_name: "",
  visit_date: "", visit_time: "", scheduled_start_time: "", scheduled_duration_minutes: 60,
  actual_start_time: "", actual_end_time: "", duration_minutes: 60, actual_duration_minutes: 60,
  location: "", actual_location: "", supervised: true, supervisor_name: "",
  attended: true, compliance_status: "as_scheduled", no_show_reason: "",
  child_behavior_before: "calm", child_behavior_after: "calm",
  incident_type: "none", incident_notes: "", logistical_challenges: "",
  notes: "", concerns: "",
};

const COMPLIANCE_STATUSES = [
  ["as_scheduled", "As scheduled"], ["late_start", "Late start"], ["ended_early", "Ended early"],
  ["shortened", "Shortened"], ["rescheduled", "Rescheduled"], ["cancelled", "Cancelled"],
  ["no_show", "No-show"], ["other", "Other"],
];

const INCIDENT_TYPES = [
  ["none", "No notable incident"], ["late_arrival", "Late arrival"], ["missed_visit", "Missed visit"],
  ["early_departure", "Early departure"], ["location_issue", "Location issue"], ["transportation_issue", "Transportation issue"],
  ["communication_issue", "Communication issue"], ["safety_concern", "Safety concern"], ["child_distress", "Child distress"], ["other", "Other"],
];

const emotionEmoji = { calm: "😌", anxious: "😰", excited: "😄", upset: "😢", withdrawn: "😶" };

export default function VisitationTracker() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportLoading, setReportLoading] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.VisitationLog.filter({ parent_email: u.email }, "-visit_date", 100).then(setLogs);
    });
  }, []);

  async function handleSave() {
    if (!form.child_name || !form.visit_date || !form.visitor_name) return;
    setSaving(true);
    const created = await base44.entities.VisitationLog.create({ ...form, parent_email: user.email });
    setLogs(prev => [created, ...prev]);
    setForm(BLANK);
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id) {
    await base44.entities.VisitationLog.delete(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  }

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function generateMonthlyReport() {
    setReportLoading(true);
    const response = await base44.functions.invoke("generateVisitationConsistencyReport", { month: reportMonth });
    setMonthlyReport(response.data);
    setReportLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Visitation Tracker" subtitle="Document visits for court records" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Add button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
          >
            <Plus size={16} /> Log a Visit
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>New Visitation Log</p>

            <input placeholder="Child's name *" value={form.child_name} onChange={e => f("child_name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <div className="grid grid-cols-2 gap-2">
              <select value={form.visit_type} onChange={e => f("visit_type", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
                {VISIT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <input placeholder="Visitor name *" value={form.visitor_name} onChange={e => f("visitor_name", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={form.visit_date} onChange={e => f("visit_date", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input type="time" value={form.scheduled_start_time || form.visit_time} onChange={e => { f("scheduled_start_time", e.target.value); f("visit_time", e.target.value); }}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Scheduled location" value={form.location} onChange={e => f("location", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              <input type="number" placeholder="Scheduled duration (min)" value={form.scheduled_duration_minutes} onChange={e => { f("scheduled_duration_minutes", Number(e.target.value)); f("duration_minutes", Number(e.target.value)); }}
                className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm" style={{ color: C.darkGreen }}>
                <input type="checkbox" checked={form.attended} onChange={e => f("attended", e.target.checked)} /> Visit occurred
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: C.darkGreen }}>
                <input type="checkbox" checked={form.supervised} onChange={e => f("supervised", e.target.checked)} /> Supervised
              </label>
            </div>

            {!form.attended && (
              <input placeholder="No-show reason" value={form.no_show_reason} onChange={e => f("no_show_reason", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
            )}

            {form.attended && (
              <>
              <div className="grid grid-cols-2 gap-2">
                <input type="time" value={form.actual_start_time} onChange={e => f("actual_start_time", e.target.value)} placeholder="Actual start"
                  className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
                <input type="time" value={form.actual_end_time} onChange={e => f("actual_end_time", e.target.value)} placeholder="Actual end"
                  className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
                <input placeholder="Actual location" value={form.actual_location} onChange={e => f("actual_location", e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
                <input type="number" placeholder="Actual duration (min)" value={form.actual_duration_minutes} onChange={e => { f("actual_duration_minutes", Number(e.target.value)); f("duration_minutes", Number(e.target.value)); }}
                  className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>BEFORE VISIT</p>
                  <select value={form.child_behavior_before} onChange={e => f("child_behavior_before", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
                    {EMOTIONS.map(e => <option key={e} value={e}>{emotionEmoji[e]} {e}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>AFTER VISIT</p>
                  <select value={form.child_behavior_after} onChange={e => f("child_behavior_after", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
                    {EMOTIONS.map(e => <option key={e} value={e}>{emotionEmoji[e]} {e}</option>)}
                  </select>
                </div>
              </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-2">
              <select value={form.compliance_status} onChange={e => f("compliance_status", e.target.value)} className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
                {COMPLIANCE_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select value={form.incident_type} onChange={e => f("incident_type", e.target.value)} className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
                {INCIDENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <textarea placeholder="Notable incidents, if any..." value={form.incident_notes} onChange={e => f("incident_notes", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <textarea placeholder="Logistical challenges (transportation, timing, pickup location, communication)..." value={form.logistical_challenges} onChange={e => f("logistical_challenges", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <textarea placeholder="Notes about the visit..." value={form.notes} onChange={e => f("notes", e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: C.cream, background: C.offWhite }} />

            <textarea placeholder="Any concerns? (safety, behavior, etc.)" value={form.concerns} onChange={e => f("concerns", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: "#F4C9B8", background: "#FEF3EE" }} />

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                {saving ? "Saving…" : "Save Log"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="py-2.5 px-4 rounded-xl font-bold text-sm"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <MonthlyConsistencyReport month={reportMonth} setMonth={setReportMonth} onGenerate={generateMonthlyReport} loading={reportLoading} result={monthlyReport} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total Visits", value: logs.filter(l => l.attended).length },
            { label: "No-Shows", value: logs.filter(l => !l.attended).length },
            { label: "This Month", value: logs.filter(l => l.attended && new Date(l.visit_date).getMonth() === new Date().getMonth()).length },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-xl font-extrabold" style={{ color: C.darkGreen }}>{s.value}</p>
              <p className="text-[10px]" style={{ color: C.mutedText }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Log list */}
        <div className="space-y-3">
          {logs.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: C.mutedText }}>No visits logged yet. Tap "Log a Visit" to start.</p>
          )}
          {logs.map(log => (
            <div key={log.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.cream}` }}>
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                style={{ background: log.attended ? C.white : "#FEF3EE" }}
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: C.darkGreen }}>{log.child_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize"
                      style={{ background: log.attended ? "#EAF4EA" : "#FEF3EE", color: log.attended ? C.midGreen : "#B84C2A" }}>
                      {log.attended ? "Attended" : "No-Show"}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>
                    {log.visitor_name} • {log.visit_date} {log.visit_time && `@ ${log.visit_time}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); handleDelete(log.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Trash2 size={14} color={C.mutedText} />
                  </button>
                  {expandedId === log.id ? <ChevronUp size={14} color={C.mutedText} /> : <ChevronDown size={14} color={C.mutedText} />}
                </div>
              </div>

              {expandedId === log.id && (
                <div className="px-4 py-3 space-y-2" style={{ background: C.offWhite, borderTop: `1px solid ${C.cream}` }}>
                  {log.attended && (
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-[10px]" style={{ color: C.mutedText }}>Before</p>
                        <p className="text-lg">{emotionEmoji[log.child_behavior_before]}</p>
                        <p className="text-[10px]" style={{ color: C.darkGreen }}>{log.child_behavior_before}</p>
                      </div>
                      <div className="text-[18px] self-center">→</div>
                      <div className="text-center">
                        <p className="text-[10px]" style={{ color: C.mutedText }}>After</p>
                        <p className="text-lg">{emotionEmoji[log.child_behavior_after]}</p>
                        <p className="text-[10px]" style={{ color: C.darkGreen }}>{log.child_behavior_after}</p>
                      </div>
                      {(log.actual_duration_minutes || log.duration_minutes) && (
                        <div className="ml-auto text-right">
                          <p className="text-[10px]" style={{ color: C.mutedText }}>Actual Duration</p>
                          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{log.actual_duration_minutes || log.duration_minutes}min</p>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[11px]" style={{ color: C.mutedText }}><strong>Scheduled:</strong> {log.scheduled_start_time || log.visit_time || "time not set"} · {log.scheduled_duration_minutes || log.duration_minutes || 0}min · {log.location || "location not set"}</p>
                  {log.attended && <p className="text-[11px]" style={{ color: C.mutedText }}><strong>Actual:</strong> {log.actual_start_time || "start not set"}–{log.actual_end_time || "end not set"} · {log.actual_location || log.location || "location not set"}</p>}
                  {log.compliance_status && <p className="text-[11px] capitalize" style={{ color: C.darkGreen }}><strong>Status:</strong> {log.compliance_status.replaceAll("_", " ")}</p>}
                  {log.incident_type && log.incident_type !== "none" && <p className="text-[11px] px-2 py-1 rounded" style={{ color: "#B84C2A", background: "#FEF3EE" }}><strong>Incident:</strong> {log.incident_type.replaceAll("_", " ")} {log.incident_notes && `— ${log.incident_notes}`}</p>}
                  {log.logistical_challenges && <p className="text-[11px]" style={{ color: C.mutedText }}><strong>Logistical challenge:</strong> {log.logistical_challenges}</p>}
                  {log.notes && <p className="text-[11px]" style={{ color: C.darkGreen }}><strong>Notes:</strong> {log.notes}</p>}
                  {log.concerns && <p className="text-[11px] px-2 py-1 rounded" style={{ color: "#B84C2A", background: "#FEF3EE" }}><strong>⚠️ Concern:</strong> {log.concerns}</p>}
                  {log.location && <p className="text-[11px]" style={{ color: C.mutedText }}>📍 {log.actual_location || log.location}</p>}
                  {log.supervised && log.supervisor_name && <p className="text-[11px]" style={{ color: C.mutedText }}>Supervisor: {log.supervisor_name}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}