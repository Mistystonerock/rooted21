import { Clock, Star } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { ROUTINE_META } from "@/lib/schedule-tasks";

export default function SchedulePreview({ schedule }) {
  if (!schedule || !schedule.tasks?.length) return null;

  const meta = ROUTINE_META[schedule.routine_type] || ROUTINE_META.custom;
  const totalMin = schedule.tasks.reduce((s, t) => s + (t.duration_min || 0), 0);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${meta.color}40` }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: meta.color }}>
        <span className="text-xl">{meta.emoji}</span>
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: "white" }}>{schedule.name}</p>
          {schedule.child_name && (
            <p className="text-[10px] opacity-80" style={{ color: "white" }}>For {schedule.child_name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold" style={{ color: "white", opacity: 0.9 }}>
            {hours > 0 ? `${hours}h ` : ""}{mins > 0 ? `${mins}m` : ""}
          </p>
          <p className="text-[9px] opacity-70" style={{ color: "white" }}>{schedule.tasks.length} steps</p>
        </div>
      </div>

      {/* Task visual strip */}
      <div className="p-3 space-y-2" style={{ background: C.white }}>
        {schedule.tasks.map((task, i) => (
          <div key={task.id || i} className="flex items-center gap-3">
            {/* Step number */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0"
              style={{ background: `${task.color}25`, color: task.color }}>
              {i + 1}
            </div>

            {/* Emoji */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${task.color}20` }}>
              {task.emoji}
            </div>

            {/* Label */}
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{task.label}</p>
              <div className="flex items-center gap-1">
                <Clock size={8} color={C.mutedText} />
                <span className="text-[9px]" style={{ color: C.mutedText }}>{task.duration_min} min</span>
              </div>
            </div>

            {/* Duration bar */}
            <div className="w-16 h-2 rounded-full overflow-hidden flex-shrink-0" style={{ background: C.cream }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (task.duration_min / 60) * 100)}%`,
                  background: task.color
                }} />
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ background: `${meta.color}12` }}>
        <Star size={10} color={meta.color} />
        <p className="text-[10px] font-bold" style={{ color: meta.color }}>
          Total routine: {hours > 0 ? `${hours}h ` : ""}{mins} min · {schedule.tasks.length} steps
        </p>
      </div>
    </div>
  );
}