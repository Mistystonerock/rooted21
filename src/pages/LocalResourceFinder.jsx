import { useState, useEffect, useCallback } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileRefresh from "@/components/mobile/MobileRefresh";
import {
  MapPin, Phone, Globe, Navigation, Search, AlertTriangle,
  Heart, Users, Loader2, ExternalLink, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";

// ── Always-available national crisis hotlines ─────────────────────────────
const NATIONAL_HOTLINES = [
  {
    id: "988",
    name: "988 Suicide & Crisis Lifeline",
    description: "Call or text for 24/7 crisis support. Free and confidential.",
    phone: "988",
    website: "https://988lifeline.org",
    type: "crisis",
    emoji: "🆘",
    alwaysShow: true,
  },
  {
    id: "ctext",
    name: "Crisis Text Line",
    description: "Text HOME to 741741 — free 24/7 support via text message.",
    phone: "741741",
    phoneLabel: "Text HOME to 741741",
    website: "https://www.crisistextline.org",
    type: "crisis",
    emoji: "💬",
    alwaysShow: true,
  },
  {
    id: "samhsa",
    name: "SAMHSA Helpline",
    description: "Free, confidential treatment referrals 24/7. En Español available.",
    phone: "18006624357",
    phoneLabel: "1-800-662-4357",
    website: "https://www.samhsa.gov/find-help/national-helpline",
    type: "crisis",
    emoji: "🏥",
    alwaysShow: true,
  },
  {
    id: "childhelp",
    name: "Childhelp National Abuse Hotline",
    description: "24/7 support for child abuse situations. Crisis counselors available.",
    phone: "18004224453",
    phoneLabel: "1-800-422-4453",
    website: "https://www.childhelp.org/hotline",
    type: "crisis",
    emoji: "🛡️",
    alwaysShow: true,
  },
  {
    id: "nami",
    name: "NAMI HelpLine",
    description: "Mon–Fri 10am–10pm ET. Information, referrals, and support.",
    phone: "18009506264",
    phoneLabel: "1-800-950-6264",
    website: "https://www.nami.org/help",
    type: "support",
    emoji: "🤝",
    alwaysShow: true,
  },
];

// ── Community support resources by state (curated) ────────────────────────
const STATE_RESOURCES = {
  OK: [
    { name: "Oklahoma Family Network", phone: "14054634851", phoneLabel: "1-405-463-4851", website: "https://www.okfamilynetwork.org", type: "support", description: "Family-driven support for children with mental/behavioral health needs." },
    { name: "Oklahoma 2-1-1", phone: "211", website: "https://www.211oklahoma.org", type: "support", description: "Statewide resource referral line for mental health, housing, food, and more." },
    { name: "Youth Crisis Center (Tulsa)", phone: "19185839988", phoneLabel: "1-918-583-9988", website: "https://www.turningpointok.org", type: "crisis", description: "24/7 crisis shelter and intervention for youth in Tulsa area." },
  ],
  OH: [
    { name: "Ohio RISE", phone: "18336474731", phoneLabel: "1-833-647-4731", website: "https://managedcare.medicaid.ohio.gov/ohio-rise", type: "support", description: "Statewide care coordination, intensive services, and crisis stabilization for eligible Ohio youth." },
    { name: "Ohio 2-1-1", phone: "211", website: "https://oh211.org", type: "support", description: "Statewide helpline connecting Ohioans to food, housing, mental health, utilities, transportation, and local services." },
    { name: "OCECD — Ohio IEP Support", phone: "18443822604", phoneLabel: "1-844-382-2604", website: "https://www.ocecd.org", type: "support", description: "Ohio Coalition for the Education of Children with Disabilities. IEP, special education rights, parent mentoring, and school advocacy support." },
    { name: "OhioKAN Kinship & Adoption Navigator", phone: "18446446526", phoneLabel: "1-844-OHIO-KAN", website: "https://ohiokan.jfs.ohio.gov", type: "support", description: "Connections and navigation support for kinship and adoptive families across Ohio." },
    { name: "Disability Rights Ohio", phone: "18002809182", phoneLabel: "1-800-282-9181", website: "https://www.disabilityrightsohio.org", type: "support", description: "Protection and advocacy organization for Ohioans with disabilities, including education and access rights." },
    { name: "Ohio Legal Help", website: "https://www.ohiolegalhelp.org", type: "support", description: "Free legal information and referrals for Ohio families navigating court, custody, housing, benefits, and protection orders." },
  ],
  TX: [
    { name: "Texas 2-1-1", phone: "211", website: "https://www.211texas.org", type: "support", description: "Free, confidential social services referral for Texans." },
    { name: "MHMR of Tarrant County", phone: "18006246461", phoneLabel: "1-800-624-6461", website: "https://www.mhmrtc.org", type: "crisis", description: "24/7 mental health crisis line for Tarrant County." },
  ],
  CA: [
    { name: "CalHOPE Warm Line", phone: "18339003446", phoneLabel: "1-833-900-3446", website: "https://www.calhope.org", type: "support", description: "Emotional support line for Californians. Not a crisis line." },
    { name: "California 2-1-1", phone: "211", website: "https://www.211ca.org", type: "support", description: "Local services referral across California." },
  ],
  FL: [
    { name: "Florida 2-1-1", phone: "211", website: "https://www.211florida.org", type: "support", description: "Statewide helpline for Florida residents." },
    { name: "Guidance Care Center (FL Keys)", phone: "13058520323", phoneLabel: "1-305-852-0323", website: "https://www.guidancecare.com", type: "crisis", description: "Mental health and substance abuse crisis services." },
  ],
};

// ── Geocode user location via browser API ────────────────────────────────
function useGeolocation() {
  const [location, setLocation] = useState(null); // { lat, lng, city, state }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Reverse geocode with a free API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const state = data.address?.state || "";
          const stateCode = data.address?.["ISO3166-2-lvl4"]?.split("-")[1] || "";
          const postcode = data.address?.postcode || "";
          setLocation({ lat, lng, city, state, stateCode, postcode });
        } catch {
          setLocation({ lat, lng, city: "", state: "", stateCode: "", postcode: "" });
        }
        setLoading(false);
      },
      (err) => {
        setError("Could not detect location. Please allow location access and try again.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  return { location, error, loading, detect };
}

// ── Build a Google Maps search URL for nearby mental health centers ───────
function mapsUrl(lat, lng, query) {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lng},13z`;
}

// ── Resource card ─────────────────────────────────────────────────────────
function ResourceCard({ resource, highlight }) {
  const [expanded, setExpanded] = useState(false);

  const typeColor = {
    crisis: "#B84C2A",
    support: C.midGreen,
  }[resource.type] || C.brown;

  const typeBg = {
    crisis: "#FEF3EE",
    support: `${C.midGreen}12`,
  }[resource.type] || C.cream;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: C.white,
        border: `1.5px solid ${highlight ? typeColor : C.cream}`,
        boxShadow: highlight ? `0 0 0 1px ${typeColor}30` : "none",
      }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-3 p-4 text-left"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>{resource.emoji || (resource.type === "crisis" ? "🆘" : "🤝")}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{resource.name}</p>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
              style={{ background: typeBg, color: typeColor }}
            >
              {resource.type}
            </span>
          </div>
          <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: C.mutedText }}>
            {resource.description}
          </p>
        </div>
        {expanded
          ? <ChevronUp size={14} color={C.mutedText} className="flex-shrink-0 mt-0.5" />
          : <ChevronDown size={14} color={C.mutedText} className="flex-shrink-0 mt-0.5" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{resource.description}</p>
          <div className="flex gap-2 flex-wrap">
            {resource.phone && (
              <a
                href={`tel:${resource.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: typeColor, color: "#fff", textDecoration: "none" }}
              >
                <Phone size={12} /> {resource.phoneLabel || resource.phone}
              </a>
            )}
            {resource.website && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}
              >
                <Globe size={12} /> Website <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Nearby search button (opens Google Maps) ──────────────────────────────
