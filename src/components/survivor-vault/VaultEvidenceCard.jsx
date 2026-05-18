import { Clock, Download, FileText, Shield } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const labels = {
  screenshot: "Screenshot",
  photo: "Photo",
  police_report: "Police report",
  threatening_message: "Concerning message",
  custody_paperwork: "Custody paperwork",
  journal: "Journal",
  medical_document: "Medical document",
  evidence_timeline: "Evidence timeline",
  other: "Other"
};

export default function VaultEvidenceCard({ item, onDownload }) {
  const displayName = item.disguise_name || item.title;

  return (
    <article className="rounded-2xl p-4 shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: C.cream }}>
          <FileText size={18} color={C.darkGreen} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black" style={{ color: C.darkGreen }}>{displayName}</p>
          <p className="mt-1 text-xs font-bold" style={{ color: C.warmText }}>{labels[item.category] || item.category}</p>
        </div>
      </div>
      {item.description && <p className="mt-3 text-sm leading-relaxed" style={{ color: C.mutedText }}>{item.description}</p>}
      {item.timeline_notes && <p className="mt-2 rounded-xl p-3 text-xs leading-relaxed" style={{ background: C.offWhite, color: C.mutedText }}>{item.timeline_notes}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold" style={{ color: C.warmText }}>
        <span className="inline-flex items-center gap-1"><Clock size={12} /> {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : "Timestamped"}</span>
        <span className="inline-flex items-center gap-1"><Shield size={12} /> Append-only</span>
      </div>
      {item.private_file_uri && (
        <button onClick={() => onDownload(item)} className="mt-4 w-full rounded-xl py-2 text-xs font-black" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>
          <Download size={14} className="mr-1" /> Secure download
        </button>
      )}
    </article>
  );
}