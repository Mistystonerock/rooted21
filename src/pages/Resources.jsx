import MobileHeader from "@/components/mobile/MobileHeader";
import HubCard from "@/components/hubs/HubCard";
import ZipResourceNotice from "@/components/hubs/ZipResourceNotice";
import { C } from "@/lib/rooted-constants";

const RESOURCE_SECTIONS = [
  {
    title: "Ross County & Ohio Help",
    items: [
      { title: "Ross County Community Action", description: "Local help with poverty reduction, family stability, community supports, and employment opportunities.", url: "https://www.rossccac.org/", emoji: "🏘️", meta: "Ross County" },
      { title: "Ross County Job & Family Services", description: "Benefits, family services, Medicaid/SNAP/TANF connections, and local agency support.", url: "https://jfs.ohio.gov/about/local-agencies-directory/cdjfs-ross", emoji: "🏛️", meta: "475 Western Ave., Chillicothe" },
      { title: "OhioMeansJobs — Ross County", description: "Local job search help, resume support, training, and employment services.", url: "https://ohiomeansjobs.ohio.gov/job-seekers/find-a-job/local-help/ross-county", emoji: "💼", meta: "740-772-7532" },
      { title: "Ohio Benefits", description: "Apply for Ohio SNAP, Medicaid, cash assistance, and other benefit programs.", url: "https://benefits.ohio.gov", emoji: "🍎" },
      { title: "211 Ohio", description: "Search by ZIP or call 2-1-1 for food, utilities, shelter, transportation, and crisis supports.", url: "https://www.211ohio.org", emoji: "☎️" },
    ],
  },
  {
    title: "Court, Legal & Paperwork",
    items: [
      { title: "Supreme Court of Ohio Forms", description: "Official Ohio court forms and court document categories.", url: "https://www.supremecourt.ohio.gov/forms/all-forms/", emoji: "⚖️", tag: "FORMS" },
      { title: "Ross County Clerk Legal Forms", description: "Local Ross County legal forms including divorce/dissolution and court paperwork links.", url: "http://www.co.ross.oh.us/clerk/legal-forms.html", emoji: "📄", meta: "Ross County" },
      { title: "Secure Documents", description: "Upload, scan, store, and organize legal and family documents securely.", url: "/documents", emoji: "🔒" },
      { title: "Document Scanner", description: "Scan court paperwork and automatically pull dates into your Care Calendar.", url: "/document-scanner", emoji: "📷", tag: "AI" },
      { title: "Form & Paperwork Help", description: "Guided support for what to file and how to organize documents.", url: "/form-helper", emoji: "📝" },
      { title: "Court-Ready Export", description: "Create court-ready PDFs from your records.", url: "/court-ready-export", emoji: "📦" },
      { title: "Case Management", description: "Track legal matters, tasks, documents, notes, and case activity.", url: "/case-management", emoji: "⚖️" },
    ],
  },
  {
    title: "Local & Specialized Resources",
    items: [
      { title: "Substance Abuse Resources", description: "Detox, rehab, medication-assisted treatment, and peer recovery resources near your ZIP code.", url: "/substance-abuse-resources", emoji: "🫶", tag: "NEW" },
      { title: "Community Resource Map", description: "Therapists, pantries, support groups, and community resources.", url: "/community-resources", emoji: "🗺️" },
      { title: "Local Resource Finder", description: "Find crisis lines and local services near you.", url: "/local-resources", emoji: "📍" },
      { title: "Job & Career Resources", description: "OhioMeansJobs, resume tools, training, childcare, benefits, and housing resources.", url: "/job-resources", emoji: "💼" },
      { title: "Professional Directory", description: "Find therapists, coaches, and professional support.", url: "/professional-directory", emoji: "🔎" },
    ],
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Resource Hub" subtitle="Local, legal, work, and community help" backTo="/dashboard" />
      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-5">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🗂️</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>All Resources in One Place</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>Start with your ZIP code, then jump to local help, court paperwork, jobs, benefits, and substance-use support.</p>
        </div>
        <ZipResourceNotice />
        {RESOURCE_SECTIONS.map(section => (
          <div key={section.title} className="space-y-2">
            <p className="text-[11px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>{section.title}</p>
            <div className="space-y-3">{section.items.map(item => <HubCard key={item.title} item={item} />)}</div>
          </div>
        ))}
        <div className="rounded-2xl p-4" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>In crisis?</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#B84C2A" }}>Call or text 988. If there is immediate danger, call 911.</p>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}