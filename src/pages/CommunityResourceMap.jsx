import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Loader2, RefreshCw } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import BottomNav from "@/components/rooted/BottomNav";
import ResourceCard from "@/components/resources/CommunityResourceCard";

const BG = "#0b1f12";
const CARD = "#12271a";
const BORDER = "rgba(255,255,255,0.08)";
const GREEN = "#3db870";
const GOLD = "#c9973a";
const TEXT = "#f0e8d8";
const MUTED = "rgba(240,232,216,0.55)";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🗺️" },
  { id: "therapist", label: "Therapists", emoji: "🧠" },
  { id: "support_group", label: "Support Groups", emoji: "🤝" },
  { id: "food_pantry", label: "Food Pantries", emoji: "🥫" },
  { id: "mental_health", label: "Mental Health", emoji: "💙" },
  { id: "crisis", label: "Crisis Lines", emoji: "🚨" },
  { id: "legal_aid", label: "Legal Aid", emoji: "⚖️" },
];

function mapTypeToCategory(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("therapist") || t.includes("trauma") || t.includes("counseling") || t.includes("counselor")) return "therapist";
  if (t.includes("support group") || t.includes("group") || t.includes("peer")) return "support_group";
  if (t.includes("food") || t.includes("pantry") || t.includes("hunger") || t.includes("nutrition")) return "food_pantry";
  if (t.includes("mental health") || t.includes("behavioral")) return "mental_health";
  if (t.includes("crisis") || t.includes("hotline") || t.includes("emergency")) return "crisis";
  if (t.includes("legal") || t.includes("attorney") || t.includes("law")) return "legal_aid";
  return "other";
}

