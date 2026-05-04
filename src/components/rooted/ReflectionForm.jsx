import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Save, X } from "lucide-react";

export default function ReflectionForm({ lesson, onSubmit, onCancel }) {
  const [worksheetAnswer, setWorksheetAnswer] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!worksheetAnswer.trim()) {
      alert("Please answer the worksheet question");
      return;
    }
    setSaving(true);
    try {
      await base44.entities.LessonReflection.create({
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        worksheet_answer: worksheetAnswer,
        reflection_date: new Date().toISOString().split("T")[0],
        notes: notes || undefined
      });
      onSubmit();
    } catch (error) {
      console.error("Error saving reflection:", error);
      alert("Failed to save reflection");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold" style={{ color: C.mutedText }}>LESSON {lesson.id}</p>
            <h3 className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>{lesson.title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-2"
            style={{ background: C.cream, border: "none", cursor: "pointer" }}
          >
            <X size={18} color={C.darkGreen} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold block mb-2" style={{ color: C.mutedText }}>
              WORKSHEET REFLECTION
            </label>
            <p className="text-sm mb-2" style={{ color: C.darkText }}>{lesson.worksheet}</p>
            <textarea
              value={worksheetAnswer}
              onChange={(e) => setWorksheetAnswer(e.target.value)}
              placeholder="Write your reflection here..."
              rows={5}
              className="w-full rounded-xl p-3 text-sm font-sans resize-none"
              style={{
                border: `1.5px solid ${C.cream}`,
                background: C.offWhite,
                color: C.darkText
              }}
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-2" style={{ color: C.mutedText }}>
              ADDITIONAL NOTES (OPTIONAL)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other insights or thoughts..."
              rows={3}
              className="w-full rounded-xl p-3 text-sm font-sans resize-none"
              style={{
                border: `1.5px solid ${C.cream}`,
                background: C.offWhite,
                color: C.darkText
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-sm"
              style={{
                background: C.cream,
                color: C.darkGreen,
                border: "none",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: C.darkGreen,
                color: C.white,
                border: "none",
                cursor: "pointer",
                opacity: saving ? 0.7 : 1
              }}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Reflection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}