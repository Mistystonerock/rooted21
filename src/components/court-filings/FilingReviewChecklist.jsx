import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import FilingStatusBadge from "@/components/court-filings/FilingStatusBadge";

export default function FilingReviewChecklist({ status, placeholders, missingFields, draftMarkdown, onEditDraft, onContinue }) {
  const hasIssues = placeholders.length > 0 || missingFields.length > 0;

  return (
    <section className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center justify-between">
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Review before signing</p>
        <FilingStatusBadge status={status} />
      </div>

      {hasIssues ? (
        <div className="rounded-xl p-3 space-y-2" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <div className="flex gap-2">
            <AlertTriangle size={15} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>This draft is not ready to sign yet.</p>
          </div>
          {placeholders.length > 0 && (
            <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
              Blank placeholder text found: {placeholders.map(p => `"${p}"`).join(", ")}. Edit the draft below to replace it with real information.
            </p>
          )}
          {missingFields.length > 0 && (
            <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
              Missing information: {missingFields.join(", ")}. Add these details to the draft below.
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}` }}>
          <CheckCircle2 size={15} color={C.midGreen} />
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>No blank placeholders or missing fields found.</p>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>DRAFT TEXT (edit as needed)</label>
        <textarea
          value={draftMarkdown}
          onChange={e => onEditDraft(e.target.value)}
          rows={10}
          className="w-full rounded-xl border px-3 py-2.5 text-xs leading-relaxed"
          style={{ borderColor: C.cream, fontFamily: "monospace" }}
        />
      </div>

      <button
        onClick={onContinue}
        disabled={hasIssues}
        className="w-full rounded-xl py-3 text-sm font-bold"
        style={{ background: hasIssues ? C.cream : C.darkGreen, color: hasIssues ? C.mutedText : "#fff", border: "none" }}
      >
        {hasIssues ? "Resolve issues above to continue" : "Continue to declaration & signature"}
      </button>
    </section>
  );
}