import { C } from "@/lib/rooted-constants";
import { MapPin, Globe, Phone, Mail, Star, CheckCircle } from "lucide-react";

const SPECIALTY_META = {
  therapist:  { label: "Therapist",          color: C.gold,     emoji: "💛" },
  caseworker: { label: "Caseworker",          color: "#5B8DB8",  emoji: "📋" },
  coach:      { label: "Co-Parenting Coach",  color: C.midGreen, emoji: "🌱" },
  counselor:  { label: "Counselor",           color: C.brown,    emoji: "🤝" },
  advocate:   { label: "Advocate",            color: "#B84C2A",  emoji: "⚖️" },
  other:      { label: "Professional",        color: C.mutedText,emoji: "👤" },
};

export default function ProfessionalCard({ pro, onRequest, onBook }) {
  const meta = SPECIALTY_META[pro.specialty] || SPECIALTY_META.other;

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}
    >
      {/* Top row */}
      <div className="flex gap-3 items-start">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 font-bold"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          {pro.photo_url
            ? <img src={pro.photo_url} alt={pro.full_name} className="w-12 h-12 rounded-2xl object-cover" />
            : meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-bold text-sm leading-snug" style={{ color: C.darkGreen }}>{pro.full_name}</p>
            {pro.verified && (
              <CheckCircle size={13} color={C.midGreen} title="Verified by Rooted 21" />
            )}
          </div>
          <p className="text-[11px]" style={{ color: C.mutedText }}>{pro.title || meta.label}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full"
              style={{ background: `${meta.color}15`, color: meta.color }}>
              {meta.emoji} {meta.label}
            </span>
            {pro.rating && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: C.gold }}>
                <Star size={9} fill={C.gold} /> {pro.rating.toFixed(1)}
              </span>
            )}
            {pro.years_experience && (
              <span className="text-[10px]" style={{ color: C.mutedText }}>{pro.years_experience} yrs exp.</span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {pro.bio && (
        <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{pro.bio}</p>
      )}

      {/* Tags */}
      {pro.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {pro.tags.map(tag => (
            <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: C.cream, color: C.darkGreen }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Details row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {pro.location && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: C.mutedText }}>
            <MapPin size={9} /> {pro.location}
          </span>
        )}
        {pro.virtual_available && (
          <span className="text-[10px] font-bold" style={{ color: C.midGreen }}>💻 Virtual</span>
        )}
        {pro.accepts_insurance && (
          <span className="text-[10px] font-bold" style={{ color: C.brown }}>🛡️ Insurance</span>
        )}
        {pro.offers_sliding_scale && (
          <span className="text-[10px] font-bold" style={{ color: "#5B8DB8" }}>💲 Sliding scale</span>
        )}
      </div>

      {/* Contact links + Request button */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {pro.email && (
          <a href={`mailto:${pro.email}`} className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
            style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}>
            <Mail size={10} /> Email
          </a>
        )}
        {pro.phone && (
          <a href={`tel:${pro.phone}`} className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
            style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}>
            <Phone size={10} /> Call
          </a>
        )}
        {pro.website && (
          <a href={pro.website} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
            style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}>
            <Globe size={10} /> Website
          </a>
        )}
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={() => onBook && onBook(pro)}
            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg"
            style={{ background: C.midGreen, color: "#fff", border: "none", cursor: "pointer" }}
          >
            📅 Book Slot
          </button>
          <button
            onClick={() => onRequest(pro)}
            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
          >
            ✉️ Request
          </button>
        </div>
      </div>
    </div>
  );
}