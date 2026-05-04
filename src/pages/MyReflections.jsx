import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, BookOpen, Trash2 } from "lucide-react";

export default function MyReflections() {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadReflections();
  }, []);

  async function loadReflections() {
    try {
      const data = await base44.entities.LessonReflection.list("-created_date", 100);
      setReflections(data);
    } catch (error) {
      console.error("Error loading reflections:", error);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    try {
      await base44.entities.LessonReflection.delete(id);
      setReflections(reflections.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting reflection:", error);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/lessons">
          <button className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
            <ChevronLeft size={18} color={C.cream} />
          </button>
        </Link>
        <BookOpen size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>My Reflections</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Your worksheet answers & insights</p>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-4 border-t-transparent rounded-full mx-auto animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
          </div>
        ) : reflections.length === 0 ? (
          <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <BookOpen size={32} color={C.cream} className="mx-auto" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No reflections yet</p>
            <p className="text-xs" style={{ color: C.mutedText }}>
              Complete lessons and answer the worksheet questions to start building your reflection journal.
            </p>
            <Link to="/lessons">
              <button
                className="mt-4 px-4 py-2 rounded-lg font-bold text-xs"
                style={{
                  background: C.darkGreen,
                  color: C.white,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Go to Lessons
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.map(reflection => (
              <div
                key={reflection.id}
                className="rounded-2xl p-4"
                style={{ background: C.white, border: `1px solid ${C.cream}` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: C.mutedText }}>
                      LESSON {reflection.lesson_id}
                    </p>
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
                      {reflection.lesson_title}
                    </p>
                  </div>
                  {deleteConfirm === reflection.id ? (
                    <div className="flex gap-2 text-[10px]">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 rounded"
                        style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
                      >
                        Keep
                      </button>
                      <button
                        onClick={() => handleDelete(reflection.id)}
                        className="px-2 py-1 rounded"
                        style={{ background: "#B84C2A", color: "white", border: "none", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(reflection.id)}
                      className="rounded-lg p-1.5"
                      style={{ background: C.offWhite, border: "none", cursor: "pointer" }}
                    >
                      <Trash2 size={14} color={C.mutedText} />
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>YOUR REFLECTION</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.darkText }}>
                    {reflection.worksheet_answer}
                  </p>
                </div>

                {reflection.notes && (
                  <div className="mb-3 p-2 rounded-lg" style={{ background: C.offWhite }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>NOTES</p>
                    <p className="text-xs" style={{ color: C.darkText }}>
                      {reflection.notes}
                    </p>
                  </div>
                )}

                <p className="text-[10px]" style={{ color: C.mutedText }}>
                  {reflection.reflection_date || "No date"}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}