import { CheckCircle2, FileClock, FileWarning, Scale } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const OPTIONS = [
  { key: "chronology", label: "Chronology", helper: "Date-ordered timeline from journal and visit records", icon: FileClock },
  { key: "incident_report", label: "Incident report", helper: "No-shows, concerns, schedule changes, and incidents", icon: FileWarning },
  { key: "consistency_summary", label: "Consistency summary", helper: "Parenting-time completion and communication tone totals", icon: Scale },
];

export default function DocumentTypeSelector({ selected, onToggle }) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>Document types</p>
      <div className="mt-3 space-y-2">
        {OPTIONS.map(({ key, label, helper, icon: Icon }) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left"
              style={{ background: active ? "#F0F7F2" : C.offWhite, borderColor: active ? C.midGreen : C.cream }}
            >
              <Icon size={18} color={active ? C.darkGreen : C.mutedText} />
              <span className="flex-1">
                <span className="block text-sm font-black" style={{ color: C.darkGreen }}>{label}</span>
                <span className="block text-[11px] leading-5" style={{ color: C.mutedText }}>{helper}</span>
              </span>
              {active && <CheckCircle2 size={17} color={C.midGreen} />}
            </button>
          );
        })}
      </div>
    </section>
  );
}