import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AdminCodeRedemption from "@/components/rooted/AdminCodeRedemption";
import FeatureShowcase from "@/components/launch/FeatureShowcase";
import FoundersNote from "@/components/launch/FoundersNote";
import DonationPanel from "@/components/launch/DonationPanel";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const LAUNCH_DATE = new Date("2026-07-10T09:00:00-04:00");

const BG = "#faf6ee";
const CARD = "#fffdf9";
const CREAM = "#efe4d2";
const BORDER = "rgba(90,70,50,0.18)";
const GREEN = "#2d4a35";
const DARK = "#2d4a35";
const MUTED = "#5c4a37";
const GOLD = "#a9784f";

const HELP_ITEMS = [
  { icon: ShieldCheck, title: "Trauma-informed parenting", text: "Calm tools for behavior, regulation, routines, and parent support." },
  { icon: FileText, title: "Court & CPS organization", text: "Track documents, case plans, deadlines, visits, and progress." },
  { icon: MapPin, title: "Local resources", text: "Find practical help for housing, food, recovery, legal aid, school, and family needs." },
  { icon: MessageCircle, title: "Communication support", text: "Prepare messages, meetings, questions, and documentation in plain language." },
  { icon: LockKeyhole, title: "Private family records", text: "Keep sensitive documents, notes, reminders, and progress organized." },
  { icon: HeartHandshake, title: "Wraparound coordination", text: "Support families working with courts, schools, providers, and community agencies." },
];

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
      <p className="font-serif text-2xl font-black md:text-3xl" style={{ color: DARK }}>{String(value).padStart(2, "0")}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide" style={{ color: MUTED }}>{label}</p>
    </div>
  );
}

function HelpCard({ icon: Icon, title, text }) {
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
        const result = await base44.functions.invoke("validateBetaTesterCode", { code: betaCode });
        if (result.data?.valid) {
          localStorage.setItem("pending_beta_code", betaCode);
          base44.auth.redirectToLogin("/welcome");
          return;
        }
        setError(result.data?.error || "This enrollment code could not be verified.");
        setLoading(false);
        return;
      } catch (err) {
        const msg = err?.data?.error || err?.response?.data?.error || err?.message || "This enrollment code could not be verified. Please check the code and try again.";
        setError(msg);
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
    <div id="top" className="min-h-screen w-full max-w-[100vw] overflow-x-hidden" style={{ background: BG, color: DARK }}>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: CREAM }}>
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <p className="font-serif text-xl font-black leading-none" style={{ color: DARK }}>Rooted 21</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: MUTED }}>Parenting Network</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => base44.auth.redirectToLogin("/welcome")}
            className="rounded-xl px-4 py-2 text-sm font-black"
            style={{ background: CARD, color: GREEN, border: `1.5px solid ${GREEN}` }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => base44.auth.redirectToLogin("/welcome")}
            className="rounded-xl px-4 py-2 text-sm font-black"
            style={{ background: GREEN, color: "#fff", border: "none" }}
          >
            Sign Up
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 pb-[160px]">
        <section className="grid gap-6 py-6 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-10">
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
                Redeem Access Code
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

        <section id="founders-note" className="mt-4 w-full max-w-full overflow-x-hidden">
          <FoundersNote />
        </section>

        <section id="donations" className="mt-6 w-full max-w-full overflow-x-hidden">
          <DonationPanel />
        </section>

        <section id="app-tour" className="mt-6 grid w-full max-w-full gap-6 overflow-x-hidden md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="min-w-0">
            <FeatureShowcase />
          </div>
          <section id="what-we-help" className="min-w-0 rounded-[2rem] border p-5" style={{ background: CARD, borderColor: BORDER }}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} color={GREEN} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: GREEN }}>What we help with</p>
                <h2 className="font-serif text-2xl font-black" style={{ color: DARK }}>Tools for real-life family systems.</h2>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {HELP_ITEMS.map(item => <HelpCard key={item.title} {...item} />)}
            </div>
          </section>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]" id="waitlist">
          <div className="rounded-[2rem] border p-6" style={{ background: CARD, borderColor: BORDER }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: GREEN }}>Stay connected</p>
            <h2 className="mt-3 font-serif text-2xl font-black" style={{ color: DARK }}>Join the launch list or enter your beta code.</h2>
            <p className="mt-4 text-sm leading-7" style={{ color: MUTED }}>
              Families, caregivers, professionals, schools, courts, community partners, and supporters can join the waitlist for updates before launch. If you already have beta access, enter your code and log in to continue to the welcome page.
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
                  <option value="supporter">Community supporter</option>
                  <option value="other">Other</option>
                </select>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Optional: What kind of support are you looking for?" rows={3} style={{ ...inputStyle, resize: "none" }} />
                <input value={form.beta_code} onChange={e => setForm(f => ({ ...f, beta_code: e.target.value.toUpperCase() }))} placeholder="Optional beta access code" maxLength={12} style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "0.08em" }} />
                {error && <p className="rounded-xl p-3 text-sm font-bold" style={{ background: "#FEF3EE", color: "#9A3412" }}>{error}</p>}
                <button type="submit" disabled={loading} className="w-full rounded-2xl px-5 py-3 text-sm font-black" style={{ background: loading ? `${GREEN}88` : GREEN, color: "#fff", border: "none" }}>
                  {loading ? "Saving…" : "Join Waitlist / Continue"}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border p-5" style={{ background: CREAM, borderColor: BORDER }}>
          <p className="text-sm font-black" style={{ color: DARK }}>Professional boundary disclaimer</p>
          <p className="mt-2 text-xs leading-6" style={{ color: MUTED }}>
            Rooted 21 helps organize information, prepare questions, document progress, and connect families with supports. It does not replace an attorney, therapist, medical provider, emergency service, court order, or crisis service. If there is immediate danger, call 911 or local emergency services. For mental health crisis support, call or text 988.
          </p>
        </section>

        <footer id="footer-actions" className="mt-8 flex flex-col items-center justify-center gap-3 pb-8 text-center text-xs md:flex-row" style={{ color: MUTED }}>
          <button type="button" onClick={() => base44.auth.redirectToLogin("/welcome")} className="rounded-xl px-4 py-2 text-xs font-black" style={{ background: CARD, color: GREEN, border: `1.5px solid ${GREEN}` }}>Log In</button>
          <button type="button" onClick={() => base44.auth.redirectToLogin("/welcome")} className="rounded-xl px-4 py-2 text-xs font-black" style={{ background: GREEN, color: "#fff", border: "none" }}>Sign Up</button>
          <button type="button" onClick={() => setShowCodeModal(true)} className="rounded-xl px-4 py-2 text-xs font-black" style={{ background: CARD, color: DARK, border: `1px solid ${BORDER}` }}>Redeem Access Code</button>
          <a href="/privacy-policy" className="no-underline" style={{ color: MUTED }}>Privacy Policy</a>
          <a href="/terms-of-service" className="no-underline" style={{ color: MUTED }}>Terms of Service</a>
          <a href="/legal-disclaimers" className="no-underline" style={{ color: MUTED }}>Legal & Disclaimers</a>
        </footer>
      </main>

      {showCodeModal && <AdminCodeRedemption onClose={() => setShowCodeModal(false)} onSuccess={() => setShowCodeModal(false)} />}
    </div>
  );
}