import { Link } from "react-router-dom";
import { AlertTriangle, Phone, HeartPulse, Send } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import TraffickingHeader from "@/components/trafficking/TraffickingHeader";
import HotlineCard from "@/components/trafficking/HotlineCard";

export default function TraffickingEmergency() {
  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <TraffickingHeader title="Get Help Now" subtitle="Safety options first" backTo="/human-trafficking-support" />

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
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

        <HotlineCard />

        <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
            <Send size={30} color="#fff" />
          </div>
          <h2 className="text-center font-serif text-xl font-black" style={{ color: C.darkGreen }}>Alert your support team</h2>
          <p className="mt-2 text-center text-sm leading-relaxed" style={{ color: C.mutedText }}>
            Send a private SOS to the people you have chosen. You control who is notified, who sees your location, and who reads your message.
          </p>
          <Link to="/sos" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black no-underline shadow-lg"
            style={{ background: C.darkGreen, color: "#fff" }}>
            <Send size={20} /> Open secure SOS
          </Link>
        </section>

        <section className="rounded-3xl p-5 text-center shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
            <HeartPulse size={32} color="#fff" />
          </div>
          <h2 className="font-serif text-xl font-black" style={{ color: C.darkGreen }}>Emotional crisis support</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>For panic, fear, or emotional crisis, call or text 988 anytime.</p>
          <a href="tel:988" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black no-underline shadow-lg" style={{ background: C.darkGreen, color: "#fff" }}>
            <Phone size={22} /> Call or Text 988
          </a>
        </section>
      </main>
    </div>
  );
}