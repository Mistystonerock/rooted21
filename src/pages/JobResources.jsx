import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ExternalLink, Search, Briefcase, GraduationCap, DollarSign, Heart, Users, FileText, Home, Wrench } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", icon: "🔍" },
  { id: "job_search", label: "Job Search", icon: "💼" },
  { id: "training", label: "Training", icon: "🎓" },
  { id: "financial", label: "Financial Aid", icon: "💰" },
  { id: "childcare", label: "Childcare", icon: "🧒" },
  { id: "legal", label: "Legal Aid", icon: "⚖️" },
  { id: "housing", label: "Housing", icon: "🏠" },
  { id: "resume", label: "Resume Help", icon: "📄" },
];

const RESOURCES = [
  // Job Search
  {
    category: "job_search",
    title: "Indeed",
    description: "Search millions of jobs by location, salary, and type. Set up job alerts for foster/adoptive-family-friendly employers.",
    url: "https://www.indeed.com",
    tags: ["Remote", "Part-time", "Entry level"],
    note: "Filter by 'flexible schedule' or 'remote' for caregiver-friendly roles",
  },
  {
    category: "job_search",
    title: "LinkedIn Jobs",
    description: "Professional job network with company culture info. Look for 'family-friendly' or 'flexible' employer badges.",
    url: "https://www.linkedin.com/jobs",
    tags: ["Networking", "Professional"],
    note: "Great for connecting with employers who value work-life balance",
  },
  {
    category: "job_search",
    title: "FlexJobs",
    description: "Curated remote, hybrid, and flexible job listings — ideal for parents managing complex family schedules.",
    url: "https://www.flexjobs.com",
    tags: ["Remote", "Flexible", "Verified"],
    note: "Subscription-based but all listings are verified scam-free",
  },
  {
    category: "job_search",
    title: "USA Jobs (Federal)",
    description: "Official federal government job board. Federal jobs often offer excellent benefits, stability, and flexibility.",
    url: "https://www.usajobs.gov",
    tags: ["Government", "Benefits", "Stable"],
  },
  {
    category: "job_search",
    title: "Ohio Means Jobs",
    description: "Ohio's state job board with local listings, resume tools, and career coaching resources.",
    url: "https://ohiomeansjobs.ohio.gov",
    tags: ["Ohio", "Local", "Free"],
    note: "Includes free resume builder and career assessments",
  },
  // Training & Education
  {
    category: "training",
    title: "Coursera",
    description: "Free and paid online courses from top universities. Earn certificates in business, tech, healthcare, and more.",
    url: "https://www.coursera.org",
    tags: ["Free audit", "Certificate", "Flexible"],
    note: "Financial aid available — most courses can be audited free",
  },
  {
    category: "training",
    title: "Google Career Certificates",
    description: "6-month certificates in IT support, data analytics, project management, UX design, and cybersecurity. ~$200 total or free via libraries.",
    url: "https://grow.google/certificates",
    tags: ["No degree needed", "6 months", "High demand"],
    note: "Designed for career changers with no prior experience required",
  },
  {
    category: "training",
    title: "Ohio Learn to Earn",
    description: "Ohio workforce development program covering tuition for in-demand jobs — tech, healthcare, skilled trades.",
    url: "https://www.ohiohighered.org",
    tags: ["Ohio", "Tuition help", "In-demand"],
  },
  {
    category: "training",
    title: "Khan Academy",
    description: "Free foundational learning in math, reading, science, and computer programming to build job-ready skills.",
    url: "https://www.khanacademy.org",
    tags: ["100% free", "Self-paced"],
  },
  {
    category: "training",
    title: "LinkedIn Learning",
    description: "1,000s of professional development courses. Free with many library cards. Great for soft skills and tech tools.",
    url: "https://www.linkedin.com/learning",
    tags: ["Free w/ library card", "Professional skills"],
  },
  // Financial Aid
  {
    category: "financial",
    title: "Ohio Benefits (SNAP, Medicaid, TANF)",
    description: "Apply for food assistance, healthcare, and cash assistance for families in Ohio.",
    url: "https://benefits.ohio.gov",
    tags: ["Ohio", "SNAP", "Medicaid", "TANF"],
  },
  {
    category: "financial",
    title: "211 Ohio — Benefits Navigator",
    description: "Connects Ohio families to financial assistance, utility help, food banks, and social services. Call 2-1-1 or search online.",
    url: "https://www.211ohio.org",
    tags: ["Ohio", "All benefits", "Free"],
    note: "Call 2-1-1 anytime for a live navigator",
  },
  {
    category: "financial",
    title: "EITC (Earned Income Tax Credit)",
    description: "If you work and have children, you may qualify for thousands of dollars back at tax time. Free filing help available.",
    url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc",
    tags: ["Tax credit", "Families", "Free filing"],
    note: "Average EITC refund is over $2,000 for families with children",
  },
  {
    category: "financial",
    title: "Child Care and Development Fund (CCDF)",
    description: "Federal childcare subsidy that helps low-income working parents pay for childcare while they work or train.",
    url: "https://www.acf.hhs.gov/occ/ccdf-programs",
    tags: ["Federal", "Childcare subsidy", "Working parents"],
  },
  {
    category: "financial",
    title: "Ohio Adoption Tax Credit Info",
    description: "Ohio families who adopt from foster care may qualify for state and federal adoption tax credits up to $15,950.",
    url: "https://tax.ohio.gov",
    tags: ["Ohio", "Adoption", "Tax credit"],
  },
  // Childcare
  {
    category: "childcare",
    title: "Ohio Child Care Resource & Referral",
    description: "Find licensed childcare providers near you, including subsidy-accepting providers for working parents.",
    url: "https://www.occrra.org",
    tags: ["Ohio", "Licensed", "Subsidy accepted"],
  },
  {
    category: "childcare",
    title: "Care.com",
    description: "Find babysitters, nannies, and after-school care. Some providers offer flexible and last-minute availability.",
    url: "https://www.care.com",
    tags: ["Flexible", "Vetted", "Nationwide"],
  },
  {
    category: "childcare",
    title: "Head Start / Early Head Start",
    description: "Free early childhood education and family support services for low-income families with children ages 0–5.",
    url: "https://eclkc.ohs.acf.hhs.gov",
    tags: ["Free", "Ages 0-5", "Federal program"],
  },
  // Legal Aid
  {
    category: "legal",
    title: "Ohio Legal Help",
    description: "Free legal information and tools for Ohio residents on family law, housing, employment, and public benefits.",
    url: "https://www.ohiolegalhelp.org",
    tags: ["Ohio", "Free", "Family law"],
  },
  {
    category: "legal",
    title: "Legal Aid Society of Columbus",
    description: "Free civil legal services for low-income central Ohio residents including custody, housing, and employment issues.",
    url: "https://www.columbuslegalaid.org",
    tags: ["Columbus", "Free", "Civil legal"],
  },
  {
    category: "legal",
    title: "Ohio State Bar Association Lawyer Referral",
    description: "Find a licensed attorney in Ohio for a free or low-cost consultation through the state bar's referral service.",
    url: "https://www.ohiobar.org",
    tags: ["Ohio", "Attorney referral", "Consultation"],
  },
  // Housing
  {
    category: "housing",
    title: "HUD Housing Assistance",
    description: "Federal rental assistance, Section 8 vouchers, and public housing resources through HUD.",
    url: "https://www.hud.gov/topics/rental_assistance",
    tags: ["Federal", "Rental assistance", "Section 8"],
  },
  {
    category: "housing",
    title: "Ohio Housing Finance Agency",
    description: "Down payment assistance, affordable rental housing, and homebuyer programs for Ohio families.",
    url: "https://www.ohiohome.org",
    tags: ["Ohio", "Homebuyer", "Rental"],
  },
  // Resume Help
  {
    category: "resume",
    title: "Resume.com",
    description: "Free online resume builder with professional templates. Download in PDF or Word format.",
    url: "https://www.resume.com",
    tags: ["Free", "Templates", "PDF"],
  },
  {
    category: "resume",
    title: "Jobscan Resume Scanner",
    description: "Optimize your resume for applicant tracking systems (ATS). Paste a job description to see how well your resume matches.",
    url: "https://www.jobscan.co",
    tags: ["ATS optimization", "Job matching"],
    note: "Free scans available — helps your resume get past automated filters",
  },
  {
    category: "resume",
    title: "Ohio Means Jobs Resume Builder",
    description: "Free Ohio-specific resume builder with templates tailored to in-state employers.",
    url: "https://ohiomeansjobs.ohio.gov",
    tags: ["Ohio", "Free", "Templates"],
  },
];

