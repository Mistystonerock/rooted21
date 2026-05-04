import { GripVertical, Trash2, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function TaskBlock({ task, index, total, onDelete, onMoveUp, onMoveDown, dragHandleProps, isDragging }) {
  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-3 py-3 transition-all"
      style={{
        background: `${task.color}18`,
        border: `2px solid ${task.color}60`,
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.15)" : undefined,
      }}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded-lg"
        style={{ color: C.mutedText }}
      >
        <GripVertical size={16} />
      </div>

      {/* Emoji bubble */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 select-none"
        style={{ background: `${task.color}30` }}
      >
        {task.emoji}
      </div>

      {/* Label + duration */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-snug" style={{ color: C.darkGreen }}>{task.label}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={9} color={C.mutedText} />
          <span className="text-[10px]" style={{ color: C.mutedText }}>{task.duration_min} min</span>
          {task.note && (
            <span className="text-[10px] ml-1 truncate italic" style={{ color: C.mutedText }}>
              · {task.note}
            </span>
          )}
        </div>
      </div>

      {/* Reorder arrows (mobile fallback) */}
      <div className="flex flex-col gap-0.5">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="rounded p-0.5 disabled:opacity-20"
          style={{ background: "none", border: "none", cursor: index === 0 ? "default" : "pointer" }}
        >
          <ChevronUp size={13} color={C.mutedText} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="rounded p-0.5 disabled:opacity-20"
          style={{ background: "none", border: "none", cursor: index === total - 1 ? "default" : "pointer" }}
        >
          <ChevronDown size={13} color={C.mutedText} />
        </button>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 p-2 rounded-xl hover:opacity-80 transition-opacity"
        style={{ background: "#B84C2A18", border: "none", cursor: "pointer" }}
      >
        <Trash2 size={13} color="#B84C2A" />
      </button>
    </div>
  );
}