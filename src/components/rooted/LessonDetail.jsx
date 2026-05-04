import { C } from "@/lib/rooted-constants";
import { CheckCircle2, ChevronLeft } from "lucide-react";

export default function LessonDetail({ lesson, isCompleted, onMarkComplete, onBack }) {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <button onClick={onBack} className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold" style={{ color: C.lightGreen }}>Lesson {lesson.id}</p>
          <p className="font-serif font-bold text-sm truncate" style={{ color: C.cream }}>{lesson.title}</p>
        </div>
        <span className="text-xl">{lesson.emoji}</span>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Content */}
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          {lesson.content.split("\n").map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />;
            if (line.startsWith("**")) {
              return (
                <p key={i} className="font-bold text-sm mt-3 mb-1" style={{ color: C.darkGreen }}>
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (/^[-•]/.test(line)) {
              return (
                <p key={i} className="text-sm leading-relaxed ml-3" style={{ color: "#3a3028" }}>
                  • {line.replace(/^[-•]\s*/, "")}
                </p>
              );
            }
            return (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "#3a3028" }}>
                {line}
              </p>
            );
          })}
        </div>

        {/* Tip */}
        <div className="rounded-xl px-4 py-3 flex gap-3" style={{ background: "#E8F4EA", border: `1px solid ${C.midGreen}` }}>
          <span className="text-base flex-shrink-0">💡</span>
          <div>
            <p className="text-xs font-bold mb-0.5" style={{ color: C.darkGreen }}>Today's Tip</p>
            <p className="text-sm leading-relaxed" style={{ color: C.darkGreen }}>{lesson.tip}</p>
          </div>
        </div>

        {/* Worksheet */}
        <div className="rounded-xl px-4 py-3" style={{ background: C.cream, border: `1px solid ${C.brown}` }}>
          <p className="text-xs font-bold mb-1" style={{ color: C.brown }}>📝 Reflection Worksheet</p>
          <p className="text-sm leading-relaxed" style={{ color: C.darkGreen }}>{lesson.worksheet}</p>
        </div>

        {/* Complete button */}
        {isCompleted ? (
          <div className="rounded-xl p-3.5 flex items-center gap-2 justify-center" style={{ background: "#E8F4EA", border: `1px solid ${C.midGreen}` }}>
            <CheckCircle2 size={18} color={C.midGreen} />
            <p className="font-bold text-sm" style={{ color: C.midGreen }}>Lesson Complete!</p>
          </div>
        ) : (
          <button
            onClick={onMarkComplete}
            className="w-full py-3.5 rounded-xl border-none font-extrabold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}
          >
            ✓ Mark as Complete
          </button>
        )}
      </div>
    </div>
  );
}