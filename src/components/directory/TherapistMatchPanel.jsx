import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Zap, Star, MapPin, Wifi, ChevronRight, RotateCcw, Shield, Phone, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const STRENGTH_STYLES = {
  "Strong Match": { bg: "#EAF4EA", color: C.midGreen, border: C.midGreen + "55", badge: "💚" },
  "Good Match":   { bg: "#FEF9EC", color: "#7A5200", border: "#E8C96A", badge: "💛" },
  "Possible Match": { bg: "#EEF4FB", color: "#5B8DB8", border: "#BDD0E8", badge: "💙" },
};

function MatchCard({ match }) {
  const [expanded, setExpanded] = useState(false);
  const pro = match.professional;
  const style = STRENGTH_STYLES[match.match_strength] || STRENGTH_STYLES["Possible Match"];

  if (!pro) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${style.border}`, background: "#fff" }}>
      {/* Match strength badge */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full"
          style={{ background: style.bg, color: style.color }}>
          {style.badge} {match.match_strength}
        </span>
        {pro.verified && (
          <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.midGreen }}>
            <Shield size={9} /> Verified
          </span>
        )}
      </div>

      {/* Pro header */}
      <div className="px-4 pb-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: C.cream, color: C.darkGreen }}>
          {pro.full_name?.[0] || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{pro.full_name}</p>
          <p className="text-[11px]" style={{ color: C.mutedText }}>{pro.title || pro.specialty}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {pro.location && (
              <span className="flex items-center gap-0.5 text-[10px]" style={{ color: C.mutedText }}>
                <MapPin size={9} /> {pro.location}
              </span>
            )}
            {pro.virtual_available && (
              <span className="flex items-center gap-0.5 text-[10px]" style={{ color: C.midGreen }}>
                <Wifi size={9} /> Virtual
              </span>
            )}
            {pro.rating && (
              <span className="flex items-center gap-0.5 text-[10px]" style={{ color: C.gold }}>
                <Star size={9} fill={C.gold} /> {pro.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI reasoning */}
      <div className="mx-4 mb-3 rounded-xl px-3 py-2.5" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
        <p className="text-[10px] font-extrabold mb-1" style={{ color: style.color }}>🧠 WHY THIS MATCH</p>
        <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>{match.why_this_match}</p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t text-left"
        style={{ background: C.offWhite, border: "none", borderTop: `1px solid ${C.cream}`, cursor: "pointer" }}>
        <span className="text-[11px] font-bold" style={{ color: C.darkGreen }}>
          {expanded ? "Hide details" : "See details & contact"}
        </span>
        <ChevronRight size={13} color={C.mutedText} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {expanded && (
        <div className="px-4 py-3 space-y-2">
          {pro.bio && <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{pro.bio}</p>}

          {pro.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pro.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: C.cream, color: C.darkGreen }}>{tag}</span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[10px]" style={{ color: C.mutedText }}>
            {pro.accepts_insurance && <span>✅ Accepts insurance</span>}
            {pro.offers_sliding_scale && <span>✅ Sliding scale</span>}
            {pro.years_experience && <span>📅 {pro.years_experience} yrs experience</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            {pro.email && (
              <a href={`mailto:${pro.email}`} className="flex items-center gap-2 text-xs font-bold rounded-xl px-3 py-2"
                style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}>
                <Phone size={12} /> Email {pro.full_name.split(" ")[0]}
              </a>
            )}
            {pro.website && (
              <a href={pro.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-xs font-bold rounded-xl px-3 py-2"
                style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
                <Globe size={12} /> Visit Website / Book
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TherapistMatchPanel({ daysLogged = 0 }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke("analyzeAndMatchTherapist", {});
    setLoading(false);
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      setResult(res.data);
    }
  }

  // Not enough data
  if (result && !result.ready) {
    return (
      <div className="rounded-2xl p-5" style={{ background: "#EEF4FB", border: "1.5px solid #BDD0E8" }}>
        <p className="text-2xl mb-2">📊</p>
        <p className="font-bold text-sm mb-1" style={{ color: "#5B8DB8" }}>Almost There</p>
        <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{result.message}</p>
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "#BDD0E8" }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (result.days_logged / 5) * 100)}%`, background: "#5B8DB8" }} />
        </div>
        <p className="text-[10px] mt-1" style={{ color: "#5B8DB8" }}>{result.days_logged} / 5 check-ins needed</p>
      </div>
    );
  }

  // Results
  if (result?.ready) {
    return (
      <div className="space-y-4">
        {/* Summary card */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm mb-1.5" style={{ color: C.cream }}>🧠 Your Family's Profile</p>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>{result.summary}</p>

          {result.focus_areas?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {result.focus_areas.map(area => (
                <span key={area} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", color: C.cream }}>
                  {area}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-lg font-extrabold" style={{ color: C.gold }}>{result.stats.days_logged}</p>
              <p className="text-[9px]" style={{ color: C.lightGreen }}>Days Logged</p>
            </div>
            <div className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-lg font-extrabold" style={{ color: C.gold }}>{result.stats.avg_child_regulation}</p>
              <p className="text-[9px]" style={{ color: C.lightGreen }}>Avg Regulation</p>
            </div>
            <div className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-lg font-extrabold" style={{ color: C.gold }}>{result.stats.behavior_logs}</p>
              <p className="text-[9px]" style={{ color: C.lightGreen }}>Behavior Logs</p>
            </div>
          </div>
        </div>

        {/* Matches */}
        {result.matches?.length > 0 ? (
          <>
            <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
              {result.matches.length} RECOMMENDED MATCH{result.matches.length > 1 ? "ES" : ""}
            </p>
            {result.matches.map((match, i) => (
              <MatchCard key={i} match={match} />
            ))}
          </>
        ) : (
          <div className="rounded-2xl p-5 text-center" style={{ background: C.cream }}>
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No Matches Found Yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>The professional directory may be empty. Check back as more providers join.</p>
            <Link to="/professional-directory" className="block mt-3 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
              Browse Directory →
            </Link>
          </div>
        )}

        {/* Next step */}
        {result.next_step && (
          <div className="rounded-xl p-3.5 flex gap-3" style={{ background: "#FEF9EC", border: "1px solid #E8C96A" }}>
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <p className="text-[10px] font-extrabold mb-0.5" style={{ color: "#7A5200" }}>YOUR NEXT STEP</p>
              <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{result.next_step}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setResult(null)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
          <RotateCcw size={13} /> Re-run Analysis
        </button>
      </div>
    );
  }

  // Default CTA
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
      <div className="p-4" style={{ background: C.darkGreen }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} color={C.gold} />
          <p className="font-bold text-sm" style={{ color: C.cream }}>AI Therapist Match</p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
          After logging daily activity, our AI analyzes your family's behavior patterns, triggers, and regulation scores — then matches you to the therapists in our network who can help most.
        </p>
      </div>

      <div className="p-4 space-y-3" style={{ background: "#fff" }}>
        <div className="space-y-2">
          {["📊 Analyzes 21 days of your check-ins & behavior logs", "🧠 Identifies your family's top triggers & patterns", "💚 Matches you to therapists by specialty & approach", "💬 Explains exactly WHY each therapist fits your needs"].map(item => (
            <div key={item} className="flex items-start gap-2">
              <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{item}</p>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FDECEC", color: "#C0392B" }}>{error}</p>
        )}

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
          style={{ background: loading ? C.midGreen + "88" : C.midGreen, color: "#fff", border: "none", cursor: loading ? "default" : "pointer" }}>
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing your family's data...
            </>
          ) : (
            <><Zap size={14} /> Analyze & Find My Match</>
          )}
        </button>
        <p className="text-[10px] text-center" style={{ color: C.mutedText }}>
          Uses your last 21 days of check-ins • Takes ~15 seconds
        </p>
      </div>
    </div>
  );
}