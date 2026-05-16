import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ExternalLink, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";

const FILTERS = ["All", "Emergency", "Primary Care", "Pediatrics", "Dental", "Eye Care", "Mental Health", "Community Health", "No Insurance Help", "Medicaid"];
const LOCAL_ZIPS = ["45601", "45690", "45640", "45651", "45631", "45701", "43138", "43130"];
const LOCAL_PREFIXES = ["456", "457", "431"];

const LOCAL_PROVIDERS = [
  { name: "Adena Regional Medical Center Emergency Department", category: "Emergency", address: "272 Hospital Road, Chillicothe, Ohio 45601", phone: "740-779-7500", hours: "Open 24 hours 7 days a week", insurance: "Accepts Medicaid and most insurance", sliding: "No sliding scale listed", directions: true },
  { name: "Adena Pike Medical Center", category: "Emergency", address: "100 Dawn Lane, Waverly, Ohio 45690", phone: "740-947-2186", hours: "Open 24 hours 7 days a week", insurance: "Accepts Medicaid and most insurance", sliding: "No sliding scale listed", directions: true },
  { name: "Adena Health System Primary Care", category: "Primary Care", address: "Multiple locations in Ross County", phone: "740-779-7500", website: "https://www.adena.org", insurance: "Accepts Medicaid, CHIP, and most insurance", sliding: "No sliding scale listed" },
  { name: "Adena Pediatrics Chillicothe", category: "Pediatrics", address: "Chillicothe, Ohio", phone: "740-779-7500", website: "https://www.adena.org", insurance: "Accepts Medicaid and CHIP", sliding: "No sliding scale listed" },
  { name: "Ross County Health District Dental", category: "Dental", address: "Ross County, Ohio", phone: "740-702-9200", insurance: "Low cost dental care for qualifying residents", sliding: "Sliding scale fees based on income" },
  { name: "Southeast Healthcare", category: "Mental Health", address: "Ross County, Ohio", phone: "740-773-1000", website: "https://southeasthealthcare.org", services: "Behavioral health, addiction recovery, trauma therapy, family counseling", insurance: "Accepts Medicaid, most insurance, sliding scale fees", sliding: "Sliding scale fees available" },
  { name: "Scioto Paint Valley Mental Health Center", category: "Mental Health", address: "Ross County, Ohio", phone: "740-773-4450", services: "Mental health counseling, psychiatric care, crisis support", insurance: "Call to confirm insurance", sliding: "Call to ask about reduced fees" },
  { name: "Ross County Health District", category: "Community Health", address: "Ross County, Ohio", phone: "740-702-9200", website: "https://rosscountyhealth.org", services: "Public health, immunizations, WIC, health education", insurance: "Public health services", sliding: "Call to ask about low cost services" },
  { name: "Southeast Healthcare Community Health", category: "Community Health", address: "Ross County, Ohio", phone: "740-773-1000", services: "Primary care, behavioral health, substance use treatment", insurance: "Accepts Medicaid and most insurance", sliding: "Sliding scale fees available" },
];

