import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";
import HubCard from "@/components/hubs/HubCard";
import ZipResourceNotice from "@/components/hubs/ZipResourceNotice";
import HousingResourcesTab from "@/components/resources/HousingResourcesTab";
import ChillicotheRossCountyHub from "@/components/resources/ChillicotheRossCountyHub";
import { C } from "@/lib/rooted-constants";

const RESOURCE_SECTIONS = [
  {
    title: "Ross County & Ohio Help",
    items: [
      { title: "Ross County Community Action", description: "Local help with poverty reduction, family stability, community supports, and employment opportunities.", url: "https://www.rossccac.org/", emoji: "🏘️", meta: "Ross County" },
      { title: "Ross County Job & Family Services", description: "Benefits, family services, Medicaid/SNAP/TANF connections, and local agency support.", url: "https://jfs.ohio.gov/about/local-agencies-directory/cdjfs-ross", emoji: "🏛️", meta: "475 Western Ave., Chillicothe" },
      { title: "OhioMeansJobs — Ross County", description: "Local job search help, resume support, training, and employment services.", url: "https://ohiomeansjobs.ohio.gov/job-seekers/find-a-job/local-help/ross-county", emoji: "💼", meta: "740-772-7532" },
      { title: "Veterans & Military Family Support", description: "VA health care, veteran benefits, emergency assistance, transportation, crisis support, disability claims, caregiver support, and surviving spouse resources.", url: "/resources", emoji: "🇺🇸", tag: "NEW" },
      { title: "Social Security, SSI, SSDI & Benefits Help", description: "Official SSA services, replacement cards, SSI/SSDI, appeals, benefit letters, forms, local office help, and document checklist reminders.", url: "/resources", emoji: "🪪", tag: "NEW" },
      { title: "Ohio Benefits", description: "Apply for Ohio SNAP, Medicaid, cash assistance, and other benefit programs.", url: "https://benefits.ohio.gov", emoji: "🍎" },
      { title: "211 Ohio", description: "Search by ZIP or call 2-1-1 for food, utilities, shelter, transportation, and crisis supports.", url: "https://www.211ohio.org", emoji: "☎️" },
    ],
  },
  {
    title: "Court, Legal & Paperwork",
    items: [
      { title: "Court Prep & Rights by State", description: "Choose your state for official forms, parent rights, IEP safeguards, and legal education links.", url: "/court-rights-education", emoji: "⚖️", tag: "STATE LINKS" },
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
    title: "Family Stability",
    items: [
      { title: "Free & Low-Cost Family Fun", description: "Find safe, free, low-cost, and benefit-based parks, library events, trails, festivals, books, and family bonding activities.", url: "/free-low-cost-family-fun", emoji: "🌿", tag: "NEW" },
    ],
  },
  {
    title: "Parenting Support",
    items: [
      { title: "Family Bonding Activities", description: "Free and low-cost ideas for connection, regulation, learning, and positive family memories.", url: "/free-low-cost-family-fun", emoji: "💚" },
    ],
  },
  {
    title: "Local & Specialized Resources",
    items: [
      { title: "Substance Abuse Resources", description: "Detox, rehab, medication-assisted treatment, and peer recovery resources near your ZIP code.", url: "/substance-abuse-resources", emoji: "🫶", tag: "NEW" },
      { title: "Community Resource Map", description: "Therapists, pantries, support groups, and community resources.", url: "/community-resources", emoji: "🗺️" },
      { title: "Chillicothe & Ross County Resource Hub", description: "Food, housing, utilities, transportation, veterans, Social Security, court support, medical care, family fun, crisis, and local verified resources.", url: "/resources", emoji: "📍", tag: "LOCAL" },
      { title: "Local Resource Finder", description: "Find crisis lines and local services near you.", url: "/local-resources", emoji: "📍" },
      { title: "Job & Career Resources", description: "OhioMeansJobs, resume tools, training, childcare, benefits, and housing resources.", url: "/job-resources", emoji: "💼" },
      { title: "Professional Directory", description: "Find therapists, coaches, and professional support.", url: "/professional-directory", emoji: "🔎" },
    ],
  },
];

export default function Resources() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Resource Hub" subtitle="Local, legal, work, and community help" backTo="/dashboard" />
      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-5">
        <div className="flex rounded-2xl p-1" style={{ background: C.cream }}>
          {[
            { id: "all", label: "All Resources" },
            { id: "housing", label: "Housing" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 rounded-xl px-3 py-3 text-sm font-black"
              style={{ background: activeTab === tab.id ? C.darkGreen : "transparent", color: activeTab === tab.id ? "#fff" : C.darkGreen, border: "none" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "housing" ? (
          <HousingResourcesTab />
        ) : (
          <>
            <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
              <p className="text-3xl mb-2">🗂️</p>
              <p className="font-serif font-bold text-base" style={{ color: C.cream }}>All Resources in One Place</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>Start with your ZIP code, then jump to local help, court paperwork, jobs, benefits, and substance-use support.</p>
            </div>
            <ZipResourceNotice />
            <ChillicotheRossCountyHub />
            {RESOURCE_SECTIONS.map(section => (
              <div key={section.title} className="space-y-2">
                <p className="text-[11px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>{section.title}</p>
                <div className="space-y-3">{section.items.map(item => <HubCard key={item.title} item={item} />)}</div>
              </div>
            ))}
          </>
        )}
        <div className="rounded-2xl p-4" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>In crisis?</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#B84C2A" }}>Call or text 988. If there is immediate danger, call 911.</p>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}