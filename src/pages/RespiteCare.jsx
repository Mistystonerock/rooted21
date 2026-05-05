import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import {
  ChevronLeft, Search, Phone, Mail, MapPin, Clock, CheckCircle2,
  Heart, Star, Filter, MessageCircle
} from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileRefresh from "@/components/mobile/MobileRefresh";

const EXPERTISE_TAGS = [
  "Trauma-Informed",
  "Foster Care",
  "Developmental Disabilities",
  "Infant/Toddler",
  "Ages 5–12",
  "Teen",
  "Behavioral Needs",
  "Medical Needs",
  "TBRI® Trained",
  "Bilingual",
];

const PROVIDERS = [
  {
    id: 1,
    name: "Sandra M.",
    title: "Certified Respite Care Provider",
    location: "Tulsa, OK",
    photo: "SM",
    rating: 4.9,
    reviews: 34,
    availability: ["Weekends", "Evenings"],
    expertise: ["Trauma-Informed", "Foster Care", "Ages 5–12", "TBRI® Trained"],
    bio: "Licensed foster parent and TBRI® practitioner with 12 years of experience supporting children from hard places. I provide a calm, structured, loving environment with predictable routines.",
    certifications: ["CPR/First Aid", "TBRI® Certified", "DHS Approved"],
    phone: "918-555-0142",
    email: "sandra.respite@rooted21.org",
    hourlyRate: "$18–22/hr",
    overnight: true,
    vetted: true,
  },
  {
    id: 2,
    name: "Marcus & Denise T.",
    title: "Respite Care Family",
    location: "Broken Arrow, OK",
    photo: "MT",
    rating: 5.0,
    reviews: 21,
    availability: ["Weekdays", "Weekends", "Overnight"],
    expertise: ["Trauma-Informed", "Behavioral Needs", "Teen", "Ages 5–12"],
    bio: "We are a two-parent household with therapeutic foster care experience. Our home is calm and pet-friendly. We specialize in teenagers who need structure and safety during caregiver recovery periods.",
    certifications: ["CPR/First Aid", "DHS Approved", "Therapeutic Foster Certified"],
    phone: "918-555-0287",
    email: "taylors.respite@rooted21.org",
    hourlyRate: "$20–25/hr",
    overnight: true,
    vetted: true,
  },
  {
    id: 3,
    name: "Rosa V.",
    title: "In-Home Respite Specialist",
    location: "Owasso, OK",
    photo: "RV",
    rating: 4.8,
    reviews: 19,
    availability: ["Weekdays", "Evenings"],
    expertise: ["Infant/Toddler", "Trauma-Informed", "Bilingual", "Medical Needs"],
    bio: "Bilingual (Spanish/English) care specialist with a background in early childhood development and medical foster care. I come to your home to reduce transitions for sensitive children.",
    certifications: ["CPR/First Aid", "Early Childhood Cert.", "DHS Approved"],
    phone: "918-555-0391",
    email: "rosa.respite@rooted21.org",
    hourlyRate: "$16–20/hr",
    overnight: false,
    vetted: true,
  },
  {
    id: 4,
    name: "James O.",
    title: "Community Respite Volunteer",
    location: "Claremore, OK",
    photo: "JO",
    rating: 4.7,
    reviews: 12,
    availability: ["Saturdays", "Evenings"],
    expertise: ["Trauma-Informed", "Foster Care", "Developmental Disabilities", "Ages 5–12"],
    bio: "Retired school counselor and program volunteer. I provide structured, calm respite for children with developmental differences and trauma histories. Short sessions (2–6 hours) preferred.",
    certifications: ["CPR/First Aid", "School Counselor (Ret.)", "TBRI® Trained"],
    phone: "918-555-0445",
    email: "james.respite@rooted21.org",
    hourlyRate: "Sliding scale / Volunteer",
    overnight: false,
    vetted: true,
  },
  {
    id: 6,
    name: "Ohio RISE",
    title: "Statewide Respite & Crisis Stabilization Program",
    location: "Ohio (Statewide)",
    photo: "OR",
    rating: 4.9,
    reviews: 0,
    availability: ["Weekdays", "Weekends", "Overnight"],
    expertise: ["Trauma-Informed", "Behavioral Needs", "Teen", "Ages 5–12", "Developmental Disabilities", "Foster Care"],
    bio: "Ohio RISE (Resilience through Integrated Systems and Excellence) provides intensive, community-based services including crisis stabilization and respite for children with complex behavioral health needs. Services are available to Medicaid-eligible youth statewide and are coordinated through each county's Care Management Entity (CME).",
    certifications: ["Ohio Medicaid Covered", "State-Certified", "Crisis Stabilization", "Care Coordination"],
    phone: "1-833-OH-RISE1",
    email: "ohiorise@medicaid.ohio.gov",
    website: "https://managedcare.medicaid.ohio.gov/ohio-rise",
    hourlyRate: "Medicaid / No Cost",
    overnight: true,
    vetted: true,
  },
  {
    id: 5,
    name: "Angela W.",
    title: "Certified Therapeutic Respite Provider",
    location: "Tulsa, OK",
    photo: "AW",
    rating: 4.9,
    reviews: 28,
    availability: ["Weekends", "Weekdays", "Overnight"],
    expertise: ["TBRI® Trained", "Trauma-Informed", "Behavioral Needs", "Teen", "Foster Care"],
    bio: "10 years providing therapeutic respite for families in the foster and adoption community. TBRI® trained and experienced with attachment-disordered children. Can work in your home or mine.",
    certifications: ["TBRI® Certified", "CPR/First Aid", "DHS Approved", "Mental Health First Aid"],
    phone: "918-555-0521",
    email: "angela.respite@rooted21.org",
    hourlyRate: "$22–28/hr",
    overnight: true,
    vetted: true,
  },
];

