import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import OhioSystemsGrid from "@/components/ohio/OhioSystemsGrid";
import BlueprintStageCard from "@/components/ohio/BlueprintStageCard";
import ComplianceFoundationCard from "@/components/ohio/ComplianceFoundationCard";
import { C } from "@/lib/rooted-constants";

export default function OhioSystemsNavigator() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Ohio Systems Navigator" subtitle="CPS, court, school, housing, benefits, recovery" backTo="/wraparound-support" />
      <div className="mx-auto max-w-[560px] space-y-4 px-4 py-5">
        <WraparoundHero title="One calm map for every system" subtitle="Rooted 21 organizes the Ohio child-welfare, court, education, behavioral-health, housing, benefits, legal, and recovery systems families often navigate at the same time." icon="🗺️" />
        <OhioSystemsGrid />
        <BlueprintStageCard />
        <ComplianceFoundationCard />
        <div className="pb-8" />
      </div>
    </main>
  );
}