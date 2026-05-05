import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Search, X, Users, ExternalLink } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import ProfessionalCard from "@/components/directory/ProfessionalCard";
import ConsultationModal from "@/components/directory/ConsultationModal";

const NATIONAL_DIRECTORIES = [
  {
    category: "🧠 Therapists & Counselors",
    color: C.gold,
    links: [
      {
        name: "Psychology Today – Find a Therapist",
        desc: "Largest U.S. therapist directory. Filter by insurance, issue, and distance.",
        url: "https://www.psychologytoday.com/us/therapists",
      },
      {
        name: "Kids Therapy Finder",
        desc: "11,000+ pediatric counselors, therapists & specialists across the U.S.",
        url: "https://www.kidstherapyfinder.com/",
      },
      {
        name: "Inclusive Therapists",
        desc: "Verified mental health providers centering BIPOC, LGBTQ+, and marginalized communities.",
        url: "https://www.inclusivetherapists.com/",
      },
      {
        name: "Childhelp Partnership – Find a Therapist",
        desc: "Guide and directory for finding trauma-trained child therapists nationwide.",
        url: "https://www.childhelppartnership.org/parents-and-caregivers/find-a-therapist/",
      },
    ],
  },
  {
    category: "🌱 TBRI® Practitioners",
    color: C.midGreen,
    links: [
      {
        name: "TCU KPICD – TBRI® Practitioner Directory",
        desc: "Official directory of TBRI®-trained practitioners in all 50 states and 69 countries.",
        url: "https://child.tcu.edu/find-a-practitioner/",
      },
      {
        name: "OLS TBRI® Practitioner Directory",
        desc: "Searchable online directory of certified TBRI® practitioners.",
        url: "https://myols.net/kpicd/user-directory/practitioner",
      },
    ],
  },
  {
    category: "👨‍👩‍👧 Co-Parenting Coaches",
    color: C.brown,
    links: [
      {
        name: "Peaceful Parent Happy Kids – Coach Directory",
        desc: "Certified coaches specializing in co-parenting, divorce, blended families & more.",
        url: "https://www.peacefulparenthappykids.com/coaches-directory",
      },
      {
        name: "Jai Institute – Parenting Coach Directory",
        desc: "Find a parenting coach near you for co-parenting and family support.",
        url: "https://coaches.jaiinstituteforparenting.com/",
      },
      {
        name: "ABC Parenting – Find a Parent Coach",
        desc: "Locate an ABC-certified parent coach by state.",
        url: "https://www.abcparenting.org/findaparentcoach/",
      },
      {
        name: "Family Life Coaching Association – Coach Directory",
        desc: "Browse certified family life coaches across the U.S.",
        url: "https://flcassociation.org/coach-directory/",
      },
    ],
  },
  {
    category: "⚖️ Child Welfare & Advocacy",
    color: "#B84C2A",
    links: [
      {
        name: "Child Welfare Information Gateway",
        desc: "Federal resource hub for child welfare research, services, and professional referrals.",
        url: "https://www.childwelfare.gov/",
      },
      {
        name: "Parent Advocacy – Referral Platform USA",
        desc: "Helps parents navigate the child welfare system and find legal advocates.",
        url: "https://parentadvocacy.net/ldbrp/the-referral-platform-usa/",
      },
    ],
  },
  {
    category: "🏡 Foster & Adoptive Family Support",
    color: "#5B8DB8",
    links: [
      {
        name: "National Directory of Adoption Competent Professionals",
        desc: "Hundreds of mental health therapists nationwide with adoption-competency training.",
        url: "https://adoptionsupport.org/national-directory/",
      },
    ],
  },
];

const SPECIALTIES = [
  { value: "all",        label: "All",              emoji: "👥" },
  { value: "therapist",  label: "Therapists",       emoji: "💛" },
  { value: "coach",      label: "Coaches",          emoji: "🌱" },
  { value: "caseworker", label: "Caseworkers",      emoji: "📋" },
  { value: "counselor",  label: "Counselors",       emoji: "🤝" },
  { value: "advocate",   label: "Advocates",        emoji: "⚖️" },
  { value: "other",      label: "Other",            emoji: "👤" },
];

// Sample seed professionals so the page is useful out of the box
const SEED_PROS = [
  {
    id: "seed-1",
    full_name: "Dr. Maria Santos",
    title: "Licensed Clinical Social Worker",
    specialty: "therapist",
    bio: "Specializing in trauma-informed care and TBRI® for foster and adoptive families. 15+ years supporting children from hard places.",
    email: "maria.santos@example.com",
    location: "Austin, TX",
    tags: ["TBRI®", "Trauma-Informed", "Foster Care", "Adoptive Families"],
    accepts_insurance: true,
    offers_sliding_scale: true,
    virtual_available: true,
    verified: true,
    years_experience: 15,
    rating: 4.9,
  },
  {
    id: "seed-2",
    full_name: "James Whitfield, LMFT",
    title: "Licensed Marriage & Family Therapist",
    specialty: "coach",
    bio: "Co-parenting coach helping families navigate court-mandated parenting programs, conflict resolution, and rebuilding trust.",
    email: "james@example.com",
    phone: "512-555-0182",
    website: "https://example.com",
    location: "Virtual / Nationwide",
    tags: ["Co-Parenting", "Conflict Resolution", "Court Programs"],
    accepts_insurance: false,
    offers_sliding_scale: true,
    virtual_available: true,
    verified: true,
    years_experience: 10,
    rating: 4.7,
  },
  {
    id: "seed-3",
    full_name: "Keisha Moore, MSW",
    title: "Child Welfare Advocate & Caseworker",
    specialty: "caseworker",
    bio: "Experienced CPS liaison helping families understand their rights, navigate the child welfare system, and build stronger support networks.",
    email: "keisha.moore@example.com",
    location: "Dallas, TX",
    tags: ["CPS Navigation", "Family Rights", "System Advocacy"],
    accepts_insurance: false,
    offers_sliding_scale: false,
    virtual_available: true,
    verified: true,
    years_experience: 8,
    rating: 4.8,
  },
  {
    id: "seed-4",
    full_name: "Dr. Robert Chen",
    title: "Child Psychologist",
    specialty: "counselor",
    bio: "Specializing in attachment disorders, sensory processing, and behavioral challenges in children ages 4–17. EMDR certified.",
    email: "rchen@example.com",
    phone: "713-555-0234",
    location: "Houston, TX",
    tags: ["Attachment", "Sensory", "EMDR", "Behavior"],
    accepts_insurance: true,
    offers_sliding_scale: false,
    virtual_available: false,
    verified: true,
    years_experience: 20,
    rating: 4.6,
  },
];

