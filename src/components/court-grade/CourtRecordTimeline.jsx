import { FileCheck2, MapPin } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CourtRecordTimeline({ records }) {
  if (records.length === 0) {
    return <div className="rounded-3xl p-6 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}><p className="font-bold" style={{ color: C.darkGreen }}>No locked records yet</p><p className="text-xs mt-1" style={{ color: C.mutedText }}>Submit your first record to begin the unalterable timeline.</p></div>;
  }

  return (
    <div className="space-y-2">
      {records.map(record => (
        <article key={record.id} className="rounded-2xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-start gap-3">
            <FileCheck2 size={18} color={C.darkGreen} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black" style={{ color: C.darkGreen }}>{record.title}</p>
              <p className="text-[11px] uppercase font-bold" style={{ color: C.gold }}>{record.record_type?.replaceAll('_', ' ')}</p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: C.darkText }}>{record.details}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.cream, color: C.darkGreen }}>Submitted {new Date(record.submitted_at).toLocaleString()}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.cream, color: C.darkGreen }}>ID {record.verification_id}</span>
                {record.gps_latitude && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1" style={{ background: "#EAF4EA", color: C.darkGreen }}><MapPin size={10} /> GPS</span>}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}