import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Star, CheckCircle2, Loader2 } from "lucide-react";

const FAMILY_TYPES = [
  { value: "foster", label: "Foster Parent" },
  { value: "adoptive", label: "Adoptive Parent" },
  { value: "kinship", label: "Kinship Caregiver" },
  { value: "biological", label: "Biological Parent" },
  { value: "professional", label: "Professional" },
  { value: "other", label: "Other" },
];

export default function AppSurvey() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    family_type: "foster",
    app_overall: 0,
    ease_of_use: 0,
    features_helpful: 0,
    most_helpful: "",
    needs_improvement: "",
    would_recommend: false,
    additional_feedback: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUser = () => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
  };

  useState(() => { fetchUser(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?.email) return;
    
    setLoading(true);
    await base44.entities.Survey.create({
      email: user.email,
      full_name: form.full_name || user.full_name,
      family_type: form.family_type,
      app_overall: form.app_overall,
      ease_of_use: form.ease_of_use || null,
      features_helpful: form.features_helpful || null,
      most_helpful: form.most_helpful,
      needs_improvement: form.needs_improvement,
      would_recommend: form.would_recommend,
      additional_feedback: form.additional_feedback,
      submitted_at: new Date().toISOString(),
    });
    setSubmitted(true);
    setLoading(false);
  }

  function StarRating({ value, onChange, label }) {
    return (
      <div className="mb-4">
        <p className="text-xs font-bold mb-2" style={{ color: C.mutedText }}>{label}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => onChange(star)}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: value >= star ? C.gold : C.cream,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Star size={16} fill={value >= star ? C.brown : "none"} color={value >= star ? C.brown : C.mutedText} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Survey" backTo="/" />
        <div className="max-w-[520px] mx-auto px-4 py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "#EAF4EA" }}>
            <CheckCircle2 size={32} color={C.midGreen} />
          </div>
          <h1 className="font-serif font-bold text-2xl" style={{ color: C.darkGreen }}>
            Thank You! 💚
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#3a3028" }}>
            Your feedback helps us build a better app for families. We truly appreciate you taking the time to share your thoughts.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl font-bold text-sm mt-4"
            style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="We'd Love Your Feedback" subtitle="Help us improve Rooted 21" backTo="/" />

      <div className="max-w-[520px] mx-auto px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>YOUR NAME</label>
            <input
              type="text"
              placeholder={user?.full_name || "First & last name"}
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            />
          </div>

          {/* Family type */}
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>I AM A...</label>
            <select
              value={form.family_type}
              onChange={e => setForm({ ...form, family_type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            >
              {FAMILY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${C.cream}`, margin: "20px 0" }} />

          {/* Rating sections */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-extrabold tracking-wider mb-4" style={{ color: C.mutedText }}>RATE YOUR EXPERIENCE</p>
            
            <StarRating
              label="Overall, how would you rate the Rooted 21 app?"
              value={form.app_overall}
              onChange={(val) => setForm({ ...form, app_overall: val })}
            />

            <StarRating
              label="How easy is the app to use?"
              value={form.ease_of_use}
              onChange={(val) => setForm({ ...form, ease_of_use: val })}
            />

            <StarRating
              label="How helpful are the features?"
              value={form.features_helpful}
              onChange={(val) => setForm({ ...form, features_helpful: val })}
            />
          </div>

          {/* Open-ended feedback */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-extrabold tracking-wider mb-3" style={{ color: C.mutedText }}>YOUR FEEDBACK</p>
            
            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
              What feature was MOST helpful? (Optional)
            </label>
            <textarea
              placeholder="Tell us which feature you loved..."
              value={form.most_helpful}
              onChange={e => setForm({ ...form, most_helpful: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs border outline-none resize-none mb-3"
              style={{ borderColor: C.cream, background: C.offWhite, minHeight: 60 }}
            />

            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
              What needs improvement? (Optional)
            </label>
            <textarea
              placeholder="What could we do better..."
              value={form.needs_improvement}
              onChange={e => setForm({ ...form, needs_improvement: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs border outline-none resize-none mb-3"
              style={{ borderColor: C.cream, background: C.offWhite, minHeight: 60 }}
            />

            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
              Any other comments? (Optional)
            </label>
            <textarea
              placeholder="Anything else you'd like us to know..."
              value={form.additional_feedback}
              onChange={e => setForm({ ...form, additional_feedback: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs border outline-none resize-none"
              style={{ borderColor: C.cream, background: C.offWhite, minHeight: 60 }}
            />
          </div>

          {/* Recommendation */}
          <label className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer"
            style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <input
              type="checkbox"
              checked={form.would_recommend}
              onChange={e => setForm({ ...form, would_recommend: e.target.checked })}
              className="w-5 h-5 rounded"
              style={{ accentColor: C.darkGreen }}
            />
            <span className="text-xs font-bold" style={{ color: C.darkGreen }}>
              I would recommend Rooted 21 to other families
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!form.app_overall || loading}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: form.app_overall ? C.darkGreen : C.cream,
              color: form.app_overall ? "#fff" : C.mutedText,
              border: "none",
              cursor: form.app_overall ? "pointer" : "default",
            }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting...</>
            ) : (
              "Submit Feedback"
            )}
          </button>

          <p className="text-center text-[10px]" style={{ color: C.mutedText }}>
            All feedback is anonymous and helps us improve. Thank you! 💛
          </p>

          <div className="pb-8" />
        </form>
      </div>
    </div>
  );
}