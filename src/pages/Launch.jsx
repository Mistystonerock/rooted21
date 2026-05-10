import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import TreeLogo from "@/components/rooted/TreeLogo";
import { Heart, Users, BookOpen, Shield, CheckCircle2, ChevronDown } from "lucide-react";

const LAUNCH_DATE = new Date("2026-06-10T09:00:00-04:00"); // June 10, 9am ET

function useCountdown() {
  const [time, setTime] = useState(() => getTimeLeft());

  function getTimeLeft() {
    const diff = LAUNCH_DATE - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      launched: false,
    };
  }

  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  return time;
}

function CountdownBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl"
        style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <p className="text-[10px] font-bold mt-1.5 tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
        {label}
      </p>
    </div>
  );
}

const PILLARS = [
  { emoji: "🌳", title: "Trauma-Informed Parenting", desc: "Evidence-based tools grounded in attachment science and trust-based principles — translated into daily, doable steps." },
  { emoji: "💙", title: "For Foster, Adoptive & Kinship Families", desc: "Built specifically for caregivers of children from hard places. No one-size-fits-all advice here." },
  { emoji: "🤝", title: "Community Without Judgment", desc: "A safe space where parents can be honest about the hard days and celebrate the wins together." },
  { emoji: "🏛️", title: "Accessible & Affordable", desc: "We believe every family deserves support, regardless of income. Our mission is access for the families who need it most." },
];

const FAMILY_TYPES = [
  { value: "foster", label: "Foster Parent" },
  { value: "adoptive", label: "Adoptive Parent" },
  { value: "kinship", label: "Kinship Caregiver" },
  { value: "biological", label: "Biological Parent" },
  { value: "other", label: "Other / Professional" },
];