export default function ProfessionalDirectory() {
  const [user, setUser] = useState(null);
  const [dbPros, setDbPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [filterVirtual, setFilterVirtual] = useState(false);
  const [filterInsurance, setFilterInsurance] = useState(false);
  const [filterSliding, setFilterSliding] = useState(false);
  const [selectedPro, setSelectedPro] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.ProfessionalListing.list("-created_date", 100),
    ]).then(([u, pros]) => {
      setUser(u);
      setDbPros(pros);
      setLoading(false);
    });
  }, []);

  // Merge seed + DB listings (DB listings override seeds by id)
  const allPros = useMemo(() => {
    const dbIds = new Set(dbPros.map(p => p.id));
    const seeds = SEED_PROS.filter(s => !dbIds.has(s.id));
    return [...dbPros, ...seeds];
  }, [dbPros]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allPros.filter(p => {
      if (specialty !== "all" && p.specialty !== specialty) return false;
      if (filterVirtual && !p.virtual_available) return false;
      if (filterInsurance && !p.accepts_insurance) return false;
      if (filterSliding && !p.offers_sliding_scale) return false;
      if (!q) return true;
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [allPros, specialty, search, filterVirtual, filterInsurance, filterSliding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Professional Directory"
        subtitle="Find verified child welfare professionals"
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} color={C.gold} />
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
              Verified Professionals
            </p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            Browse therapists, caseworkers, co-parenting coaches, and child welfare advocates.
            Request a consultation directly from the directory.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} color={C.mutedText} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or keyword…"
            className="w-full rounded-xl pl-9 pr-9 py-2.5 text-sm font-sans"
            style={{ border: `1.5px solid ${C.cream}`, background: "#fff" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={13} color={C.mutedText} />
            </button>
          )}
        </div>

        {/* Specialty filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {SPECIALTIES.map(s => (
            <button
              key={s.value}
              onClick={() => setSpecialty(s.value)}
              className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                background: specialty === s.value ? C.darkGreen : C.cream,
                color: specialty === s.value ? "#fff" : C.mutedText,
                border: "none", cursor: "pointer",
              }}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* Toggle filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "💻 Virtual", state: filterVirtual, set: setFilterVirtual },
            { label: "🛡️ Insurance", state: filterInsurance, set: setFilterInsurance },
            { label: "💲 Sliding Scale", state: filterSliding, set: setFilterSliding },
          ].map(f => (
            <button
              key={f.label}
              onClick={() => f.set(v => !v)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full"
              style={{
                background: f.state ? C.midGreen : C.cream,
                color: f.state ? "#fff" : C.mutedText,
                border: "none", cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-[10px]" style={{ color: C.mutedText }}>
          {filtered.length} professional{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "#fff", border: `1.5px dashed ${C.cream}` }}>
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No results</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(pro => (
              <ProfessionalCard key={pro.id} pro={pro} onRequest={setSelectedPro} />
            ))}
          </div>
        )}

        {/* National Referral Directories */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.midGreen}` }}>
          <div className="px-4 py-3" style={{ background: C.darkGreen }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>🗺️ National Referral Directories</p>
            <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>
              Real, vetted referral sites covering therapists, TBRI® practitioners, co-parenting coaches & child welfare advocates across the U.S.
            </p>
          </div>
          <div className="divide-y" style={{ background: "#fff", borderColor: C.cream }}>
            {NATIONAL_DIRECTORIES.map(section => (
              <div key={section.category} className="p-4 space-y-2">
                <p className="text-[10px] font-extrabold tracking-wider" style={{ color: section.color }}>
                  {section.category}
                </p>
                {section.links.map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-xl p-3 transition-all hover:shadow-sm"
                    style={{ background: C.offWhite, textDecoration: "none", display: "flex", border: `1px solid ${C.cream}` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: section.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs leading-snug" style={{ color: C.darkGreen }}>{link.name}</p>
                      <p className="text-[10px] mt-0.5 leading-snug" style={{ color: C.mutedText }}>{link.desc}</p>
                    </div>
                    <ExternalLink size={11} color={C.mutedText} className="flex-shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="rounded-xl p-3.5 text-center" style={{ background: C.cream }}>
          <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
            Are you a verified professional? Contact the Rooted 21 team to be listed in this directory.
          </p>
        </div>

        <div className="pb-8" />
      </div>

      {/* Consultation modal */}
      {selectedPro && user && (
        <ConsultationModal
          pro={selectedPro}
          user={user}
          onClose={() => setSelectedPro(null)}
        />
      )}
    </div>
  );
}