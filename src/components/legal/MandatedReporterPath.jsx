import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { AlertTriangle, FileText, Phone } from "lucide-react";

export default function MandatedReporterPath() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ concern_date: new Date().toISOString().split("T")[0], child_name: "", reporter_role: "caregiver", concern_summary: "", next_steps: "" });

  useEffect(() => {
    base44.entities.MandatedReportNote.list("-created_date", 10).then(setNotes);
  }, []);

  async function saveNote(e) {
    e.preventDefault();
    const created = await base44.entities.MandatedReportNote.create(form);
    setNotes(prev => [created, ...prev]);
    setForm(prev => ({ ...prev, concern_summary: "", next_steps: "" }));
  }

  return (
    <section className="space-y-3 rounded-3xl p-4" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
      <div className="flex gap-3">
        <AlertTriangle size={22} color="#B84C2A" className="mt-1" />
        <div>
          <h2 className="font-serif text-lg font-black" style={{ color: "#9A3412" }}>Mandated-Reporter Path</h2>
          <p className="text-xs leading-relaxed" style={{ color: "#9A3412" }}>If you suspect abuse or neglect, call the hotline first. Rooted 21 can help store your notes, but it does not replace the report.</p>
        </div>
      </div>

      <a href="tel:18556424453" className="flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-black no-underline" style={{ background: "#B84C2A", color: "#fff" }}>
        <Phone size={16} className="mr-2" /> Call 1-855-OH-CHILD
      </a>

      <form onSubmit={saveNote} className="space-y-2 rounded-2xl p-3" style={{ background: C.white }}>
        <p className="text-xs font-black" style={{ color: C.darkGreen }}><FileText size={14} className="mr-1 inline" /> Store report notes</p>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.concern_date} onChange={e => setForm(prev => ({ ...prev, concern_date: e.target.value }))} type="date" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <select value={form.reporter_role} onChange={e => setForm(prev => ({ ...prev, reporter_role: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
            <option value="caregiver">Caregiver</option>
            <option value="teacher">Teacher</option>
            <option value="clinician">Clinician</option>
            <option value="caseworker">Caseworker</option>
            <option value="other">Other</option>
          </select>
        </div>
        <input value={form.child_name} onChange={e => setForm(prev => ({ ...prev, child_name: e.target.value }))} placeholder="Child name or initials" className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <textarea value={form.concern_summary} onChange={e => setForm(prev => ({ ...prev, concern_summary: e.target.value }))} required placeholder="Write only facts: what you saw, heard, dates, injuries, disclosures, or safety concerns." rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <textarea value={form.next_steps} onChange={e => setForm(prev => ({ ...prev, next_steps: e.target.value }))} placeholder="Reference number, who you called, or follow-up steps" rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <button className="w-full rounded-xl py-2 text-sm font-black" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>Save Notes</button>
      </form>

      {notes.length > 0 && <p className="text-xs font-bold" style={{ color: "#9A3412" }}>{notes.length} mandated-report note{notes.length === 1 ? "" : "s"} saved.</p>}
    </section>
  );
}