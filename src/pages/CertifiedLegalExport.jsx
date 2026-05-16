import MobileHeader from "@/components/mobile/MobileHeader";
import WraparoundHero from "@/components/wraparound/WraparoundHero";
import CertifiedExportBuilder from "@/components/legal-export/CertifiedExportBuilder";
import CertificationStandardsCard from "@/components/legal-export/CertificationStandardsCard";
import { C } from "@/lib/rooted-constants";

export default function CertifiedLegalExport() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Certified Legal Export" subtitle="Unalterable records for legal review" backTo="/cps-case-navigation" />
      <div className="mx-auto max-w-[560px] space-y-4 px-4 py-5">
        <WraparoundHero title="Secure, court-focused export packets" subtitle="Generate tamper-evident communication and case-document packets with authentication codes, hash-chain manifests, and FRE 902(11)-style certification support." icon="⚖️" />
        <CertificationStandardsCard />
        <CertifiedExportBuilder />
        <div className="pb-8" />
      </div>
    </main>
  );
}