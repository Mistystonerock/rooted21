import { BarChart3, CheckCircle2, FileCheck2, ListChecks } from "lucide-react";
import { C } from "@/lib/rooted-constants";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.offWhite }}>
        <Icon size={16} color={C.midGreen} />
      </div>
      <p className="text-xl font-black" style={{ color: C.darkGreen }}>{value}</p>
      <p className="text-[11px] font-bold leading-snug" style={{ color: C.mutedText }}>{label}</p>
    </div>
  );
}

export default function CasePlanProgressTracker({ checklists }) {
  const items = checklists.flatMap(list => list.items || []);
  const total = items.length;
  const completed = items.filter(item => item.completed).length;
  const proofUploaded = items.filter(item => item.proof_url).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen, border: `1.5px solid ${C.gold}40` }}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: C.gold }}>Family journey tracker</p>
          <h2 className="mt-1 font-serif text-xl font-bold leading-tight" style={{ color: C.cream }}>Overall case-plan progress</h2>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            See what is complete, what still needs proof, and what comes next.
          </p>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black" style={{ background: "rgba(255,255,255,0.13)", color: C.cream }}>
          {pct}%
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.16)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.gold }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-bold" style={{ color: C.lightGreen }}>
        <span>{completed} completed</span>
        <span>{Math.max(total - completed, 0)} remaining</span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <StatCard icon={ListChecks} label="Required tasks" value={total} />
        <StatCard icon={CheckCircle2} label="Checked off" value={completed} />
        <StatCard icon={FileCheck2} label="Proof uploaded" value={proofUploaded} />
      </div>

      <div className="mt-4 rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${C.gold}35` }}>
        <div className="flex items-center gap-2">
          <BarChart3 size={15} color={C.gold} />
          <p className="text-xs font-bold" style={{ color: C.cream }}>
            {pct === 100 ? "All listed requirements are complete." : "Keep uploading proof as you complete each requirement."}
          </p>
        </div>
      </div>
    </section>
  );
}