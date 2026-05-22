import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import CourtPacketDisclaimer from "@/components/court-packet/CourtPacketDisclaimer";
import CourtPacketCard from "@/components/court-packet/CourtPacketCard";
import CourtPacketGuide from "@/components/court-packet/CourtPacketGuide";
import CourtPacketQuestionnaire from "@/components/court-packet/CourtPacketQuestionnaire";
import CourtResourceCard from "@/components/court-packet/CourtResourceCard";
import CourtVaultMetadataPanel from "@/components/court-packet/CourtVaultMetadataPanel";
import { COURT_PACKETS, OFFICIAL_COURT_RESOURCES } from "@/lib/court-packet-data";
import { C } from "@/lib/rooted-constants";
import { ArrowLeft, FileText, MapPin, Search } from "lucide-react";
import { useEffect } from "react";

export default function CourtPacketHelper() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [location, setLocation] = useState({ state: "OH", county: "Ross", zip: "45601", courtType: "" });
  const [search, setSearch] = useState("");
  const [courtDocuments, setCourtDocuments] = useState([]);

  useEffect(() => {
    async function loadCourtContext() {
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
      if (!me) return;
      const docs = await base44.entities.SecureDocument.list("-created_date", 100);
      setCourtDocuments(docs.filter(doc => doc.auto_populate_court_packet || doc.extracted_court_dates?.length || doc.court_case_number || doc.judge_name));
    }
    loadCourtContext();
  }, []);

  const filteredPackets = useMemo(() => COURT_PACKETS.filter(packet => !search || packet.title.toLowerCase().includes(search.toLowerCase())), [search]);
  const resources = OFFICIAL_COURT_RESOURCES.filter(resource => {
    const countyMatch = !location.county || resource.county === "Statewide" || resource.county.includes(location.county);
    const stateMatch = !location.state || resource.state === location.state;
    const courtMatch = !location.courtType || resource.court_type.toLowerCase().includes(location.courtType.toLowerCase());
    return countyMatch && stateMatch && courtMatch;
  });

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Court Packet Helper" subtitle="Forms, documents, reminders, and calm preparation" backTo="/resources" />
      <main className="mx-auto max-w-[620px] space-y-5 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen }}>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.14)" }}><FileText color={C.cream} /></div>
            <div>
              <p className="font-serif text-2xl font-black" style={{ color: C.cream }}>Court Packet Helper</p>
              <p className="mt-2 text-sm leading-6" style={{ color: C.lightGreen }}>Find common documents that may apply, official links when verified, county requirement reminders, and filing preparation checklists.</p>
            </div>
          </div>
        </section>

        <CourtPacketDisclaimer />

        {selected ? (
          <>
            <button type="button" onClick={() => setSelected(null)} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}><ArrowLeft size={14} className="mr-1" /> Back to packet list</button>
            <section className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: C.cream }}>
              <p className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>{selected.title}</p>
              <p className="mt-2 text-sm leading-6" style={{ color: C.mutedText }}>{selected.usedFor}</p>
              <p className="mt-3 rounded-2xl p-3 text-xs font-bold leading-5" style={{ background: "#fff7ed", color: "#9a3412" }}>Before filing, verify current requirements with the court clerk, attorney, legal aid, or official court website. This packet may not include every required form.</p>
            </section>
            <a href="/evidence-timeline" className="block rounded-2xl px-4 py-3 text-center text-sm font-black no-underline" style={{ background: C.gold, color: C.darkGreen }}>Open Evidence Timeline + Chronology Exhibit</a>
            <CourtPacketGuide packet={selected} user={user} />
          </>
        ) : (
          <>
            <section className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
              <p className="mb-3 flex items-center gap-2 font-serif text-lg font-bold" style={{ color: C.darkGreen }}><MapPin size={18} /> Location-based court resources</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={location.state} onChange={e => setLocation(prev => ({ ...prev, state: e.target.value }))} placeholder="State" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
                <input value={location.county} onChange={e => setLocation(prev => ({ ...prev, county: e.target.value }))} placeholder="County" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
                <input value={location.zip} onChange={e => setLocation(prev => ({ ...prev, zip: e.target.value }))} placeholder="ZIP code" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
                <input value={location.courtType} onChange={e => setLocation(prev => ({ ...prev, courtType: e.target.value }))} placeholder="Court type if known" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
              </div>
            </section>

            <CourtVaultMetadataPanel documents={courtDocuments} />

            <button type="button" onClick={() => setShowQuestionnaire(value => !value)} className="w-full rounded-2xl px-4 py-4 text-sm font-black" style={{ background: C.gold, color: C.darkGreen, border: "none" }}>Not sure where to start?</button>
            {showQuestionnaire && <CourtPacketQuestionnaire packets={COURT_PACKETS} onSelectPacket={setSelected} />}

            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.mutedText} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search packet types..." className="w-full rounded-2xl border bg-white py-3 pl-10 pr-3 text-sm" style={{ borderColor: C.cream }} /></div>

            <section className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: C.mutedText }}>Court packet categories</p>
              {filteredPackets.map(packet => <CourtPacketCard key={packet.title} packet={packet} onOpen={setSelected} />)}
            </section>

            <section className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: C.mutedText }}>Official and verified resources</p>
              {resources.map(resource => <CourtResourceCard key={resource.name} resource={resource} />)}
            </section>
          </>
        )}
      </main>
    </div>
  );
}