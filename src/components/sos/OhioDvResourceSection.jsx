import { useMemo, useState } from "react";
import { Accessibility, Baby, Car, HeartHandshake, Home, Languages, MapPin, PawPrint, Phone, Scale, Search, Shield, Users } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const RESOURCES = [
  {
    name: "National Domestic Violence Hotline",
    category: "National hotline",
    county: "Statewide",
    phone: "1-800-799-7233",
    text: "Text START to 88788",
    website: "https://www.thehotline.org/",
    description: "24/7 confidential support, safety planning options, shelter referrals, and chat support.",
    emergency: true,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["hotline", "safety planning", "shelter referral"]
  },
  {
    name: "Ohio Domestic Violence Network",
    category: "Ohio DV shelters",
    county: "Statewide",
    phone: "1-800-934-9840",
    website: "https://www.odvn.org/",
    description: "Ohio-focused DV support, local shelter referrals, advocacy options, and survivor resources.",
    emergency: true,
    childFriendly: true,
    petFriendly: true,
    languages: true,
    accessibility: true,
    tags: ["shelter referral", "advocacy", "emergency housing"]
  },
  {
    name: "LSS CHOICES for Victims of Domestic Violence",
    category: "DV shelter / emergency housing",
    county: "Franklin",
    phone: "614-224-4663",
    website: "https://lssnetworkofhope.org/choices/",
    description: "Franklin County emergency shelter, crisis support, advocacy, and safety planning.",
    emergency: true,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["shelter", "crisis center", "emergency housing"]
  },
  {
    name: "Journey Center for Safety and Healing",
    category: "DV shelter / crisis center",
    county: "Cuyahoga",
    phone: "216-391-4357",
    website: "https://www.journeyneo.org/",
    description: "Cleveland-area DV crisis support, shelter, counseling, advocacy, and family support.",
    emergency: true,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["shelter", "trauma counseling", "legal advocacy"]
  },
  {
    name: "Women Helping Women",
    category: "DV / sexual assault support",
    county: "Hamilton",
    phone: "513-381-5610",
    website: "https://www.womenhelpingwomen.org/",
    description: "Cincinnati-area support for domestic violence, sexual assault, stalking, and dating violence.",
    emergency: true,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["sexual assault", "protective order help", "advocacy"]
  },
  {
    name: "Artemis Center",
    category: "Local crisis center",
    county: "Montgomery",
    phone: "937-461-4357",
    website: "https://www.artemiscenter.org/",
    description: "Dayton-area domestic violence crisis intervention, advocacy, support groups, and safety planning.",
    emergency: true,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["crisis center", "counseling", "support groups"]
  },
  {
    name: "The Cocoon",
    category: "DV shelter / advocacy",
    county: "Wood",
    phone: "419-373-1730",
    website: "https://thecocoon.org/",
    description: "Emergency shelter, advocacy, support, and legal system navigation for survivors.",
    emergency: true,
    childFriendly: true,
    petFriendly: true,
    languages: false,
    accessibility: true,
    tags: ["shelter", "pet-friendly", "legal advocacy"]
  },
  {
    name: "Ohio Legal Help",
    category: "Legal aid / protective orders",
    county: "Statewide",
    website: "https://www.ohiolegalhelp.org/",
    description: "Plain-language Ohio legal information, protective order guidance, custody basics, and legal aid referrals.",
    emergency: false,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["legal aid", "protective order", "custody"]
  },
  {
    name: "Legal Aid Society directory through Ohio Legal Help",
    category: "Legal aid",
    county: "Statewide",
    website: "https://www.ohiolegalhelp.org/find-your-legal-aid",
    description: "Find the correct legal aid office by county for protective orders, housing, benefits, and family safety needs.",
    emergency: false,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["legal aid", "county lookup", "protective order help"]
  },
  {
    name: "Ohio Alliance to End Sexual Violence",
    category: "Sexual assault support",
    county: "Statewide",
    website: "https://oaesv.org/",
    description: "Ohio sexual assault advocacy, prevention resources, and local rape crisis center connections.",
    emergency: false,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["sexual assault", "rape crisis", "advocacy"]
  },
  {
    name: "National Human Trafficking Hotline",
    category: "Human trafficking resources",
    county: "Statewide",
    phone: "1-888-373-7888",
    text: "Text 233733",
    website: "https://humantraffickinghotline.org/",
    description: "24/7 confidential trafficking support, safety planning options, and service referrals.",
    emergency: true,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["human trafficking", "hotline", "emergency support"]
  },
  {
    name: "Child Advocacy Centers of Ohio",
    category: "Child advocacy centers",
    county: "Statewide",
    website: "https://www.ohiochildrensalliance.org/",
    description: "Connections to child advocacy centers supporting children after abuse, violence, or trafficking concerns.",
    emergency: false,
    childFriendly: true,
    petFriendly: false,
    languages: true,
    accessibility: true,
    tags: ["children", "advocacy", "trauma support"]
  },
  {
    name: "Buckeye Region Anti-Violence Organization resources",
    category: "LGBTQ+ affirming resources",
    county: "Statewide",
    website: "https://www.equalityohio.org/",
    description: "LGBTQ+ affirming survivor support referrals, legal information, and community safety resources in Ohio.",
    emergency: false,
    childFriendly: true,
    petFriendly: false,
    languages: false,
    accessibility: true,
    tags: ["LGBTQ+ affirming", "legal", "community support"]
  },
  {
    name: "211 Ohio / United Way Resource Navigation",
    category: "Transportation / emergency needs",
    county: "Statewide",
    phone: "211",
    website: "https://www.211.org/",
    description: "Local referrals for emergency housing, transportation, food, utility help, counseling, and family support.",
    emergency: true,
    childFriendly: true,
    petFriendly: true,
    languages: true,
    accessibility: true,
    tags: ["transportation", "housing", "local referrals"]
  }
];

