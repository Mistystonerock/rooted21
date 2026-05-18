import { DoorOpen, MessageCircle, Phone, Shield } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function DomesticViolenceSupportSection() {
  const quickExit = () => {
    window.location.replace("https://www.google.com/search?q=weather");
  };

  return (
    <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
          <Shield size={28} color="#fff" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: C.midGreen }}>Private safety support</p>
          <h2 className="mt-1 font-serif text-xl font-black leading-tight" style={{ color: C.darkGreen }}>
            SOS: Domestic Violence & Safety Support
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>
            If something feels unsafe at home or in a relationship, you deserve support without judgment. You can move at your own pace.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        <p className="text-xs font-bold leading-relaxed" style={{ color: C.darkGreen }}>
          If someone may be monitoring your phone or browser, use a safer device if possible. The quick exit button opens a weather search, but browser history may still show activity.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <a
          href="tel:18007997233"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.darkGreen, color: "#fff" }}
        >
          <Phone size={18} /> Call National DV Hotline
        </a>
        <a
          href="sms:88788?body=START"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.midGreen, color: "#fff" }}
        >
          <MessageCircle size={18} /> Text START to 88788
        </a>
        <button
          type="button"
          onClick={quickExit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
        >
          <DoorOpen size={18} /> Quick exit
        </button>
      </div>
    </section>
  );
}