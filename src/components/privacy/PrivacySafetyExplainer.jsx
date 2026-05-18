import { BellOff, Database, DoorOpen, EyeOff, FileText, HeartHandshake, Lock, MegaphoneOff, ShieldCheck, SlidersHorizontal, UserCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const protections = [
  {
    icon: Lock,
    title: "Encrypted data",
    text: "Your information is protected while it moves through Rooted 21 and while it is stored. We treat family details, documents, notes, and safety plans as sensitive."
  },
  {
    icon: MegaphoneOff,
    title: "No selling. No ads.",
    text: "Rooted 21 does not sell your personal data. We do not use advertising profiles, ad tracking, or outside ad targeting inside your care tools."
  },
  {
    icon: Database,
    title: "Secure storage",
    text: "Records are stored in protected systems with access controls. Sensitive files can be kept in private storage instead of open public links."
  },
  {
    icon: UserCheck,
    title: "Role-based permissions",
    text: "People only see what their role allows. Parents, professionals, admins, and founder-level users have different access boundaries."
  },
  {
    icon: HeartHandshake,
    title: "Survivor-safe design",
    text: "Safety tools are built to be discreet, calm, and choice-based. You can hide sensitive sections, use quick exit, and reduce unsafe notifications."
  },
  {
    icon: SlidersHorizontal,
    title: "User-controlled privacy",
    text: "You choose what can be shared, who can comment, and how visible certain records are. You can change these choices as your situation changes."
  },
  {
    icon: FileText,
    title: "Document protection",
    text: "Court papers, safety plans, medical records, and school documents can be stored with privacy controls and careful sharing options."
  },
  {
    icon: ShieldCheck,
    title: "Secure vault",
    text: "The vault is for extra-sensitive information. It supports private storage, safer access, and settings designed for people who need added protection."
  },
  {
    icon: BellOff,
    title: "Hidden notification mode",
    text: "You can reduce or hide sensitive notification previews so messages do not reveal private details on a shared or unsafe device."
  },
  {
    icon: DoorOpen,
    title: "Quick exit",
    text: "Quick exit helps you leave Rooted 21 fast and opens a safer screen. It is there for moments when privacy or safety changes quickly."
  },
  {
    icon: EyeOff,
    title: "Account choices",
    text: "You can request a copy of your data or ask for account deletion. These requests are handled carefully and shown in plain language."
  }
];

export default function PrivacySafetyExplainer() {
  return (
    <section className="rounded-3xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: C.midGreen }}>Privacy & Safety Center</p>
        <h2 className="mt-1 font-serif text-xl font-black" style={{ color: C.darkGreen }}>Built for trust, choice, and safety</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>
          Rooted 21 is designed to protect real families, not confuse them. Here is what that means in everyday words.
        </p>
      </div>

      <div className="grid gap-3">
        {protections.map(item => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-2xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${C.midGreen}22` }}>
                  <Icon size={18} color={C.darkGreen} />
                </div>
                <div>
                  <h3 className="text-sm font-black" style={{ color: C.darkGreen }}>{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{item.text}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}