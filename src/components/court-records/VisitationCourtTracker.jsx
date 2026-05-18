import { MapPin, UsersRound } from "lucide-react";
import { formatDate } from "./courtRecordUtils";

export default function VisitationCourtTracker({ visits }) {
  return (
    <section className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <UsersRound className="h-5 w-5 text-green-700" />
        <div>
          <h2 className="font-black text-stone-900">Visitation tracking</h2>
          <p className="text-xs text-stone-500">Attendance, location, supervision, and parent notes</p>
        </div>
      </div>
      <div className="space-y-2">
        {visits.slice(0, 6).map(visit => (
          <article key={visit.id} className="rounded-2xl border border-stone-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-stone-900">{visit.child_name} · {formatDate(visit.visit_date)}</p>
                <p className="text-xs text-stone-500">Visitor: {visit.visitor_name} · {visit.supervised ? "Supervised" : "Unsupervised"}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-bold ${visit.attended ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{visit.attended ? "Attended" : "Missed"}</span>
            </div>
            {visit.location && <p className="mt-2 flex items-center gap-1 text-xs text-stone-500"><MapPin className="h-3 w-3" /> {visit.location}</p>}
            {visit.notes && <p className="mt-2 text-sm text-stone-700">{visit.notes}</p>}
          </article>
        ))}
        {!visits.length && <p className="rounded-xl border border-dashed p-4 text-sm text-stone-500">No visitation logs found yet.</p>}
      </div>
    </section>
  );
}