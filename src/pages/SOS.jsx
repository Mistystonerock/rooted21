import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, ChevronLeft, HeartPulse, Phone, Send } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import DomesticViolenceSupportSection from "@/components/sos/DomesticViolenceSupportSection";
import SurvivorModeSettings from "@/components/safety-plan/SurvivorModeSettings";
import { isDvSectionHidden } from "@/lib/survivorMode";

export default function SOS() {
  const navigate = useNavigate();
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState("");
  const [hideDvSection, setHideDvSection] = useState(() => isDvSectionHidden());

  function getCurrentLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("Location unavailable");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`https://maps.google.com/?q=${latitude},${longitude}`);
        },
        () => resolve("Location unavailable"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  useEffect(() => {
    const refresh = () => setHideDvSection(isDvSectionHidden());
    window.addEventListener("storage", refresh);
    window.addEventListener("rooted21-survivor-settings-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("rooted21-survivor-settings-changed", refresh);
    };
  }, []);

  async function handleSupportTeamAlert() {
    setSendingAlert(true);
    setAlertStatus("Getting your location…");
    const location = await getCurrentLocation();

    setAlertStatus("Sending alert to your support team…");
    const response = await base44.functions.invoke("sendEmergencyAlert", {
      situation: "SOS emergency alert triggered from Rooted 21. Please contact me immediately.",
      location,
    });

    const count = response.data?.smsCount || 0;
    setAlertStatus(count > 0 ? `Alert sent to ${count} support contact${count === 1 ? "" : "s"}.` : "No support contacts with phone numbers were found.");
    setSendingAlert(false);
  }

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
          <div>
            <h1 className="font-serif text-lg font-bold" style={{ color: "#fff" }}>SOS Safety Support</h1>
            <p className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.82)" }}>Private, calming safety options</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-5 text-center shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
            <Send size={30} color="#fff" />
          </div>
          <h2 className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>Alert my support team</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>Sends an SMS to your saved support team contacts with your current location and a request for immediate help.</p>
          <button
            type="button"
            onClick={handleSupportTeamAlert}
            disabled={sendingAlert}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black shadow-lg"
            style={{ background: sendingAlert ? C.cream : C.darkGreen, color: sendingAlert ? C.darkGreen : "#fff", border: "none", cursor: sendingAlert ? "default" : "pointer" }}
          >
            <Send size={22} /> {sendingAlert ? "Sending Alert…" : "Send SOS Alert"}
          </button>
          {alertStatus && <p className="mt-3 text-xs font-bold" style={{ color: C.darkGreen }}>{alertStatus}</p>}
          <Link to="/my-team" className="mt-3 inline-flex text-xs font-bold underline" style={{ color: C.darkGreen }}>Manage support team contacts</Link>
        </section>

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
        {!hideDvSection && <DomesticViolenceSupportSection />}

        <Link to="/chat?crisis=1" className="flex w-full items-center justify-center rounded-2xl py-4 text-sm font-black no-underline" style={{ background: C.darkGreen, color: "#fff" }}>
          Open Rooted 21 crisis coaching
        </Link>
      </main>
    </div>
  );
}