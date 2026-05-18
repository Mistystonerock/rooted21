import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import CourtDeadlineCard from "@/components/court-records/CourtDeadlineCard";
import CourtRecordFeed from "@/components/court-records/CourtRecordFeed";
import CourtSummaryPanel from "@/components/court-records/CourtSummaryPanel";
import UnalterableRecordForm from "@/components/court-records/UnalterableRecordForm";
import { buildCourtDeadlines } from "@/components/court-records/courtRecordUtils";
import { Download, Printer, ShieldCheck } from "lucide-react";

export default function CourtGradeDocumentation() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [cases, setCases] = useState([]);
  const [visits, setVisits] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const [sealed, caseRows, visitRows, checklistRows, planRows] = await Promise.all([
        base44.entities.CourtGradeRecord.list("-submitted_at", 100),
        base44.entities.CPSCaseNavigation.list("-updated_date", 20),
        base44.entities.VisitationLog.list("-visit_date", 100),
        base44.entities.CasePlanChecklist.list("-updated_date", 20),
        base44.entities.ReunificationPlan.list("-updated_date", 20)
      ]);
      setRecords(sealed);
      setCases(caseRows);
      setVisits(visitRows);
      setChecklists(checklistRows);
      setPlans(planRows);
      setLoading(false);
    }
    load();
  }, []);

  const deadlines = useMemo(() => buildCourtDeadlines(cases[0]), [cases]);

  async function submitRecord(record) {
    const created = await base44.entities.CourtGradeRecord.create(record);
    setRecords(prev => [created, ...prev]);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 print:bg-white">
      <MobileHeader title="Court-Grade Documentation" subtitle="Unalterable records, deadlines & hearing summaries" backTo="/dashboard" />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 pb-28 print:max-w-none print:pb-4">
        <section className="rounded-3xl bg-green-900 p-5 text-white shadow-sm print:bg-white print:text-stone-900 print:border">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold print:bg-stone-100"><ShieldCheck className="mr-2 h-4 w-4" /> Append-only court packet</div>
              <h1 className="text-2xl font-black">Unalterable Record System</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80 print:text-stone-600">Each submitted record receives a timestamp, verification ID, hash, and cannot be edited or deleted after submission.</p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button onClick={() => window.print()} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-green-900"><Printer className="mr-2 h-4 w-4" /> Print hearing summary</button>
              <Link to="/certified-legal-export" className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-green-950 no-underline"><Download className="mr-2 h-4 w-4" /> Certified PDF export</Link>
            </div>
          </div>
        </section>

        {loading ? <div className="rounded-2xl bg-white p-6 text-center">Loading court records...</div> : (
          <>
            <CourtSummaryPanel cases={cases} visits={visits} checklists={checklists} plans={plans} />
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {deadlines.map(deadline => <CourtDeadlineCard key={deadline.title} deadline={deadline} />)}
            </section>
            {user && <UnalterableRecordForm user={user} previousHash={records[0]?.record_hash} onSubmit={submitRecord} />}
            <section className="rounded-3xl border bg-white p-4">
              <h2 className="mb-3 text-lg font-black">Printable hearing summary</h2>
              <CourtRecordFeed records={records} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}