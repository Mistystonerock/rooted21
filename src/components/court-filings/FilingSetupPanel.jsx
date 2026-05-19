import { FileText, Sparkles } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const FILING_TYPES = [
  { value: "service_request", label: "Service Request Form", help: "Pre-filled request for services, supports, or referrals" },
  { value: "status_report", label: "Status Report", help: "Court-ready progress and compliance update" },
  { value: "status_update", label: "Status Update", help: "Progress summary for court or CPS review" },
  { value: "compliance_summary", label: "Compliance Summary", help: "Shows completed and pending case plan items" },
  { value: "hearing_statement", label: "Hearing Statement", help: "Prepared statement for an upcoming hearing" },
  { value: "communication_exhibit", label: "Communication Exhibit", help: "Summarizes communication history for documentation" },
];

export default function FilingSetupPanel({ form, setForm, casePlans, cases, onGenerate, generating }) {
  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2">
        <FileText size={17} color={C.midGreen} />
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Filing setup</p>
      </div>

      <div>
        <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>FILING TYPE</label>
        <select value={form.filing_type} onChange={e => setForm({ ...form, filing_type: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.cream }}>
          {FILING_TYPES.map(type => <option key={type.value} value={type.value}>{type.label} — {type.help}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>CASE PLAN CHECKLIST</label>
        <select value={form.case_plan_id} onChange={e => setForm({ ...form, case_plan_id: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.cream }}>
          <option value="">Use all active checklists</option>
          {casePlans.map(plan => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>LINKED CASE</label>
        <select value={form.case_id} onChange={e => setForm({ ...form, case_id: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.cream }}>
          <option value="">No specific case</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.child_name} · {c.case_type}{c.case_number ? ` · ${c.case_number}` : ""}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>COURT / AGENCY NAME</label>
        <input value={form.court_name} onChange={e => setForm({ ...form, court_name: e.target.value })} placeholder="Example: County Juvenile Court" className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.cream }} />
      </div>

      <button onClick={onGenerate} disabled={generating} className="w-full rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2" style={{ background: C.darkGreen, color: "#fff", border: "none", opacity: generating ? 0.75 : 1 }}>
        <Sparkles size={15} /> {generating ? "Drafting filing…" : "Generate court-ready draft"}
      </button>
    </div>
  );
}