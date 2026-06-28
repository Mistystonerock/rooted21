import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import BlueprintSection from "@/components/project/BlueprintSection";
import { blueprintSections, blueprintSummary } from "@/lib/project-blueprint-data";
import { Compass, ShieldCheck } from "lucide-react";

export default function ProjectBlueprint() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Project Blueprint" subtitle="MVP scope, safety, roles, and roadmap" backTo="/app-docs" />
      <div className="mx-auto max-w-[760px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
          <Compass size={28} color={C.gold} />
          <h1 className="mt-3 font-serif text-2xl font-bold" style={{ color: C.cream }}>Rooted 21 secure platform plan</h1>
          <p className="mt-2 text-sm leading-7" style={{ color: C.lightGreen }}>
            A founder-facing blueprint for converting Rooted 21 from prototype to a secure, scalable, trauma-informed mobile and web platform.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {blueprintSummary.map(item => (
            <div key={item.label} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: C.midGreen }}>{item.label}</p>
              <p className="mt-2 text-sm font-bold leading-6" style={{ color: C.darkGreen }}>{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl p-4" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <div className="flex gap-3">
            <ShieldCheck size={18} color="#B84C2A" className="mt-0.5 flex-shrink-0" />
            <p className="text-xs leading-6" style={{ color: "#B84C2A" }}>
              This blueprint keeps Rooted 21 positioned as preparation, organization, education, documentation, and support technology. It does not position the app as legal counsel, medical care, therapy, or emergency response.
            </p>
          </div>
        </section>

        {blueprintSections.map((section, index) => (
          <BlueprintSection key={section.title} section={section} index={index} />
        ))}

        <div className="rounded-xl p-3 text-center" style={{ background: C.cream }}>
          <p className="text-[10px]" style={{ color: C.mutedText }}>Rooted 21 MVP and strategic roadmap reference</p>
        </div>
        <div className="pb-8" />
      </div>
    </main>
  );
}