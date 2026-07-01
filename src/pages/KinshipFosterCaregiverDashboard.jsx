import { Link } from "react-router-dom";
import { Activity, BookOpen, CalendarDays, ChevronRight, ClipboardList, FileText, GraduationCap, Heart, MapPin, Scale, ShieldCheck, Sparkles } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import { C } from "@/lib/rooted-constants";

const dashboardLinks = [
  { label: "Moxie AI Guidance", path: "/personalized-chat", icon: Sparkles },
  { label: "Child Progress Dashboard", path: "/progress", icon: Activity },
  { label: "Behavior Tracking", path: "/behavior-hub", icon: Heart },
  { label: "School Support Center", path: "/education-hub", icon: GraduationCap },
  { label: "IEP / 504 Tracker", path: "/education-hub", icon: FileText },
  { label: "Court Preparation Tools", path: "/court-preparation-checklist", icon: Scale },
  { label: "Resource Navigator", path: "/resources", icon: MapPin },
  { label: "Document Vault", path: "/documents", icon: FileText },
  { label: "Appointment Tracker", path: "/care-calendar", icon: CalendarDays },
  { label: "Milestone Tracking", path: "/milestones", icon: ClipboardList },
  { label: "Family Calendar", path: "/care-calendar", icon: CalendarDays },
  { label: "Caregiver Training Center", path: "/training-videos", icon: BookOpen },
];

const sections = [
  { title: "Moxie may", items: ["Provide caregiving support", "Offer trauma-informed parenting guidance", "Suggest behavioral interventions", "Explain court and child welfare terminology", "Recommend community resources", "Help organize documentation", "Generate caregiver reports"] },
  { title: "Moxie may not", items: ["Provide legal advice", "Replace agency decisions", "Override court orders", "Make placement recommendations", "Diagnose mental health conditions"] },
  { title: "Child-centered access", items: ["Child profile", "School information", "Medical appointments", "Behavioral tracking", "Caregiver notes", "Shared court documents", "Shared case plan goals"] },
  { title: "Document boundaries", items: ["Upload and organize records", "Store school and medical documentation", "Generate reports", "Cannot delete agency-uploaded documents", "Cannot alter court orders", "Cannot modify official case plans"] },
  { title: "Reports available", items: ["Caregiver Progress Summary", "Child Behavioral Summary", "School Progress Report", "Appointment History", "Placement Stability Report", "Resource Utilization Report"] },
];

export default function KinshipFosterCaregiverDashboard() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite, color: C.text }}>
      <MobileHeader title="Kinship / Foster Caregiver" subtitle="Limited child-centered access" backTo="/dashboard" />
      <main className="mx-auto max-w-[560px] space-y-4 px-4 pb-24 pt-4">
        <section className="rounded-3xl border p-5 shadow-sm" style={{ background: C.white, borderColor: C.cream }}>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl p-3" style={{ background: `${C.midGreen}20` }}><ShieldCheck size={24} color={C.darkGreen} /></div>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: C.darkGreen }}>Child safety, stability, education, health, and permanency</h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>This profile supports relatives, foster families, guardians, and temporary caregivers with child-centered tools while protecting parent, agency, court, and behavioral-health privacy boundaries.</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {dashboardLinks.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path} className="rounded-2xl border p-3 no-underline shadow-sm" style={{ background: C.white, borderColor: C.cream }}>
                <Icon size={18} color={C.darkGreen} />
                <p className="mt-2 text-sm font-bold" style={{ color: C.text }}>{item.label}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-black" style={{ color: C.midGreen }}>Open <ChevronRight size={12} /></span>
              </Link>
            );
          })}
        </section>

        <section className="rounded-3xl border p-4" style={{ background: C.white, borderColor: C.cream }}>
          <h2 className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>Approval & expiration controls</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>Caregivers may generate connection requests, request professional access, and share child information only with authorized users. Access requires approval and expiration controls.</p>
        </section>

        {sections.map(section => (
          <section key={section.title} className="rounded-3xl border p-4" style={{ background: C.white, borderColor: C.cream }}>
            <h2 className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>{section.title}</h2>
            <ul className="mt-3 space-y-2">
              {section.items.map(item => <li key={item} className="text-sm leading-relaxed" style={{ color: C.mutedText }}>• {item}</li>)}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}