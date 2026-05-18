import { Calendar, Lock, Phone, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const LABELS = {
  therapy_session: "Therapy",
  mood_check: "Mood",
  crisis_plan: "Crisis plan",
  safety_plan: "Safety plan",
  provider_contact: "Provider",
  substance_use: "42 CFR Part 2",
  other: "Record"
};

export default function BehavioralHealthRecordCard({ record }) {
  return (
    <article className="rounded-2xl border p-4 space-y-3" style={{ background: C.white, borderColor: C.cream }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold" style={{ color: C.darkText }}>{record.title}</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>{LABELS[record.record_kind] || "Record"}{record.child_name ? ` · ${record.child_name}` : ""}</p>
        </div>
        <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: record.part2_segmented ? "#FFF7ED" : "#EAF4EA", color: record.part2_segmented ? "#9A3412" : C.darkGreen }}>
          {record.part2_segmented ? "Part 2" : record.permission_segment}
        </span>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: C.darkText }}>{record.summary}</p>

      <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: C.mutedText }}>
        {record.event_date && <span className="flex items-center gap-1"><Calendar size={13} /> {record.event_date}</span>}
        {record.provider_phone && <span className="flex items-center gap-1"><Phone size={13} /> {record.provider_phone}</span>}
        {record.mood_rating && <span>Mood: {record.mood_rating}/10</span>}
        {record.provider_name && <span>{record.provider_name}</span>}
      </div>

      <div className="rounded-xl p-3 text-xs flex gap-2" style={{ background: C.offWhite, color: C.mutedText }}>
        <Lock size={14} className="shrink-0" />
        <span>AES-256 at rest, TLS in transit, segmented consent required.</span>
      </div>

      <div className="text-[10px] font-bold flex items-center gap-1" style={{ color: C.darkGreen }}>
        <ShieldCheck size={13} /> HIPAA-aware privacy architecture
      </div>
    </article>
  );
}