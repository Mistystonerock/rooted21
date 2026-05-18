import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { MapPin, ShieldCheck } from "lucide-react";

const RECORD_TYPES = [
  ["message", "Timestamped message"],
  ["visitation_attendance", "Visitation attendance"],
  ["gps_checkin", "GPS check-in"],
  ["case_plan_completion", "Case-plan completion"],
  ["court_hearing", "Court hearing"],
  ["shelter_care_72_hour", "72-hour shelter care"],
  ["adjudication_30_day", "30-day adjudication"],
  ["review_90_day", "90-day review"],
  ["reunification_milestone", "Reunification milestone"],
  ["summary_note", "Summary note"]
];

export default function CourtGradeRecordForm({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    record_type: "summary_note",
    title: "",
    details: "",
    child_name: "",
    case_number: "",
    attendance_status: "not_applicable",
    completion_status: "not_applicable",
    milestone_status: "not_applicable",
    hearing_date: "",
    deadline_date: ""
  });
  const [gps, setGps] = useState(null);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function captureGps() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(position => {
      setGps({
        gps_latitude: position.coords.latitude,
        gps_longitude: position.coords.longitude,
        gps_accuracy_meters: position.coords.accuracy
      });
    });
  }

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, ...gps }); }} className="rounded-3xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} color={C.darkGreen} />
        <h2 className="font-black" style={{ color: C.darkGreen }}>Submit unalterable record</h2>
      </div>

      <select value={form.record_type} onChange={e => update("record_type", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
        {RECORD_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-2">
        <input value={form.child_name} onChange={e => update("child_name", e.target.value)} placeholder="Child name" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <input value={form.case_number} onChange={e => update("case_number", e.target.value)} placeholder="Case number" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
      </div>

      <input required value={form.title} onChange={e => update("title", e.target.value)} placeholder="Record title" className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
      <textarea required value={form.details} onChange={e => update("details", e.target.value)} placeholder="What happened? Include facts, attendance, completion steps, or hearing notes." className="w-full min-h-[100px] rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />

      {form.record_type === "visitation_attendance" && (
        <select value={form.attendance_status} onChange={e => update("attendance_status", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          <option value="scheduled">Scheduled</option><option value="attended">Attended</option><option value="missed">Missed</option><option value="cancelled">Cancelled</option>
        </select>
      )}

      {form.record_type === "case_plan_completion" && (
        <select value={form.completion_status} onChange={e => update("completion_status", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          <option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="blocked">Blocked</option>
        </select>
      )}

      {form.record_type === "reunification_milestone" && (
        <select value={form.milestone_status} onChange={e => update("milestone_status", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          <option value="planned">Planned</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="delayed">Delayed</option>
        </select>
      )}

      {(form.record_type.includes("hearing") || form.record_type.includes("hour") || form.record_type.includes("day")) && (
        <input type="datetime-local" value={form.hearing_date || form.deadline_date} onChange={e => { update("hearing_date", e.target.value); update("deadline_date", e.target.value); }} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
      )}

      <div className="flex gap-2">
        <button type="button" onClick={captureGps} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
          <MapPin size={14} className="mr-1" /> Add GPS
        </button>
        {gps && <span className="text-xs font-bold self-center" style={{ color: C.midGreen }}>GPS captured</span>}
      </div>

      <button disabled={submitting} className="w-full rounded-xl py-3 text-sm font-black" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>
        {submitting ? "Submitting…" : "Submit locked record"}
      </button>
      <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>After submission, this record cannot be edited or deleted in the app.</p>
    </form>
  );
}