import { BarChart3, FileText, Loader2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function MonthlyConsistencyReport({ month, setMonth, onGenerate, loading, result }) {
  const stats = result?.stats;
  const report = result?.report;

  return (
    <section className="space-y-3 rounded-2xl border bg-white p-4" style={{ borderColor: C.cream }}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: C.cream }}>
          <BarChart3 size={18} color={C.darkGreen} />
        </div>
        <div className="flex-1">
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Monthly consistency report</p>
          <p className="mt-1 text-xs leading-5" style={{ color: C.mutedText }}>Generate a neutral AI summary of scheduled vs. actual parenting time for court records.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <button type="button" onClick={onGenerate} disabled={loading} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Generate"}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl p-2" style={{ background: C.offWhite }}><p className="font-black" style={{ color: C.darkGreen }}>{stats.scheduled_visits}</p><p>Scheduled</p></div>
          <div className="rounded-xl p-2" style={{ background: C.offWhite }}><p className="font-black" style={{ color: C.darkGreen }}>{stats.completed_visits}</p><p>Completed</p></div>
          <div className="rounded-xl p-2" style={{ background: C.offWhite }}><p className="font-black" style={{ color: C.darkGreen }}>{stats.consistency_rate}%</p><p>Rate</p></div>
        </div>
      )}

      {report && (
        <div className="space-y-3 rounded-2xl p-3 text-sm leading-6" style={{ background: C.offWhite, color: C.darkText }}>
          <p className="flex items-center gap-2 font-black" style={{ color: C.darkGreen }}><FileText size={15} /> Court-ready summary</p>
          <p>{report.summary}</p>
          {report.court_ready_statement && <p className="rounded-xl bg-white p-3 text-xs leading-6">{report.court_ready_statement}</p>}
          {report.recurring_challenges?.length > 0 && (
            <div>
              <p className="text-xs font-black" style={{ color: C.darkGreen }}>Recurring logistical challenges</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">{report.recurring_challenges.map((item, index) => <li key={index}>{item}</li>)}</ul>
            </div>
          )}
          {report.suggested_next_steps?.length > 0 && (
            <div>
              <p className="text-xs font-black" style={{ color: C.darkGreen }}>Suggested documentation steps</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">{report.suggested_next_steps.map((item, index) => <li key={index}>{item}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}