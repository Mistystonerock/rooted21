import { CalendarClock, FileClock, Gavel, ShieldCheck } from "lucide-react";
import { buildCourtDeadlines, formatDate } from "./courtRecordUtils";

const iconMap = {
  "Shelter care hearing": ShieldCheck,
  "Adjudication hearing": Gavel,
  "Review hearing": CalendarClock,
  "Permanency timeline": FileClock
};

export default function HearingTimelinePanel({ caseSnapshot }) {
  const deadlines = buildCourtDeadlines(caseSnapshot);

  return (
    <section className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-wide text-green-700">Court timeline</p>
        <h2 className="text-lg font-black text-stone-900">Hearings and permanency reminders</h2>
        <p className="mt-1 text-sm text-stone-600">Plain-language reminders based on the dates entered in your case snapshot.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {deadlines.map(item => {
          const Icon = iconMap[item.title] || CalendarClock;
          return (
            <article key={item.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900">{item.title}</h3>
                  <p className="text-sm text-stone-700">{formatDate(item.date)}</p>
                  <p className="mt-1 text-xs text-stone-500">{item.source}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}