export default function Launch() {
  const time = useCountdown();
  const [form, setForm] = useState({ full_name: "", email: "", city: "", family_type: "foster", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(null);

  useEffect(() => {
    base44.entities.WaitlistSignup.list("-created_date", 1000).then(list => setCount(list.length)).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setLoading(true);
    setError("");
    await base44.entities.WaitlistSignup.create({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      city: form.city.trim(),
      family_type: form.family_type,
      message: form.message.trim(),
    });
    setSubmitted(true);
    setLoading(false);
    setCount(c => (c || 0) + 1);
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: C.offWhite }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center px-5 pt-16 pb-12 text-center"
        style={{ background: `linear-gradient(160deg, hsl(138,24%,18%) 0%, hsl(138,24%,28%) 60%, hsl(43,48%,40%) 100%)` }}
      >
        {/* Nonprofit badge */}
        <span
          className="mb-6 px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase"
          style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          Parenting Support Network
        </span>

        <TreeLogo size={64} />

        <h1 className="font-serif font-bold mt-5 mb-2" style={{ fontSize: "2rem", color: "#fff", lineHeight: 1.2 }}>
          Rooted <span style={{ color: "hsl(43,70%,65%)" }}>21</span>
        </h1>
        <p className="font-serif italic text-base mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>
          Parenting Network
        </p>
        <p className="text-sm mt-3 leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
          Trauma-informed parenting support, tools, and community — free for families who need it most.
        </p>

        {/* Countdown */}
        {!time.launched ? (
          <div className="mt-8">
            <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
              Launching June 10, 2026
            </p>
            <div className="flex items-start gap-3">
              <CountdownBlock value={time.days} label="Days" />
              <span className="text-2xl font-bold mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>:</span>
              <CountdownBlock value={time.hours} label="Hours" />
              <span className="text-2xl font-bold mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>:</span>
              <CountdownBlock value={time.minutes} label="Min" />
              <span className="text-2xl font-bold mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>:</span>
              <CountdownBlock value={time.seconds} label="Sec" />
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl px-6 py-4" style={{ background: "rgba(255,255,255,0.15)" }}>
            <p className="font-bold text-lg" style={{ color: "#fff" }}>🎉 We're Live!</p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>Welcome to the Rooted 21 Community.</p>
          </div>
        )}

        {/* Waitlist count */}
        {count > 0 && (
          <p className="mt-6 text-xs font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>
            🌱 {count} familie{count !== 1 ? "s" : ""} already on the waitlist
          </p>
        )}

        {/* Scroll cue */}
        <div className="mt-8 animate-bounce">
          <ChevronDown size={20} color="rgba(255,255,255,0.4)" />
        </div>
      </div>

      {/* ── MISSION STATEMENT ────────────────────────────────────── */}
      <div className="max-w-[540px] mx-auto px-5 py-10">
        <div className="text-center mb-8">
          <span className="text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ background: C.cream, color: C.mutedText }}>
            Our Mission
          </span>
          <h2 className="font-serif font-bold text-2xl mt-4 mb-3" style={{ color: C.darkGreen, lineHeight: 1.3 }}>
            Every family deserves support —<br />
            <span style={{ color: C.gold }}>wherever they are.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#3a3028" }}>
            In too many towns across America, there are no parenting classes, no trauma-informed support groups, 
            no resources for foster and adoptive families navigating the hardest moments of their lives. 
            Rooted 21 exists to change that.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "#3a3028" }}>
            We are bringing <strong>research-backed, trauma-informed parenting tools</strong> directly 
            to families — through an app, live classes, and a community built on grace, not judgment.
          </p>
        </div>

        {/* Founder's note */}
        <div className="rounded-2xl p-5 mb-8" style={{ background: C.darkGreen }}>
          <p className="text-[10px] font-extrabold tracking-widest uppercase mb-3" style={{ color: C.gold }}>
            A Note From Our Founder
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
            "I started Rooted 21 because I live in a community where these classes simply don't exist. 
            I'm getting certified so I can bring this work home — to the families right here who need it 
            and have nowhere else to turn. This app is the tool I wish I'd had. I want every parent who 
            feels alone in this to know: <strong style={{ color: C.gold }}>you are not alone, and you are not failing.</strong>"
          </p>
          <p className="text-[11px] mt-3 font-bold" style={{ color: C.lightGreen }}>
            — Founder, Rooted 21 Parenting Network
          </p>
        </div>

        {/* Pillars */}
        <div className="mb-8">
          <p className="text-[10px] font-extrabold tracking-widest uppercase text-center mb-5" style={{ color: C.mutedText }}>
            What We Stand For
          </p>
          <div className="space-y-3">
            {PILLARS.map(p => (
              <div key={p.title} className="rounded-2xl p-4 flex items-start gap-4"
                style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
                <span className="text-2xl flex-shrink-0 mt-0.5">{p.emoji}</span>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: C.darkGreen }}>{p.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's in the app */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1.5px solid ${C.cream}` }}>
          <div className="px-5 py-4" style={{ background: C.darkGreen }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>What's Inside the App</p>
            <p className="text-[11px] mt-0.5" style={{ color: C.lightGreen }}>Everything a family needs — in one place, free.</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2" style={{ background: "#fff" }}>
            {[
              ["📚", "21-Lesson Curriculum"],
              ["🧠", "Daily Check-In Tools"],
              ["🤖", "AI Parenting Coach"],
              ["📈", "Behavior Analytics"],
              ["🎓", "Live Parenting Classes"],
              ["⚖️", "Case Management"],
              ["🔒", "Secure Document Vault"],
              ["🤝", "Professional Support Team"],
              ["🚨", "Crisis Toolbox"],
              ["📅", "Family Care Calendar"],
            ].map(([emoji, label]) => (
              <div key={label} className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: C.offWhite }}>
                <span className="text-base">{emoji}</span>
                <p className="text-[11px] font-bold" style={{ color: C.darkGreen }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WAITLIST FORM ─────────────────────────────────────── */}
        <div id="waitlist" className="rounded-2xl overflow-hidden mb-6" style={{ border: `2px solid ${C.midGreen}` }}>
          <div className="px-5 py-4 text-center" style={{ background: C.midGreen }}>
            <p className="font-serif font-bold text-lg" style={{ color: "#fff" }}>
              Join the Waitlist 🌱
            </p>
            <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>
              Be the first to know when we launch on June 10
            </p>
          </div>

          {submitted ? (
            <div className="px-5 py-8 text-center" style={{ background: "#fff" }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "#EAF4EA" }}>
                <CheckCircle2 size={28} color={C.midGreen} />
              </div>
              <p className="font-serif font-bold text-base mb-2" style={{ color: C.darkGreen }}>
                You're on the list! 🎉
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>
                We'll email you the moment Rooted 21 opens its doors on June 10.
                Thank you for believing in this mission.
              </p>
              <p className="text-[11px] mt-3 font-bold" style={{ color: C.midGreen }}>
                Share with another family who needs this. ❤️
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-5 py-5 space-y-3" style={{ background: "#fff" }}>
              <div>
                <label className="text-[10px] font-extrabold tracking-wide" style={{ color: C.mutedText }}>
                  YOUR NAME *
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="First & last name"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold tracking-wide" style={{ color: C.mutedText }}>
                  EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@email.com"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold tracking-wide" style={{ color: C.mutedText }}>
                  YOUR CITY / TOWN
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Where are you located?"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold tracking-wide" style={{ color: C.mutedText }}>
                  I AM A...
                </label>
                <select
                  value={form.family_type}
                  onChange={e => setForm(f => ({ ...f, family_type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                >
                  {FAMILY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold tracking-wide" style={{ color: C.mutedText }}>
                  WHY ARE YOU INTERESTED? (OPTIONAL)
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us a little about your family or what you're looking for..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none resize-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />
              </div>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FDECEC", color: "#C0392B" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: loading ? C.midGreen + "88" : C.darkGreen, color: "#fff", border: "none", cursor: loading ? "default" : "pointer" }}
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving your spot...</>
                ) : (
                  <>🌱 Reserve My Spot — It's Free</>
                )}
              </button>
              <p className="text-[10px] text-center" style={{ color: C.mutedText }}>
                No spam, ever. We'll only email you about the launch. ❤️
              </p>
            </form>
          )}
        </div>

        {/* Crisis reminder */}
        <div className="rounded-xl p-3 flex items-center gap-3 mb-4" style={{ background: C.cream }}>
          <Heart size={13} color={C.brown} className="flex-shrink-0" />
          <p className="text-[11px]" style={{ color: C.darkGreen }}>
            In crisis right now? Call or text <strong>988</strong>. In immediate danger, call <strong>911</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <TreeLogo size={36} />
          <p className="font-serif font-bold mt-2 text-sm" style={{ color: C.darkGreen }}>
            Rooted 21 Parenting Network
          </p>
          <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>
            Stronger Parents. Stronger Kids. Stronger Families.
          </p>
        </div>
      </div>
    </div>
  );
}