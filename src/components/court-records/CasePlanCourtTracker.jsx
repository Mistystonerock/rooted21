import { CheckCircle2, ClipboardList } from "lucide-react";
import { completionPercent, formatDate } from "./courtRecordUtils";

export default function CasePlanCourtTracker({ checklists }) {
  const checklist = checklists[0];
  const items = checklist?.items || [];
  const percent = completionPercent(items);

  return (
    <section className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-green-700" />
        <div>
          <h2 className="font-black text-stone-900">Case-plan tracking</h2>
          <p className="text-xs text-stone-500">Court-ready progress in parent-friendly language</p>
        </div>
      </div>
      <div className="mb-3 rounded-2xl bg-green-50 p-3">
        <p className="text-xs font-bold text-green-800">Most recent plan completion</p>
        <p className="text-3xl font-black text-green-900">{percent}%</p>
      </div>
      <div className="space-y-2">
        {items.slice(0, 6).map(item => (
          <div key={item.id || item.text} className="flex items-start gap-2 rounded-xl border border-stone-200 p-3 text-sm">
            <CheckCircle2 className={`mt-0.5 h-4 w-4 ${item.completed ? "text-green-700" : "text-stone-300"}`} />
            <div>
              <p className="font-bold text-stone-800">{item.text}</p>
              <p className="text-xs text-stone-500">Due: {formatDate(item.due_date)} {item.completed ? `· Completed ${formatDate(item.completed_date)}` : ""}</p>
            </div>
          </div>
        ))}
        {!items.length && <p className="rounded-xl border border-dashed p-4 text-sm text-stone-500">No case-plan checklist found yet.</p>}
      </div>
    </section>
  );
}