const CATEGORY_ICONS = {
  job_search: Briefcase,
  training: GraduationCap,
  financial: DollarSign,
  childcare: Heart,
  legal: FileText,
  housing: Home,
  resume: FileText,
};

export default function JobResources() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = RESOURCES.filter(r => {
    const matchesCat = activeCategory === "all" || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags?.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const counts = {};
  RESOURCES.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Job & Career Resources"
        subtitle="Tools for working parents"
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <Briefcase size={24} color={C.gold} className="mb-2" />
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Career & Support Resources
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Job boards, training programs, financial aid, childcare help, and legal resources — curated for foster, adoptive, and kinship families.
          </p>
          <div className="flex gap-3 mt-3">
            <div className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-lg font-extrabold" style={{ color: C.cream }}>{RESOURCES.length}</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>Resources</p>
            </div>
            <div className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-lg font-extrabold" style={{ color: C.cream }}>8</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>Categories</p>
            </div>
            <div className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-lg font-extrabold" style={{ color: C.cream }}>Free</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>Many options</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <Search size={14} color={C.mutedText} />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#000" }}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all"
              style={{
                background: activeCategory === cat.id ? C.darkGreen : "#fff",
                color: activeCategory === cat.id ? C.cream : C.darkGreen,
                border: `1.5px solid ${activeCategory === cat.id ? C.darkGreen : C.cream}`,
                cursor: "pointer",
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
              {cat.id !== "all" && (
                <span className="text-[9px] opacity-70">({counts[cat.id] || 0})</span>
              )}
            </button>
          ))}
        </div>

        {/* Resource list */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: C.cream }}>
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No results found</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Try a different search or category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((resource, idx) => {
              const cat = CATEGORIES.find(c => c.id === resource.category);
              return (
                <div key={idx} className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
                  {/* Header bar */}
                  <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: C.offWhite, borderBottom: `1px solid ${C.cream}` }}>
                    <span style={{ fontSize: 14 }}>{cat?.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.mutedText }}>
                      {cat?.label}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{resource.title}</p>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-opacity hover:opacity-80"
                        style={{ background: C.darkGreen, color: "#fff", textDecoration: "none", minWidth: "auto" }}
                      >
                        <ExternalLink size={11} />
                        Visit
                      </a>
                    </div>

                    <p className="text-xs leading-relaxed mb-2.5" style={{ color: "#3a3028" }}>
                      {resource.description}
                    </p>

                    {resource.note && (
                      <div className="rounded-lg px-3 py-2 mb-2.5" style={{ background: "#FEF9EC", border: "1px solid #E8C96A" }}>
                        <p className="text-[11px]" style={{ color: "#7A5200" }}>
                          💡 {resource.note}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {resource.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: C.cream, color: C.darkGreen }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer tip */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>💡 Quick Tip</p>
          <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
            Call <strong>2-1-1</strong> anytime (phone or text) to reach Ohio 211 — a free navigator will connect you to local jobs, financial help, childcare, and more in your area.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}