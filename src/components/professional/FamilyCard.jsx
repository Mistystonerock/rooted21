import { C } from "@/lib/rooted-constants";
import { ChevronRight, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

export default function FamilyCard({ family, checkins, lessons, onClick }) {
  const completedLessons = lessons.filter(l => l.completed).length;
  const progressPct = Math.round((completedLessons / 21) * 100);
  const latestCheckin = checkins[0];

  const avgReg = checkins.length
    ? (checkins.reduce((a, c) => a + (c.child_regulation || 0), 0) / checkins.length).toFixed(1)
    : null;

  const statusColor = {
    active: C.midGreen,
    completed: C.gold,
    on_hold: "#B84C2A",
  }[family.status] || C.midGreen;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all hover:shadow-md"
      style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: C.cream, color: C.darkGreen }}>
            {(family.family_name || family.family_email)?.[0]?.toUpperCase() || "F"}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
              {family.family_name || family.family_email}
            </p>
            {family.child_name && (
              <p className="text-[11px]" style={{ color: C.mutedText }}>🧒 {family.child_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
            style={{ background: `${statusColor}18`, color: statusColor }}>
            {family.status?.replace("_", " ")}
          </span>
          <ChevronRight size={14} color={C.mutedText} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {/* Lessons */}
        <div className="rounded-lg p-2 text-center" style={{ background: C.offWhite }}>
          <p className="text-base font-extrabold leading-none" style={{ color: C.darkGreen }}>{completedLessons}</p>
          <p className="text-[9px] mt-0.5" style={{ color: C.mutedText }}>of 21 lessons</p>
        </div>
        {/* Check-ins */}
        <div className="rounded-lg p-2 text-center" style={{ background: C.offWhite }}>
          <p className="text-base font-extrabold leading-none" style={{ color: C.darkGreen }}>{checkins.length}</p>
          <p className="text-[9px] mt-0.5" style={{ color: C.mutedText }}>check-ins</p>
        </div>
        {/* Avg regulation */}
        <div className="rounded-lg p-2 text-center" style={{ background: C.offWhite }}>
          <p className="text-base font-extrabold leading-none" style={{ color: avgReg >= 3.5 ? C.midGreen : avgReg >= 2.5 ? C.gold : "#B84C2A" }}>
            {avgReg || "–"}
          </p>
          <p className="text-[9px] mt-0.5" style={{ color: C.mutedText }}>avg reg.</p>
        </div>
      </div>

      {/* Lesson progress bar */}
      {completedLessons > 0 && (
        <div className="mt-2.5">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.cream }}>
            <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: C.midGreen }} />
          </div>
        </div>
      )}

      {/* Latest check-in note */}
      {latestCheckin?.note && (
        <p className="text-[11px] mt-2 italic truncate" style={{ color: C.mutedText }}>
          "{latestCheckin.note}"
        </p>
      )}
    </button>
  );
}