import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import TreeLogo from "@/components/rooted/TreeLogo";
import { Facebook, Instagram, Music2 } from "lucide-react";

const FOUNDER_EMAIL = "misty.stonerock88@gmail.com";
const LAUNCH_DATE = new Date("2026-07-10T00:00:00-04:00").getTime();
const ROLES = ["Parent", "Foster Parent", "Caseworker", "Therapist", "Court Staff", "Other"];

function getCountdown() {
  const distance = Math.max(0, LAUNCH_DATE - Date.now());
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

export default function ComingSoon({ onBetaAccess }) {
  const [form, setForm] = useState({ first_name: "", email: "", role_type: "Parent" });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBeta, setShowBeta] = useState(false);
  const [betaCode, setBetaCode] = useState("");
  const [betaError, setBetaError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdownItems = useMemo(() => [
    ["Days", countdown.days],
    ["Hours", countdown.hours],
    ["Minutes", countdown.minutes],
    ["Seconds", countdown.seconds],
  ], [countdown]);

  async function submitWaitlist(e) {
    e.preventDefault();
    setSaving(true);
    await base44.functions.invoke("saveWaitlistSignup", form);
    setSubmitted(true);
    setSaving(false);
  }

  async function submitBetaCode(e) {
    e.preventDefault();
    setBetaError("");
    setCheckingCode(true);
    try {
      await base44.functions.invoke("validateBetaTesterCode", { code: betaCode });
      localStorage.setItem("rooted21_beta_access", "true");
      onBetaAccess?.();
    } catch {
      setBetaError("This code is not valid. Please contact Misty at misty.stonerock88@gmail.com");
    }
    setCheckingCode(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8" style={{ background: "radial-gradient(circle at top, #1b5a34 0%, #0d2818 45%, #06170d 100%)", color: "#F7E8C6" }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #c9973a 0 2px, transparent 2px)", backgroundSize: "42px 42px" }} />
      <button onClick={() => base44.auth.redirectToLogin("/founder-dashboard")} className="absolute bottom-2 right-3 z-20 text-[10px] underline opacity-60 hover:opacity-100" style={{ background: "transparent", border: "none", color: "#E6D8B8" }}>Admin Login</button>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] max-w-[620px] flex-col justify-center">
        <div className="rounded-[32px] border p-6 shadow-2xl md:p-8" style={{ background: "rgba(13,40,24,0.86)", borderColor: "rgba(247,232,198,0.24)", backdropFilter: "blur(18px)" }}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "rgba(247,232,198,0.12)", border: "1px solid rgba(247,232,198,0.25)" }}>
              <TreeLogo size={54} />
            </div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em]" style={{ color: "#c9973a" }}>Rooted 21 Parenting Network</p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl">Rooted 21 is Coming Soon 🌿</h1>
            <p className="mt-3 text-base font-semibold" style={{ color: "#E6D8B8" }}>We are putting the finishing touches on something built for families like yours.</p>
            <p className="mx-auto mt-4 max-w-[520px] text-sm leading-7" style={{ color: "#E6D8B8" }}>
              Rooted 21 is a free trauma-informed parenting support platform designed for parents navigating hard things. We will be launching very soon. Sign up below to be the first to know when we go live.
            </p>
            <p className="mt-4 font-serif text-lg italic" style={{ color: "#c9973a" }}>Breaking cycles. One family at a time.</p>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {countdownItems.map(([label, value]) => (
              <div key={label} className="rounded-2xl border px-2 py-3 text-center" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(247,232,198,0.16)" }}>
                <p className="text-2xl font-black">{String(value).padStart(2, "0")}</p>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "#E6D8B8" }}>{label}</p>
              </div>
            ))}
          </div>

          {submitted ? (
            <div className="mt-6 rounded-3xl border p-5 text-center" style={{ background: "rgba(107,157,110,0.18)", borderColor: "rgba(107,157,110,0.45)" }}>
              <p className="font-serif text-2xl font-bold">You are on the list!</p>
              <p className="mt-2 text-sm leading-7" style={{ color: "#E6D8B8" }}>We will email you the moment Rooted 21 goes live. Thank you for believing in this mission. — Misty</p>
            </div>
          ) : (
            <form onSubmit={submitWaitlist} className="mt-6 space-y-3">
              <input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="First name" className="w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(247,232,198,0.28)", background: "rgba(255,255,255,0.96)", color: "#1a1a1a" }} />
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(247,232,198,0.28)", background: "rgba(255,255,255,0.96)", color: "#1a1a1a" }} />
              <select value={form.role_type} onChange={e => setForm({ ...form, role_type: e.target.value })} className="w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(247,232,198,0.28)", background: "rgba(255,255,255,0.96)", color: "#1a1a1a" }}>
                {ROLES.map(role => <option key={role} value={role}>I am a: {role}</option>)}
              </select>
              <button disabled={saving} className="w-full rounded-2xl px-5 py-3 text-sm font-black" style={{ background: "#c9973a", color: "#0d2818", border: "none" }}>{saving ? "Saving..." : "Sign Me Up"}</button>
              <p className="text-center text-[11px]" style={{ color: "#E6D8B8" }}>We will never spam you. You will only hear from us when we launch.</p>
            </form>
          )}

          <div className="mt-5 text-center">
            <button onClick={() => setShowBeta(v => !v)} className="text-xs underline" style={{ background: "transparent", border: "none", color: "#E6D8B8" }}>Have a beta access code? Click here.</button>
            {showBeta && (
              <form onSubmit={submitBetaCode} className="mx-auto mt-3 flex max-w-sm flex-col gap-2 sm:flex-row">
                <input required value={betaCode} onChange={e => setBetaCode(e.target.value)} placeholder="Enter beta code" className="flex-1 rounded-xl border px-3 py-2 text-sm uppercase" style={{ background: "#fff", color: "#1a1a1a" }} />
                <button disabled={checkingCode} className="rounded-xl px-4 py-2 text-xs font-bold" style={{ background: "#6b9d6e", color: "#fff", border: "none" }}>{checkingCode ? "Checking..." : "Enter"}</button>
              </form>
            )}
            {betaError && <p className="mt-2 text-xs font-bold" style={{ color: "#ffb4a8" }}>{betaError}</p>}
          </div>
        </div>

        <section className="mt-6 rounded-3xl border p-5 text-center" style={{ background: "rgba(13,40,24,0.72)", borderColor: "rgba(247,232,198,0.18)" }}>
          <p className="font-serif text-lg font-bold">Follow us for updates and parenting support content.</p>
          <div className="mt-4 flex justify-center gap-3">
            <a href="#" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "#F7E8C6" }}><Facebook size={19} /></a>
            <a href="#" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "#F7E8C6" }}><Instagram size={19} /></a>
            <a href="#" aria-label="TikTok" className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "#F7E8C6" }}><Music2 size={19} /></a>
          </div>
          <p className="mt-5 text-sm" style={{ color: "#E6D8B8" }}>Questions? Email us at <a href="mailto:misty.stonerock88@gmail.com" className="underline" style={{ color: "#c9973a" }}>misty.stonerock88@gmail.com</a></p>
        </section>

        <footer className="mt-6 text-center text-[11px] leading-6" style={{ color: "rgba(247,232,198,0.72)" }}>
          <p>© 2026 Rooted 21 Parenting Network LLC. All rights reserved.</p>
          <p>Trademark pending. Chillicothe, Ross County, Ohio.</p>
          <p>rooted21parenting.org</p>
        </footer>
      </main>
    </div>
  );
}