import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Sparkles, MapPin, Heart } from "lucide-react";

export default function PeerMatchPanel({ user }) {
  const [myProfile, setMyProfile] = useState(null);
  const [myChildren, setMyChildren] = useState([]);
  const [zipCode, setZipCode] = useState(user.zip_code || "");
  const [familyType, setFamilyType] = useState(user.family_type || "foster");
  const [childNeeds, setChildNeeds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const NEEDS = ["trauma", "FASD", "RAD", "sibling_group", "teens", "reunification", "adoption", "kinship", "court_involved", "IEP_school"];
  const FAMILY_TYPES = ["foster", "adoptive", "kinship", "biological"];

  useEffect(() => {
    base44.entities.ChildProfile.list("-created_date", 20).then(setMyChildren);
  }, []);

  async function findMatches() {
    setLoading(true);
    setSearched(true);

    // Get all community posts as a proxy for active parents
    const posts = await base44.entities.CommunityPost.list("-created_date", 500);

    // Use AI to suggest matching context
    const prompt = `I am a ${familyType} parent${zipCode ? ` in zip code ${zipCode}` : ""} 
    with children who have needs: ${childNeeds.join(", ") || "general trauma history"}.
    
    Based on these active community topics from other parents in the network, suggest 3-4 brief peer connection recommendations.
    Each suggestion should explain WHY connecting with someone who posted in that topic would help me.
    
    Topics active in the community: ${[...new Set(posts.map(p => p.topic))].join(", ")}
    
    Format as JSON array: [{"topic": "topic_key", "reason": "Why this connection matters", "conversation_starter": "A warm first message to send"}]`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                reason: { type: "string" },
                conversation_starter: { type: "string" }
              }
            }
          }
        }
      }
    });

    setMatches(result?.matches || []);
    setLoading(false);
  }

  const TOPIC_LABELS = {
    trauma_parenting: { label: "Trauma Parenting", emoji: "🧠" },
    foster_care: { label: "Foster Care", emoji: "🏠" },
    adoption: { label: "Adoption", emoji: "❤️" },
    kinship: { label: "Kinship Care", emoji: "👨‍👩‍👧" },
    court_system: { label: "Court & Legal", emoji: "⚖️" },
    school_iep: { label: "School & IEP", emoji: "🏫" },
    mental_health: { label: "Mental Health", emoji: "💙" },
    self_care: { label: "Caregiver Self-Care", emoji: "🌿" },
    wins: { label: "Wins", emoji: "🎉" },
    general: { label: "General", emoji: "💬" },
  };

  return (
    <div className="px-4 py-4 space-y-4">

      {/* Intro */}
      <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} color={C.gold} />
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Find Your People</p>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: C.lightGreen }}>
          Connect with parents who understand your specific journey — same challenges, same family situation, nearby location.
        </p>
      </div>

      {/* Match criteria */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>TELL US ABOUT YOUR SITUATION</p>

        <div>
          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>I AM A...</p>
          <div className="flex flex-wrap gap-1.5">
            {FAMILY_TYPES.map(t => (
              <button key={t} onClick={() => setFamilyType(t)}
                className="px-3 py-1.5 rounded-full text-xs font-bold capitalize"
                style={{
                  background: familyType === t ? C.darkGreen : C.offWhite,
                  color: familyType === t ? "#fff" : C.darkGreen,
                  border: `1px solid ${familyType === t ? C.darkGreen : C.cream}`,
                  cursor: "pointer",
                }}>
                {t} parent
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>MY CHILD'S NEEDS (select all that apply)</p>
          <div className="flex flex-wrap gap-1.5">
            {NEEDS.map(n => (
              <button key={n} onClick={() =>
                setChildNeeds(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{
                  background: childNeeds.includes(n) ? C.midGreen : C.offWhite,
                  color: childNeeds.includes(n) ? "#fff" : C.darkGreen,
                  border: `1px solid ${childNeeds.includes(n) ? C.midGreen : C.cream}`,
                  cursor: "pointer",
                }}>
                {n.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={14} color={C.mutedText} />
          <input
            value={zipCode}
            onChange={e => setZipCode(e.target.value)}
            placeholder="Your ZIP code (optional)"
            maxLength={5}
            className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />
        </div>

        <button onClick={findMatches} disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding matches…</>
          ) : (
            <><Sparkles size={15} /> Find My Peer Matches</>
          )}
        </button>
      </div>

      {/* Results */}
      {searched && !loading && matches.length === 0 && (
        <p className="text-center text-sm py-4" style={{ color: C.mutedText }}>No matches found yet — try adjusting your criteria.</p>
      )}

      {matches.map((match, i) => {
        const topic = TOPIC_LABELS[match.topic] || { label: match.topic, emoji: "💬" };
        return (
          <div key={i} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{topic.emoji}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{topic.label} Community</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Suggested peer group</p>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#3a3028" }}>{match.reason}</p>
            <div className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>💬 CONVERSATION STARTER</p>
              <p className="text-xs italic leading-relaxed" style={{ color: C.darkGreen }}>"{match.conversation_starter}"</p>
            </div>
            <a href={`/peer-support`}
              className="mt-3 block w-full py-2 rounded-xl font-bold text-xs text-center"
              style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
              Join the {topic.label} Discussion →
            </a>
          </div>
        );
      })}

      {/* Community values */}
      <div className="rounded-2xl p-4" style={{ background: C.cream }}>
        <p className="font-bold text-xs mb-2" style={{ color: C.darkGreen }}>🤝 Our Community Values</p>
        {["No judgment — we've all had hard days", "Anonymity respected always", "Trauma-informed conversations", "Grace over perfection"].map((v, i) => (
          <div key={i} className="flex gap-2 text-xs mb-1">
            <span style={{ color: C.midGreen }}>✓</span>
            <span style={{ color: C.darkGreen }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}