const STATEWIDE_RESOURCES = [
  { name: "NeedyMeds Provider Search", category: "Primary Care", address: "Online provider search", website: "https://www.needymeds.org", insurance: "Find low-cost providers and programs", sliding: "Many listed programs offer reduced cost care" },
  { name: "Find a Community Health Center", category: "Community Health", address: "Search by zip code", website: "https://findahealthcenter.hrsa.gov", insurance: "Must see patients regardless of ability to pay", sliding: "Fees based on income" },
  { name: "Psychology Today Therapist Finder", category: "Mental Health", address: "Online therapist directory", website: "https://www.psychologytoday.com", insurance: "Filter by insurance", sliding: "Some providers offer sliding scale" },
  { name: "Ohio Medicaid Provider Search", category: "Medicaid", address: "Ohio statewide", phone: "1-800-324-8680", website: "https://benefits.ohio.gov", insurance: "Ohio Medicaid provider help", sliding: "Medicaid coverage may reduce or remove cost" },
  { name: "Apply for Ohio Medicaid", category: "Medicaid", address: "Ohio statewide", phone: "1-800-324-8680", website: "https://benefits.ohio.gov", services: "If your family has children you may qualify regardless of immigration status", insurance: "Medicaid and CHIP applications", sliding: "Income-based eligibility" },
  { name: "Caresource Ohio", category: "Medicaid", address: "Ohio statewide", phone: "1-800-488-0134", website: "https://www.caresource.com", insurance: "Ohio Medicaid managed care plan", sliding: "Not listed" },
  { name: "Buckeye Health Plan", category: "Medicaid", address: "Ohio statewide", phone: "1-866-246-4276", website: "https://www.buckeyehealthplan.com", insurance: "Ohio Medicaid managed care plan", sliding: "Not listed" },
  { name: "Molina Healthcare Ohio", category: "Medicaid", address: "Ohio statewide", phone: "1-800-642-4168", website: "https://www.molinahealthcare.com", insurance: "Ohio Medicaid managed care plan", sliding: "Not listed" },
  { name: "Community Health Centers", category: "No Insurance Help", address: "Search by zip code", website: "https://findahealthcenter.hrsa.gov", services: "Must see patients regardless of ability to pay", insurance: "No insurance required", sliding: "Fees based on income" },
  { name: "GoodRx — Free Prescription Savings", category: "No Insurance Help", address: "Free app available", website: "https://www.goodrx.com", services: "Save up to 80 percent on medications", insurance: "No insurance required", sliding: "Free prescription coupons" },
  { name: "Free Eye Care for Babies", category: "Eye Care", address: "InfantSEE free eye assessments for babies 6 to 12 months", website: "https://www.infantsee.org", insurance: "Free program", sliding: "Free assessments" },
  { name: "Free and Low Cost Dental", category: "Dental", address: "Call 211 to find a free dental clinic near you", phone: "211", services: "Ohio Medicaid covers dental for all children", insurance: "Medicaid dental for children", sliding: "Ask 211 for free or low-cost clinics" },
  { name: "Mental Health Crisis", category: "Mental Health", address: "Always available", phone: "988", insurance: "Free crisis support", sliding: "No cost" },
  { name: "Emergency", category: "Emergency", address: "Always available", phone: "911", insurance: "Emergency services", sliding: "Call immediately for emergencies" },
  { name: "Poison Control", category: "Emergency", address: "Always available", phone: "1-800-222-1222", insurance: "Free phone help", sliding: "No cost" },
  { name: "Domestic Violence Hotline", category: "Emergency", address: "Always available", phone: "1-800-799-7233", insurance: "Free hotline", sliding: "No cost" },
  { name: "Ohio Child Abuse Hotline", category: "Emergency", address: "Always available", phone: "1-855-642-4453", insurance: "Free hotline", sliding: "No cost" },
  { name: "Sexual Assault Hotline", category: "Emergency", address: "Always available", phone: "1-800-656-4673", insurance: "Free hotline", sliding: "No cost" },
];

function cleanPhone(phone = "") {
  return phone.replace(/[^0-9]/g, "");
}

function mapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function isLocalZip(zip) {
  return LOCAL_ZIPS.includes(zip) || LOCAL_PREFIXES.some(prefix => zip.startsWith(prefix));
}

function ProviderCard({ provider }) {
  return (
    <div className="rounded-2xl p-4 shadow-sm" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-extrabold leading-tight" style={{ color: C.darkGreen }}>{provider.name}</h3>
        <span className="rounded-full px-3 py-1 text-[11px] font-black" style={{ background: `${C.midGreen}18`, color: C.darkGreen }}>{provider.category}</span>
      </div>
      <div className="space-y-2 text-xs leading-relaxed" style={{ color: C.mutedText }}>
        <p><strong style={{ color: C.darkGreen }}>Address:</strong> {provider.address}</p>
        {provider.hours && <p><strong style={{ color: C.darkGreen }}>Hours:</strong> {provider.hours}</p>}
        {provider.services && <p><strong style={{ color: C.darkGreen }}>Services:</strong> {provider.services}</p>}
        <p><strong style={{ color: C.darkGreen }}>Insurance:</strong> {provider.insurance}</p>
        <p><strong style={{ color: C.darkGreen }}>Sliding scale:</strong> {provider.sliding}</p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {provider.phone && (
          <a href={`tel:${cleanPhone(provider.phone)}`} className="rounded-xl py-3 text-center text-sm font-black no-underline" style={{ background: C.darkGreen, color: "#fff" }}>📞 Call {provider.phone}</a>
        )}
        {provider.website && (
          <a href={provider.website} target="_blank" rel="noreferrer" className="rounded-xl py-3 text-center text-sm font-black no-underline" style={{ background: C.midGreen, color: "#fff" }}>🌐 Visit Website</a>
        )}
        <a href={mapsUrl(provider.address)} target="_blank" rel="noreferrer" className="rounded-xl py-3 text-center text-sm font-black no-underline" style={{ background: C.brown, color: "#fff" }}>🗺️ Get Directions</a>
      </div>
    </div>
  );
}