const AVAIL_COLORS = {
  Weekdays: C.midGreen,
  Weekends: C.brown,
  Evenings: C.gold,
  Overnight: "#5B8DB8",
  Saturdays: C.brown,
};

function ProviderCard({ provider, onView }) {
  return (
    <div
      className="rounded-2xl p-4 transition-all hover:shadow-md"
      style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base flex-shrink-0"
          style={{ background: C.darkGreen, color: C.cream }}
        >
          {provider.photo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{provider.name}</p>
            {provider.vetted && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${C.midGreen}18`, color: C.midGreen }}>
                <CheckCircle2 size={8} /> Vetted
              </span>
            )}
          </div>
          <p className="text-[11px]" style={{ color: C.mutedText }}>{provider.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={9} color={C.mutedText} />
            <p className="text-[10px]" style={{ color: C.mutedText }}>{provider.location}</p>
            <span style={{ color: C.cream }}>·</span>
            <Star size={9} color={C.gold} fill={C.gold} />
            <p className="text-[10px] font-bold" style={{ color: C.gold }}>{provider.rating}</p>
            <p className="text-[10px]" style={{ color: C.mutedText }}>({provider.reviews})</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] font-bold" style={{ color: C.brown }}>{provider.hourlyRate}</p>
          {provider.overnight && (
            <p className="text-[9px] mt-0.5" style={{ color: C.midGreen }}>Overnight ✓</p>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "#3a3028" }}>
        {provider.bio}
      </p>

      {/* Availability */}
      <div className="flex flex-wrap gap-1 mb-2">
        {provider.availability.map(a => (
          <span key={a} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${AVAIL_COLORS[a] || C.midGreen}18`, color: AVAIL_COLORS[a] || C.midGreen }}>
            <Clock size={8} className="inline mr-0.5" />{a}
          </span>
        ))}
      </div>

      {/* Expertise tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {provider.expertise.slice(0, 3).map(tag => (
          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full"
            style={{ background: C.cream, color: C.darkGreen }}>
            {tag}
          </span>
        ))}
        {provider.expertise.length > 3 && (
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: C.cream, color: C.mutedText }}>
            +{provider.expertise.length - 3} more
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={`tel:${provider.phone.replace(/\D/g, "")}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
          style={{ background: C.darkGreen, color: C.cream, textDecoration: "none" }}
        >
          <Phone size={12} /> Call
        </a>
        <a
          href={`mailto:${provider.email}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
          style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}
        >
          <Mail size={12} /> Email
        </a>
        <button
          onClick={() => onView(provider)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
          style={{ background: `${C.midGreen}18`, color: C.midGreen, border: "none", cursor: "pointer" }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

function ProviderProfile({ provider, onBack }) {
  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold"
        style={{ background: "none", border: "none", color: C.midGreen, cursor: "pointer" }}>
        <ChevronLeft size={14} /> Back to directory
      </button>

      {/* Hero */}
      <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0"
            style={{ background: "#ffffff20", color: C.cream }}>
            {provider.photo}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-serif font-bold text-base" style={{ color: C.cream }}>{provider.name}</p>
              {provider.vetted && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${C.midGreen}40`, color: C.lightGreen }}>
                  <CheckCircle2 size={8} /> Vetted
                </span>
              )}
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: C.lightGreen }}>{provider.title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={10} color={C.lightGreen} />
              <p className="text-[11px]" style={{ color: C.lightGreen }}>{provider.location}</p>
              <span style={{ color: `${C.lightGreen}60` }}>·</span>
              <Star size={10} color={C.gold} fill={C.gold} />
              <p className="text-[11px] font-bold" style={{ color: C.gold }}>{provider.rating} ({provider.reviews} reviews)</p>
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: C.cream }}>{provider.bio}</p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>RATE</p>
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{provider.hourlyRate}</p>
          {provider.overnight && <p className="text-[10px] mt-0.5" style={{ color: C.midGreen }}>Overnight available</p>}
        </div>
        <div className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>AVAILABILITY</p>
          <div className="flex flex-wrap gap-1">
            {provider.availability.map(a => (
              <span key={a} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${AVAIL_COLORS[a] || C.midGreen}18`, color: AVAIL_COLORS[a] || C.midGreen }}>
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expertise */}
      <div className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>AREAS OF EXPERTISE</p>
        <div className="flex flex-wrap gap-1.5">
          {provider.expertise.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: `${C.midGreen}15`, color: C.darkGreen }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>CERTIFICATIONS & CREDENTIALS</p>
        <div className="space-y-1.5">
          {provider.certifications.map(cert => (
            <div key={cert} className="flex items-center gap-2">
              <CheckCircle2 size={12} color={C.midGreen} />
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{cert}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl p-4 space-y-2.5" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
        <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>CONTACT {provider.name.split(" ")[0].toUpperCase()}</p>
        <a href={`tel:${provider.phone.replace(/\D/g, "")}`}
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: C.darkGreen, textDecoration: "none" }}>
          <Phone size={16} color={C.cream} />
          <div>
            <p className="text-xs font-bold" style={{ color: C.cream }}>Call Now</p>
            <p className="text-[10px]" style={{ color: C.lightGreen }}>{provider.phone}</p>
          </div>
        </a>
        <a href={`mailto:${provider.email}?subject=Respite Care Request — Rooted 21`}
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: C.cream, textDecoration: "none" }}>
          <Mail size={16} color={C.darkGreen} />
          <div>
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Send Email</p>
            <p className="text-[10px]" style={{ color: C.mutedText }}>{provider.email}</p>
          </div>
        </a>
      </div>
    </div>
  );
}

