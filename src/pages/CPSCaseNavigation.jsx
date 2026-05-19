import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import CpsCaseSnapshotForm from "@/components/cps/CpsCaseSnapshotForm";
import CpsQuickActions from "@/components/cps/CpsQuickActions";
import CpsTimelineCard from "@/components/cps/CpsTimelineCard";
import OhioEscalationResources from "@/components/cps/OhioEscalationResources";
import { C } from "@/lib/rooted-constants";

export default function CPSCaseNavigation() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="CPS Case Navigation" subtitle="Know where you are and what comes next" backTo="/wraparound-support" />
      <div className="mx-auto max-w-[560px] space-y-5 px-4 pt-6 pb-32">
        <WraparoundHero title="You do not have to navigate CPS alone" subtitle="Track your case stage, next hearing, case-plan tasks, visitation, documentation, and Ohio support pathways in one calm place." icon="🧭" />
        <CpsCaseSnapshotForm />
        <CpsQuickActions />
        <CpsTimelineCard />
        <OhioEscalationResources />
        <section className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-sm font-black" style={{ color: C.darkGreen }}>SACWIS note</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Rooted 21 does not connect directly to SACWIS. This page helps you organize parent-owned information so you can share clear records with your attorney, caseworker, or court team when you choose.</p>
        </section>
        <div className="pb-14" />
      </div>
    </main>
  );
}