export default function LocalMedical() {
  const [zip, setZip] = useState("");
  const [draftZip, setDraftZip] = useState("");
  const [editingZip, setEditingZip] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    base44.auth.me().then(user => {
      const saved = user?.local_medical_zip || "";
      setZip(saved);
      setDraftZip(saved);
      setEditingZip(!saved);
    });
  }, []);

  async function saveZip() {
    const clean = draftZip.trim();
    setZip(clean);
    setEditingZip(false);
    if (clean) await base44.auth.updateMe({ local_medical_zip: clean });
  }

  const showLocal = zip && isLocalZip(zip);
  const providers = useMemo(() => {
    const list = showLocal ? [...LOCAL_PROVIDERS, ...STATEWIDE_RESOURCES] : STATEWIDE_RESOURCES;
    return activeFilter === "All" ? list : list.filter(item => item.category === activeFilter);
  }, [showLocal, activeFilter]);

  const groupedProviders = useMemo(() => {
    return providers.reduce((groups, provider) => {
      groups[provider.category] = [...(groups[provider.category] || []), provider];
      return groups;
    }, {});
  }, [providers]);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-3 py-3" style={{ background: "#FFF7ED", borderBottom: "2px solid #FDBA74" }}>
        <div className="mx-auto grid max-w-[720px] grid-cols-2 gap-2 sm:grid-cols-4">
          <a href="tel:911" className="rounded-2xl px-2 py-4 text-center text-sm font-black no-underline shadow-lg" style={{ background: "#DC2626", color: "#fff" }}><span className="mb-1 block text-2xl">🚨</span>Call 911</a>
          <a href="tel:988" className="rounded-2xl px-2 py-4 text-center text-sm font-black no-underline shadow-lg" style={{ background: "#2563EB", color: "#fff" }}><span className="mb-1 block text-2xl">💙</span>Crisis Line 988</a>
          <a href="tel:211" className="rounded-2xl px-2 py-4 text-center text-sm font-black no-underline shadow-lg" style={{ background: "#16A34A", color: "#fff" }}><span className="mb-1 block text-2xl">📞</span>Call 211</a>
          <a href={`https://www.google.com/maps/search/urgent+care+near+${encodeURIComponent(zip || "me")}`} target="_blank" rel="noreferrer" className="rounded-2xl px-2 py-4 text-center text-sm font-black no-underline shadow-lg" style={{ background: "#F97316", color: "#fff" }}><span className="mb-1 block text-2xl">🏥</span>Find Urgent Care</a>
        </div>
      </div>

      <div className="px-4 py-3 text-center text-sm font-bold leading-relaxed" style={{ background: "#B42318", color: "#fff" }}>
        Emergency: Call 911 · Mental Health Crisis: Call or text 988 · Poison Control: <a href="tel:18002221222" style={{ color: "#fff", textDecoration: "underline" }}>1-800-222-1222</a>
      </div>

      <div className="sticky top-0 z-20 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          <Link to="/resource-library" className="rounded-xl p-2" style={{ background: "#ffffff18" }} aria-label="Back to Resource Library"><ChevronLeft size={20} color={C.cream} /></Link>
          <div className="flex-1">
            <h1 className="font-serif text-lg font-bold" style={{ color: C.cream }}>Local Medical Resources</h1>
            <p className="text-[11px] leading-snug" style={{ color: C.lightGreen }}>Find medical resources near you by zip code</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[720px] space-y-5 px-4 py-5 pb-24">
        <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          {editingZip ? (
            <div className="space-y-3 sm:flex sm:items-end sm:gap-2 sm:space-y-0">
              <div className="flex-1">
                <label className="mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}><MapPin size={15} color={C.midGreen} /> Enter your zip code to find medical resources near you.</label>
                <input value={draftZip} onChange={(e) => setDraftZip(e.target.value)} inputMode="numeric" placeholder="Zip code" className="w-full rounded-xl px-4 py-3 text-base font-bold" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
              </div>
              <button onClick={saveZip} className="w-full rounded-xl px-5 py-3 text-sm font-black sm:w-auto" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>Find Resources</button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold" style={{ color: C.mutedText }}>Showing resources near</p>
                <p className="text-2xl font-black" style={{ color: C.darkGreen }}>{zip}</p>
              </div>
              <button onClick={() => setEditingZip(true)} className="rounded-xl px-4 py-3 text-sm font-black" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>Edit Zip Code</button>
            </div>
          )}
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {FILTERS.map(filter => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-black whitespace-nowrap" style={{ background: activeFilter === filter ? C.darkGreen : C.white, color: activeFilter === filter ? "#fff" : C.darkGreen, border: `1px solid ${C.cream}` }}>{filter}</button>
          ))}
        </div>

        {zip && !showLocal && (
          <div className="rounded-2xl p-4" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}30` }}>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>We are still adding local providers for your area.</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Here are statewide resources that can help you find care near you.</p>
          </div>
        )}

        {!zip && (
          <div className="rounded-2xl p-5 text-center" style={{ background: C.white, border: `1.5px dashed ${C.midGreen}` }}>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Enter your zip code to organize local medical resources.</p>
          </div>
        )}

        {zip && Object.entries(groupedProviders).map(([category, items]) => (
          <section key={category} className="space-y-3">
            <h2 className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>{category}</h2>
            <div className="space-y-3">{items.map(provider => <ProviderCard key={`${provider.name}-${provider.category}`} provider={provider} />)}</div>
          </section>
        ))}

        <div className="rounded-2xl p-4 text-center" style={{ background: C.cream }}>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Know a provider we should add?</p>
          <a href="mailto:misty.stonerock88@gmail.com" className="mt-1 inline-flex text-sm font-black underline" style={{ color: C.brown }}>Email us at misty.stonerock88@gmail.com</a>
        </div>
      </main>
    </div>
  );
}