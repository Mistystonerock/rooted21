import MobileHeader from "@/components/mobile/MobileHeader";
import AgencyDashboardSection from "@/components/agency/AgencyDashboardSection";

const dashboardAccess = ["Platform Management Dashboard", "User Role Management", "Agency Management", "Resource Partner Verification", "Security & Audit Center", "AI Configuration Center", "Program & Curriculum Management", "Community Moderation Center", "Analytics & Impact Dashboard", "Billing / Subscription Management", "Technical Support Center", "Compliance Monitoring Center"];
const platformTools = ["Create and manage user roles", "Assign permissions", "Approve agencies", "Approve resource partners", "Manage platform-wide settings", "Configure onboarding flows", "Manage feature access", "Review support requests", "Manage public-facing content", "Monitor platform performance"];
const aiTools = ["Moxie tone and safety settings", "Role-specific AI permissions", "Crisis response disclaimers", "Legal disclaimer language", "Clinical disclaimer language", "Resource recommendation rules", "Program-specific AI prompts", "Report generation templates", "Restricted topics and escalation language"];
const curriculumTools = ["21-Day Parenting Program", "Rooted & Rising Teen Curriculum", "Parent-child activities", "Quizzes", "Reflection prompts", "Certificates", "Training modules", "Facilitator resources", "Course completion rules"];
const securityTools = ["Login history", "Access logs", "Permission changes", "Failed login attempts", "Document downloads", "Report exports", "QR code access activity", "Suspicious activity alerts", "Data sharing approvals", "Consent changes"];
const billingTools = ["Subscription tiers", "Agency billing", "Family scholarships", "Promo codes", "Free access codes", "Trial access", "Invoices", "Payment status", "Grant-funded accounts"];
const reports = ["Platform Usage Report", "User Growth Report", "Agency Performance Report", "Resource Utilization Report", "Course Completion Report", "Family Engagement Report", "Community Impact Report", "Grant Outcome Report", "Security Audit Report", "Support Ticket Report", "Referral Network Report", "County-Level Impact Report"];

export default function SystemAdminDashboard() {
  return (
    <div className="min-h-screen bg-rooted-off-white">
      <MobileHeader title="System Administrator" subtitle="Platform-level administration" backTo="/dashboard" />
      <main className="mx-auto max-w-[720px] space-y-4 px-4 py-5 pb-20">
        <section className="rounded-3xl bg-rooted-dark-green p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rooted-cream">Platform-level administration</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-white">System Administrator / Platform Owner</h1>
          <p className="mt-3 text-sm leading-relaxed text-rooted-cream">For Rooted 21 leadership and approved internal managers who oversee platform settings, roles, agencies, resources, programs, security, AI configuration, billing, analytics, and support.</p>
        </section>

        <section className="rounded-2xl border border-rooted-cream bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base font-bold text-rooted-dark-green">Privacy guardrails</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
            <li>• System administrators manage the platform, not private family lives.</li>
            <li>• Cannot automatically access private journals, court records, CPS records, school records, medical records, behavioral health records, or substance-use records.</li>
            <li>• Emergency access requires a documented reason, administrator identity, timestamp, records accessed, and automatic audit log.</li>
          </ul>
        </section>

        <AgencyDashboardSection title="Dashboard access" items={dashboardAccess} />
        <AgencyDashboardSection title="Platform management" items={platformTools} />
        <AgencyDashboardSection title="AI configuration center" items={aiTools} />
        <AgencyDashboardSection title="Curriculum & program management" items={curriculumTools} />
        <AgencyDashboardSection title="Security & audit center" items={securityTools} />
        <AgencyDashboardSection title="Billing / subscription management" items={billingTools} />
        <AgencyDashboardSection title="Reports available" items={reports} />
      </main>
    </div>
  );
}