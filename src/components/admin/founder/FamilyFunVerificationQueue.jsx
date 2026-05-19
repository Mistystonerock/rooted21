import { base44 } from "@/api/base44Client";
import FounderMetric from "@/components/admin/founder/FounderMetric";

const DARK = "#5a3d28";
const GREEN = "#6b9d6e";
const CREAM = "#f5ede2";
const MUTED = "#8b6f54";

function daysSince(date) {
  if (!date) return 999;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

export default function FamilyFunVerificationQueue({ resourceListings = [], resourceReports = [], onRefresh }) {
  const activities = resourceListings.filter(item => item.category === "family_fun");
  const reports = resourceReports.filter(report => report.resource_category === "family_fun" || activities.some(item => item.id === report.resource_id));
  const reviewNeeded = activities.filter(item => daysSince(item.verified_at) > 60);
  const outdated = activities.filter(item => daysSince(item.verified_at) > 90 || item.verification_status === "outdated");
  const brokenLinks = reports.filter(report => ["wrong_website", "website_not_working", "broken_link"].includes(report.report_type));
  const changedPrices = reports.filter(report => ["wrong_cost", "not_actually_free", "changed_prices"].includes(report.report_type));
  const seasonal = activities.filter(item => item.seasonal || reports.some(report => report.resource_id === item.id && report.report_type === "seasonal_update_needed"));

  async function updateStatus(resource, status) {
    await base44.entities.ResourceListing.update(resource.id, {
      verification_status: status,
      verified_at: status === "verified" ? new Date().toISOString() : resource.verified_at
    });
    onRefresh?.();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FounderMetric label="Total activities" value={activities.length} detail="Free and low-cost fun" />
        <FounderMetric label="Verified activities" value={activities.filter(item => item.verification_status === "verified").length} detail="Current source check" />
        <FounderMetric label="60-day review" value={reviewNeeded.length} detail="Needs source check" />
        <FounderMetric label="Outdated" value={outdated.length} detail="90+ days or flagged" />
        <FounderMetric label="User issues" value={reports.filter(report => report.status === "pending").length} detail="Pending reports" />
        <FounderMetric label="Broken links" value={brokenLinks.length} detail="Website reports" />
        <FounderMetric label="Changed prices" value={changedPrices.length} detail="Cost/free concerns" />
        <FounderMetric label="Seasonal updates" value={seasonal.length} detail="Events needing update" />
      </div>

      <div className="space-y-2">
        {outdated.concat(reviewNeeded.filter(item => !outdated.some(old => old.id === item.id))).slice(0, 12).map(resource => (
          <div key={resource.id} className="rounded-2xl border p-4" style={{ borderColor: CREAM, background: "#faf6f1" }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold" style={{ color: DARK }}>{resource.name}</p>
                <p className="text-xs" style={{ color: MUTED }}>{resource.city || "Ohio"}{resource.county ? ` · ${resource.county} County` : ""} · Last verified {resource.verified_at ? new Date(resource.verified_at).toLocaleDateString() : "not recorded"}</p>
              </div>
              <select value={resource.verification_status || "needs_review"} onChange={event => updateStatus(resource, event.target.value)} className="rounded-xl border px-3 py-2 text-xs font-bold" style={{ borderColor: CREAM, color: DARK }}>
                <option value="verified">verified</option>
                <option value="needs_review">needs_review</option>
                <option value="outdated">outdated</option>
                <option value="archived">archived</option>
              </select>
            </div>
            {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold" style={{ color: GREEN }}>Open official website</a>}
          </div>
        ))}
      </div>
    </div>
  );
}