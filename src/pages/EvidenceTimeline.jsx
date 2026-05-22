import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import EvidenceUploadForm from "@/components/evidence/EvidenceUploadForm";
import EvidenceTimelineList from "@/components/evidence/EvidenceTimelineList";
import ChronologyExportButton from "@/components/evidence/ChronologyExportButton";
import { C } from "@/lib/rooted-constants";
import { Link } from "react-router-dom";
import { FileText, FolderOpen, Search } from "lucide-react";

export default function EvidenceTimeline() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [courtDocuments, setCourtDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const [timeline, docs] = await Promise.all([
        base44.entities.EvidenceTimelineItem.filter({ owner_email: me.email }, "event_date", 500),
        base44.entities.SecureDocument.list("-created_date", 200),
      ]);
      setItems(timeline);
      setCourtDocuments(docs.filter(doc => doc.auto_populate_court_packet || doc.court_case_number || doc.court_packet_tags?.length || ["court_order", "legal", "visitation", "safety_plan", "case_plan"].includes(doc.category)));
      setLoading(false);
    }
    load();
  }, []);

  const categories = useMemo(() => [...new Set(items.flatMap(item => item.case_categories || []))].sort(), [items]);
  const filteredItems = useMemo(() => items
    .filter(item => category === "all" || (item.case_categories || []).includes(category))
    .filter(item => !search || [item.title, item.summary, item.message_text, item.source_note, ...(item.case_categories || [])].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => `${a.event_date || ""} ${a.event_time || ""}`.localeCompare(`${b.event_date || ""} ${b.event_time || ""}`)), [items, category, search]);

  async function deleteItem(id) {
    if (!confirm("Delete this timeline evidence item?")) return;
    await base44.entities.EvidenceTimelineItem.delete(id);
    setItems(prev => prev.filter(item => item.id !== id));
  }

  if (loading) {
    return <div className="min-h-screen" style={{ background: C.offWhite }}><MobileHeader title="Evidence Timeline" backTo="/court-packet-helper" /><div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: `${C.midGreen} transparent` }} /></div></div>;
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Evidence Timeline" subtitle="Build a court chronology exhibit" backTo="/court-packet-helper" />
      <main className="mx-auto max-w-[680px] space-y-5 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen }}>
          <p className="font-serif text-2xl font-black" style={{ color: C.cream }}>Interactive Evidence Timeline</p>
          <p className="mt-2 text-sm leading-6" style={{ color: C.lightGreen }}>Pin photos, documents, and messages chronologically, tag them by case category, and export a Chronology Exhibit PDF with court-document cross-references.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/documents" className="inline-flex rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: C.gold, color: C.darkGreen }}><FolderOpen size={14} className="mr-1" /> Open Document Vault</Link>
            <Link to="/case-plan-tracker" className="inline-flex rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: "rgba(255,255,255,0.12)", color: C.cream, border: `1px solid ${C.gold}` }}><FileText size={14} className="mr-1" /> Case Plan Tracker</Link>
            <Link to="/automated-briefing" className="inline-flex rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: "rgba(255,255,255,0.12)", color: C.cream, border: `1px solid ${C.gold}` }}><FileText size={14} className="mr-1" /> Automated Briefing</Link>
          </div>
        </section>

        <EvidenceUploadForm user={user} courtDocuments={courtDocuments} onCreated={item => setItems(prev => [...prev, item])} />

        <section className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
          <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.mutedText} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search timeline evidence..." className="w-full rounded-2xl border py-3 pl-10 pr-3 text-sm" style={{ borderColor: C.cream }} /></div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => setCategory("all")} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: category === "all" ? C.darkGreen : C.offWhite, color: category === "all" ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>All</button>
            {categories.map(item => <button key={item} type="button" onClick={() => setCategory(item)} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: category === item ? C.darkGreen : C.offWhite, color: category === item ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>{item}</button>)}
          </div>
        </section>

        <ChronologyExportButton items={filteredItems} courtDocuments={courtDocuments} />
        <EvidenceTimelineList items={filteredItems} courtDocuments={courtDocuments} onDelete={deleteItem} />
      </main>
    </div>
  );
}