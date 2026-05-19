import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AdminCodeRedemption from "@/components/rooted/AdminCodeRedemption";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";

const LAUNCH_DATE = new Date("2026-07-10T09:00:00-04:00");

const BG = "#faf6f1";
const CARD = "#ffffff";
const CREAM = "#f5ede2";
const BORDER = "rgba(120,85,60,0.18)";
const GREEN = "#6b9d6e";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const GOLD = "#a67c52";

function getTimeLeft() {
  const diff = LAUNCH_DATE - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownBox({ label, value }) {
  return (
    <div className="rounded-2xl border p-3 text-center" style={{ background: CREAM, borderColor: BORDER }}>
      <p className="font-serif text-2xl font-black" style={{ color: DARK }}>{String(value).padStart(2, "0")}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide" style={{ color: MUTED }}>{label}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: CARD, borderColor: BORDER }}>
      <Icon size={20} color={GREEN} />
      <p className="mt-3 text-sm font-black" style={{ color: DARK }}>{title}</p>
      <p className="mt-2 text-xs leading-6" style={{ color: MUTED }}>{text}</p>
    </div>
  );
}

export default function Launch() {
  const [time, setTime] = useState(() => getTimeLeft());
  const [form, setForm] = useState({ full_name: "", email: "", family_type: "foster", message: "", beta_code: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    setLoading(true);
    setError("");

    const betaCode = form.beta_code.trim().toUpperCase();
    if (betaCode) {
      try {
        await base44.functions.invoke("validateBetaTesterCode", { code: betaCode });
        localStorage.setItem("pending_beta_code", betaCode);
        base44.auth.redirectToLogin("/welcome");
        return;
      } catch {
        setError("This beta access code could not be verified. Please check the code and try again.");
        setLoading(false);
        return;
      }
    }

    await base44.entities.WaitlistSignup.create({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      family_type: form.family_type,
      message: form.message.trim(),
    });
    setSubmitted(true);
    setLoading(false);
  }

  const inputStyle = {
    width: "100%",
    background: CARD,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 12,
    padding: "12px 14px",
    color: DARK,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div className="min-h-screen" style={{ background: BG, color: DARK }}>
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: CREAM }}>
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <p className="font-serif text-xl font-black leading-none" style={{ color: DARK }}>Rooted 21</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: MUTED }}>Parenting Network</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => base44.auth.redirectToLogin("/welcome")}
          className="rounded-xl px-4 py-2 text-sm font-black"
          style={{ background: CARD, color: GREEN, border: `1.5px solid ${GREEN}` }}
        >
          Already have access? Log In
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <section className="grid gap-6 py-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide" style={{ background: CARD, borderColor: BORDER, color: GREEN }}>
              <CalendarDays size={14} /> Launching July 10, 2026
            </div>
            <div>
              <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl" style={{ color: DARK }}>
                Calm support for families navigating hard systems.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 md:text-lg" style={{ color: MUTED }}>
                Rooted 21 Parenting Network is being built as a private, trauma-informed place to organize paperwork, prepare for court/CPS and school meetings, document progress, and connect families with wraparound supports.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-2xl px-5 py-3 text-sm font-black"
                style={{ background: GREEN, color: "#fff", border: "none" }}
              >
                Join the Waitlist <ArrowRight size={16} className="ml-2" />
              </button>
              <button
                type="button"
                onClick={() => setShowCodeModal(true)}
                className="rounded-2xl px-5 py-3 text-sm font-black"
                style={{ background: CARD, color: DARK, border: `1.5px solid ${BORDER}` }}
              >
                Redeem Beta Access
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border p-5 shadow-sm" style={{ background: CARD, borderColor: BORDER }}>
            <div className="flex items-center gap-2 text-sm font-black" style={{ color: DARK }}>
              <Clock size={18} color={GREEN} /> Live countdown
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <CountdownBox label="Days" value={time.days} />
              <CountdownBox label="Hours" value={time.hours} />
              <CountdownBox label="Minutes" value={time.minutes} />
              <CountdownBox label="Seconds" value={time.seconds} />
            </div>
            <p className="mt-4 rounded-2xl p-4 text-sm leading-7" style={{ background: BG, color: MUTED }}>
              We are finalizing tools for parenting support, paperwork organization, court/CPS preparation, behavior tracking, care coordination, and family resource navigation.
            </p>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <InfoCard icon={ShieldCheck} title="Trauma-informed support" text="Built to reduce overwhelm, use plain language, and help families take one next step at a time." />
          <InfoCard icon={LockKeyhole} title="Private organization" text="Designed for sensitive family information, documents, reminders, and progress tracking." />
          <InfoCard icon={HeartHandshake} title="Wraparound services" text="Supports coordination across court, CPS, school, behavioral health, housing, recovery, and community resources." />
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]" id="waitlist">
          <div className="rounded-[2rem] border p-6" style={{ background: CARD, borderColor: BORDER }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: GREEN }}>Founder note</p>
            <h2 className="mt-3 font-serif text-2xl font-black" style={{ color: DARK }}>Built from lived experience and frontline family support.</h2>
            <p className="mt-4 text-sm leading-7" style={{ color: MUTED }}>
              Rooted 21 was created to help families feel less alone while navigating systems that can feel confusing, intimidating, and emotionally heavy. The goal is simple: help parents and caregivers get organized, prepare questions, document progress, and find supportive next steps without shame.
            </p>
          </div>

          <div className="rounded-[2rem] border p-6" style={{ background: CARD, borderColor: BORDER }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: GREEN }}>Join waitlist</p>
            <h2 className="mt-3 font-serif text-2xl font-black" style={{ color: DARK }}>Be notified when Rooted 21 opens.</h2>
            {submitted ? (
              <div className="mt-5 rounded-2xl p-5 text-center" style={{ background: CREAM }}>
                <CheckCircle2 size={28} color={GREEN} className="mx-auto" />
                <p className="mt-3 font-black" style={{ color: DARK }}>You’re on the waitlist.</p>
                <p className="mt-2 text-sm" style={{ color: MUTED }}>Thank you. We’ll keep you updated before launch.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" style={inputStyle} />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" style={inputStyle} />
                <select value={form.family_type} onChange={e => setForm(f => ({ ...f, family_type: e.target.value }))} style={inputStyle}>
                  <option value="foster">Foster parent</option>
                  <option value="adoptive">Adoptive parent</option>
                  <option value="kinship">Kinship caregiver</option>
                  <option value="biological">Biological parent</option>
                  <option value="professional">Professional / provider</option>
                  <option value="other">Other</option>
                </select>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Optional: What kind of support are you looking for?" rows={3} style={{ ...inputStyle, resize: "none" }} />
                <input value={form.beta_code} onChange={e => setForm(f => ({ ...f, beta_code: e.target.value.toUpperCase() }))} placeholder="Optional beta access code" maxLength={12} style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "0.08em" }} />
                {error && <p className="rounded-xl p-3 text-sm font-bold" style={{ background: "#FEF3EE", color: "#9A3412" }}>{error}</p>}
                <button type="submit" disabled={loading} className="w-full rounded-2xl px-5 py-3 text-sm font-black" style={{ background: loading ? `${GREEN}88` : GREEN, color: "#fff", border: "none" }}>
                  {loading ? "Saving…" : "Join Waitlist"}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border p-6" style={{ background: CARD, borderColor: BORDER }}>
          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: GREEN }}>Support the mission</p>
          <h2 className="mt-3 font-serif text-2xl font-black" style={{ color: DARK }}>Help keep family support accessible.</h2>
          <p className="mt-4 text-sm leading-7" style={{ color: MUTED }}>
            Donations and community support help Rooted 21 continue building low-cost tools for families who need organization, preparation, documentation, and connection during difficult seasons.
          </p>
          <a href="/donate" className="mt-4 inline-flex rounded-2xl px-5 py-3 text-sm font-black no-underline" style={{ background: GOLD, color: "#fff" }}>Donation / Support Info</a>
        </section>

        <section className="mt-6 rounded-[2rem] border p-5" style={{ background: CREAM, borderColor: BORDER }}>
          <p className="text-sm font-black" style={{ color: DARK }}>Professional boundary disclaimer</p>
          <p className="mt-2 text-xs leading-6" style={{ color: MUTED }}>
            Rooted 21 helps organize information, prepare questions, document progress, and connect families with supports. It does not replace an attorney, therapist, medical provider, emergency service, court order, or crisis service. If there is immediate danger, call 911 or local emergency services. For mental health crisis support, call or text 988.
          </p>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-center gap-3 pb-8 text-center text-xs md:flex-row" style={{ color: MUTED }}>
          <a href="/privacy-policy" className="no-underline" style={{ color: MUTED }}>Privacy Policy</a>
          <span className="hidden md:inline">•</span>
          <a href="/terms-of-service" className="no-underline" style={{ color: MUTED }}>Terms of Service</a>
          <span className="hidden md:inline">•</span>
          <a href="/legal-disclaimers" className="no-underline" style={{ color: MUTED }}>Legal & Disclaimers</a>
        </footer>
      </main>

      {showCodeModal && <AdminCodeRedemption onClose={() => setShowCodeModal(false)} onSuccess={() => setShowCodeModal(false)} />}
    </div>
  );
}