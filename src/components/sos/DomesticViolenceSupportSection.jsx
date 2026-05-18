import { Link } from "react-router-dom";
import { Backpack, BellOff, DoorOpen, EyeOff, FileText, HeartHandshake, Home, KeyRound, LockKeyhole, MapPin, MessageCircle, Phone, Scale, Shield, Users } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { activateQuickExit } from "@/lib/survivorMode";
import ChildSafetyPlanningSection from "@/components/sos/ChildSafetyPlanningSection";
import OhioDvResourceSection from "@/components/sos/OhioDvResourceSection";

const SAFETY_TOOLS = [
  {
    icon: EyeOff,
    title: "Discreet privacy tools",
    text: "You deserve safety. Quick Exit can move to a neutral fake screen, survivor mode can hide sensitive areas, and PIN-protected access can add another privacy layer."
  },
  {
    icon: Backpack,
    title: "Emergency bag checklist",
    text: "If it feels safe, consider IDs, birth certificates, medication, keys, cash/card, phone charger, children’s comfort items, custody papers, and copies of important documents."
  },
  {
    icon: Users,
    title: "Trusted contacts",
    text: "You are not alone. Choose one or more safe people who can help with a ride, a code word, child pickup, a place to pause, or a quiet check-in."
  },
  {
    icon: FileText,
    title: "Safety plan builder",
    text: "Support is available. You can create a gentle safety plan for contacts, safe places, calming steps, children’s needs, and crisis resources."
  },
  {
    icon: Scale,
    title: "Protective order resources",
    text: "Learn about Ohio protective order options, documentation, court preparation, legal aid, and ways to ask for help without pressure."
  },
  {
    icon: Home,
    title: "Shelter locator",
    text: "Find Ohio domestic violence shelters, emergency housing, transportation support, pet-aware options, and statewide crisis referrals."
  },
  {
    icon: HeartHandshake,
    title: "Trauma support resources",
    text: "Emotional abuse, coercive control, stalking, threats, intimidation, and isolation can affect the body and mind. Care and support can happen at your pace."
  },
  {
    icon: LockKeyhole,
    title: "Hidden encrypted document vault",
    text: "If it is safe, store screenshots, photos, reports, messages, timelines, and documents in a hidden PIN-protected vault with private file access."
  },
  {
    icon: BellOff,
    title: "Hidden notifications",
    text: "You can keep sensitive notifications off or hidden so previews do not reveal private safety information."
  },
  {
    icon: KeyRound,
    title: "PIN-protected access",
    text: "A PIN can protect survivor tools and the hidden vault. Choose something only you know, when it feels safe to set one."
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
            For survivors of domestic violence, coercive control, emotional abuse, stalking, or parents thinking through safety options. You deserve safety. You are not alone. Support is available.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        <p className="text-xs font-bold leading-relaxed" style={{ color: C.darkGreen }}>
          If someone may be monitoring your phone or browser, your safety comes first. A safer device may help when available. Quick Exit redirects to a neutral fake screen, though browser history may still show activity.
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
          to="/safety-plan"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}
        >
          <FileText size={18} /> Open safety plan builder
        </Link>
        <Link
          to="/my-team"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}
        >
          <Users size={18} /> Trusted contacts
        </Link>
        <Link
          to="/protective-order-help"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}
        >
          <Scale size={18} /> Protective order resources
        </Link>
        <Link
          to="/hidden-document-vault"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}
        >
          <LockKeyhole size={18} /> Hidden encrypted document vault
        </Link>
        <Link
          to="/privacy-center"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}
        >
          <BellOff size={18} /> Hidden notifications & PIN settings
        </Link>
        <a
          href="https://www.ohiolegalhelp.org/find-your-legal-aid"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}
        >
          <Scale size={18} /> Legal aid resources
        </a>
        <a
          href="https://www.odvn.org/find-help/"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline"
          style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}
        >
          <MapPin size={18} /> Shelter locator
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

      <ChildSafetyPlanningSection />

      <div className="mt-4 rounded-2xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>Trauma support reminders</p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: C.mutedText }}>
          You deserve safety. You are not alone. Support is available. You can choose what feels safe today and leave the rest for later.
        </p>
      </div>

      <div className="mt-4">
        <OhioDvResourceSection />
      </div>
    </section>
  );
}