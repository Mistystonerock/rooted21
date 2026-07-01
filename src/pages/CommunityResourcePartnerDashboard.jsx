import MobileHeader from "@/components/mobile/MobileHeader";
import AgencyDashboardSection from "@/components/agency/AgencyDashboardSection";

const dashboardAccess = ["Referral Dashboard", "Service Request Center", "Appointment Management", "Family Resource Requests", "Moxie Resource Assistant", "Organization Profile", "Community Calendar", "Resource Library", "Referral Outcome Tracker", "Secure Messaging Center"];
const organizationProfile = ["Organization Name", "Mission Statement", "Services Offered", "Eligibility Requirements", "Counties Served", "Contact Information", "Office Locations", "Hours of Operation", "Languages Spoken", "Accessibility Information", "Emergency Services Availability"];
const referralTools = ["Receive referrals", "Accept referrals", "Decline referrals", "Request additional information", "Schedule appointments", "Update referral status", "Contacted Family", "Family Engaged", "Services Active", "Services Completed", "Referral Closed"];
const appointmentTools = ["Schedule appointments", "Send reminders", "Confirm attendance", "Reschedule appointments", "Track missed appointments", "Notify families automatically"];
const events = ["Parenting Classes", "Food Distributions", "Community Events", "Job Fairs", "Resource Fairs", "Support Groups", "Holiday Programs", "School Events", "Volunteer Opportunities"];
const marketplace = ["County", "ZIP Code", "Service Category", "Availability", "Cost", "Languages Spoken", "Accessibility Features", "Veteran-Friendly Services", "LGBTQ+ Affirming Services", "Family-Friendly Programs"];
const reports = ["Referral Outcome Report", "Service Utilization Report", "Appointment Attendance Report", "Community Impact Report", "Program Completion Report", "Family Engagement Report", "Waitlist Report", "Resource Availability Report"];

export default function CommunityResourcePartnerDashboard() {
  return (
    <div className="min-h-screen bg-rooted-off-white">
      <MobileHeader title="Resource Partner" subtitle="Referral-based service coordination" backTo="/dashboard" />
      <main className="mx-auto max-w-[720px] space-y-4 px-4 py-5 pb-20">
        <section className="rounded-3xl bg-rooted-dark-green p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rooted-cream">Referral-based access</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-white">Community Resource Partner / Service Provider</h1>
          <p className="mt-3 text-sm leading-relaxed text-rooted-cream">For organizations that provide direct services and help families connect to resources. This role supports referrals and appointments without managing cases or browsing confidential records.</p>
        </section>

        <section className="rounded-2xl border border-rooted-cream bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base font-bold text-rooted-dark-green">Privacy guardrails</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
            <li>• Can view only assigned referrals, appointment information, shared contact details, referral reasons, basic goals, and required documentation.</li>
            <li>• Cannot view court records, behavioral health documentation, school records, CPS documentation, or medical records unless explicitly authorized.</li>
            <li>• All referrals, messages, documents, QR codes, and profile updates remain permission-based and auditable.</li>
          </ul>
        </section>

        <AgencyDashboardSection title="Dashboard access" items={dashboardAccess} />
        <AgencyDashboardSection title="Organization profile" items={organizationProfile} />
        <AgencyDashboardSection title="Referral management" items={referralTools} />
        <AgencyDashboardSection title="Appointment center" items={appointmentTools} />
        <AgencyDashboardSection title="Community events" items={events} />
        <AgencyDashboardSection title="Marketplace search fields" items={marketplace} />
        <AgencyDashboardSection title="Reports available" items={reports} />
      </main>
    </div>
  );
}