import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import ResourceEditor from "@/components/resources-admin/ResourceEditor";
import ResourceFilters from "@/components/resources-admin/ResourceFilters";
import ResourceListingCard from "@/components/resources-admin/ResourceListingCard";
import { emptyResource } from "@/components/resources-admin/resourceAdminUtils";
import { Database, Plus, RefreshCw } from "lucide-react";

export default function ResourceManagement() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", county: "all", category: "all", status: "all" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    const rows = await base44.entities.ResourceListing.list("-updated_date", 1000);
    setResources(rows);
    setLoading(false);
  }

  const canManage = ["admin", "founder"].includes(user?.role);
  const counties = useMemo(() => [...new Set(resources.map(r => r.county).filter(Boolean))].sort(), [resources]);
  const filtered = resources.filter(resource => {
    const text = `${resource.name} ${resource.county} ${resource.category} ${resource.description_en}`.toLowerCase();
    const matchesSearch = !filters.search || text.includes(filters.search.toLowerCase());
    const matchesCounty = filters.county === "all" || resource.county === filters.county;
    const matchesCategory = filters.category === "all" || resource.category === filters.category;
    const matchesStatus = filters.status === "all" || (filters.status === "crisis" ? resource.crisis_priority : resource.verification_status === filters.status);
    return matchesSearch && matchesCounty && matchesCategory && matchesStatus;
  });

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
    const saved = form.id ? await base44.entities.ResourceListing.update(form.id, data) : await base44.entities.ResourceListing.create(data);
    setResources(prev => form.id ? prev.map(r => r.id === saved.id ? saved : r) : [saved, ...prev]);
    setForm(null);
    setSaving(false);
  }

  async function approve(resource) {
    const updated = await base44.entities.ResourceListing.update(resource.id, { verification_status: "verified", verified_at: new Date().toISOString(), verified_by: user.email });
    setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
  }

  async function archive(resource) {
    const updated = await base44.entities.ResourceListing.update(resource.id, { verification_status: "archived", archived_at: new Date().toISOString() });
    setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
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
            <button onClick={() => setForm(emptyResource(user?.email))} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-green-900"><Plus className="mr-2 h-4 w-4" /> New resource</button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Total</p><p className="text-2xl font-black">{resources.length}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Needs review</p><p className="text-2xl font-black">{resources.filter(r => ["needs_review", "outdated"].includes(r.verification_status)).length}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs font-bold text-stone-500">Crisis priority</p><p className="text-2xl font-black">{resources.filter(r => r.crisis_priority).length}</p></div>
          <button onClick={load} className="rounded-2xl border bg-white p-4 text-left"><p className="text-xs font-bold text-stone-500">Refresh</p><p className="inline-flex items-center text-sm font-black"><RefreshCw className="mr-2 h-4 w-4" /> Reload</p></button>
        </div>

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