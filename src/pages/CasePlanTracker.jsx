import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import RequirementForm from "@/components/case-plan-tracker/RequirementForm";
import RequirementCard from "@/components/case-plan-tracker/RequirementCard";
import ProgressReportPanel from "@/components/case-plan-tracker/ProgressReportPanel";
import { C } from "@/lib/rooted-constants";
import { GitBranch, Scale } from "lucide-react";

export default function CasePlanTracker() {
  const [user, setUser] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const [reqs, evidence] = await Promise.all([
        base44.entities.CasePlanRequirement.filter({ owner_email: me.email }, "due_date", 300),
        base44.entities.EvidenceTimelineItem.filter({ owner_email: me.email }, "event_date", 500),
      ]);
      setRequirements(reqs);
      setEvidenceItems(evidence);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => filter === "all" ? requirements : requirements.filter(item => item.status === filter), [requirements, filter]);

  async function createRequirement(data) {
    const created = await base44.entities.CasePlanRequirement.create(data);
    setRequirements(prev => [...prev, created].sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999")));
  }

  async function updateRequirement(id, data) {
    const updated = await base44.entities.CasePlanRequirement.update(id, data);
    setRequirements(prev => prev.map(item => item.id === id ? updated : item));
  }

  async function deleteRequirement(id) {
    if (!confirm("Delete this case plan requirement?")) return;
    await base44.entities.CasePlanRequirement.delete(id);
    setRequirements(prev => prev.filter(item => item.id !== id));
  }

  if (loading) {
    return <div className="min-h-screen" style={{ background: C.offWhite }}><MobileHeader title="Case Plan Tracker" backTo="/court-packet-helper" /><div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: `${C.midGreen} transparent` }} /></div></div>;
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Case Plan Tracker" subtitle="Requirements, evidence, and progress" backTo="/court-packet-helper" />
      <main className="mx-auto max-w-[720px] space-y-5 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen }}>
          <p className="font-serif text-2xl font-black" style={{ color: C.cream }}>Visual Case Plan Tracker</p>
          <p className="mt-2 text-sm leading-6" style={{ color: C.lightGreen }}>Map CPS or court case plan requirements, attach Evidence Timeline items, and export a progress report showing how your actions align with obligations.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/evidence-timeline" className="inline-flex rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: C.gold, color: C.darkGreen }}><GitBranch size={14} className="mr-1" /> Evidence Timeline</Link>
            <Link to="/court-packet-helper" className="inline-flex rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: "rgba(255,255,255,0.12)", color: C.cream, border: `1px solid ${C.gold}` }}><Scale size={14} className="mr-1" /> Court Packet Helper</Link>
          </div>
        </section>

        <section className="rounded-3xl border p-4 text-xs leading-6" style={{ background: "#fff7ed", borderColor: "#fed7aa", color: "#9a3412" }}>This tracker is for organization and progress visualization only. Confirm legal obligations, deadlines, required proof, and filing needs with your caseworker, attorney, legal aid, court clerk, or official court website.</section>

        <ProgressReportPanel requirements={requirements} evidenceItems={evidenceItems} />
        <RequirementForm user={user} onCreate={createRequirement} />

        <section className="rounded-3xl border bg-white p-3 shadow-sm" style={{ borderColor: C.cream }}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[['all', 'All'], ['not_started', 'Not started'], ['in_progress', 'In progress'], ['completed', 'Completed'], ['needs_review', 'Needs review']].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: filter === value ? C.darkGreen : C.offWhite, color: filter === value ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>{label}</button>)}
          </div>
        </section>

        <section className="space-y-3">
          {filtered.length === 0 ? <div className="rounded-3xl border bg-white p-8 text-center" style={{ borderColor: C.cream }}><p className="text-sm font-bold" style={{ color: C.darkGreen }}>No requirements in this view</p></div> : filtered.map(item => <RequirementCard key={item.id} requirement={item} evidenceItems={evidenceItems} onUpdate={updateRequirement} onDelete={deleteRequirement} />)}
        </section>
      </main>
    </div>
  );
}