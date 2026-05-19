import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import FamilyFunResourceCard from "@/components/resources/FamilyFunResourceCard";
import { Search } from "lucide-react";

const FILTERS = [
  "Free", "$5 or Less", "Near Me", "Parks", "Trails", "Library Events", "Storytime", "Free Books", "Splash Pads", "Festivals", "Museums for All", "EBT Discounts", "Rainy Day", "Outdoor", "Indoor", "Sensory-Friendly", "Teens", "Little Kids"
];

const RESOURCE_TYPES = [
  "Free parks", "State parks", "Local parks", "Trails", "StoryWalk trails", "Nature programs", "Library events", "Storytime", "Free kids programs", "Summer programs", "Splash pads", "Playgrounds", "Community festivals", "Free holiday events", "Free family nights", "Free books", "Library adventure passes", "Free or low-cost skating events", "Free community meals with family activities", "Sensory-friendly activities", "Rainy day activities", "Indoor free activities", "Outdoor free activities", "Museums for All", "EBT/SNAP/WIC/Medicaid discounts", "Parent-child bonding activities", "Teen activities", "Youth volunteer opportunities"
];

function normalize(value) {
  return String(value || "").toLowerCase();
}

export default function FreeLowCostFamilyFun() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => { loadResources(); }, []);

  async function loadResources() {
    setLoading(true);
    const list = await base44.entities.ResourceListing.filter({ category: "family_fun" }, "name", 200);
    setResources(list);
    setLoading(false);
  }

  function toggleFilter(filter) {
    setActiveFilters(prev => prev.includes(filter) ? prev.filter(item => item !== filter) : [...prev, filter]);
  }

  const filteredResources = useMemo(() => {
    const text = normalize(query);
    const cleanZip = zipCode.replace(/\D/g, "").slice(0, 5);
    return resources.filter(resource => {
      const zips = [resource.zip_code, ...(resource.service_area_zips || [])].filter(Boolean);
      const isStatewide = normalize(resource.county).includes("statewide") || normalize(resource.city).includes("statewide");
      const zipMatch = !cleanZip || isStatewide || zips.includes(cleanZip);
      const haystack = normalize([
        resource.name, resource.city, resource.county, resource.zip_code, resource.cost, resource.activity_type, resource.eligibility_notes, resource.setting,
        ...(resource.service_area_zips || []), ...(resource.tags || []), ...(resource.benefit_tags || [])
      ].join(" "));
      const queryMatch = !text || haystack.includes(text);
      const filterMatch = activeFilters.length === 0 || activeFilters.every(filter => haystack.includes(normalize(filter.replace("$5 or Less", "low-cost").replace("Near Me", "local").replace("EBT Discounts", "ebt"))));
      return zipMatch && queryMatch && filterMatch;
    });
  }, [resources, query, zipCode, activeFilters]);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Free & Low-Cost Family Fun" subtitle="Safe memories without a big budget" backTo="/resources" />
      <main className="mx-auto max-w-[720px] space-y-5 px-4 py-5 pb-36">
        <section className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl">🌿</p>
          <h1 className="mt-2 font-serif text-xl font-bold" style={{ color: C.cream }}>I do not have a lot of money, but I still want to make memories with my kids.</h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.lightGreen }}>Find free, low-cost, benefit-based, indoor, outdoor, sensory-friendly, learning, and bonding activities for families.</p>
        </section>

        <section className="rounded-2xl border p-4" style={{ background: C.white, borderColor: C.cream }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: C.mutedText }}>Activity types included</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {RESOURCE_TYPES.map(type => <span key={type} className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: C.cream, color: C.darkGreen }}>{type}</span>)}
          </div>
        </section>

        <section className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
            <input value={zipCode} onChange={event => setZipCode(event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" placeholder="ZIP code" className="w-full rounded-2xl border px-3 py-3 text-sm font-bold" style={{ borderColor: C.cream }} />
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.mutedText} />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search county, city, free, EBT, indoor, outdoor, teen, sensory-friendly…" className="w-full rounded-2xl border py-3 pl-10 pr-3 text-sm" style={{ borderColor: C.cream }} />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map(filter => (
              <button key={filter} onClick={() => toggleFilter(filter)} className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold" style={{ background: activeFilters.includes(filter) ? C.darkGreen : C.cream, color: activeFilters.includes(filter) ? "#fff" : C.darkGreen, border: "none" }}>{filter}</button>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border p-4 text-xs font-bold leading-relaxed" style={{ background: "#FEF3EE", borderColor: "#F4C9B8", color: "#9A3412" }}>
          Official websites are used first. Do not rely on social media screenshots for final verification. Prices, hours, eligibility, and events may change. Please verify before going.
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm" style={{ color: C.mutedText }}>Loading family fun resources…</div>
        ) : filteredResources.length === 0 ? (
          <div className="rounded-2xl border p-6 text-center" style={{ background: C.white, borderColor: C.cream }}>
            <p className="font-bold" style={{ color: C.darkGreen }}>No matching activities found for that ZIP yet.</p>
            <p className="mt-1 text-xs" style={{ color: C.mutedText }}>Try another ZIP, clear filters, or search by county, city, park, library, EBT, indoor, outdoor, or age range.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResources.map(resource => <FamilyFunResourceCard key={resource.id} resource={resource} onReported={loadResources} />)}
          </div>
        )}
      </main>
    </div>
  );
}