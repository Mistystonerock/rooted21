import { FileCheck2 } from "lucide-react";
import { formatDate } from "./courtRecordUtils";

export default function CourtRecordFeed({ records }) {
  if (!records.length) {
    return <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-600">No sealed records yet.</div>;
  }

  return (
    <div className="space-y-3">
      {records.map(record => (
        <article key={record.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm break-inside-avoid">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-green-700">{record.record_type?.replaceAll("_", " ")}</p>
              <h3 className="font-black text-stone-900">{record.title}</h3>
            </div>
            <FileCheck2 className="h-5 w-5 flex-shrink-0 text-green-700" />
          </div>
          <p className="mt-2 text-sm text-stone-700 whitespace-pre-wrap">{record.summary}</p>
          <div className="mt-3 grid gap-1 text-xs text-stone-500 sm:grid-cols-2">
            <span>Event: {formatDate(record.event_datetime)}</span>
            <span>Submitted: {formatDate(record.submitted_at)}</span>
            <span>Verification: {record.verification_id}</span>
            <span>Hash: {record.record_hash?.slice(0, 16)}...</span>
          </div>
        </article>
      ))}
    </div>
  );
}