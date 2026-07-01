import MobileHeader from "@/components/mobile/MobileHeader";
import RoleGovernanceCard from "@/components/roles/RoleGovernanceCard";
import { ROLE_GOVERNANCE } from "@/lib/role-governance-data";
import { C } from "@/lib/rooted-constants";

export default function RoleGovernance() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="🔐 Role Governance" subtitle="Access, permissions, AI boundaries, and future growth" backTo="/app-docs" />
      <main className="mx-auto max-w-[760px] space-y-4 px-4 py-5">
        <section className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="font-serif text-xl font-bold" style={{ color: C.cream }}>Every role has clear boundaries.</p>
          <p className="mt-2 text-sm leading-7" style={{ color: C.lightGreen }}>
            Rooted 21 keeps family-owned records centered on the family. Professionals can view relevant progress only when access is approved, while Moxie AI stays inside legal, medical, emergency, and professional boundaries.
          </p>
        </section>
        <section className="grid gap-3 md:grid-cols-3">
          {["Family-owned records", "Read-only collaboration", "Consent-first sharing"].map(item => (
            <div key={item} className="rounded-2xl p-4 text-center" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <p className="text-sm font-black" style={{ color: C.darkGreen }}>{item}</p>
            </div>
          ))}
        </section>
        {ROLE_GOVERNANCE.map(role => <RoleGovernanceCard key={role.role} role={role} />)}
        <div className="pb-8" />
      </main>
    </div>
  );
}