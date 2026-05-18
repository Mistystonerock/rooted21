import { AlertTriangle, Archive, CheckCircle2, Edit3, ShieldAlert } from "lucide-react";
import { daysSinceVerified, isVerifiedRecently, STATUS_LABELS } from "./resourceAdminUtils";

export default function ResourceListingCard({ resource, onEdit, onVerify, onArchive }) {
  const days = daysSinceVerified(resource);
  const recent = isVerifiedRecently(resource);

  return (
    <article className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-stone-900">{resource.name}</h3>
            {recent && <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-[11px] font-bold text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified recently</span>}
            {resource.crisis_priority && <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-[11px] font-bold text-red-800"><ShieldAlert className="mr-1 h-3 w-3" /> Crisis priority</span>}
            {days >= 60 && resource.verification_status !== "archived" && <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-800"><AlertTriangle className="mr-1 h-3 w-3" /> Stale</span>}
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-stone-500">{resource.category?.replaceAll("_", " ")} · {resource.county || "Statewide"} · {STATUS_LABELS[resource.verification_status] || resource.verification_status}</p>
          <p className="mt-2 text-sm text-stone-700">{resource.description_en || "No English description yet."}</p>
          <div className="mt-2 text-xs text-stone-500">Verified {resource.verified_at ? new Date(resource.verified_at).toLocaleDateString() : "never"} · {days} days since review</div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <button onClick={() => onVerify(resource)} className="rounded-xl bg-green-800 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="mr-1 h-4 w-4" /> Approve</button>
          <button onClick={() => onEdit(resource)} className="rounded-xl border px-3 py-2 text-xs font-bold"><Edit3 className="mr-1 h-4 w-4" /> Update</button>
          {resource.verification_status !== "archived" && <button onClick={() => onArchive(resource)} className="rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700"><Archive className="mr-1 h-4 w-4" /> Archive</button>}
        </div>
      </div>
    </article>
  );
}