export default function RespiteCare() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const filtered = PROVIDERS.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.expertise.some(e => e.toLowerCase().includes(q)) ||
      p.availability.some(a => a.toLowerCase().includes(q));
    const matchFilter = !activeFilter || p.expertise.includes(activeFilter);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Respite Care Directory"
        subtitle="Vetted Providers · Short-Term Relief"
        backTo="/dashboard"
        rightSlot={
          <div className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: `${C.gold}30` }}>
            <Heart size={11} color={C.gold} />
            <span className="text-[10px] font-bold" style={{ color: C.gold }}>{PROVIDERS.length}</span>
          </div>
        }
      />

      <MobileRefresh onRefresh={async () => {}}>
      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {/* Intro banner */}
        <div className="rounded-xl p-3.5 flex gap-3 items-start"
          style={{ background: "#FFF8E8", border: `1px solid ${C.gold}` }}>
          <Heart size={16} color={C.gold} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold mb-0.5" style={{ color: C.brown }}>You deserve rest.</p>
            <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>
              All providers are background-checked and experienced with children from hard places.
              Short-term care so you can restore and return stronger.
            </p>
          </div>
        </div>

        {selectedProvider ? (
          <ProviderProfile provider={selectedProvider} onBack={() => setSelectedProvider(null)} />
        ) : (
          <>
            {/* Search */}
            <div className="relative">
              <Search size={14} color={C.mutedText} className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, location, or expertise…"
                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm font-sans"
                style={{ border: `1.5px solid ${C.cream}`, background: C.white }}
              />
            </div>

            {/* Filter chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFilter(null)}
                className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
                style={{
                  background: !activeFilter ? C.darkGreen : C.cream,
                  color: !activeFilter ? C.white : C.mutedText,
                  border: "none", cursor: "pointer",
                }}
              >
                <Filter size={9} /> All
              </button>
              {EXPERTISE_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
                  className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                  style={{
                    background: activeFilter === tag ? C.midGreen : C.cream,
                    color: activeFilter === tag ? C.white : C.mutedText,
                    border: "none", cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results count */}
            {(search || activeFilter) && (
              <p className="text-[11px]" style={{ color: C.mutedText }}>
                {filtered.length} provider{filtered.length !== 1 ? "s" : ""} found
              </p>
            )}

            {/* Provider cards */}
            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map(p => (
                  <ProviderCard key={p.id} provider={p} onView={setSelectedProvider} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
                <p className="text-2xl mb-2">🔍</p>
                <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No providers found</p>
                <p className="text-xs mt-1" style={{ color: C.mutedText }}>Try adjusting your search or clearing the filter.</p>
              </div>
            )}

            {/* Request section */}
            <div className="rounded-2xl p-4 text-center" style={{ background: C.darkGreen }}>
              <p className="font-serif font-bold text-sm mb-1" style={{ color: C.cream }}>Need someone not listed?</p>
              <p className="text-xs mb-3" style={{ color: C.lightGreen }}>
                Contact us to request a vetted provider in your area or to apply to become one.
              </p>
              <a
                href="mailto:rooted21@respite.org?subject=Respite Care Request"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: C.gold, color: C.darkGreen, textDecoration: "none" }}
              >
                <MessageCircle size={13} /> Contact Rooted 21
              </a>
            </div>
          </>
        )}

        <div className="pb-6" />
      </div>
      </MobileRefresh>
    </div>
  );
}