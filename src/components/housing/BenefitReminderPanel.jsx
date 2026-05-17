import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Bell, CalendarDays, CheckCircle2, Trash2 } from "lucide-react";

const TYPES = [
  ["snap", "SNAP recertification"],
  ["wic", "WIC appointment"],
  ["tanf", "TANF / Ohio Works First"],
  ["medicaid", "Medicaid renewal"],
  ["childcare", "Childcare subsidy"],
  ["section_8", "Section 8 recertification"],
  ["housing_inspection", "Section 8 inspection"],
  ["fair_housing", "Fair-housing complaint"],
  ["other", "Other deadline"],
];

function daysUntil(date) {
  const today = new Date();
  const due = new Date(`${date}T00:00:00`);
  return Math.ceil((due - new Date(today.toDateString())) / 86400000);
}

export default function BenefitReminderPanel({ zip }) {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ title: "SNAP recertification", benefit_type: "snap", due_date: "", notes: "Gather ID, pay stubs, benefit letters, and proof of address." });

  useEffect(() => {
    base44.entities.BenefitReminder.list("due_date", 50).then(setReminders);
  }, []);

  async function addReminder(e) {
    e.preventDefault();
    const created = await base44.entities.BenefitReminder.create({ ...form, zip_code: zip || "", status: "active" });
    setReminders(prev => [...prev, created].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")));
    setForm(prev => ({ ...prev, due_date: "" }));
  }

  async function markDone(item) {
    await base44.entities.BenefitReminder.update(item.id, { status: "done" });
    setReminders(prev => prev.map(r => r.id === item.id ? { ...r, status: "done" } : r));
  }

  async function remove(item) {
    await base44.entities.BenefitReminder.delete(item.id);
    setReminders(prev => prev.filter(r => r.id !== item.id));
  }

  return (
    <section className="space-y-3 rounded-3xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: C.cream }}>
          <Bell size={20} color={C.darkGreen} />
        </div>
        <div>
          <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Benefit & Housing Reminders</h2>
          <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>Track SNAP, Medicaid, WIC, Section 8 inspections, recertifications, and paperwork deadlines.</p>
        </div>
      </div>

      <form onSubmit={addReminder} className="space-y-2 rounded-2xl p-3" style={{ background: C.offWhite }}>
        <select value={form.benefit_type} onChange={e => {
          const label = TYPES.find(([value]) => value === e.target.value)?.[1] || "Reminder";
          setForm(prev => ({ ...prev, benefit_type: e.target.value, title: label }));
        }} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} type="date" required className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} rows={2} />
        <button className="w-full rounded-xl py-2 text-sm font-black" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>Add Reminder</button>
      </form>

      <div className="space-y-2">
        {reminders.length === 0 ? (
          <p className="rounded-2xl p-4 text-center text-xs" style={{ background: C.offWhite, color: C.mutedText }}>No reminders yet. Add a recertification or inspection date above.</p>
        ) : reminders.map(item => {
          const days = daysUntil(item.due_date);
          const urgent = item.status !== "done" && days <= 10;
          return (
            <div key={item.id} className="rounded-2xl p-3" style={{ background: urgent ? "#FEF3EE" : C.offWhite, border: `1px solid ${urgent ? "#F4C9B8" : C.cream}` }}>
              <div className="flex items-start gap-2">
                <CalendarDays size={16} color={urgent ? "#B84C2A" : C.darkGreen} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black" style={{ color: C.darkGreen }}>{item.title}</p>
                  <p className="text-xs" style={{ color: urgent ? "#B84C2A" : C.mutedText }}>{days < 0 ? `Due ${Math.abs(days)} days ago` : days === 0 ? "Due today" : `Due in ${days} days`} • {item.due_date}</p>
                  {item.notes && <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{item.notes}</p>}
                </div>
                {item.status !== "done" && <button onClick={() => markDone(item)} className="rounded-xl p-2" style={{ background: C.white, border: "none" }} aria-label="Mark done"><CheckCircle2 size={16} color={C.midGreen} /></button>}
                <button onClick={() => remove(item)} className="rounded-xl p-2" style={{ background: C.white, border: "none" }} aria-label="Delete reminder"><Trash2 size={16} color="#B84C2A" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}