function NearbySearchCard({ location, label, query, icon: Icon, color }) {
  const url = mapsUrl(location.lat, location.lng, query);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:shadow-md"
      style={{ background: C.white, border: `1.5px solid ${C.cream}`, textDecoration: "none" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={18} color={color} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{label}</p>
        <p className="text-[11px]" style={{ color: C.mutedText }}>Opens Google Maps near you</p>
      </div>
      <ExternalLink size={13} color={C.mutedText} />
    </a>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function LocalResourceFinder() {
  const { location, error: geoError, loading: geoLoading, detect } = useGeolocation();
  const [manualState, setManualState] = useState("");
  const [activeTab, setActiveTab] = useState("crisis");

  // Auto-detect on first load
  useEffect(() => { detect(); }, []);

  const stateCode = location?.stateCode || manualState.toUpperCase();
  const stateResources = STATE_RESOURCES[stateCode] || [];

  const crisisHotlines = NATIONAL_HOTLINES.filter(r => r.type === "crisis");
  const supportLines = NATIONAL_HOTLINES.filter(r => r.type === "support");
  const localCrisis = stateResources.filter(r => r.type === "crisis");
  const localSupport = stateResources.filter(r => r.type === "support");

  const TABS = [
    { id: "crisis", label: "🆘 Crisis Lines", count: crisisHotlines.length + localCrisis.length },
    { id: "support", label: "🤝 Support", count: supportLines.length + localSupport.length },
    { id: "nearby", label: "📍 Near Me", count: null },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Local Resources"
        subtitle="Crisis Lines · Support Groups · Near You"
        backTo="/dashboard"
      />

      <MobileRefresh onRefresh={async () => { detect(); }}>
        <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">

          {/* ── EMERGENCY BANNER ── */}
          <div
            className="rounded-xl p-3.5 flex items-start gap-2.5"
            style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}
          >
            <AlertTriangle size={15} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: "#B84C2A" }}>
              <strong>Immediate danger?</strong> Call <strong>911</strong> now.
              {" "}For mental health crisis, call or text <strong>988</strong> — free, 24/7.
            </p>
          </div>

          {/* ── LOCATION CARD ── */}
          <div
            className="rounded-2xl p-4"
            style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} color={C.midGreen} />
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Your Location</p>
            </div>

            {geoLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" color={C.midGreen} />
                <p className="text-xs" style={{ color: C.mutedText }}>Detecting location…</p>
              </div>
            ) : location ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
                    {location.city ? `${location.city}, ` : ""}{location.state || location.stateCode}
                  </p>
                  {location.postcode && (
                    <p className="text-[11px]" style={{ color: C.mutedText }}>ZIP: {location.postcode}</p>
                  )}
                </div>
                <button
                  onClick={detect}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
                >
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {geoError && (
                  <p className="text-[11px]" style={{ color: "#B84C2A" }}>{geoError}</p>
                )}
                <button
                  onClick={detect}
                  className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl text-xs font-bold"
                  style={{ background: C.darkGreen, color: C.cream, border: "none", cursor: "pointer" }}
                >
                  <Navigation size={13} /> Detect My Location
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: C.cream }} />
                  <p className="text-[10px]" style={{ color: C.mutedText }}>or enter state manually</p>
                  <div className="flex-1 h-px" style={{ background: C.cream }} />
                </div>
                <input
                  value={manualState}
                  onChange={e => setManualState(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="State code (e.g. OK)"
                  maxLength={2}
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-center font-bold tracking-widest"
                  style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, color: C.darkGreen }}
                />
              </div>
            )}
          </div>

          {/* ── TABS ── */}
          <div className="flex gap-1.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: activeTab === tab.id ? C.darkGreen : C.cream,
                  color: activeTab === tab.id ? C.cream : C.mutedText,
                  border: "none", cursor: "pointer",
                }}
              >
                {tab.label}
                {tab.count != null && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-full text-[9px]"
                    style={{
                      background: activeTab === tab.id ? "#ffffff30" : C.darkGreen + "20",
                      color: activeTab === tab.id ? C.cream : C.darkGreen,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── CRISIS LINES TAB ── */}
          {activeTab === "crisis" && (
            <div className="space-y-2">
              {localCrisis.length > 0 && (
                <>
                  <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
                    📍 LOCAL — {location?.state || stateCode}
                  </p>
                  {localCrisis.map(r => (
                    <ResourceCard key={r.name} resource={r} highlight />
                  ))}
                  <p className="text-[10px] font-extrabold tracking-wider mt-3" style={{ color: C.mutedText }}>
                    🌎 NATIONAL
                  </p>
                </>
              )}
              {crisisHotlines.map(r => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}

          {/* ── SUPPORT TAB ── */}
          {activeTab === "support" && (
            <div className="space-y-2">
              {localSupport.length > 0 && (
                <>
                  <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
                    📍 LOCAL — {location?.state || stateCode}
                  </p>
                  {localSupport.map(r => (
                    <ResourceCard key={r.name} resource={r} highlight />
                  ))}
                  <p className="text-[10px] font-extrabold tracking-wider mt-3" style={{ color: C.mutedText }}>
                    🌎 NATIONAL
                  </p>
                </>
              )}
              {supportLines.map(r => (
                <ResourceCard key={r.id} resource={r} />
              ))}

              {/* Community support tip */}
              <div
                className="rounded-xl p-3.5 flex items-start gap-2.5 mt-2"
                style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` }}
              >
                <Heart size={14} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
                  <strong>Tip:</strong> Type your ZIP code on{" "}
                  <a href="https://www.nami.org/Support-Education/Support-Groups" target="_blank" rel="noopener noreferrer" style={{ color: C.midGreen, textDecoration: "underline" }}>
                    NAMI.org
                  </a>{" "}
                  to find a free local support group near you.
                </p>
              </div>
            </div>
          )}

          {/* ── NEAR ME TAB ── */}
          {activeTab === "nearby" && (
            <div className="space-y-3">
              {!location ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}
                >
                  <Navigation size={28} color={C.midGreen} className="mx-auto mb-3" />
                  <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>
                    Location needed
                  </p>
                  <p className="text-xs mb-4" style={{ color: C.mutedText }}>
                    Allow location access to find centers near you.
                  </p>
                  <button
                    onClick={detect}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: C.darkGreen, color: C.cream, border: "none", cursor: "pointer" }}
                  >
                    <Navigation size={12} className="inline mr-1.5" /> Detect My Location
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[11px]" style={{ color: C.mutedText }}>
                    Showing options near <strong>{location.city || location.state}</strong>. Tapping opens Google Maps.
                  </p>

                  <NearbySearchCard
                    location={location}
                    label="Emergency Mental Health Centers"
                    query="emergency mental health center near me"
                    icon={AlertTriangle}
                    color="#B84C2A"
                  />
                  <NearbySearchCard
                    location={location}
                    label="Community Mental Health Clinics"
                    query="community mental health clinic near me"
                    icon={Heart}
                    color={C.midGreen}
                  />
                  <NearbySearchCard
                    location={location}
                    label="Behavioral Health Hospitals"
                    query="behavioral health hospital near me"
                    icon={MapPin}
                    color={C.brown}
                  />
                  <NearbySearchCard
                    location={location}
                    label="Trauma-Informed Therapists"
                    query="trauma-informed therapist near me"
                    icon={Users}
                    color={C.gold}
                  />
                  <NearbySearchCard
                    location={location}
                    label="Child & Family Support Centers"
                    query="child family support center near me"
                    icon={Heart}
                    color="#5B8DB8"
                  />
                  <NearbySearchCard
                    location={location}
                    label="Substance Abuse Treatment Centers"
                    query="substance abuse treatment center near me"
                    icon={Search}
                    color={C.mutedText}
                  />

                  {/* SAMHSA locator */}
                  <a
                    href={`https://findtreatment.gov/?sAddr=${location.postcode || `${location.lat},${location.lng}`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl p-4"
                    style={{ background: C.darkGreen, textDecoration: "none" }}
                  >
                    <Globe size={18} color={C.gold} />
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: C.cream }}>SAMHSA Treatment Locator</p>
                      <p className="text-[11px]" style={{ color: C.lightGreen }}>Official federal database of treatment facilities</p>
                    </div>
                    <ExternalLink size={13} color={C.lightGreen} />
                  </a>
                </>
              )}
            </div>
          )}

          {/* ── FOOTER NOTE ── */}
          <div
            className="rounded-xl p-3.5 text-center"
            style={{ background: C.cream }}
          >
            <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
              Resources are verified but may change. Always call ahead to confirm availability.
              In immediate danger, call <strong style={{ color: "#B84C2A" }}>911</strong>.
            </p>
          </div>

          <div className="pb-6" />
        </div>
      </MobileRefresh>
    </div>
  );
}