export default function CommunityResourceMap() {
  const [user, setUser] = useState(null);
  const [zip, setZip] = useState("");
  const [inputZip, setInputZip] = useState("");
  const [results, setResults] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedResources, setSavedResources] = useState([]);
  const [activeTab, setActiveTab] = useState("search"); // "search" | "favorites"
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.SavedResource.filter({ owner_email: u.email }, "-created_date", 100)
          .then(setSavedResources);
      }
    }).catch(() => {});
  }, []);

  async function handleSearch() {
    const z = inputZip.trim();
    if (!/^\d{5}$/.test(z)) return;
    setLoading(true);
    setResults(null);
    setZip(z);
    setActiveCategory("all");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Find real local community resources near ZIP code ${z} for families involved with foster care, adoption, kinship care, or the child welfare system. Include a diverse mix of:
- Trauma-informed therapists and counseling centers (especially those accepting Medicaid/sliding scale)
- Peer support groups for foster, adoptive, and kinship parents
- Family food pantries and food assistance programs
- Community mental health centers
- Crisis hotlines specific to this region
- Legal aid organizations for family law / child welfare
- Family resource centers

For each resource provide: name, type (choose the most specific from: Trauma-Informed Therapist, Support Group, Food Pantry, Mental Health Center, Crisis Line, Legal Aid, Family Resource Center), phone (if known), website (if known), address or general area (city/neighborhood), and a 1-2 sentence plain-language description of who they serve and what they offer.

Return 10–15 results. If exact ZIP data is unavailable, return resources for the broader metro/county area.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          location_label: { type: "string" },
          resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                phone: { type: "string" },
                website: { type: "string" },
                address: { type: "string" },
                description: { type: "string" },
              }
            }
          }
        }
      }
    });

    // Normalize resource types
    const normalized = (response.resources || []).map(r => ({
      ...r,
      resource_type: mapTypeToCategory(r.type),
    }));

    setResults(normalized);
    setLocationLabel(response.location_label || z);
    setLoading(false);
  }

  function isSaved(resource) {
    return savedResources.find(s => s.resource_name === resource.name);
  }

  async function handleSave(resource) {
    if (!user) return;
    const data = {
      owner_email: user.email,
      resource_name: resource.name,
      resource_type: resource.resource_type || "other",
      phone: resource.phone || "",
      website: resource.website || "",
      address: resource.address || "",
      description: resource.description || "",
      zip_code: zip,
      location_label: locationLabel,
      is_favorite: true,
      contact_log: [],
    };
    const created = await base44.entities.SavedResource.create(data);
    setSavedResources(s => [...s, created]);
  }

  async function handleUnsave(resource) {
    const saved = isSaved(resource);
    if (!saved) return;
    setSavedResources(s => s.filter(r => r.id !== saved.id));
  }

  function handleContactLogged(savedId, updatedLog) {
    setSavedResources(s => s.map(r => r.id === savedId ? { ...r, contact_log: updatedLog } : r));
  }

  const displayedResults = results?.filter(r =>
    activeCategory === "all" || r.resource_type === activeCategory
  ) || [];

  const followUpItems = savedResources
    .flatMap(r => (r.contact_log || []).filter(c => c.follow_up_date && c.follow_up_date >= new Date().toISOString().split("T")[0]).map(c => ({ ...c, resource_name: r.resource_name, saved_id: r.id })))
    .sort((a, b) => a.follow_up_date.localeCompare(b.follow_up_date))
    .slice(0, 5);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "var(--font-sans)" }}>
      <MobileHeader title="Community Resource Map" subtitle="Therapists, support groups & pantries near you" backTo="/dashboard" />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px 16px 100px" }}>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: CARD, borderRadius: 14, padding: 4, marginBottom: 16, border: `1px solid ${BORDER}` }}>
          {[
            { id: "search", label: "🗺️ Find Resources" },
            { id: "favorites", label: `❤️ Saved (${savedResources.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "9px 6px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
              background: activeTab === tab.id ? GREEN : "transparent",
              color: activeTab === tab.id ? "#0b1f12" : MUTED,
              transition: "all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SEARCH TAB ── */}
        {activeTab === "search" && (
          <div className="space-y-4">
            {/* ZIP search */}
            <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 18, padding: "18px 16px" }}>
              <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: "1.1rem", color: TEXT, marginBottom: 6 }}>Find resources near you</p>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 14, lineHeight: 1.6 }}>Enter your zip code to find trauma-informed therapists, peer support groups, food pantries, and more.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <MapPin size={13} color={MUTED} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputZip}
                    onChange={e => setInputZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="ZIP code (e.g. 43215)"
                    maxLength={5}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: "11px 12px 11px 32px", color: "#fff", fontSize: 15, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || inputZip.length !== 5}
                  style={{ padding: "11px 18px", background: inputZip.length === 5 && !loading ? GREEN : `${GREEN}30`, border: "none", borderRadius: 12, color: inputZip.length === 5 && !loading ? "#0b1f12" : MUTED, fontWeight: 800, fontSize: 14, cursor: inputZip.length === 5 && !loading ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
                >
                  {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
                  {loading ? "Searching…" : "Search"}
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️</div>
                <p style={{ fontSize: 13, color: TEXT, fontWeight: 700 }}>Finding resources near {inputZip}…</p>
                <p style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Searching for therapists, support groups, pantries & more</p>
              </div>
            )}

            {/* Results */}
            {results && !loading && (
              <div>
                {/* Location header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.14em" }}>RESULTS NEAR</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{locationLabel}</p>
                  </div>
                  <button onClick={() => { setResults(null); setInputZip(""); }} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", color: MUTED, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    <RefreshCw size={11} style={{ display: "inline", marginRight: 4 }} />New Search
                  </button>
                </div>

                {/* Category filter */}
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 14, scrollbarWidth: "none" }}>
                  {CATEGORIES.map(cat => {
                    const count = cat.id === "all" ? results.length : results.filter(r => r.resource_type === cat.id).length;
                    if (cat.id !== "all" && count === 0) return null;
                    return (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                        flexShrink: 0, padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${activeCategory === cat.id ? GREEN : BORDER}`,
                        background: activeCategory === cat.id ? `${GREEN}18` : CARD,
                        color: activeCategory === cat.id ? GREEN : MUTED, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      }}>
                        {cat.emoji} {cat.label} {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Resource cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <AnimatePresence>
                    {displayedResults.map((r, i) => (
                      <motion.div key={r.name + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <ResourceCard
                          resource={r}
                          saved={isSaved(r)}
                          onSave={handleSave}
                          onUnsave={handleUnsave}
                          onContactLogged={handleContactLogged}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {displayedResults.length === 0 && (
                    <div style={{ textAlign: "center", padding: "24px", background: CARD, borderRadius: 14 }}>
                      <p style={{ fontSize: 13, color: MUTED }}>No {activeCategory !== "all" ? CATEGORIES.find(c => c.id === activeCategory)?.label : ""} results found.</p>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 10, color: MUTED, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
                  Results are AI-generated. Always verify contact info before visiting.
                </p>
              </div>
            )}

            {/* Empty state */}
            {!results && !loading && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { emoji: "🧠", label: "Trauma-Informed Therapists", desc: "Sliding scale & Medicaid accepted" },
                  { emoji: "🤝", label: "Foster Parent Support Groups", desc: "Connect with others who get it" },
                  { emoji: "🥫", label: "Family Food Pantries", desc: "No-question food assistance near you" },
                  { emoji: "⚖️", label: "Free Legal Aid", desc: "Family law & child welfare help" },
                ].map(item => (
                  <div key={item.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 12px" }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{item.emoji}</div>
                    <p style={{ fontWeight: 700, fontSize: 12, color: TEXT, marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FAVORITES TAB ── */}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            {/* Follow-up reminders */}
            {followUpItems.length > 0 && (
              <div style={{ background: `${GOLD}10`, border: `1.5px solid ${GOLD}30`, borderRadius: 16, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: "0.12em", marginBottom: 10 }}>📅 UPCOMING FOLLOW-UPS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {followUpItems.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{item.resource_name}</p>
                        <p style={{ fontSize: 11, color: MUTED }}>{item.outcome}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: `${GOLD}15`, padding: "3px 8px", borderRadius: 8, flexShrink: 0 }}>{item.follow_up_date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {savedResources.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", background: CARD, borderRadius: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>❤️</div>
                <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.1rem", color: TEXT, marginBottom: 8 }}>No saved resources yet</p>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>Search by ZIP and tap the heart icon to save providers and track your contact history.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {savedResources.map(r => (
                  <ResourceCard
                    key={r.id}
                    resource={{ ...r, name: r.resource_name }}
                    saved={r}
                    onSave={() => {}}
                    onUnsave={async () => {
                      await base44.entities.SavedResource.delete(r.id);
                      setSavedResources(s => s.filter(x => x.id !== r.id));
                    }}
                    onContactLogged={handleContactLogged}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}