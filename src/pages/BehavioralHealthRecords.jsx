import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import DocumentUploadModal from "@/components/documents/DocumentUploadModal";
import BehavioralHealthRecordForm from "@/components/behavioral-health/BehavioralHealthRecordForm";
import BehavioralHealthRecordCard from "@/components/behavioral-health/BehavioralHealthRecordCard";
import BehavioralHealthConsentPanel from "@/components/behavioral-health/BehavioralHealthConsentPanel";
import { Brain, FileText, HeartPulse, Lock, Pill, Plus, Shield, Upload, Users } from "lucide-react";

const filters = ["all", "therapy_session", "mood_check", "safety_plan", "crisis_plan", "provider_contact", "substance_use"];

export default function BehavioralHealthRecords() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [medications, setMedications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => { boot(); }, []);

  async function boot() {
    const me = await base44.auth.me();
    setUser(me);
    const [recordList, medList, docList, releaseList] = await Promise.all([
      base44.entities.BehavioralHealthRecord.filter({ owner_email: me.email }, "-created_date", 300),
      base44.entities.MedicationRecord.filter({ parent_email: me.email }, "-created_date", 100),
      base44.entities.SecureDocument.list("-created_date", 100),
      base44.entities.ReleaseOfInformation.filter({ owner_email: me.email }, "-created_date", 100)
    ]);
    setRecords(recordList);
    setMedications(medList);
    setDocuments(docList.filter(d => ["behavioral_health", "substance_use", "safety", "medical"].includes(d.permission_segment)));
    setReleases(releaseList);
    setLoading(false);
  }

  async function audit(event, entityName, entityId, summary) {
    await base44.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: event,
      entity_name: entityName,
      entity_id: entityId,
      severity: "info",
      summary,
      occurred_at: new Date().toISOString()
    });
  }

  async function saveRecord(data) {
    const created = await base44.entities.BehavioralHealthRecord.create(data);
    await audit("record_create", "BehavioralHealthRecord", created.id, "Behavioral health record created with segmented privacy protections.");
    setRecords(prev => [created, ...prev]);
    setShowForm(false);
  }

  async function createRelease(data) {
    const created = await base44.entities.ReleaseOfInformation.create(data);
    await audit("consent_change", "ReleaseOfInformation", created.id, "Behavioral health consent release created.");
    setReleases(prev => [created, ...prev]);
  }

  async function handleDocumentUploaded(doc) {
    setDocuments(prev => [doc, ...prev]);
    await audit("document_upload", "SecureDocument", doc.id, "Secure behavioral health document uploaded to private vault.");
    setShowUpload(false);
  }

  const shown = useMemo(() => filter === "all" ? records : records.filter(r => r.record_kind === filter), [records, filter]);
  const part2Count = records.filter(r => r.part2_segmented).length + documents.filter(d => d.part2_segmented).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}><div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.darkGreen} transparent ${C.darkGreen} ${C.darkGreen}` }} /></div>;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="🧠 Behavioral Health" subtitle="Private family records" backTo="/dashboard" />
      <main className="mx-auto max-w-[760px] px-4 py-5 space-y-4">
        <section className="rounded-3xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${C.darkGreen}, ${C.brown})` }}>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl p-3 bg-white/15"><Shield size={24} /></div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-white">Secure behavioral health records</h1>
              <p className="mt-2 text-sm text-white/85">Therapy, medication, safety, crisis, mood, providers, consent, and uploads are kept private and segmented.</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={Brain} label="Records" value={records.length} />
          <Metric icon={Pill} label="Medications" value={medications.length} />
          <Metric icon={FileText} label="Secure uploads" value={documents.length} />
          <Metric icon={Lock} label="Part 2 segmented" value={part2Count} />
        </div>

        <section className="rounded-3xl border p-4" style={{ background: C.white, borderColor: C.cream }}>
          <h2 className="font-serif text-lg font-bold" style={{ color: C.darkText }}>Privacy protections</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Protection icon={Lock} text="Encrypted private vault storage for uploads" />
            <Protection icon={Users} text="Role-based record access by owner and consent" />
            <Protection icon={Shield} text="HIPAA-aware privacy and minimum-needed sharing" />
            <Protection icon={HeartPulse} text="42 CFR Part 2 segmentation for substance-use records" />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowForm(true)} className="rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: C.darkGreen, color: "#fff", border: "none" }}><Plus size={16} /> Add record</button>
          <button onClick={() => setShowUpload(true)} className="rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: C.white, color: C.darkText, border: `1px solid ${C.cream}` }}><Upload size={16} /> Secure upload</button>
        </div>

        {showForm && <BehavioralHealthRecordForm user={user} onSave={saveRecord} onCancel={() => setShowForm(false)} />}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => <button key={f} onClick={() => setFilter(f)} className="rounded-full px-3 py-2 text-xs font-bold whitespace-nowrap" style={{ background: filter === f ? C.darkGreen : C.white, color: filter === f ? "#fff" : C.darkText, border: `1px solid ${C.cream}` }}>{f.replaceAll("_", " ")}</button>)}
        </div>

        <div className="space-y-3">
          {shown.map(record => <BehavioralHealthRecordCard key={record.id} record={record} />)}
          {shown.length === 0 && <div className="rounded-3xl border p-8 text-center" style={{ background: C.white, borderColor: C.cream }}><p className="font-bold" style={{ color: C.darkText }}>No records yet</p><p className="text-sm mt-1" style={{ color: C.mutedText }}>Add one when you feel ready.</p></div>}
        </div>

        <BehavioralHealthConsentPanel user={user} releases={releases} onCreate={createRelease} />
      </main>
      {showUpload && <DocumentUploadModal user={user} onDocumentUploaded={handleDocumentUploaded} onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border p-3" style={{ background: C.white, borderColor: C.cream }}><Icon size={18} color={C.darkGreen} /><p className="mt-2 text-xl font-black" style={{ color: C.darkText }}>{value}</p><p className="text-[11px] font-bold" style={{ color: C.mutedText }}>{label}</p></div>;
}

function Protection({ icon: Icon, text }) {
  return <div className="flex items-center gap-2 rounded-xl p-3 text-xs font-semibold" style={{ background: C.offWhite, color: C.darkText }}><Icon size={15} color={C.darkGreen} /> {text}</div>;
}