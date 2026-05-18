import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import ResourceEditor from "@/components/resources-admin/ResourceEditor";
import ResourceFilters from "@/components/resources-admin/ResourceFilters";
import ResourceListingCard from "@/components/resources-admin/ResourceListingCard";
import { emptyResource, resourceSortScore } from "@/components/resources-admin/resourceAdminUtils";
import { Database, Plus, RefreshCw } from "lucide-react";

export default function ResourceManagement() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", county: "all", category: "all", status: "all" });
  const [reports, setReports] = useState([]);
  const [permissions, setPermissions] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    const [rows, reportRows, permissionRows] = await Promise.all([
      base44.entities.ResourceListing.list("-updated_date", 1000),
      ["admin", "founder"].includes(me?.role) ? base44.entities.ResourceReport.list("-reported_at", 500) : Promise.resolve([]),
      me?.role === "admin" ? base44.entities.AdminPermissions.filter({ admin_email: me.email, is_active: true }, "-created_date", 1) : Promise.resolve([])
    ]);
    setResources(rows);
    setReports(reportRows);
    setPermissions(permissionRows[0] || null);
    setLoading(false);
  }

  const canManage = ["admin", "founder"].includes(user?.role);
  const assignedCounties = permissions?.assigned_counties || [];
  const manageableResources = user?.role === "founder" ? resources : resources.filter(resource => !assignedCounties.length || assignedCounties.includes(resource.county));
  const counties = useMemo(() => [...new Set(manageableResources.map(r => r.county).filter(Boolean))].sort(), [manageableResources]);
  const filtered = manageableResources.filter(resource => {
    const text = `${resource.name} ${resource.county} ${resource.category} ${resource.description_en}`.toLowerCase();
    const matchesSearch = !filters.search || text.includes(filters.search.toLowerCase());
    const matchesCounty = filters.county === "all" || resource.county === filters.county;
    const matchesCategory = filters.category === "all" || resource.category === filters.category;
    const matchesStatus = filters.status === "all" || (filters.status === "crisis" ? resource.crisis_priority : resource.verification_status === filters.status);
    return matchesSearch && matchesCounty && matchesCategory && matchesStatus;
  }).sort((a, b) => resourceSortScore(a) - resourceSortScore(b));

  async function saveListing(e) {
    e.preventDefault();
    setSaving(true);
    const data = { ...form };
    if (data.verification_status === "verified") {
      data.verified_at = new Date().toISOString();
      data.verified_by = user.email;
    }
    if (data.verification_status === "archived") {
      data.archived_at = new Date().toISOString();
    }
    const response = await base44.functions.invoke("updateResourceListing", { resourceId: form.id || null, data });
    const saved = response.data.resource;
    setResources(prev => form.id ? prev.map(r => r.id === saved.id ? saved : r) : [saved, ...prev]);
    setForm(null);
    setSaving(false);
  }

  async function approve(resource) {
    const response = await base44.functions.invoke("updateResourceListing", { resourceId: resource.id, data: { ...resource, verification_status: "verified", verified_at: new Date().toISOString(), verified_by: user.email } });
    const updated = response.data.resource;
    setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
  }

  async function archive(resource) {
    const response = await base44.functions.invoke("updateResourceListing", { resourceId: resource.id, data: { ...resource, verification_status: "archived", archived_at: new Date().toISOString() } });
    const updated = response.data.resource;
    setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
  }

  async function reviewReport(report, status) {
    const updated = await base44.entities.ResourceReport.update(report.id, {
      status,
      reviewed_by: user.email,
      reviewed_at: new Date().toISOString()
    });
    setReports(prev => prev.map(item => item.id === updated.id ? updated : item));
  }

  function exportResourceReport() {
    const summary = {
      exported_at: new Date().toISOString(),
      total_resources: resources.length,
      verified: resources.filter(r => r.verification_status === "verified").length,
      needs_review: resources.filter(r => r.verification_status === "needs_review").length,
      outdated: resources.filter(r => r.verification_status === "outdated").length,
      closed: resources.filter(r => r.verification_status === "closed").length,
      pending_reports: reports.filter(r => r.status === "pending").length,
      resources: resources.map(r => ({ name: r.name, county: r.county, category: r.category, status: r.verification_status, last_verified: r.verified_at || "never", verified_by: r.verified_by || "" }))
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rooted21-resource-health-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!loading && !canManage) {
    return <div className="min-h-screen bg-stone-50"><MobileHeader title="Resource Management" backTo="/founder-dashboard" /><div className="mx-auto max-w-md p-6 text-center"><p className="font-bold">Admin access required.</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <MobileHeader title="Statewide Resource Database" subtitle="Admin verification, multilingual listings & stale-resource review" backTo="/founder-dashboard" />
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5 pb-24">
        <section className="rounded-3xl bg-green-900 p-5 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><Database className="mr-2 h-4 w-4" /> Ohio statewide support directory</div>
              <h1 className="text-2xl font-black">Resource Management System</h1>
              <p className="mt-2 text-sm text-white/80">Review stale listings, approve updates, archive outdated resources, and maintain county-filtered multilingual support records.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.role === "founder" && <button onClick={exportResourceReport} className="rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white">Export report</button>}
              <button onClick={() => setForm(emptyResource(user?.email))} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-green-900"><Plus className="mr-2 h-4 w-4" /> New resource</button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Total</p><p className="text-2xl font-black">{manageableResources.length}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Verified</p><p className="text-2xl font-black">{manageableResources.filter(r => r.verification_status === "verified").length}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Needs review</p><p className="text-2xl font-black">{manageableResources.filter(r => ["needs_review", "outdated"].includes(r.verification_status)).length}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Closed</p><p className="text-2xl font-black">{manageableResources.filter(r => r.verification_status === "closed").length}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Pending reports</p><p className="text-2xl font-black">{reports.filter(r => r.status === "pending").length}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Emergency</p><p className="text-2xl font-black">{manageableResources.filter(r => r.crisis_priority || r.emergency_availability || r.verification_status === "emergency_only").length}</p></div>
          <button onClick={load} className="rounded-2xl border bg-white p-4 text-left"><p className="text-xs font-bold text-stone-500">Refresh</p><p className="inline-flex items-center text-sm font-black"><RefreshCw className="mr-2 h-4 w-4" /> Reload</p></button>
        </div>

        {reports.filter(report => report.status === "pending").length > 0 && (
          <section className="rounded-3xl border bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-black">Community reports pending review</p>
            <div className="grid gap-2 md:grid-cols-2">
              {reports.filter(report => report.status === "pending").slice(0, 6).map(report => (
                <div key={report.id} className="rounded-2xl border bg-stone-50 p-3 text-sm">
                  <p className="font-bold">{report.resource_name}</p>
                  <p className="text-xs text-stone-500">{report.report_type?.replaceAll("_", " ")} · {report.resource_county || "No county"}</p>
                  {report.details && <p className="mt-2 text-xs text-stone-700">{report.details}</p>}
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => reviewReport(report, "reviewed")} className="rounded-xl bg-green-800 px-3 py-2 text-xs font-bold text-white">Mark reviewed</button>
                    <button onClick={() => reviewReport(report, "resolved")} className="rounded-xl border px-3 py-2 text-xs font-bold">Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {form && <ResourceEditor form={form} onChange={setForm} onSubmit={saveListing} onCancel={() => setForm(null)} saving={saving} />}
        <ResourceFilters filters={filters} counties={counties} onChange={setFilters} />

        <section className="space-y-3">
          {loading ? <div className="rounded-2xl bg-white p-6 text-center">Loading resources...</div> : filtered.map(resource => (
            <ResourceListingCard key={resource.id} resource={resource} onEdit={setForm} onVerify={approve} onArchive={archive} />
          ))}
          {!loading && filtered.length === 0 && <div className="rounded-2xl border bg-white p-6 text-center text-sm text-stone-600">No resources match the current filters.</div>}
        </section>
      </main>
    </div>
  );
}