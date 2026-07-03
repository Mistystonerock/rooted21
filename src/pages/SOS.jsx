import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronLeft, HeartPulse, Phone, X, HeartHandshake, ChevronRight } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import DomesticViolenceSupportSection from "@/components/sos/DomesticViolenceSupportSection";
import SurvivorModeSettings from "@/components/safety-plan/SurvivorModeSettings";
import PrivacySecuritySection from "@/components/privacy/PrivacySecuritySection";
import SosSupportRequest from "@/components/sos/SosSupportRequest";
import { isDvSectionHidden, activateQuickExit } from "@/lib/survivorMode";

export default function SOS() {
  const navigate = useNavigate();
  const [hideDvSection, setHideDvSection] = useState(() => isDvSectionHidden());

  useEffect(() => {
    const refresh = () => setHideDvSection(isDvSectionHidden());
    window.addEventListener("storage", refresh);
    window.addEventListener("rooted21-survivor-settings-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("rooted21-survivor-settings-changed", refresh);
    };
  }, []);

  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
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
          <div className="flex-1">
            <h1 className="font-serif text-lg font-bold" style={{ color: "#fff" }}>SOS Safety Support</h1>
            <p className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.82)" }}>Private, calming safety options</p>
          </div>
          <button
            type="button"
            onClick={() => activateQuickExit()}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black"
            style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "none", cursor: "pointer" }}
            aria-label="Quick exit to a safe screen"
          >
            <X size={16} color="#fff" /> Quick exit
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <SosSupportRequest />

        <Link to="/human-trafficking-support" className="flex w-full items-center justify-between gap-3 rounded-3xl p-4 no-underline shadow-sm" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: `${C.midGreen}18` }}>
              <HeartHandshake size={22} color={C.darkGreen} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: C.darkGreen }}>Human Trafficking Survivor Support</p>
              <p className="text-[11px] font-bold" style={{ color: C.mutedText }}>Private, gentle safety options</p>
            </div>
          </div>
          <ChevronRight size={20} color={C.darkGreen} />
        </Link>

        <section className="rounded-3xl p-5 text-center shadow-lg" style={{ background: "#fff", border: `2px solid ${C.cream}` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.midGreen }}>
            <AlertTriangle size={32} color="#fff" />
          </div>
          <h2 className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>If anyone is in immediate danger</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>Call emergency services now. Do not wait for an app response.</p>
          <a href="tel:911" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black no-underline shadow-lg" style={{ background: C.midGreen, color: "#fff" }}>
            <Phone size={22} /> Call 911
          </a>
        </section>

        <section className="rounded-3xl p-5 text-center shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
            <HeartPulse size={32} color="#fff" />
          </div>
          <h2 className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>Mental health crisis support</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>For suicidal thoughts, self-harm, panic, or emotional crisis, call or text 988.</p>
          <a href="tel:988" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black no-underline shadow-lg" style={{ background: C.darkGreen, color: "#fff" }}>
            <Phone size={22} /> Call or Text 988
          </a>
        </section>

        <SurvivorModeSettings />
        <PrivacySecuritySection />
        {!hideDvSection && <DomesticViolenceSupportSection />}

        <Link to="/chat?crisis=1" className="flex w-full items-center justify-center rounded-2xl py-4 text-sm font-black no-underline" style={{ background: C.darkGreen, color: "#fff" }}>
          Open Rooted 21 crisis coaching
        </Link>
      </main>
    </div>
  );
}