import { Link } from "react-router-dom";
import { DoorOpen, EyeOff, FileText, HeartHandshake, Home, MessageCircle, Phone, Scale, Shield } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { activateQuickExit } from "@/lib/survivorMode";

const SAFETY_TOOLS = [
  {
    icon: EyeOff,
    title: "If privacy feels uncertain",
    text: "You deserve safety and privacy. If it feels safer, you can use a trusted device, private browser, library computer, or trusted person’s phone at your own pace."
  },
  {
    icon: Home,
    title: "Planning can help safety",
    text: "Leaving can be dangerous, and planning matters. When you are ready, it may help to think through documents, medication, keys, transportation, children’s essentials, pets, cash, and one trusted contact."
  },
  {
    icon: FileText,
    title: "Quiet documentation, if safe",
    text: "If it feels safe for you, you can keep factual notes, photos, dates, screenshots, threats, police reports, medical visits, and custody-related incidents somewhere private."
  },
  {
    icon: HeartHandshake,
    title: "You are not alone",
    text: "Emotional abuse, stalking, coercive control, financial control, intimidation, and isolation are real safety concerns. You deserve safety, and support is available."
  }
];

export default function DomesticViolenceSupportSection() {
  const quickExit = () => {
    activateQuickExit();
  };

  return (
    <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
          <Shield size={28} color="#fff" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: C.midGreen }}>Hidden survival toolkit</p>
          <h2 className="mt-1 font-serif text-xl font-black leading-tight" style={{ color: C.darkGreen }}>
            SOS: Domestic Violence & Safety Support
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>
            For survivors of domestic violence, coercive control, emotional abuse, stalking, or parents thinking through safety options. No judgment. No pressure. You can move at your own pace.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        <p className="text-xs font-bold leading-relaxed" style={{ color: C.darkGreen }}>
          If someone may be monitoring your phone or browser, your safety comes first. A safer device may help when available. The quick exit button opens a neutral screen, though browser history may still show activity.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {SAFETY_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.title} className="rounded-2xl p-4" style={{ background: "#FAF6F1", border: `1px solid ${C.cream}` }}>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${C.midGreen}22` }}>
                  <Icon size={18} color={C.darkGreen} />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: C.darkGreen }}>{tool.title}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{tool.text}</p>
                </div>
              </div>
            </div>
          );
        })}
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
        <Link
          to="/protective-order-help"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}
        >
          <Scale size={18} /> Protective order help
        </Link>
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