import { Link } from "react-router-dom";
import { AlertTriangle, Phone, MessageCircle, Shield, ChevronLeft } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CrisisSupport() {
  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <div className="sticky top-0 z-20 px-4 py-3" style={{ background: "#7F1D1D", paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[520px] items-center gap-3">
          <Link to="/dashboard" className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.14)" }} aria-label="Back to dashboard">
            <ChevronLeft size={20} color="#fff" />
          </Link>
          <div>
            <h1 className="font-serif text-lg font-bold" style={{ color: "#fff" }}>Crisis Support</h1>
            <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.82)" }}>Immediate caregiver support resources</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: "#FEF2F2", border: "2px solid #FCA5A5" }}>
          <div className="mb-3 flex items-start gap-3">
            <div className="rounded-2xl p-3" style={{ background: "#DC2626" }}>
              <AlertTriangle size={26} color="#fff" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-black" style={{ color: "#7F1D1D" }}>If anyone is in immediate danger</h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "#991B1B" }}>Call 911 now. Rooted 21 is not emergency medical, legal, or crisis intervention service.</p>
            </div>
          </div>
          <a href="tel:911" className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black no-underline shadow-lg" style={{ background: "#DC2626", color: "#fff" }}>
            <Phone size={20} /> Call 911
          </a>
        </section>

        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-2xl p-3" style={{ background: "#2563EB" }}>
              <Shield size={24} color="#fff" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Mental health crisis support</h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: C.mutedText }}>988 connects to the Suicide & Crisis Lifeline in the United States.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="tel:988" className="flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black no-underline" style={{ background: "#2563EB", color: "#fff" }}>
              <Phone size={18} /> Call 988
            </a>
            <a href="sms:988" className="flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black no-underline" style={{ background: "#1D4ED8", color: "#fff" }}>
              <MessageCircle size={18} /> Text 988
            </a>
          </div>
        </section>

        <section className="rounded-2xl p-4" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}30` }}>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>App Store submission note</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>
            Rooted 21 includes crisis links for caregiver support and quick access to 988/911. It does not replace emergency services, therapy, medical care, or legal advice.
          </p>
        </section>
      </main>
    </div>
  );
}