const FILTERS = [
  { key: "emergency", label: "Emergency available", icon: Shield },
  { key: "childFriendly", label: "Child-friendly", icon: Baby },
  { key: "petFriendly", label: "Pet-friendly", icon: PawPrint },
  { key: "languages", label: "Language support", icon: Languages },
  { key: "accessibility", label: "Accessibility", icon: Accessibility }
];

const CATEGORY_ICONS = {
  "National hotline": Phone,
  "Ohio DV shelters": Home,
  "DV shelter / emergency housing": Home,
  "DV shelter / crisis center": Home,
  "DV / sexual assault support": HeartHandshake,
  "Local crisis center": Shield,
  "DV shelter / advocacy": Home,
  "Legal aid / protective orders": Scale,
  "Legal aid": Scale,
  "Sexual assault support": HeartHandshake,
  "Human trafficking resources": Users,
  "Child advocacy centers": Baby,
  "LGBTQ+ affirming resources": HeartHandshake,
  "Transportation / emergency needs": Car
};

export default function OhioDvResourceSection() {
  const [county, setCounty] = useState("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});

  const counties = useMemo(() => ["all", ...new Set(RESOURCES.map(item => item.county))].sort((a, b) => a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)), []);

  const visibleResources = RESOURCES.filter(resource => {
    const countyMatch = county === "all" || resource.county === county || resource.county === "Statewide";
    const queryText = `${resource.name} ${resource.category} ${resource.description} ${resource.tags.join(" ")}`.toLowerCase();
    const queryMatch = !query || queryText.includes(query.toLowerCase());
    const filterMatch = FILTERS.every(filter => !filters[filter.key] || resource[filter.key]);
    return countyMatch && queryMatch && filterMatch;
  });

  return (
    <section className="rounded-3xl p-5 shadow-lg" style={{ background: C.white, border: `2px solid ${C.midGreen}40` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
          <MapPin size={28} color="#fff" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: C.midGreen }}>Emergency resources</p>
          <h2 className="mt-1 font-serif text-xl font-black leading-tight" style={{ color: C.darkGreen }}>Ohio DV Resource Finder</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>
            You are not alone. Ohio-focused domestic violence, housing, legal, trafficking, sexual assault, child advocacy, transportation, and affirming support resources are available when you are ready.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        <p className="text-xs font-bold leading-relaxed" style={{ color: C.darkGreen }}>
          If danger feels immediate, emergency support is available through 911. For 24/7 DV support, you can call 1-800-799-7233 or text START to 88788.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} color={C.warmText} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search support, shelter, legal aid, counseling..."
            className="w-full rounded-2xl border py-3 pl-9 pr-3 text-sm"
            style={{ borderColor: C.cream }}
          />
        </div>
        <select value={county} onChange={e => setCounty(e.target.value)} className="w-full rounded-2xl border px-3 py-3 text-sm" style={{ borderColor: C.cream }}>
          {counties.map(item => <option key={item} value={item}>{item === "all" ? "All counties + statewide" : `${item} County + statewide`}</option>)}
        </select>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FILTERS.map(filter => {
            const Icon = filter.icon;
            const active = !!filters[filter.key];
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, [filter.key]: !prev[filter.key] }))}
                className="justify-start rounded-2xl px-3 py-2 text-left text-xs font-black"
                style={{ background: active ? C.darkGreen : C.offWhite, color: active ? "#fff" : C.darkGreen, border: `1px solid ${C.cream}` }}
              >
                <Icon size={14} className="mr-2" /> {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {visibleResources.map(resource => {
          const Icon = CATEGORY_ICONS[resource.category] || Shield;
          return (
            <article key={resource.name} className="rounded-2xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${C.midGreen}22` }}>
                  <Icon size={18} color={C.darkGreen} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black" style={{ color: C.darkGreen }}>{resource.name}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: C.warmText }}>{resource.category} · {resource.county}</p>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: C.mutedText }}>{resource.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {resource.tags.map(tag => <span key={tag} className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: C.white, color: C.darkGreen, border: `1px solid ${C.cream}` }}>{tag}</span>)}
                  </div>
                  <div className="mt-3 grid gap-2">
                    {resource.phone && <a href={`tel:${resource.phone.replace(/[^0-9]/g, "")}`} className="rounded-xl px-3 py-2 text-xs font-black no-underline" style={{ background: C.darkGreen, color: "#fff" }}>Call {resource.phone}</a>}
                    {resource.text && <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{resource.text}</p>}
                    {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 text-xs font-black no-underline" style={{ background: C.white, color: C.darkGreen, border: `1px solid ${C.cream}` }}>Open website</a>}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {visibleResources.length === 0 && (
          <div className="rounded-2xl p-4 text-center text-sm font-bold" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>
            No resources match those filters right now. You can remove one filter or select all counties when you are ready.
          </div>
        )}
      </div>
    </section>
  );
}