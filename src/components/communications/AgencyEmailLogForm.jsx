import { useState } from "react";
import { MailPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";

export default function AgencyEmailLogForm({ user, cases, onCreated }) {
  const [form, setForm] = useState({
    agency_name: "",
    contact_email: "",
    contact_name: "",
    direction: "sent",
    subject: "",
    body: "",
    correspondence_date: new Date().toISOString().slice(0, 16),
    case_id: "",
    child_name: "",
    notes: "",
  });

  async function submit(e) {
    e.preventDefault();
    const created = await base44.entities.AgencyEmailCorrespondence.create({
      ...form,
      owner_email: user.email,
      correspondence_date: new Date(form.correspondence_date).toISOString(),
    });
    onCreated(created);
    setForm({ agency_name: "", contact_email: "", contact_name: "", direction: "sent", subject: "", body: "", correspondence_date: new Date().toISOString().slice(0, 16), case_id: "", child_name: "", notes: "" });
  }

  const inputClass = "w-full rounded-xl border px-3 py-2 text-sm outline-none";

  return (
    <form onSubmit={submit} className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2 mb-1">
        <MailPlus size={17} color={C.midGreen} />
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Log agency email</p>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <input required className={inputClass} placeholder="Agency / organization" value={form.agency_name} onChange={e => setForm({ ...form, agency_name: e.target.value })} />
        <input className={inputClass} placeholder="Contact email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
        <input className={inputClass} placeholder="Contact name" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
        <select className={inputClass} value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })}>
          <option value="sent">Sent by me</option>
          <option value="received">Received from agency</option>
        </select>
        <input required className={inputClass} placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
        <input required type="datetime-local" className={inputClass} value={form.correspondence_date} onChange={e => setForm({ ...form, correspondence_date: e.target.value })} />
        <select className={inputClass} value={form.case_id} onChange={e => {
          const selected = cases.find(c => c.id === e.target.value);
          setForm({ ...form, case_id: e.target.value, child_name: selected?.child_name || form.child_name });
        }}>
          <option value="">No linked case</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.child_name} · {c.case_type}</option>)}
        </select>
        <input className={inputClass} placeholder="Child name" value={form.child_name} onChange={e => setForm({ ...form, child_name: e.target.value })} />
      </div>
      <textarea required className={`${inputClass} min-h-[110px]`} placeholder="Paste email body or write a clear summary" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
      <textarea className={`${inputClass} min-h-[70px]`} placeholder="Private notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
      <button className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>
        Save email to audit trail
      </button>
    </form>
  );
}