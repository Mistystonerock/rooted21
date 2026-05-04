import { Plus } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { TASK_LIBRARY, ROUTINE_META } from "@/lib/schedule-tasks";

export default function TaskLibraryPanel({ routineType, onAdd }) {
  const tasks = TASK_LIBRARY[routineType] || TASK_LIBRARY.custom;

  return (
    <div>
      <p className="text-[10px] font-extrabold tracking-wider mb-2.5" style={{ color: C.mutedText }}>
        TASK LIBRARY — TAP TO ADD
      </p>
      <div className="grid grid-cols-2 gap-2">
        {tasks.map((task, i) => (
          <button
            key={i}
            onClick={() => onAdd(task)}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all hover:shadow-md active:scale-95"
            style={{ background: `${task.color}15`, border: `1.5px solid ${task.color}35`, cursor: "pointer" }}
          >
            <span className="text-lg flex-shrink-0">{task.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight truncate" style={{ color: C.darkGreen }}>{task.label}</p>
              <p className="text-[9px]" style={{ color: C.mutedText }}>{task.duration_min} min</p>
            </div>
            <Plus size={11} color={task.color} className="ml-auto flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}