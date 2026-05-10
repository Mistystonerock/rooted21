import { C } from "@/lib/rooted-constants";
import { ExternalLink, Briefcase, BookOpen, DollarSign, Users, GraduationCap } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";

const JOB_SECTIONS = [
  {
    section: "🔍 Job Search Platforms",
    icon: Briefcase,
    color: C.darkGreen,
    items: [
      { title: "Indeed", desc: "Search millions of jobs by location, salary, and type", url: "https://www.indeed.com" },
      { title: "LinkedIn Jobs", desc: "Professional network + job listings and networking", url: "https://www.linkedin.com/jobs" },
      { title: "Glassdoor", desc: "Job listings with company reviews and salary info", url: "https://www.glassdoor.com" },
      { title: "ZipRecruiter", desc: "AI-powered job matching across industries", url: "https://www.ziprecruiter.com" },
      { title: "USAJobs.gov", desc: "Official source for federal government jobs", url: "https://www.usajobs.gov" },
      { title: "Idealist", desc: "Non-profit, social work, and mission-driven careers", url: "https://www.idealist.org" },
    ],
  },
  {
    section: "💰 Benefits & Financial Assistance",
    icon: DollarSign,
    color: C.brown,
    items: [
      { title: "Benefits.gov", desc: "Find federal and state benefit programs you may qualify for", url: "https://www.benefits.gov" },
      { title: "SNAP (Food Assistance)", desc: "Apply for food assistance through your state", url: "https://www.fns.usda.gov/snap/applicant-recipient" },
      { title: "Medicaid & CHIP", desc: "Health coverage for families and children", url: "https://www.healthcare.gov/medicaid-chip" },
      { title: "WIC Program", desc: "Nutrition support for women, infants, and children", url: "https://www.fns.usda.gov/wic" },
      { title: "Childcare Assistance (CCDF)", desc: "Federal childcare subsidies for working families", url: "https://www.childcare.gov/consumer-education/get-help-paying-for-child-care" },
      { title: "TANF — Temporary Assistance", desc: "Cash assistance and work support for families", url: "https://www.acf.hhs.gov/ofa/programs/tanf" },
    ],
  },
  {
    section: "🎓 Training & Education",
    icon: GraduationCap,
    color: C.midGreen,
    items: [
      { title: "CareerOneStop", desc: "Free job training, skills assessments, and career tools (DOL)", url: "https://www.careeronestop.org" },
      { title: "Coursera (Free Courses)", desc: "Free and paid online courses from top universities", url: "https://www.coursera.org/courses?query=free" },
      { title: "Khan Academy", desc: "Free academic and career skill building", url: "https://www.khanacademy.org" },
      { title: "Google Career Certificates", desc: "Job-ready certificates in tech, data, and business (3–6 months)", url: "https://grow.google/certificates/" },
      { title: "America's Job Center", desc: "Local workforce development centers — resume, training, job placement", url: "https://www.careeronestop.org/LocalHelp/service-locator.aspx" },
      { title: "Pell Grant (College Aid)", desc: "Federal grants for low-income students pursuing education", url: "https://studentaid.gov/understand-aid/types/grants/pell" },
    ],
  },
  {
    section: "📄 Resume & Interview Help",
    icon: BookOpen,
    color: "#7C4DFF",
    items: [
      { title: "Resume.com", desc: "Free resume builder with templates", url: "https://www.resume.com" },
      { title: "Canva Resume Builder", desc: "Design professional resumes for free", url: "https://www.canva.com/resumes/templates/" },
      { title: "Interview Warmup (Google)", desc: "AI-powered interview practice tool — free", url: "https://grow.google/certificates/interview-warmup/" },
      { title: "MyPerfectResume", desc: "Step-by-step resume and cover letter builder", url: "https://www.myperfectresume.com" },
    ],
  },
  {
    section: "👨‍👩‍👧 Foster & Adoptive Family Employment Resources",
    icon: Users,
    color: "#B84C2A",
    items: [
      { title: "Child Welfare Jobs (CWLA)", desc: "Job board for child welfare, foster care, and social services", url: "https://www.cwla.org/career-center/" },
      { title: "Foster Care to Success", desc: "Scholarships and support for foster youth and caregivers", url: "https://www.fc2success.org" },
      { title: "National Council on Disability", desc: "Employment resources for parents/caregivers with disabilities", url: "https://ncd.gov" },
      { title: "Employer Support for Foster Families", desc: "Finding employers with foster-friendly workplace policies", url: "https://www.fosteramerica.org/foster-friendly-businesses" },
    ],
  },
];

export default function JobResources() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Job & Career Resources"
        subtitle="Training, jobs, benefits & financial help"
        backTo="/resources"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <Briefcase size={26} color={C.gold} className="mb-2" />
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Career & Employment Hub</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Job boards, free training, financial assistance, resume tools, and foster family-specific employment resources — all in one place.
          </p>
        </div>

        {JOB_SECTIONS.map(section => (
          <div key={section.section}>
            <p className="text-[11px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
              {section.section}
            </p>
            <div className="space-y-2">
              {section.items.map(item => (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-xl p-3.5 transition-all hover:shadow-md"
                  style={{ background: C.white, border: `1px solid ${C.cream}`, textDecoration: "none" }}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: section.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{item.title}</p>
                    <p className="text-[11px] mt-0.5 leading-snug" style={{ color: C.mutedText }}>{item.desc}</p>
                  </div>
                  <ExternalLink size={13} color={C.mutedText} className="flex-shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl p-4 text-center" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Rooted 21 Parenting Network</p>
          <p className="text-xs mt-1" style={{ color: C.lightGreen }}>Supporting the whole family — including your financial future.</p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}