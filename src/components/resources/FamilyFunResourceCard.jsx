import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { AlertTriangle, ExternalLink, Flag, MapPin } from "lucide-react";

const REPORT_TYPES = [
  ["wrong_cost", "Wrong cost"],
  ["event_no_longer_available", "Event no longer available"],
  ["wrong_website", "Wrong website"],
  ["wrong_phone_number", "Wrong phone number"],
  ["not_actually_free", "Not actually free"],
  ["closed_location", "Closed location"],
  ["accessibility_concern", "Accessibility concern"],
  ["transportation_concern", "Transportation concern"],
  ["unsafe_or_outdated_information", "Unsafe or outdated information"]
];

function daysSince(date) {
  if (!date) return 999;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

export default function FamilyFunResourceCard({ resource, onReported }) {
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("wrong_cost");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const staleDays = daysSince(resource.verified_at);
  const needsVerification = staleDays > 60;

  async function submitReport() {
    setSaving(true);
    await base44.entities.ResourceReport.create({
      resource_id: resource.id,
      resource_name: resource.name,
      resource_county: resource.county || "",
      resource_category: "family_fun",
      report_type: reportType,
      details,
      status: "pending",
      reported_at: new Date().toISOString()
    });
    setSaving(false);
    setShowReport(false);
    setDetails("");
    onReported?.();
  }

  return (
    <article className="rounded-2xl border p-4" style={{ background: C.white, borderColor: C.cream }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.mutedText }}>{resource.activity_type || "Family activity"}</p>
          <h3 className="mt-1 font-serif text-lg font-bold leading-tight" style={{ color: C.darkGreen }}>{resource.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: C.mutedText }}><MapPin size={12} /> {resource.city || "Ohio"}{resource.county ? `, ${resource.county} County` : ""}{resource.zip_code ? ` · ${resource.zip_code}` : ""}</p>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-black" style={{ background: resource.verification_status === "verified" ? "#EAF4EA" : "#FEF3EE", color: resource.verification_status === "verified" ? "#2F7D32" : "#9A3412" }}>{resource.verification_status || "needs_review"}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed" style={{ color: "#3a3028" }}>{resource.description_en}</p>

      {needsVerification && (
        <div className="mt-3 flex gap-2 rounded-xl p-3 text-xs font-bold" style={{ background: "#FEF3EE", color: "#9A3412", border: "1px solid #F4C9B8" }}>
          <AlertTriangle size={15} className="flex-shrink-0" /> This resource may need verification. Please check the official website or call before going.
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <p><strong>Cost:</strong> {resource.cost || "Verify before going"}</p>
        <p><strong>Ages:</strong> {resource.age_range || "Family"}</p>
        <p><strong>Setting:</strong> {(resource.setting || "varies").replace("_", " /")}</p>
        <p><strong>Eligibility:</strong> {resource.eligibility_notes || "None listed"}</p>
        <p><strong>Bring:</strong> {resource.what_to_bring || "Check website"}</p>
        <p><strong>Phone:</strong> {resource.phone || "Not listed"}</p>
      </div>

      <div className="mt-3 space-y-1 text-xs" style={{ color: C.mutedText }}>
        <p><strong>Accessibility:</strong> {resource.accessibility_notes || "Check official site or call ahead."}</p>
        <p><strong>Transportation:</strong> {resource.transportation_notes || "Plan transportation before going."}</p>
        <p><strong>Last verified:</strong> {resource.verified_at ? new Date(resource.verified_at).toLocaleDateString() : "Not recorded"}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(resource.tags || []).slice(0, 10).map(tag => <span key={tag} className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: C.cream, color: C.darkGreen }}>{tag}</span>)}
        {(resource.benefit_tags || []).map(tag => <span key={tag} className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: "#EEF4FF", color: "#315E91" }}>{tag}</span>)}
      </div>

      <p className="mt-3 text-[11px] font-bold leading-relaxed" style={{ color: C.mutedText }}>Prices, hours, eligibility, and events may change. Please verify before going.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold no-underline" style={{ background: C.darkGreen, color: "#fff" }}><ExternalLink size={13} /> Official website</a>}
        {resource.events_url && <a href={resource.events_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold no-underline" style={{ background: C.cream, color: C.darkGreen }}><ExternalLink size={13} /> Events</a>}
        {resource.adventure_pass_url && <a href={resource.adventure_pass_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold no-underline" style={{ background: C.cream, color: C.darkGreen }}><ExternalLink size={13} /> Adventure Passes</a>}
        <button onClick={() => setShowReport(!showReport)} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold" style={{ background: "#FEF3EE", color: "#9A3412", border: "none" }}><Flag size={13} /> Report issue</button>
      </div>

      {showReport && (
        <div className="mt-3 rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
          <select value={reportType} onChange={event => setReportType(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
            {REPORT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <textarea value={details} onChange={event => setDetails(event.target.value)} placeholder="Optional details" className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" rows={3} style={{ borderColor: C.cream }} />
          <button onClick={submitReport} disabled={saving} className="mt-2 rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>{saving ? "Sending..." : "Send report"}</button>
        </div>
      )}
    </article>
  );
}