import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { BookOpenCheck, CheckCircle2, Plus } from "lucide-react";

const RIGHTS = [
  "Be treated with dignity, respect, and consideration as a team member",
  "Receive timely information about the child placed in your care",
  "Be told about known medical, behavioral, educational, and placement needs",
  "Participate in case planning and team meetings when appropriate",
  "Receive training, support, and guidance for the child’s needs",
  "Ask questions and raise concerns without fear of retaliation",
  "Be notified about court hearings, reviews, and important placement changes",
  "Have your family’s schedule and home respected when visits or services are planned",
  "Receive information about payments, reimbursements, and available supports",
  "Request help when a placement is at risk of disruption",
  "Have confidential family information handled carefully",
  "Be informed about grievance or complaint options when concerns are not resolved",
];

export default function ResourceFamilyRightsTracker() {
  const [logs, setLogs] = useState([]);
  const [selectedRight, setSelectedRight] = useState(RIGHTS[1]);
  const [form, setForm] = useState({ child_name: "", event_date: new Date().toISOString().split("T")[0], status: "requested", notes: "" });

  useEffect(() => {
    base44.entities.CaregiverRightLog.list("-created_date", 25).then(setLogs);
  }, []);

  async function addLog(e) {
    e.preventDefault();
    const created = await base44.entities.CaregiverRightLog.create({ right_title: selectedRight, ...form });
    setLogs(prev => [created, ...prev]);
    setForm(prev => ({ ...prev, notes: "" }));
  }

  return (
    <section className="space-y-3 rounded-3xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: C.cream }}>
          <BookOpenCheck size={20} color={C.darkGreen} />
        </div>
        <div>
          <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Ohio Resource Family Rights</h2>
          <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>Use this plain-language checklist to track when foster or kinship caregiver rights are met, missing, or need follow-up.</p>
        </div>
      </div>

      <div className="space-y-2">
        {RIGHTS.map((right, index) => (
          <button key={right} onClick={() => setSelectedRight(right)} className="w-full rounded-2xl p-3 text-left text-xs font-bold" style={{ background: selectedRight === right ? C.darkGreen : C.offWhite, color: selectedRight === right ? "#fff" : C.darkGreen, border: `1px solid ${C.cream}` }}>
            {index + 1}. {right}
          </button>
        ))}
      </div>

      <form onSubmit={addLog} className="space-y-2 rounded-2xl p-3" style={{ background: C.offWhite }}>
        <p className="text-xs font-black" style={{ color: C.darkGreen }}>Track this right</p>
        <input value={form.child_name} onChange={e => setForm(prev => ({ ...prev, child_name: e.target.value }))} placeholder="Child name or initials" className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.event_date} onChange={e => setForm(prev => ({ ...prev, event_date: e.target.value }))} type="date" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
            <option value="requested">Requested</option>
            <option value="received">Received</option>
            <option value="missing">Missing</option>
            <option value="concern_raised">Concern raised</option>
          </select>
        </div>
        <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Example: I asked for school/medical information and have not received it yet." rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <button className="w-full rounded-xl py-2 text-sm font-black" style={{ background: C.darkGreen, color: "#fff", border: "none" }}><Plus size={15} className="mr-1" /> Save Rights Note</button>
      </form>

      {logs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-black" style={{ color: C.mutedText }}>RECENT RIGHTS NOTES</p>
          {logs.slice(0, 3).map(log => (
            <div key={log.id} className="rounded-2xl p-3" style={{ background: C.offWhite }}>
              <p className="text-xs font-black" style={{ color: C.darkGreen }}><CheckCircle2 size={13} className="mr-1 inline" />{log.status?.replace("_", " ")} • {log.event_date}</p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{log.right_title}</p>
              {log.notes && <p className="mt-1 text-xs" style={{ color: C.darkGreen }}>{log.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}