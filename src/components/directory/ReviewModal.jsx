import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Star, CheckCircle2 } from "lucide-react";

export default function ReviewModal({ booking, user, onClose }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!rating) return;
    setSaving(true);
    await base44.entities.ConsultationReview.create({
      booking_id: booking.id,
      professional_id: booking.professional_id,
      professional_name: booking.professional_name,
      parent_email: user.email,
      parent_name: user.full_name || user.email,
      rating,
      review_text: reviewText.trim(),
    });
    setDone(true);
    setSaving(false);
  }

  const displayRating = hovered || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] rounded-t-3xl p-5 space-y-4"
        style={{ background: "#fff", maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>⭐ Leave a Review</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>for {booking.professional_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.mutedText} />
          </button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <CheckCircle2 size={44} color={C.midGreen} className="mx-auto mb-3" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Thank you for your review!</p>
            <p className="text-xs mt-1 mb-4" style={{ color: C.mutedText }}>
              Your feedback helps other parents find the right support.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Session info */}
            <div className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{booking.professional_name}</p>
              <p className="text-[11px]" style={{ color: C.mutedText }}>
                {new Date(booking.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {booking.time_slot}
              </p>
            </div>

            {/* Star rating */}
            <div>
              <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>YOUR RATING</p>
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                  >
                    <Star
                      size={36}
                      fill={displayRating >= star ? C.gold : "none"}
                      color={displayRating >= star ? C.gold : C.cream}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-xs font-bold" style={{ color: C.gold }}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </p>
              )}
            </div>

            {/* Review text */}
            <div>
              <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>
                WRITTEN REVIEW (OPTIONAL)
              </label>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your experience to help other parents…"
                rows={4}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !rating}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{
                background: rating ? C.darkGreen : C.cream,
                color: rating ? "#fff" : C.mutedText,
                border: "none", cursor: rating ? "pointer" : "default",
              }}
            >
              {saving ? "Submitting…" : "Submit Review"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}