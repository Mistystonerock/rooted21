import { completionPercent, formatDate } from "./courtRecordUtils";

export default function CourtSummaryPanel({ cases, visits, checklists, plans }) {
  const attended = visits.filter(v => v.attended).length;
  const missed = visits.length - attended;

  return (
    <section className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
      <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Visitation attendance</p><p className="text-2xl font-black">{attended}/{visits.length}</p><p className="text-xs text-stone-500">{missed} missed or no-show entries</p></div>
      <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Open cases</p><p className="text-2xl font-black">{cases.length}</p><p className="text-xs text-stone-500">Next: {formatDate(cases[0]?.next_hearing_date)}</p></div>
      <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Case-plan completion</p><p className="text-2xl font-black">{completionPercent(checklists[0]?.items || [])}%</p><p className="text-xs text-stone-500">Most recent checklist</p></div>
      <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Reunification milestones</p><p className="text-2xl font-black">{plans.flatMap(p => p.services || []).filter(s => s.status === "completed").length}</p><p className="text-xs text-stone-500">Completed service milestones</p></div>
    </section>
  );
}