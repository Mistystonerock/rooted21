import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import HousingZipSearch from "@/components/housing/HousingZipSearch";
import HousingResourceCard from "@/components/housing/HousingResourceCard";

const CATEGORIES = ["All", "Rentals", "Emergency Shelter", "Rental Assistance", "Section 8", "Low Income Housing", "Transitional Housing", "Domestic Violence Housing", "Utilities Help"];
const ROSS_AREA_ZIPS = ["45601", "45612", "45617", "45628", "45644", "45647", "45673", "45681", "45690"];

function withZip(url, zip) {
  return url.replace("{zip}", encodeURIComponent(zip || "Ohio"));
}

export default function HousingResources() {
  const [user, setUser] = useState(null);
  const [zip, setZip] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then((me) => {
      setUser(me);
      setZip(me?.housing_resources_zip || "");
    });
  }, []);

  async function saveZip(nextZip) {
    setSaving(true);
    await base44.auth.updateMe({ housing_resources_zip: nextZip });
    setZip(nextZip);
    setSaving(false);
  }

  const sections = useMemo(() => {
    const rentalCards = [
      { icon: "🏠", title: "Zillow Rentals", description: "Search thousands of rental listings near your zip code including apartments, houses, and townhomes", actions: [{ label: "Search Rentals on Zillow", href: withZip("https://www.zillow.com/homes/for_rent/{zip}_rb/", zip) }] },
      { icon: "🏢", title: "Apartments.com", description: "Find apartments and rentals near you with filters for price, bedrooms, and pet friendly", actions: [{ label: "Search on Apartments.com", href: withZip("https://www.apartments.com/{zip}/", zip) }] },
      { icon: "📋", title: "Craigslist Housing", description: "Local rental listings posted by landlords directly. Often includes lower cost options", actions: [{ label: "Search Craigslist", href: withZip("https://columbus.craigslist.org/search/apa?query={zip}", zip) }] },
      { icon: "📱", title: "Facebook Marketplace Rentals", description: "Local rentals posted by landlords and property managers in your community", actions: [{ label: "Search Facebook Marketplace", href: "https://www.facebook.com/marketplace/category/propertyrentals" }] },
      { icon: "📍", title: "Hotpads", description: "Rental search with map view so you can see exactly where listings are located", actions: [{ label: "Search Hotpads", href: withZip("https://hotpads.com/{zip}/apartments-for-rent", zip) }] },
    ];

    const lowIncomeCards = [
      { icon: "🏘️", title: "Ohio Housing Finance Agency", description: "Find affordable rental housing across Ohio including tax credit properties that offer reduced rent based on income", phone: "614-387-2863", website: "https://ohiohome.org", actions: [{ label: "Visit Website", href: "https://ohiohome.org" }, { label: "Call Now", href: "tel:6143872863", color: C.midGreen }] },
      { icon: "🔍", title: "Ohio Housing Locator", description: "Free searchable database of affordable rental housing across Ohio. Search by zip code, bedroom size, and accessibility needs", website: "https://www.ohiohousinglocator.com", actions: [{ label: "Search Now", href: "https://www.ohiohousinglocator.com", color: "#2563EB" }] },
      { icon: "📄", title: "Section 8 Housing Choice Voucher", description: "Section 8 vouchers help low income families pay rent in the private market. Contact your local public housing authority to apply. Waitlists may be long so apply as soon as possible.", actions: [{ label: "Find Your Local PHA", href: "https://www.hud.gov/program_offices/public_indian_housing/programs/hcv" }] },
      { icon: "🏛️", title: "HUD Affordable Housing Search", description: "Search HUD approved affordable housing near your zip code", actions: [{ label: "Search HUD Housing", href: "https://www.huduser.gov" }] },
    ];

    const rossCards = [
      { icon: "🤝", title: "Community Action Committee of Ross County", phone: "740-773-2090", services: "Emergency rental assistance, utility assistance, housing navigation", qualifies: "Low income Ross County residents", actions: [{ label: "Call Now", href: "tel:7407732090", color: C.midGreen }] },
      { icon: "🏢", title: "Chillicothe Metropolitan Housing Authority", phone: "740-773-1996", address: "484 Western Avenue Chillicothe Ohio 45601", services: "Public housing and Section 8 vouchers for Ross County residents", actions: [{ label: "Call Now", href: "tel:7407731996", color: C.midGreen }] },
      { icon: "💙", title: "Southeast Healthcare Housing Services", phone: "740-773-1000", services: "Transitional housing and housing navigation for individuals in recovery or experiencing mental health challenges", actions: [{ label: "Call Now", href: "tel:7407731000", color: C.midGreen }] },
      { icon: "🛟", title: "Salvation Army Chillicothe", phone: "740-773-3714", services: "Emergency shelter, rental assistance, utility help", actions: [{ label: "Call Now", href: "tel:7407733714", color: C.midGreen }] },
    ];

    const rentalAssistanceCards = [
      { icon: "💰", title: "Ohio Emergency Rental Assistance", description: "Ohio has emergency rental assistance programs that can help pay past due rent and prevent eviction. Eligibility is based on income and COVID or financial hardship.", phone: "1-800-686-1555", website: "https://development.ohio.gov", actions: [{ label: "Apply Now", href: "https://development.ohio.gov", color: "#EA580C" }, { label: "Call Now", href: "tel:18006861555", color: C.midGreen }] },
      { icon: "📞", title: "Call 211 for Local Assistance", description: "211 connects you to local rental assistance programs in your county. Many programs have funds available but are not well advertised. Always call 211 first.", actions: [{ label: "Call 211 Now", href: "tel:211", color: C.midGreen }] },
      { icon: "📋", title: "Ohio Benefits", description: "Apply for multiple Ohio assistance programs in one place including housing assistance, food assistance, Medicaid, and childcare help", website: "https://benefits.ohio.gov", actions: [{ label: "Apply at Ohio Benefits", href: "https://benefits.ohio.gov", color: "#EA580C" }] },
    ];

    const transitionalCards = [
      { icon: "🛡️", title: "Domestic Violence Safe Housing", description: "If you are fleeing domestic violence you may qualify for emergency safe housing immediately. These resources are confidential.", phone: "1-800-934-9840", actions: [{ label: "Call DV Hotline", href: "tel:18009349840", color: "#B42318" }, { label: "Call National Hotline", href: "tel:18007997233", color: "#7F1D1D" }] },
      { icon: "🏠", title: "Transitional Housing for Families", description: "Transitional housing provides temporary stable housing with supportive services while you work toward permanent housing. Ask 211 about transitional housing programs in your county.", actions: [{ label: "Call 211", href: "tel:211", color: C.midGreen }] },
      { icon: "💙", title: "Housing for People in Recovery", description: "Ohio has sober living homes and recovery housing for individuals and families in addiction recovery. Oxford Houses and other recovery residences offer safe affordable housing.", website: "https://ohiorecoveryhousing.org", actions: [{ label: "Find Recovery Housing", href: "https://ohiorecoveryhousing.org", color: "#2563EB" }] },
      { icon: "🔑", title: "Rapid Rehousing", description: "Rapid rehousing programs help families who are homeless or at risk get into stable housing quickly with short term rental assistance and supportive services.", actions: [{ label: "Call 211 to Find Programs", href: "tel:211", color: C.midGreen }] },
    ];

    const rightsCards = [
      { icon: "⚖️", title: "Ohio Tenant Rights", description: "In Ohio tenants have legal rights including the right to a habitable home, proper notice before eviction, and return of security deposits. Know your rights before you sign a lease.", actions: [{ label: "Ohio Legal Help", href: "https://www.ohiolegalhelp.org" }] },
      { icon: "📄", title: "Facing Eviction?", description: "If you have received an eviction notice you have rights. Contact Ohio Legal Help or your local legal aid office immediately. Do not ignore eviction papers.", phone: "614-224-8374", website: "https://www.ohiolegalhelp.org", actions: [{ label: "Get Legal Help", href: "tel:6142248374", color: C.midGreen }] },
      { icon: "🏛️", title: "Fair Housing Rights", description: "It is illegal for landlords to discriminate based on race, religion, sex, national origin, disability, or familial status. If you believe you have been discriminated against contact the Ohio Civil Rights Commission.", phone: "1-888-278-7101", actions: [{ label: "Report Discrimination", href: "tel:18882787101", color: C.midGreen }] },
    ];

    const utilityCards = [
      { icon: "🔥", title: "HEAP — Home Energy Assistance Program", description: "Ohio’s HEAP program helps low income households pay heating and cooling bills. Apply through your local community action agency.", phone: "1-800-282-0880", actions: [{ label: "Apply for HEAP", href: "tel:18002820880", color: C.midGreen }] },
      { icon: "💡", title: "Ohio Percentage of Income Payment Plan", description: "PIPP Plus caps your gas and electric bills at a percentage of your income so you never pay more than you can afford.", actions: [{ label: "Learn About PIPP", href: "https://www.energyhelp.us", color: "#EA580C" }] },
      { icon: "⚡", title: "AEP Ohio Bill Assistance", phone: "1-800-672-2231", actions: [{ label: "Call AEP", href: "tel:18006722231", color: C.midGreen }] },
      { icon: "🔥", title: "Columbia Gas of Ohio Assistance", phone: "1-800-344-4077", actions: [{ label: "Call Columbia Gas", href: "tel:18003444077", color: C.midGreen }] },
    ];

    const items = [
      { title: "Find Rentals Near You", category: "Rentals", cards: rentalCards },
      { title: "Affordable and Low Income Housing", category: "Low Income Housing", cards: lowIncomeCards },
      ...(ROSS_AREA_ZIPS.includes(zip) ? [{ title: "Ross County and 740 Area Specific Housing", category: "Emergency Shelter", cards: rossCards }] : []),
      { title: "Emergency Rental Assistance", category: "Rental Assistance", cards: rentalAssistanceCards },
      { title: "Transitional and Special Circumstances Housing", category: "Transitional Housing", cards: transitionalCards },
      { title: "Know Your Rights as a Renter", category: "Section 8", cards: rightsCards },
      { title: "Utilities Help", category: "Utilities Help", cards: utilityCards },
    ];

    return activeCategory === "All" ? items : items.filter((section) => section.category === activeCategory || (activeCategory === "Emergency Shelter" && section.title.includes("Ross County")) || (activeCategory === "Domestic Violence Housing" && section.title.includes("Transitional")) || (activeCategory === "Section 8" && section.title.includes("Affordable")));
  }, [zip, activeCategory]);

  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <header className="sticky top-0 z-20 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[520px] items-center gap-3">
          <Link to="/resources" className="rounded-xl p-2" style={{ background: "#ffffff20" }} aria-label="Back to resources"><ChevronLeft size={22} color="#fff" /></Link>
          <div className="flex-1">
            <h1 className="font-serif text-lg font-bold" style={{ color: "#fff" }}>Housing Resources</h1>
            <p className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>Rentals, assistance, shelter, and utilities help</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="grid grid-cols-2 gap-2">
          <a href={withZip("https://www.google.com/search?q=emergency+shelter+near+{zip}", zip)} target="_blank" rel="noopener noreferrer" className="rounded-2xl px-3 py-4 text-center text-sm font-black no-underline" style={{ background: "#DC2626", color: "#fff" }}>🚨 Emergency Shelter</a>
          <a href="tel:211" className="rounded-2xl px-3 py-4 text-center text-sm font-black no-underline" style={{ background: C.midGreen, color: "#fff" }}>📞 Call 211</a>
          <a href="https://www.ohiohousinglocator.com" target="_blank" rel="noopener noreferrer" className="rounded-2xl px-3 py-4 text-center text-sm font-black no-underline" style={{ background: "#2563EB", color: "#fff" }}>🏠 Ohio Housing Search</a>
          <a href="https://benefits.ohio.gov" target="_blank" rel="noopener noreferrer" className="rounded-2xl px-3 py-4 text-center text-sm font-black no-underline" style={{ background: "#EA580C", color: "#fff" }}>💰 Rental Assistance</a>
        </section>

        <HousingZipSearch zip={zip} onSave={saveZip} saving={saving} />

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {CATEGORIES.map((category) => (
            <button key={category} type="button" onClick={() => setActiveCategory(category)} className="shrink-0 rounded-full px-4 py-2 text-xs font-black" style={{ background: activeCategory === category ? C.darkGreen : C.white, color: activeCategory === category ? "#fff" : C.darkGreen, border: `1.5px solid ${activeCategory === category ? C.darkGreen : C.cream}` }}>
              {category}
            </button>
          ))}
        </div>

        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-serif text-xl font-black" style={{ color: C.darkGreen }}>{section.title}</h2>
            {section.cards.map((card) => <HousingResourceCard key={card.title} {...card} />)}
          </section>
        ))}

        <section className="rounded-3xl p-5 text-center" style={{ background: C.cream }}>
          <Home className="mx-auto mb-2" size={24} color={C.darkGreen} />
          <p className="text-sm leading-relaxed" style={{ color: C.mutedText }}>
            Know of a housing resource we should add? We want to make this as helpful as possible for families in your area. Email us at <a href="mailto:misty.stonerock88@gmail.com" className="font-black underline" style={{ color: C.darkGreen }}>misty.stonerock88@gmail.com</a>
          </p>
        </section>
      </main>
    </div>
  );
}