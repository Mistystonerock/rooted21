import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Star, ThumbsUp, X } from "lucide-react";

export default function PostClassSurvey({ enrollment, onComplete }) {
  const [step, setStep] = useState("rating");
  const [instructorRating, setInstructorRating] = useState(0);
  const [contentRating, setContentRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [improvements, setImprovements] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await base44.entities.ClassFeedback.create({
        class_id: enrollment.class_id,
        enrollment_id: enrollment.id,
        instructor_rating: instructorRating,
        content_rating: contentRating,
        would_recommend: wouldRecommend,
        improvements: improvements.trim() || null,
        feedback_date: new Date().toISOString(),
        is_anonymous: true,
      });
      setStep("complete");
      setTimeout(() => onComplete(), 2000);
    } catch (err) {
      console.error("Survey submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    onComplete();
  }

  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
        {label}
      </p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
            style={{ border: "none", background: "transparent", cursor: "pointer" }}
          >
            <Star
              size={28}
              fill={star <= value ? C.gold : C.cream}
              color={star <= value ? C.gold : C.cream}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-end" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div
        className="w-full rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ background: C.white }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>
            {step === "complete" ? "Thank You!" : "Class Feedback"}
          </p>
          {step !== "complete" && (
            <button
              onClick={handleSkip}
              className="p-1.5 rounded-lg transition-all hover:bg-opacity-80"
              style={{ background: C.cream, border: "none", cursor: "pointer" }}
            >
              <X size={18} color={C.darkGreen} />
            </button>
          )}
        </div>

        {step === "rating" && (
          <>
            <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
              Help us improve by sharing your feedback. This is completely anonymous.
            </p>

            <div className="space-y-5">
              <StarRating
                value={instructorRating}
                onChange={setInstructorRating}
                label="How would you rate the instructor?"
              />
              <StarRating
                value={contentRating}
                onChange={setContentRating}
                label="How would you rate the class content?"
              />
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
                Would you recommend this class?
              </p>
              <div className="flex gap-2">
                {[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setWouldRecommend(option.value)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs transition-all"
                    style={{
                      background:
                        wouldRecommend === option.value ? C.midGreen : C.cream,
                      color:
                        wouldRecommend === option.value ? "#fff" : C.darkGreen,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep("improvements")}
              disabled={instructorRating === 0 || contentRating === 0}
              className="w-full py-3 rounded-xl font-bold text-sm transition-opacity"
              style={{
                background: C.darkGreen,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                opacity:
                  instructorRating === 0 || contentRating === 0 ? 0.5 : 1,
              }}
            >
              Continue
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-2 rounded-xl font-bold text-xs"
              style={{
                background: "transparent",
                color: C.mutedText,
                border: `1px solid ${C.cream}`,
                cursor: "pointer",
              }}
            >
              Skip for now
            </button>
          </>
        )}

        {step === "improvements" && (
          <>
            <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
              (Optional) What could we improve for future sessions?
            </p>

            <textarea
              value={improvements}
              onChange={e => setImprovements(e.target.value)}
              placeholder="Your feedback helps us get better..."
              className="w-full p-3 rounded-xl border text-xs outline-none resize-none"
              style={{
                borderColor: C.cream,
                background: C.offWhite,
                minHeight: 100,
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm transition-opacity flex items-center justify-center gap-2"
              style={{
                background: C.midGreen,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>

            <button
              onClick={() => setStep("rating")}
              className="w-full py-2 rounded-xl font-bold text-xs"
              style={{
                background: "transparent",
                color: C.mutedText,
                border: `1px solid ${C.cream}`,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </>
        )}

        {step === "complete" && (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">✨</div>
            <p className="font-serif font-bold" style={{ color: C.darkGreen }}>
              Your feedback matters!
            </p>
            <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
              We'll use your input to continuously improve our classes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}