import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { MapPin, Search, ExternalLink, Phone, Globe, Loader2, X } from "lucide-react";

export default function LocalResources() {
  const [zip, setZip] = useState("");
  const [inputZip, setInputZip] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch() {
    const z = inputZip.trim();
    if (!/^\d{5}$/.test(z)) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setError(null);
    setLoading(true);
    setResults(null);
    setZip(z);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Find real local mental health and family support resources near ZIP code ${z}. 
Include:
- Community mental health centers
- Trauma-informed therapists or counseling centers
- Child welfare / CPS support organizations
- Family resource centers
- Domestic violence or crisis hotlines specific to this region
- Foster/adoptive family support groups
- Free or low-cost counseling services

For each resource provide: name, type (e.g. "Mental Health Center"), phone (if known), website (if known), and a 1-sentence description.
Return 6–10 results. If you don't have specific data for that ZIP, return resources for the broader city/state region.`,
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
                description: { type: "string" },
              }
            }
          }
        }
      }
    });

    setResults(response);
    setLoading(false);
  }

  function handleClear() {
    setZip("");
    setInputZip("");
    setResults(null);
    setError(null);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.midGreen}30` }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: C.darkGreen }}>
        <MapPin size={14} color={C.lightGreen} />
        <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Local Resources Near You</p>
      </div>

      <div className="p-4 space-y-3" style={{ background: C.white }}>
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          Enter your ZIP code to find mental health centers, family support services, and crisis resources in your area.
        </p>

        {/* ZIP input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={13} color={C.mutedText} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={inputZip}
              onChange={e => setInputZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="ZIP code (e.g. 74701)"
              maxLength={5}
              className="w-full rounded-xl pl-8 pr-3 py-2.5 text-sm font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || inputZip.length !== 5}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm flex-shrink-0"
            style={{
              background: inputZip.length === 5 ? C.darkGreen : C.cream,
              color: inputZip.length === 5 ? C.white : C.mutedText,
              border: "none", cursor: inputZip.length === 5 ? "pointer" : "default"
            }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {error && (
          <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>{error}</p>
        )}

        {/* Results */}
        {loading && (
          <div className="text-center py-8">
            <Loader2 size={24} className="animate-spin mx-auto mb-2" color={C.midGreen} />
            <p className="text-xs" style={{ color: C.mutedText }}>Finding local resources near {inputZip}…</p>
          </div>
        )}

        {results && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
                RESULTS FOR {results.location_label || zip}
              </p>
              <button onClick={handleClear} className="flex items-center gap-1 text-[10px] font-bold"
                style={{ background: "none", border: "none", color: C.mutedText, cursor: "pointer" }}>
                <X size={10} /> Clear
              </button>
            </div>

            {results.resources?.length === 0 && (
              <div className="text-center py-6 rounded-xl" style={{ background: C.offWhite }}>
                <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No results found</p>
                <p className="text-xs mt-1" style={{ color: C.mutedText }}>Try a nearby ZIP or a larger city ZIP.</p>
              </div>
            )}

            {results.resources?.map((r, i) => (
              <div key={i} className="rounded-xl p-3.5" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-snug" style={{ color: C.darkGreen }}>{r.name}</p>
                    {r.type && (
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 mb-1"
                        style={{ background: `${C.midGreen}18`, color: C.midGreen }}>
                        {r.type}
                      </span>
                    )}
                    <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{r.description}</p>
                  </div>
                </div>

                {(r.phone || r.website) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {r.phone && (
                      <a href={`tel:${r.phone.replace(/\D/g, "")}`}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: `${C.darkGreen}12`, color: C.darkGreen, textDecoration: "none" }}>
                        <Phone size={9} /> {r.phone}
                      </a>
                    )}
                    {r.website && (
                      <a href={r.website.startsWith("http") ? r.website : `https://${r.website}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: `${C.midGreen}12`, color: C.midGreen, textDecoration: "none" }}>
                        <Globe size={9} /> Visit Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}

            <p className="text-[10px] text-center pt-1" style={{ color: C.mutedText }}>
              Results are AI-generated. Always verify contact info before visiting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}