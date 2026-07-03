import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, ExternalLink, Globe, Phone, ShieldCheck } from "lucide-react";
import ResourceIssueReportForm from "@/components/resources/ResourceIssueReportForm";
import { C } from "@/lib/rooted-constants";
import { ROSS_ZIPS } from "@/components/hubs/ZipResourceNotice";

const FILTERS = ["All", "Food", "Housing", "Utilities", "Transportation", "Legal", "Veterans", "Social Security", "Mental Health", "Recovery", "Domestic Violence", "Parenting", "Schools", "Child Care", "Free Family Fun", "Medical", "Benefits", "Employment", "Clothing", "Crisis", "Youth Support", "Kinship/Foster Care", "Court Support"];

function daysSince(date) {
  if (!date) return 999;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function statusLabel(status) {
  if (status === "verified") return "Trusted / Verified";
  if (status === "broken_link") return "Broken Link";
  if (status === "user_reported_issue") return "User Reported Issue";
  if (status === "seasonal_event_based") return "Seasonal / Event-Based";
  return (status || "needs_review").replaceAll("_", " ");
}

export default function ChillicotheRossCountyHub({ zip, includeStatewide }) {
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [reporting, setReporting] = useState(null);

  useEffect(() => {
    setLoading(true);
    base44.entities.ResourceListing.filter({}, "name", 300).then(res => {
      setAllResources(res);
      setLoading(false);
    });
  }, []);

  const trimmedZip = (zip || "").trim();
  const isRossZip = !trimmedZip || ROSS_ZIPS.includes(trimmedZip);

  const localMatches = useMemo(() => {
    if (!trimmedZip) return allResources.filter(r => r.county === "Ross");
    return allResources.filter(r =>
      r.zip_code === trimmedZip ||
      (r.service_area_zips || []).includes(trimmedZip) ||
      (isRossZip && r.county === "Ross")
    );
  }, [allResources, trimmedZip, isRossZip]);

  const statewideMatches = useMemo(() => (
    allResources.filter(r => !r.county && !r.zip_code && (!r.service_area_zips || r.service_area_zips.length === 0))
  ), [allResources]);

  const noLocalMatches = !!trimmedZip && localMatches.length === 0;
  const showStatewide = includeStatewide || noLocalMatches;

  const combined = useMemo(() => {
    if (!showStatewide) return localMatches;
    const localIds = new Set(localMatches.map(r => r.id));
    return [...localMatches, ...statewideMatches.filter(r => !localIds.has(r.id))];
  }, [localMatches, statewideMatches, showStatewide]);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return combined;
    const needle = activeFilter.toLowerCase();
    return combined.filter(resource => `${resource.category} ${resource.tags?.join(" ")} ${resource.benefit_tags?.join(" ")}`.toLowerCase().includes(needle));
  }, [combined, activeFilter]);

  const heading = trimmedZip
    ? (isRossZip ? "Chillicothe & Ross County Resource Hub" : `Resources near ${trimmedZip}`)
    : "Chillicothe & Ross County Resource Hub";

  return (
    <section className="rounded-[28px] p-4 space-y-4" style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 18px 48px rgba(61,40,23,0.10)" }}>
      <div>
        <p className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: C.midGreen }}>LOCAL RESOURCES</p>
        <h2 className="font-serif font-bold text-xl mt-1" style={{ color: C.darkGreen }}>{heading}</h2>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: C.mutedText }}>Call or check official websites before going. Rooted 21 provides resource navigation, not legal, medical, benefits, or crisis services.</p>
      </div>

      <div className="rounded-2xl p-3 text-xs leading-6" style={{ background: "#FEF3EE", color: "#9A3412", border: "1px solid #F4C9B8" }}>
        <strong>Safety:</strong> If you are in immediate danger, call 911. For veteran crisis support, call 988 and Press 1. Rooted 21 does not need your Social Security number. Do not enter your full Social Security number into this app.
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(filter => (
          <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className="shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold" style={{ background: activeFilter === filter ? C.darkGreen : C.cream, color: activeFilter === filter ? "#fff" : C.darkGreen, border: "none" }}>
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="rounded-2xl p-4 text-center text-sm" style={{ background: C.cream, color: C.mutedText }}>Loading resources…</p>
      ) : (
        <div className="space-y-3">
          {noLocalMatches && (
            <p className="rounded-2xl p-4 text-center text-sm font-bold" style={{ background: "#FFFBEE", color: "#7A5200" }}>
              No local resources found yet. Try nearby counties or statewide resources.
            </p>
          )}
          {filtered.map(resource => {
            const stale = daysSince(resource.verified_at) > 60 || resource.verification_status !== "verified";
            return (
              <article key={resource.id} className="rounded-2xl overflow-hidden" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{resource.name}</p>
                      <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>{resource.city || (resource.county ? `${resource.county} County` : "Statewide")}{resource.county ? ` · ${statusLabel(resource.verification_status)}` : ` · ${statusLabel(resource.verification_status)}`}</p>
                    </div>
                    <span className="rounded-full px-2 py-1 text-[9px] font-black uppercase" style={{ background: stale ? "#FFFBEE" : `${C.midGreen}18`, color: stale ? "#7A5200" : C.midGreen }}>
                      {stale ? "Needs call-ahead" : "Verified"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-6" style={{ color: "#3a3028" }}>{resource.description_en}</p>
                  {stale && <p className="mt-2 rounded-xl p-2 text-[11px] font-bold" style={{ background: "#FFFBEE", color: "#7A5200" }}>This resource may need verification. Please call or check the official website before going.</p>}
                  <div className="mt-3 grid gap-1 text-[11px]" style={{ color: C.mutedText }}>
                    {resource.address && <p><strong>Address:</strong> {resource.address}</p>}
                    {resource.eligibility_notes && <p><strong>Eligibility:</strong> {resource.eligibility_notes}</p>}
                    {resource.cost && <p><strong>Cost:</strong> {resource.cost}</p>}
                    {resource.what_to_bring && <p><strong>Documents:</strong> {resource.what_to_bring}</p>}
                    {resource.transportation_notes && <p><strong>Transportation:</strong> {resource.transportation_notes}</p>}
                    {resource.accessibility_notes && <p><strong>Accessibility:</strong> {resource.accessibility_notes}</p>}
                    {resource.admin_notes && <p><strong>Safety/notes:</strong> {resource.admin_notes}</p>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {resource.phone && <a href={`tel:${resource.phone}`} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}><Phone size={12} className="mr-1" /> {resource.phone}</a>}
                    {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, textDecoration: "none" }}><Globe size={12} className="mr-1" /> Website <ExternalLink size={10} /></a>}
                    <button type="button" onClick={() => setReporting(reporting === resource.id ? null : resource.id)} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}><AlertTriangle size={12} className="mr-1" /> Report issue</button>
                  </div>
                </div>
                {reporting === resource.id && <ResourceIssueReportForm resource={resource} colors={{ panel: C.offWhite, border: C.cream, accent: C.darkGreen, button: C.darkGreen, buttonText: "#fff", muted: C.mutedText }} onClose={() => setReporting(null)} />}
              </article>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl p-3 text-[11px] leading-6" style={{ background: C.cream, color: C.mutedText }}>
        <ShieldCheck size={14} className="mr-1 inline" /> Rooted 21 does not replace attorneys, doctors, therapists, caseworkers, courts, emergency services, SSA, VA, or Job and Family Services.
      </div>
    </section>
  );
}