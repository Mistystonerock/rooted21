import { C } from "@/lib/rooted-constants";
import { Pencil, Trash2, Target } from "lucide-react";

const PLACEMENT_LABELS = {
  biological: { label: "Biological", color: C.midGreen },
  foster:     { label: "Foster",     color: "#5B8DB8" },
  adoptive:   { label: "Adoptive",   color: C.brown },
  kinship:    { label: "Kinship",    color: C.gold },
  other:      { label: "Other",      color: C.mutedText },
};

export default function ChildProfileCard({ child, onEdit, onDelete }) {
  const placement = PLACEMENT_LABELS[child.placement_type] || PLACEMENT_LABELS.other;

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: C.cream }}
        >
          {child.photo_emoji || "🧒"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
            {child.first_name}{child.last_name ? ` ${child.last_name}` : ""}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {child.age && (
              <span className="text-[11px]" style={{ color: C.mutedText }}>Age {child.age}</span>
            )}
            {child.placement_type && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${placement.color}18`, color: placement.color }}
              >
                {placement.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(child)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: C.cream, border: "none", cursor: "pointer" }}
          >
            <Pencil size={14} color={C.darkGreen} />
          </button>
          <button
            onClick={() => onDelete(child)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#FEF3EE", border: "none", cursor: "pointer" }}
          >
            <Trash2 size={14} color="#B84C2A" />
          </button>
        </div>
      </div>

      {/* Care goals */}
      {child.care_goals?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target size={11} color={C.midGreen} />
            <p className="text-[10px] font-bold" style={{ color: C.midGreen }}>Care Goals</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {child.care_goals.map((goal, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                style={{ background: `${C.midGreen}12`, color: C.darkGreen }}
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick info snippets */}
      {(child.strengths || child.triggers) && (
        <div className="grid grid-cols-2 gap-2">
          {child.strengths && (
            <div className="rounded-xl p-2.5" style={{ background: `${C.midGreen}10` }}>
              <p className="text-[9px] font-bold mb-0.5" style={{ color: C.midGreen }}>💪 Strengths</p>
              <p className="text-[10px] leading-snug line-clamp-2" style={{ color: "#3a3028" }}>{child.strengths}</p>
            </div>
          )}
          {child.triggers && (
            <div className="rounded-xl p-2.5" style={{ background: "#FEF3EE" }}>
              <p className="text-[9px] font-bold mb-0.5" style={{ color: "#B84C2A" }}>⚡ Triggers</p>
              <p className="text-[10px] leading-snug line-clamp-2" style={{ color: "#3a3028" }}>{child.triggers}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}