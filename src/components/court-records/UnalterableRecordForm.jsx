import { useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { generateVerificationId, hashRecord } from "./courtRecordUtils";

const recordTypes = [
  ["message", "Timestamped message"],
  ["visitation_attendance", "Visitation attendance"],
  ["gps_check_in", "GPS check-in"],
  ["case_plan_completion", "Case-plan completion"],
  ["hearing_summary", "Hearing summary"],
  ["shelter_care_reminder", "Shelter care hearing"],
  ["adjudication_reminder", "Adjudication hearing"],
  ["review_hearing_reminder", "Review hearing"],
  ["permanency_timeline", "Permanency timeline"],
  ["reunification_milestone", "Reunification milestone"]
];

export default function UnalterableRecordForm({ user, previousHash, onSubmit }) {
  const [form, setForm] = useState({ record_type: "message", title: "", summary: "", child_name: "", case_number: "", participant_name: "", hearing_type: "not_applicable", hearing_date: "", location_label: "", event_datetime: new Date().toISOString().slice(0, 16), attended: true });
  const [gps, setGps] = useState(null);
  const [saving, setSaving] = useState(false);

  function captureGps() {
    navigator.geolocation?.getCurrentPosition(position => setGps({
      gps_latitude: position.coords.latitude,
      gps_longitude: position.coords.longitude,
      gps_accuracy_meters: position.coords.accuracy
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const submitted_at = new Date().toISOString();
    const verification_id = generateVerificationId();
    const baseRecord = { ...form, ...gps, owner_email: user.email, event_datetime: new Date(form.event_datetime).toISOString(), submitted_at, verification_id, authentication_id: verification_id, previous_hash: previousHash || "GENESIS" };
    const record_hash = await hashRecord(baseRecord);
    await onSubmit({ ...baseRecord, record_hash });
    setForm(prev => ({ ...prev, title: "", summary: "", participant_name: "" }));
    setGps(null);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 font-black text-stone-900"><ShieldCheck className="h-5 w-5 text-green-700" /> Submit unalterable record</div>
      <select value={form.record_type} onChange={e => setForm({ ...form, record_type: e.target.value })} className="w-full rounded-xl border px-3 py-2">
        {recordTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required placeholder="Record title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input type="datetime-local" value={form.event_datetime} onChange={e => setForm({ ...form, event_datetime: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input placeholder="Child name" value={form.child_name} onChange={e => setForm({ ...form, child_name: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input placeholder="Case number" value={form.case_number} onChange={e => setForm({ ...form, case_number: e.target.value })} className="rounded-xl border px-3 py-2" />
        <select value={form.hearing_type} onChange={e => setForm({ ...form, hearing_type: e.target.value })} className="rounded-xl border px-3 py-2">
          <option value="not_applicable">Not a hearing</option>
          <option value="shelter_care">Shelter care hearing</option>
          <option value="adjudication">Adjudication hearing</option>
          <option value="disposition">Disposition hearing</option>
          <option value="review">Review hearing</option>
          <option value="permanency">Permanency hearing</option>
          <option value="other">Other hearing</option>
        </select>
        <input type="date" value={form.hearing_date} onChange={e => setForm({ ...form, hearing_date: e.target.value })} className="rounded-xl border px-3 py-2" />
      </div>
      <input placeholder="Participant / visitor name" value={form.participant_name} onChange={e => setForm({ ...form, participant_name: e.target.value })} className="w-full rounded-xl border px-3 py-2" />
      <input placeholder="Location label, if helpful" value={form.location_label} onChange={e => setForm({ ...form, location_label: e.target.value })} className="w-full rounded-xl border px-3 py-2" />
      <textarea required placeholder="Facts only: what happened, who was present, times, next steps..." value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} className="min-h-28 w-full rounded-xl border px-3 py-2" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={captureGps} className="rounded-xl border px-3 py-2 text-sm font-bold"><MapPin className="mr-2 h-4 w-4" /> {gps ? "GPS captured" : "Add GPS check-in"}</button>
        <button disabled={saving} className="rounded-xl bg-green-800 px-4 py-2 text-sm font-bold text-white">{saving ? "Sealing..." : "Submit sealed record"}</button>
      </div>
    </form>
  );
}