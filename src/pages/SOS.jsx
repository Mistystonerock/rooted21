import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronLeft, HeartPulse, Phone } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function SOS() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-28" style={{ background: "#FEF3EE" }}>
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: "#B42318", paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[520px] items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl p-2"
            style={{ background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer" }}
            aria-label="Go back"
          >
            <ChevronLeft size={22} color="#fff" />
          </button>
          <div>
            <h1 className="font-serif text-lg font-bold" style={{ color: "#fff" }}>SOS Crisis Help</h1>
            <p className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.82)" }}>Immediate safety resources</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-5 text-center shadow-lg" style={{ background: "#fff", border: "2px solid #F4C9B8" }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#DC2626" }}>
            <AlertTriangle size={32} color="#fff" />
          </div>
          <h2 className="font-serif text-2xl font-black" style={{ color: "#B42318" }}>If anyone is in immediate danger</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#5A2B22" }}>Call emergency services now. Do not wait for an app response.</p>
          <a href="tel:911" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black no-underline shadow-lg" style={{ background: "#DC2626", color: "#fff" }}>
            <Phone size={22} /> Call 911
          </a>
        </section>

        <section className="rounded-3xl p-5 text-center shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#2563EB" }}>
            <HeartPulse size={32} color="#fff" />
          </div>
          <h2 className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>Mental health crisis support</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>For suicidal thoughts, self-harm, panic, or emotional crisis, call or text 988.</p>
          <a href="tel:988" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black no-underline shadow-lg" style={{ background: "#2563EB", color: "#fff" }}>
            <Phone size={22} /> Call or Text 988
          </a>
        </section>

        <Link to="/chat?crisis=1" className="flex w-full items-center justify-center rounded-2xl py-4 text-sm font-black no-underline" style={{ background: C.darkGreen, color: "#fff" }}>
          Open Rooted 21 crisis coaching
        </Link>
      </main>
    </div>
  );
}