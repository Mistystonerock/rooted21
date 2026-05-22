import { C } from "@/lib/rooted-constants";
import { Link2, Trash2 } from "lucide-react";

const STATUS = {
  not_started: ["Not started", "#f8fafc"],
  in_progress: ["In progress", "#fef3c7"],
  completed: ["Completed", "#dcfce7"],
  needs_review: ["Needs review", "#fee2e2"],
};

export default function RequirementCard({ requirement, evidenceItems, onUpdate, onDelete }) {
  const linkedEvidence = evidenceItems.filter(item => (requirement.evidence_item_ids || []).includes(item.id));

  function toggleEvidence(id) {
    const current = requirement.evidence_item_ids || [];
    const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
    onUpdate(requirement.id, { evidence_item_ids: next });
  }

  const [label, bg] = STATUS[requirement.status] || STATUS.not_started;

  return (
    <article className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>{requirement.category?.replaceAll("_", " ")} · {requirement.priority} priority</p>
          <h3 className="mt-1 font-serif text-lg font-black" style={{ color: C.darkGreen }}>{requirement.title}</h3>
        </div>
        <button type="button" onClick={() => onDelete(requirement.id)} className="rounded-xl p-2" style={{ background: C.offWhite, color: "#9a3412", border: `1px solid ${C.cream}` }} aria-label="Delete requirement"><Trash2 size={15} /></button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <select value={requirement.status} onChange={e => onUpdate(requirement.id, { status: e.target.value })} className="rounded-full border px-3 py-1 text-xs font-bold" style={{ background: bg, borderColor: C.cream, color: C.darkGreen }}>
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="needs_review">Needs review</option>
        </select>
        {requirement.due_date && <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: C.offWhite, color: C.darkGreen }}>Due {requirement.due_date}</span>}
        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: C.offWhite, color: C.darkGreen }}>{linkedEvidence.length} evidence linked</span>
      </div>

      {requirement.legal_source && <p className="mt-3 text-xs font-bold" style={{ color: C.darkGreen }}>Source: {requirement.legal_source}</p>}
      {requirement.description && <p className="mt-2 text-sm leading-6" style={{ color: C.darkText }}>{requirement.description}</p>}
      {requirement.progress_notes && <p className="mt-3 rounded-2xl p-3 text-xs leading-5" style={{ background: C.offWhite, color: C.darkText }}>{requirement.progress_notes}</p>}

      <details className="mt-4 rounded-2xl border p-3" style={{ borderColor: C.cream }}>
        <summary className="cursor-pointer text-xs font-black" style={{ color: C.darkGreen }}><Link2 size={14} className="mr-1 inline" /> Attach Evidence Timeline items</summary>
        <div className="mt-3 max-h-48 space-y-2 overflow-auto">
          {evidenceItems.length === 0 ? <p className="text-xs" style={{ color: C.mutedText }}>No Evidence Timeline items yet.</p> : evidenceItems.map(item => (
            <label key={item.id} className="flex items-start gap-2 rounded-xl p-2 text-xs" style={{ background: C.offWhite }}>
              <input type="checkbox" checked={(requirement.evidence_item_ids || []).includes(item.id)} onChange={() => toggleEvidence(item.id)} />
              <span><strong>{item.event_date} · {item.title}</strong><br />{(item.case_categories || []).join(", ") || item.evidence_type}</span>
            </label>
          ))}
        </div>
      </details>
    </article>
  );
}