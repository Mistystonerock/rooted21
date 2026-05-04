import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { CheckCircle2, ChevronLeft, Download, BookOpen, Zap, BookMarked } from "lucide-react";
import LessonActivities from "./LessonActivities";
import ReflectionForm from "./ReflectionForm";

const TABS = [
  { id: "lesson", label: "Lesson", icon: BookOpen },
  { id: "activities", label: "Activities", icon: Zap },
  { id: "reflection", label: "Reflection", icon: BookMarked },
];

function downloadLesson(lesson) {
  const lines = [
    `HALO PROJECT — ROOTED 21`,
    `Week ${lesson.week} · Lesson ${lesson.id} · ${lesson.pillar}`,
    ``,
    `${lesson.emoji}  ${lesson.title}`,
    `${"─".repeat(50)}`,
    ``,
    lesson.content.replace(/\*\*/g, ""),
    ``,
    `${"─".repeat(50)}`,
    `💡 TODAY'S TIP`,
    `${"─".repeat(50)}`,
    lesson.tip,
    ``,
    `${"─".repeat(50)}`,
    `📝 REFLECTION WORKSHEET`,
    `${"─".repeat(50)}`,
    lesson.worksheet,
    ``,
    `${"─".repeat(50)}`,
    `Downloaded from the HALO Project · Rooted 21 Parenting Network`,
    `For crisis support: call or text 988`,
  ];

  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `HALO-Lesson-${lesson.id}-${lesson.title.replace(/[^a-z0-9]/gi, "-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LessonDetail({ lesson, isCompleted, onMarkComplete, onBack }) {
  const [tab, setTab] = useState("lesson");
  const [showReflectionForm, setShowReflectionForm] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{
        background: C.darkGreen,
        paddingTop: "max(0.75rem, calc(0.75rem + env(safe-area-inset-top)))"
      }}>
        <button onClick={onBack} className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold" style={{ color: C.lightGreen }}>Lesson {lesson.id}</p>
          <p className="font-serif font-bold text-sm truncate" style={{ color: C.cream }}>{lesson.title}</p>
        </div>
        <span className="text-xl">{lesson.emoji}</span>
        <button
          onClick={() => downloadLesson(lesson)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-bold"
          style={{ background: "#ffffff18", border: "none", color: C.lightGreen, cursor: "pointer" }}
          title="Download for offline reading"
        >
          <Download size={13} />
          Save
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex sticky top-[52px] z-10" style={{ background: C.white, borderBottom: `1px solid ${C.cream}` }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: tab === t.id ? `2.5px solid ${C.darkGreen}` : "2.5px solid transparent",
                color: tab === t.id ? C.darkGreen : C.mutedText,
                cursor: "pointer",
              }}
            >
              <Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* ── LESSON TAB ── */}
        {tab === "lesson" && (
          <>
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

            <div className="rounded-xl px-4 py-3 flex gap-3" style={{ background: "#E8F4EA", border: `1px solid ${C.midGreen}` }}>
              <span className="text-base flex-shrink-0">💡</span>
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: C.darkGreen }}>Today's Tip</p>
                <p className="text-sm leading-relaxed" style={{ color: C.darkGreen }}>{lesson.tip}</p>
              </div>
            </div>

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

            {/* Offline download hint */}
            <div className="rounded-xl px-4 py-3 flex gap-2 items-center" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <Download size={13} color={C.mutedText} />
              <p className="text-[11px]" style={{ color: C.mutedText }}>
                Tap <strong>Save</strong> at the top to download this lesson for offline reading.
              </p>
            </div>
          </>
        )}

        {/* ── ACTIVITIES TAB ── */}
        {tab === "activities" && (
          <LessonActivities lessonId={lesson.id} />
        )}

        {/* ── REFLECTION TAB ── */}
        {tab === "reflection" && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold mb-2" style={{ color: C.mutedText }}>WORKSHEET QUESTION</p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: C.darkText }}>{lesson.worksheet}</p>
              <button
                onClick={() => setShowReflectionForm(true)}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{
                  background: C.darkGreen,
                  color: C.white,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                + Record My Reflection
              </button>
            </div>

            {/* Q&A Section */}
            {lesson.questions && lesson.questions.length > 0 && (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Key Questions & Answers</p>
                {lesson.questions.map((qa, i) => (
                  <div key={i} className="space-y-1 pb-3" style={{ borderBottom: i < lesson.questions.length - 1 ? `1px solid ${C.cream}` : "none" }}>
                    <p className="text-xs font-bold" style={{ color: C.brown }}>Q: {qa.question}</p>
                    <p className="text-xs leading-relaxed" style={{ color: C.darkText }}>A: {qa.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reading Material */}
            {lesson.readingMaterial && lesson.readingMaterial.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold text-sm mb-3" style={{ color: C.darkGreen }}>📚 Reading Material</p>
                <ul className="space-y-2">
                  {lesson.readingMaterial.map((resource, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: C.darkText }}>
                      <span style={{ color: C.midGreen }}>•</span>
                      <span>{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Reflection Form Modal */}
      {showReflectionForm && (
        <ReflectionForm
          lesson={lesson}
          onSubmit={() => setShowReflectionForm(false)}
          onCancel={() => setShowReflectionForm(false)}
        />
      )}
    </div>
  );
}