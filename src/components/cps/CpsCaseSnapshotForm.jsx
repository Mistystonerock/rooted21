import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";

const STAGES = [
  ["removal_day", "Removal day"],
  ["shelter_care", "Shelter-care hearing"],
  ["adjudication", "Adjudication"],
  ["disposition", "Disposition / case plan"],
  ["case_review", "Case review"],
  ["reunification", "Reunification"],
  ["permanency", "Permanency"],
  ["closed", "Closed"],
];

export default function CpsCaseSnapshotForm() {
  const [record, setRecord] = useState(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ case_number: "", county: "", case_stage: "case_review", filing_date: "", removal_date: "", next_hearing_date: "", caseworker_name: "", caseworker_phone: "", attorney_name: "", gal_casa_name: "", main_goals: "", urgent_next_steps: "", share_with_team: false });

  useEffect(() => {
    base44.entities.CPSCaseNavigation.list("-updated_date", 1).then(items => {
      if (items[0]) {
        setRecord(items[0]);
        setForm(prev => ({ ...prev, ...items[0] }));
      }
    });
  }, []);

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function save() {
    const payload = { ...form };
    const next = record ? await base44.entities.CPSCaseNavigation.update(record.id, payload) : await base44.entities.CPSCaseNavigation.create(payload);
    setRecord(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <section className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div>
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>My CPS case snapshot</p>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.mutedText }}>Keep the basics in one place so you know where you are, who is involved, and what is next.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.county || ""} onChange={e => update("county", e.target.value)} placeholder="Ohio county" className="rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
        <input value={form.case_number || ""} onChange={e => update("case_number", e.target.value)} placeholder="Case # optional" className="rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
      </div>
      <select value={form.case_stage || "case_review"} onChange={e => update("case_stage", e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        {STAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-[10px] font-bold" style={{ color: C.mutedText }}>Filing<input type="date" value={form.filing_date || ""} onChange={e => update("filing_date", e.target.value)} className="mt-1 w-full rounded-xl px-2 py-2 text-xs" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} /></label>
        <label className="text-[10px] font-bold" style={{ color: C.mutedText }}>Removal<input type="date" value={form.removal_date || ""} onChange={e => update("removal_date", e.target.value)} className="mt-1 w-full rounded-xl px-2 py-2 text-xs" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} /></label>
        <label className="text-[10px] font-bold" style={{ color: C.mutedText }}>Next hearing<input type="date" value={form.next_hearing_date || ""} onChange={e => update("next_hearing_date", e.target.value)} className="mt-1 w-full rounded-xl px-2 py-2 text-xs" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} /></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.caseworker_name || ""} onChange={e => update("caseworker_name", e.target.value)} placeholder="Caseworker" className="rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
        <input value={form.caseworker_phone || ""} onChange={e => update("caseworker_phone", e.target.value)} placeholder="Caseworker phone" className="rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
        <input value={form.attorney_name || ""} onChange={e => update("attorney_name", e.target.value)} placeholder="Attorney" className="rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
        <input value={form.gal_casa_name || ""} onChange={e => update("gal_casa_name", e.target.value)} placeholder="GAL / CASA" className="rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
      </div>
      <textarea value={form.main_goals || ""} onChange={e => update("main_goals", e.target.value)} placeholder="My goals and priorities" rows={3} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
      <textarea value={form.urgent_next_steps || ""} onChange={e => update("urgent_next_steps", e.target.value)} placeholder="Urgent next steps to remember" rows={3} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }} />
      <label className="flex items-start gap-2 text-xs" style={{ color: C.darkGreen }}><input type="checkbox" checked={!!form.share_with_team} onChange={e => update("share_with_team", e.target.checked)} /> I may share this snapshot with my attorney, caseworker, or support team.</label>
      <button onClick={save} className="w-full rounded-2xl py-3 text-sm font-black" style={{ background: saved ? C.midGreen : C.darkGreen, color: C.white, border: "none" }}>{saved ? "Saved" : "Save Case Snapshot"}</button>
    </section>
  );
}