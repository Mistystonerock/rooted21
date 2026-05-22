import { OFFICIAL_COURT_RESOURCES } from "@/lib/court-packet-data";
import { C } from "@/lib/rooted-constants";

export default function CourtResourceVerificationQueue({ resourceListings = [], resourceReports = [] }) {
  const courtListings = resourceListings.filter(resource => ["legal_aid", "court_support", "local_government"].includes(resource.category) || /court|legal|clerk|juvenile|probate/i.test(`${resource.name} ${resource.description_en || ""}`));
  const courtReports = resourceReports.filter(report => /court|legal|clerk|juvenile|probate|form/i.test(`${report.resource_name} ${report.details || ""} ${report.resource_category || ""}`));
  const staticNeedsReview = OFFICIAL_COURT_RESOURCES.filter(resource => resource.verification_status !== "verified");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border p-4" style={{ background: C.offWhite, borderColor: C.cream }}><p className="text-xs font-bold">Official court links</p><p className="text-2xl font-black">{OFFICIAL_COURT_RESOURCES.length}</p></div>
        <div className="rounded-2xl border p-4" style={{ background: C.offWhite, borderColor: C.cream }}><p className="text-xs font-bold">Court listings</p><p className="text-2xl font-black">{courtListings.length}</p></div>
        <div className="rounded-2xl border p-4" style={{ background: C.offWhite, borderColor: C.cream }}><p className="text-xs font-bold">User reports</p><p className="text-2xl font-black">{courtReports.filter(r => r.status === "pending").length}</p></div>
        <div className="rounded-2xl border p-4" style={{ background: C.offWhite, borderColor: C.cream }}><p className="text-xs font-bold">Need review</p><p className="text-2xl font-black">{staticNeedsReview.length}</p></div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {OFFICIAL_COURT_RESOURCES.map(resource => (
          <div key={resource.name} className="rounded-2xl border p-4 text-sm" style={{ borderColor: C.cream }}>
            <div className="flex justify-between gap-3"><p className="font-bold">{resource.name}</p><span className="text-xs">{resource.verification_status}</span></div>
            <p className="mt-1 text-xs" style={{ color: C.mutedText }}>{resource.court_type} · {resource.county}, {resource.state}</p>
            <p className="mt-2 text-xs">Last verified: {resource.verified_at} · Review every 60 days</p>
          </div>
        ))}
      </div>
      {courtReports.length > 0 && <div className="rounded-2xl border p-4" style={{ borderColor: C.cream }}><p className="mb-2 font-bold">Pending court-resource reports</p>{courtReports.slice(0, 6).map(report => <p key={report.id} className="text-xs">• {report.resource_name} — {report.report_type}</p>)}</div>}
    </div>
  );
}