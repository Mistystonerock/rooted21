import MobileHeader from "@/components/mobile/MobileHeader";
import AgencyDashboardSection from "@/components/agency/AgencyDashboardSection";

const dashboardAccess = ["Assigned Participant Dashboard", "Goal & Achievement Tracker", "Meeting Scheduler", "Activity Planner", "Check-In Center", "Resource Library", "Moxie Mentor Assistant", "Progress Milestones", "Secure Messaging", "Volunteer Training Center"];
const limitedInfo = ["Preferred display name", "Age group", "Assigned goals", "Interests", "Hobbies", "Achievement milestones", "Shared activity history", "Emergency contact instructions if authorized"];
const goalAreas = ["Education", "Employment", "Life Skills", "Self-Esteem", "Healthy Relationships", "Recovery", "Parenting", "Leadership", "Community Service", "Emotional Wellness"];
const activities = ["Schedule meetings", "Track attendance", "Log activities", "Document mentoring hours", "Record participant engagement", "Plan community outings", "Library visits", "Park activities", "Job shadowing", "Volunteer projects", "Leadership workshops"];
const training = ["Trauma-Informed Care", "Professional Boundaries", "Mandatory Reporting", "Cultural Humility", "Child Safety", "Communication Skills", "Motivational Interviewing Basics", "Crisis Response Procedures", "Rooted 21 Code of Conduct", "Confidentiality & Privacy"];
const badges = ["Attendance", "Leadership", "Kindness", "Responsibility", "Teamwork", "Goal Completion", "Community Service", "Positive Growth", "Resilience"];
const requirements = ["Background Check", "Child Abuse Registry Check", "Identity Verification", "Confidentiality Agreement", "Code of Conduct", "Required Training Modules", "Program Orientation", "Renewal reminders"];

export default function VolunteerMentorDashboard() {
  return (
    <div className="min-h-screen bg-rooted-off-white">
      <MobileHeader title="Volunteer Mentor" subtitle="Encouragement, accountability, and life skills" backTo="/dashboard" />
      <main className="mx-auto max-w-[720px] space-y-4 px-4 py-5 pb-20">
        <section className="rounded-3xl bg-rooted-dark-green p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rooted-cream">Relationship-based limited access</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-white">Volunteer / Mentor / Coach</h1>
          <p className="mt-3 text-sm leading-relaxed text-rooted-cream">For trusted supporters who offer encouragement, accountability, guidance, advocacy, and positive connection while complementing—not replacing—professional services.</p>
        </section>

        <section className="rounded-2xl border border-rooted-cream bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base font-bold text-rooted-dark-green">Privacy guardrails</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
            <li>• Can view only assigned participants, shared goals, activity schedules, and approved communication.</li>
            <li>• Cannot view clinical records, court records, CPS records, financial information, confidential documentation, school records, or internal agency notes unless specifically authorized.</li>
            <li>• QR codes support check-ins, attendance, trainings, and volunteer resources only — not participant-record access.</li>
          </ul>
        </section>

        <AgencyDashboardSection title="Dashboard access" items={dashboardAccess} />
        <AgencyDashboardSection title="Participant information access" items={limitedInfo} />
        <AgencyDashboardSection title="Goal support center" items={goalAreas} />
        <AgencyDashboardSection title="Meeting & activity planner" items={activities} />
        <AgencyDashboardSection title="Volunteer training center" items={training} />
        <AgencyDashboardSection title="Recognition & achievement badges" items={badges} />
        <AgencyDashboardSection title="Background & credential requirements" items={requirements} />
      </main>
    </div>
  );
}