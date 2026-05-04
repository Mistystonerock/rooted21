import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { LESSONS } from "@/lib/lessons-data";
import { CheckCircle2, ChevronLeft, Award, Download } from "lucide-react";
import LessonDetail from "@/components/rooted/LessonDetail";
import CompletionCertificate from "@/components/rooted/CompletionCertificate";

function downloadAllLessons() {
  const lines = [
    `ROOTED 21 — 21-Lesson Program`,
    `Complete 10-Week TBRI® Curriculum`,
    `21 Lessons for Trauma-Informed Parenting`,
    `${"═".repeat(55)}`,
    ``,
  ];

  LESSONS.forEach(lesson => {
    lines.push(`${"─".repeat(55)}`);
    lines.push(`Week ${lesson.week} · Lesson ${lesson.id} · ${lesson.pillar}`);
    lines.push(`${lesson.emoji}  ${lesson.title.toUpperCase()}`);
    lines.push(`${"─".repeat(55)}`);
    lines.push(``);
    lines.push(lesson.content.replace(/\*\*/g, ""));
    lines.push(``);
    lines.push(`💡 TIP: ${lesson.tip}`);
    lines.push(``);
    lines.push(`📝 REFLECTION: ${lesson.worksheet}`);
    lines.push(``);
  });

  lines.push(`${"═".repeat(55)}`);
    lines.push(`Rooted 21 Parenting Network`);
    lines.push(`Crisis support: call or text 988`);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Rooted21-Complete-Curriculum.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Lessons() {
  const [completed, setCompleted] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    base44.entities.LessonProgress.list().then((rows) => {
      const done = new Set(rows.filter(r => r.completed).map(r => r.lesson_id));
      setCompleted(done);
    });
  }, []);

  async function handleMarkComplete(lessonId) {
    const existing = await base44.entities.LessonProgress.filter({ lesson_id: lessonId });
    if (existing.length > 0) {
      await base44.entities.LessonProgress.update(existing[0].id, { completed: true });
    } else {
      await base44.entities.LessonProgress.create({ lesson_id: lessonId, completed: true });
    }
    setCompleted(prev => new Set([...prev, lessonId]));
  }

  if (selected) {
    return (
      <LessonDetail
        lesson={selected}
        isCompleted={completed.has(selected.id)}
        onMarkComplete={() => handleMarkComplete(selected.id)}
        onBack={() => setSelected(null)}
      />
    );
  }

  const completedCount = completed.size;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard">
          <ChevronLeft size={20} color={C.cream} />
        </Link>
        <div>
          <p className="font-serif font-bold" style={{ color: C.cream }}>21-Lesson Program</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>{completedCount} of 21 lessons complete</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm font-bold" style={{ color: C.gold }}>
            {Math.round((completedCount / 21) * 100)}%
          </span>
          <button
            onClick={downloadAllLessons}
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-bold"
            style={{ background: "#ffffff18", border: "none", color: C.lightGreen, cursor: "pointer" }}
            title="Download all 21 lessons for offline reading"
          >
            <Download size={13} /> All
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2" style={{ background: C.cream }}>
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${(completedCount / 21) * 100}%`, background: C.midGreen }}
        />
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(week => {
          const weekLessons = LESSONS.filter(l => l.lesson_week === week || l.week === week);
          if (!weekLessons.length) return null;
          return (
            <div key={week} className="mb-5">
              <p className="text-[10px] font-extrabold tracking-widest mb-2 pt-1" style={{ color: C.mutedText }}>
                WEEK {week} · {weekLessons[0]?.pillar?.toUpperCase()}
              </p>
              <div className="space-y-2">
                {weekLessons.map(lesson => {
                  const done = completed.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setSelected(lesson)}
                      className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md"
                      style={{
                        background: done ? "#F0F6F0" : C.white,
                        border: `1.5px solid ${done ? C.midGreen : C.cream}`,
                      }}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: done ? C.midGreen : C.cream }}>
                        {done ? <CheckCircle2 size={18} color="white" /> : <span>{lesson.emoji}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold" style={{ color: C.mutedText }}>Lesson {lesson.id}</p>
                        <p className="text-sm font-bold truncate" style={{ color: C.darkGreen }}>{lesson.title}</p>
                      </div>
                      {done && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: C.midGreen, color: "white" }}>Done</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {completedCount === 21 && (
          <div className="rounded-2xl p-5 text-center mt-3" style={{ background: C.darkGreen }}>
            <p className="text-3xl mb-2">🌳</p>
            <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Program Complete!</p>
            <p className="text-xs mt-1 mb-4" style={{ color: C.lightGreen }}>You completed the full 21-lesson curriculum.</p>
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-2 mx-auto px-5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: C.gold, color: C.darkGreen, border: "none", cursor: "pointer" }}
            >
              <Award size={16} />
              Download Your Certificate
            </button>
          </div>
        )}

        {showCertificate && (
          <CompletionCertificate onClose={() => setShowCertificate(false)} />
        )}
        <div className="pb-6" />
      </div>
    </div>
  );
}