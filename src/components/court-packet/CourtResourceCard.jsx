import { base44 } from "@/api/base44Client";
import { ExternalLink, Flag } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CourtResourceCard({ resource }) {
  async function reportBrokenLink() {
    await base44.entities.ResourceReport.create({
      resource_name: resource.name,
      resource_county: resource.county,
      resource_category: "court_support",
      report_type: "broken_link",
      status: "pending",
      details: `Court Packet Helper report for ${resource.website}`,
      reported_at: new Date().toISOString(),
    });
    alert("Thank you. This court resource was sent to the verification queue.");
  }

  const stale = resource.verification_status !== "verified";

  return (
    <article className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>{resource.name}</p>
          <p className="mt-1 text-xs" style={{ color: C.mutedText }}>{resource.court_type} · {resource.county}, {resource.state}</p>
        </div>
        <span className="rounded-full px-2 py-1 text-[10px] font-black" style={{ background: stale ? "#fff7ed" : "#eaf4ea", color: stale ? "#9a3412" : C.darkGreen }}>{resource.verification_status}</span>
      </div>
      <div className="mt-3 space-y-1 text-xs leading-5" style={{ color: C.darkText }}>
        {resource.phone && <p><strong>Phone:</strong> {resource.phone}</p>}
        {resource.address && <p><strong>Address:</strong> {resource.address}</p>}
        <p><strong>Last verified:</strong> {resource.verified_at || "Needs verification before filing"}</p>
      </div>
      {stale && <p className="mt-3 rounded-2xl p-3 text-xs" style={{ background: "#fff7ed", color: "#9a3412" }}>This court resource may need verification. Please contact the court or legal aid before filing.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={resource.website} target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 text-xs font-bold no-underline" style={{ background: C.darkGreen, color: C.cream }}><ExternalLink size={13} className="mr-1" /> Official website</a>
        <button type="button" onClick={reportBrokenLink} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}><Flag size={13} className="mr-1" /> Report broken link</button>
      </div>
    </article>
  );
}