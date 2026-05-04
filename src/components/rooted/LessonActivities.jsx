import { ACTIVITIES } from "@/lib/activities-data";
import { C } from "@/lib/rooted-constants";
import { Clock, Target } from "lucide-react";

export default function LessonActivities({ lessonId }) {
  const activities = ACTIVITIES[lessonId] || [];

  if (activities.length === 0) {
    return (
      <div className="rounded-xl p-4 text-center" style={{ background: C.cream }}>
        <p className="text-sm" style={{ color: C.mutedText }}>Activities coming soon for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl px-4 py-3 flex gap-2 items-start" style={{ background: "#FFF8E8", border: `1px solid ${C.gold}` }}>
        <span className="text-base flex-shrink-0">🌿</span>
        <p className="text-xs leading-relaxed" style={{ color: C.brown }}>
          These activities are designed to be done <strong>with your child</strong> — not at them. Connection, communication, and self-worth grow through shared experience.
        </p>
      </div>

      {activities.map((act, i) => (
        <div key={i} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl flex-shrink-0">{act.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{act.title}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${C.midGreen}18`, color: C.midGreen }}>
                  <Target size={9} /> {act.goal}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${C.gold}18`, color: C.brown }}>
                  <Clock size={9} /> {act.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-2.5" style={{ color: "#3a3028" }}>
            {act.description}
          </p>

          {/* Prompt */}
          <div className="rounded-xl px-3.5 py-2.5 mb-2" style={{ background: "#E8F4EA", borderLeft: `3px solid ${C.midGreen}` }}>
            <p className="text-xs leading-relaxed italic" style={{ color: C.darkGreen }}>{act.prompt}</p>
          </div>

          {/* Materials */}
          {act.materials && (
            <p className="text-[11px]" style={{ color: C.mutedText }}>
              <span className="font-bold">You'll need:</span> {act.materials}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}