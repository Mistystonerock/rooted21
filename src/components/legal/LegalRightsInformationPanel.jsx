import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { AlertTriangle, BookOpenCheck, ExternalLink, FileText, Phone, Scale } from "lucide-react";

const RESOURCE_FAMILY_RIGHTS = [
  "Be treated with dignity, respect, and consideration as a member of the child welfare team.",
  "Receive all known information about the child that is needed to provide safe care.",
  "Receive training and support to meet the child’s needs.",
  "Be informed of agency policies and expectations.",
  "Be notified of meetings, reviews, and court hearings when allowed by law.",
  "Share concerns and give input about the child’s care and case plan.",
  "Receive timely financial, medical, and service information connected to the child’s placement.",
  "Ask questions and receive timely responses from the agency.",
  "Be informed before a child is moved when possible and appropriate.",
  "Have personal information kept private as required by law.",
  "File a grievance or complaint without retaliation.",
  "Receive information about services, respite, and supports available to the family."
];

const LOG_TYPES = [
  ["resource_family_info_received", "I received child information"],
  ["resource_family_info_missing", "Information is missing"],
  ["mandated_report_note", "Mandated-report note"],
  ["legal_aid_question", "Legal aid question"],
  ["clinic_search", "Free clinic search"],
];

export default function LegalRightsInformationPanel() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    log_type: "resource_family_info_received",
    title: "Child information received",
    child_name: "",
    agency_or_contact: "",
    event_date: new Date().toISOString().split("T")[0],
    notes: "",
    hotline_called: false,
    follow_up_needed: true,
  });

  useEffect(() => {
    base44.entities.LegalRightsLog.list("-created_date", 10).then(setLogs);
  }, []);

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function saveLog(e) {
    e.preventDefault();
    const created = await base44.entities.LegalRightsLog.create(form);
    setLogs(prev => [created, ...prev].slice(0, 10));
    setForm(prev => ({ ...prev, notes: "", child_name: "", agency_or_contact: "" }));
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <div className="flex items-start gap-3">
          <BookOpenCheck size={22} color={C.darkGreen} />
          <div>
            <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Ohio Resource Family Bill of Rights</h2>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Foster and kinship caregivers can use this checklist to notice when important child information or support is missing.</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {RESOURCE_FAMILY_RIGHTS.map((right, index) => (
            <div key={right} className="flex gap-2 rounded-xl p-2" style={{ background: C.offWhite }}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ background: C.darkGreen, color: "#fff" }}>{index + 1}</span>
              <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>{right}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a href="tel:18556424453" className="rounded-2xl p-4 no-underline" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8", color: "#9A3412" }}>
          <Phone size={20} />
          <p className="mt-2 text-sm font-black">Mandated-reporter path</p>
          <p className="mt-1 text-xs leading-relaxed">If you suspect abuse or neglect, call 1-855-OH-CHILD. Moxie can help store notes after you call.</p>
        </a>
        <a href="https://www.ohiolegalhelp.org" target="_blank" rel="noopener noreferrer" className="rounded-2xl p-4 no-underline" style={{ background: "#F0F7F2", border: `1.5px solid ${C.midGreen}`, color: C.darkGreen }}>
          <Scale size={20} />
          <p className="mt-2 text-sm font-black">Legal aid and self-help</p>
          <p className="mt-1 text-xs leading-relaxed">Find Ohio forms, custody modification help, protection-order education, and free legal clinics.</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-black">Open Ohio Legal Help <ExternalLink size={12} /></span>
        </a>
      </div>

      <form onSubmit={saveLog} className="space-y-3 rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <div className="flex items-start gap-2">
          <FileText size={18} color={C.darkGreen} />
          <div>
            <p className="text-sm font-black" style={{ color: C.darkGreen }}>Track rights, hotline notes, or missing information</p>
            <p className="text-xs" style={{ color: C.mutedText }}>Example: “I asked for known medical history and have not received it yet.”</p>
          </div>
        </div>
        <select value={form.log_type} onChange={e => update("log_type", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          {LOG_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={form.child_name} onChange={e => update("child_name", e.target.value)} placeholder="Child name (optional)" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <input value={form.agency_or_contact} onChange={e => update("agency_or_contact", e.target.value)} placeholder="Agency/contact" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        </div>
        <input value={form.event_date} onChange={e => update("event_date", e.target.value)} type="date" className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Write what happened, what was missing, or what you reported..." rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <label className="flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}>
          <input type="checkbox" checked={form.hotline_called} onChange={e => update("hotline_called", e.target.checked)} /> Hotline called
        </label>
        <button className="w-full rounded-xl py-3 text-sm font-black" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>Save Note</button>
      </form>

      {logs.length > 0 && (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="rounded-2xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-sm font-black" style={{ color: C.darkGreen }}>{log.title}</p>
              <p className="text-[11px]" style={{ color: C.mutedText }}>{log.event_date || new Date(log.created_date).toLocaleDateString()} • {log.agency_or_contact || "No contact listed"}</p>
              {log.notes && <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{log.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 rounded-2xl p-3" style={{ background: "#FFFBEE", border: "1px solid #F4DFA0" }}>
        <AlertTriangle size={16} color="#7A5200" className="mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed" style={{ color: "#7A5200" }}>This is education and documentation support, not legal advice. For active legal questions, contact an attorney or Ohio Legal Help.</p>
      </div>
    </section>
  );
}