import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import CourtGradeRecordForm from "@/components/court-grade/CourtGradeRecordForm";
import CourtDeadlineCards from "@/components/court-grade/CourtDeadlineCards";
import CourtRecordTimeline from "@/components/court-grade/CourtRecordTimeline";
import { Download, Printer, Scale, ShieldCheck } from "lucide-react";

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export default function UnalterableRecords() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async me => {
      setUser(me);
      const data = await base44.entities.CourtGradeRecord.filter({ owner_email: me.email }, "-submitted_at", 500);
      setRecords(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => ({
    total: records.length,
    visits: records.filter(r => r.record_type === "visitation_attendance").length,
    casePlan: records.filter(r => r.record_type === "case_plan_completion" && r.completion_status === "completed").length,
    milestones: records.filter(r => r.record_type === "reunification_milestone").length
  }), [records]);

  async function submitRecord(form) {
    setSubmitting(true);
    const submittedAt = new Date().toISOString();
    const occurredAt = form.occurred_at || submittedAt;
    const previousHash = records[0]?.record_hash || "GENESIS";
    const verificationId = `R21-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const recordHash = await sha256(JSON.stringify({ ...form, owner_email: user.email, submittedAt, previousHash, verificationId }));
    const created = await base44.entities.CourtGradeRecord.create({
      ...form,
      owner_email: user.email,
      occurred_at: occurredAt,
      submitted_at: submittedAt,
      previous_hash: previousHash,
      verification_id: verificationId,
      record_hash: recordHash
    });
    setRecords(prev => [created, ...prev]);
    setSubmitting(false);
  }

  async function exportPdf() {
    const response = await base44.functions.invoke("generateCourtGradePdf", {});
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rooted-21-certified-record.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Unalterable Records" subtitle="Court-grade documentation timeline" backTo="/dashboard" />
      <main className="max-w-[760px] mx-auto px-4 py-5 pb-28 space-y-4">
        <section className="rounded-3xl p-5" style={{ background: C.darkGreen, color: C.cream }}>
          <div className="flex items-center gap-3 mb-3">
            <Scale size={24} color={C.gold} />
            <div>
              <h1 className="font-serif text-2xl font-black" style={{ color: C.cream }}>Court-grade record system</h1>
              <p className="text-xs mt-1" style={{ color: C.cream }}>Timestamped, verification-ID records with append-only protections.</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[ ["Records", stats.total], ["Visits", stats.visits], ["Plan done", stats.casePlan], ["Milestones", stats.milestones] ].map(([label, value]) => (
              <div key={label} className="rounded-2xl p-2 text-center" style={{ background: "rgba(255,255,255,0.12)" }}>
                <p className="text-lg font-black" style={{ color: C.cream }}>{value}</p>
                <p className="text-[10px]" style={{ color: C.cream }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2">
          <button onClick={exportPdf} className="flex-1 rounded-xl py-2.5 text-xs font-black" style={{ background: C.darkGreen, color: C.cream, border: "none" }}><Download size={14} className="mr-1" /> Certified PDF</button>
          <button onClick={() => window.print()} className="flex-1 rounded-xl py-2.5 text-xs font-black" style={{ background: C.white, color: C.darkGreen, border: `1px solid ${C.cream}` }}><Printer size={14} className="mr-1" /> Hearing summary</button>
        </div>

        <div className="rounded-2xl p-3 flex gap-2" style={{ background: "#EAF4EA", border: `1px solid ${C.cream}` }}>
          <ShieldCheck size={18} color={C.darkGreen} />
          <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>Records include timestamps, generated verification IDs, hash chaining, GPS when added, and cannot be edited or deleted after submission.</p>
        </div>

        <CourtDeadlineCards records={records} />
        <CourtGradeRecordForm onSubmit={submitRecord} submitting={submitting} />

        <div>
          <h2 className="font-black mb-2" style={{ color: C.darkGreen }}>Locked timeline</h2>
          {loading ? <p className="text-sm" style={{ color: C.mutedText }}>Loading records…</p> : <CourtRecordTimeline records={records} />}
        </div>
      </main>
    </div>
  );
}