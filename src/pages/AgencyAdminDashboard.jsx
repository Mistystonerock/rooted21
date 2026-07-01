import MobileHeader from "@/components/mobile/MobileHeader";
import AgencyDashboardSection from "@/components/agency/AgencyDashboardSection";

const dashboardTools = ["Agency Performance Dashboard", "Staff Oversight Center", "Caseload Management", "Compliance Monitoring", "Documentation Review Center", "Outcome Tracking Dashboard", "Training & Certification Center", "Incident Review Center", "Audit & Quality Assurance Hub", "Moxie Leadership Insights"];
const staffTools = ["Review staff caseloads", "Monitor service delivery", "Review documentation completion", "Track productivity metrics", "Monitor training requirements", "Review performance indicators"];
const qaTools = ["Documentation quality", "Service compliance", "Goal progression", "Outcome measures", "Timeliness standards", "Regulatory compliance", "QA Reports", "Compliance Reports", "Audit Reports", "Performance Reviews"];
const complianceTools = ["HIPAA Compliance", "FERPA Compliance", "42 CFR Part 2 Compliance", "Documentation Standards", "Access Violations", "Security Events", "Audit Findings"];
const trainingTools = ["TBRI Training", "Trauma-Informed Care", "Motivational Interviewing", "CPR/First Aid", "HIPAA", "FERPA", "Mandated Reporter Training", "CEU and credential tracking"];
const outcomeTools = ["Family Engagement Rates", "Service Completion Rates", "Parenting Program Outcomes", "Reunification Progress", "Placement Stability", "Attendance Improvements", "Behavioral Progress", "Resource Utilization"];
const reports = ["Agency Performance Report", "Caseload Distribution Report", "Staff Productivity Report", "Compliance Audit Report", "Outcome Measurement Report", "Training Completion Report", "Documentation Quality Report", "Service Utilization Report", "Grant Outcome Report"];

export default function AgencyAdminDashboard() {
  return (
    <div className="min-h-screen bg-rooted-off-white">
      <MobileHeader title="Agency Administrator" subtitle="Oversight, quality, compliance, and outcomes" backTo="/dashboard" />
      <main className="mx-auto max-w-[720px] space-y-4 px-4 py-5 pb-20">
        <section className="rounded-3xl bg-rooted-dark-green p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rooted-cream">Oversight-based access</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-white">Agency Administrator / Supervisor</h1>
          <p className="mt-3 text-sm leading-relaxed text-rooted-cream">Built for supervisors, QA, compliance, leadership, program managers, and grant administrators. This role prioritizes aggregate reporting, staff support, quality assurance, and minimum-necessary client access.</p>
        </section>

        <section className="rounded-2xl border border-rooted-cream bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base font-bold text-rooted-dark-green">Privacy guardrails</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
            <li>• Can view client-level records only when supervisory authority, compliance review, or documented authorization exists.</li>
            <li>• Cannot edit client documentation, delete records, override audit logs, or modify original staff documentation.</li>
            <li>• Founder access remains separate and does not automatically grant private family-record access.</li>
          </ul>
        </section>

        <AgencyDashboardSection title="Dashboard access" items={dashboardTools} />
        <AgencyDashboardSection title="Staff oversight" items={staffTools} />
        <AgencyDashboardSection title="Quality assurance center" items={qaTools} />
        <AgencyDashboardSection title="Compliance monitoring" items={complianceTools} />
        <AgencyDashboardSection title="Staff training center" items={trainingTools} />
        <AgencyDashboardSection title="Outcome tracking" items={outcomeTools} />
        <AgencyDashboardSection title="Reports available" items={reports} />
      </main>
    </div>
  );
}