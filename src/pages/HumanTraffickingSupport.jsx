import { Link } from "react-router-dom";
import { LifeBuoy, ShieldCheck, HeartHandshake, MessageCircle, Users, MapPin, Lock } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import TraffickingHeader from "@/components/trafficking/TraffickingHeader";

const OPTIONS = [
  {
    to: "/trafficking-emergency",
    icon: LifeBuoy,
    title: "Get help now",
    desc: "Hotline, crisis lines, and the secure SOS alert to your support team.",
    primary: true,
  },
  {
    to: "/trafficking-safety-plan",
    icon: ShieldCheck,
    title: "Safety planning tool",
    desc: "Quietly build a private plan for staying safe — only you can see it.",
  },
  {
    to: "/trafficking-safe-contacts",
    icon: Users,
    title: "Safe contact plan",
    desc: "Choose who is safe to reach and how — connected to your Support Contacts.",
  },
  {
    to: "/chat?crisis=1",
    icon: MessageCircle,
    title: "Talk with Moxie",
    desc: "Gentle, private support. No pressure to explain or share anything.",
  },
];

export default function HumanTraffickingSupport() {
  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <TraffickingHeader title="You Are Not Alone" subtitle="Private safety support" backTo="/sos" />

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
            <HeartHandshake size={32} color="#fff" />
          </div>
          <h2 className="text-center font-serif text-2xl font-black" style={{ color: C.darkGreen }}>You deserve to feel safe</h2>
          <p className="mt-2 text-center text-sm leading-relaxed" style={{ color: C.mutedText }}>
            Are you worried someone is controlling, threatening, pressuring, or exploiting you or someone you care about?
            You do not have to explain anything or label what is happening. Whatever brought you here, support is available whenever you are ready.
          </p>
        </section>

        <section className="rounded-2xl p-4" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}40` }}>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
              <Lock size={18} color="#fff" />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.mutedText }}>
              This space is private to you. Nothing here is automatically shared with parents, caregivers, co-parents, agencies, or professionals.
              Use <span className="font-black" style={{ color: C.darkGreen }}>Quick exit</span> or <span className="font-black" style={{ color: C.darkGreen }}>Safe screen</span> at the top anytime to leave this page instantly.
            </p>
          </div>
        </section>

        <div className="space-y-3">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <Link key={o.to} to={o.to} className="flex items-center gap-3 rounded-3xl p-4 no-underline shadow-sm"
                style={{ background: o.primary ? C.darkGreen : "#fff", border: `2px solid ${o.primary ? C.darkGreen : C.cream}` }}>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: o.primary ? "rgba(255,255,255,0.18)" : `${C.midGreen}18` }}>
                  <Icon size={24} color={o.primary ? "#fff" : C.darkGreen} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-black" style={{ color: o.primary ? "#fff" : C.darkGreen }}>{o.title}</p>
                  <p className="text-xs leading-snug" style={{ color: o.primary ? "rgba(255,255,255,0.85)" : C.mutedText }}>{o.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="px-2 text-center text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
          If you are in immediate danger, call 911. You are always in control of what you share and when.
        </p>
      </main>
    </div>
  );
}