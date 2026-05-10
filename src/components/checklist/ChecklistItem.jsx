import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { CheckCircle2, Circle, Upload, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const CATEGORY_CONFIG = {
  service:     { label: "Service",      color: "#1A5FAD", bg: "#E8F4FF" },
  appointment: { label: "Appointment",  color: "#B84C2A", bg: "#FEF3EE" },
  document:    { label: "Document",     color: "#7A5200", bg: "#FFF8E6" },
  court_order: { label: "Court Order",  color: "#5C3D9E", bg: "#F3EDFF" },
  behavioral:  { label: "Behavioral",   color: C.midGreen, bg: "#EAF4EA" },
  housing:     { label: "Housing",      color: C.brown,   bg: "#FEF3EE" },
  employment:  { label: "Employment",   color: "#2D6A8A", bg: "#E8F4FF" },
  other:       { label: "Other",        color: C.mutedText, bg: C.offWhite },
};

export default function ChecklistItem({ item, onToggle, onUploadProof }) {
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;

  async function handleProofUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUploadProof(item.id, file_url, file.name);
    setUploading(false);
  }

  const isOverdue = item.due_date && !item.completed && new Date(item.due_date) < new Date();

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      border: `1.5px solid ${item.completed ? C.midGreen + "60" : isOverdue ? "#F4C9B8" : C.cream}`,
      background: item.completed ? "#F5FCF5" : "#fff",
      opacity: item.completed ? 0.9 : 1,
    }}>
      {/* Main row */}
      <div className="flex items-start gap-3 p-3.5">
        {/* Checkbox */}
        <button onClick={() => onToggle(item.id)}
          className="flex-shrink-0 mt-0.5"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          {item.completed
            ? <CheckCircle2 size={22} color={C.midGreen} />
            : <Circle size={22} color={isOverdue ? "#B84C2A" : C.cream} />}
        </button>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug" style={{
            color: item.completed ? C.mutedText : C.darkGreen,
            textDecoration: item.completed ? "line-through" : "none",
          }}>
            {item.text}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
            {item.due_date && (
              <span className="text-[10px] font-bold"
                style={{ color: isOverdue ? "#B84C2A" : C.mutedText }}>
                {isOverdue ? "⚠️ " : "📅 "}Due {new Date(item.due_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            {item.proof_url && (
              <span className="text-[10px] font-bold" style={{ color: C.midGreen }}>
                ✅ Proof uploaded
              </span>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
          {expanded
            ? <ChevronUp size={14} color={C.mutedText} />
            : <ChevronDown size={14} color={C.mutedText} />}
        </button>
      </div>

      {/* Expanded area */}
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-0 space-y-2.5 border-t" style={{ borderColor: C.cream }}>
          {item.completed && item.completed_date && (
            <p className="text-[10px]" style={{ color: C.midGreen }}>
              ✅ Marked complete on {new Date(item.completed_date).toLocaleDateString()}
            </p>
          )}

          {/* Proof upload */}
          {!item.proof_url ? (
            <div>
              <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>
                UPLOAD PROOF OF COMPLETION
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
                {uploading
                  ? <><Loader2 size={12} className="animate-spin" /> Uploading…</>
                  : <><Upload size={12} /> Attach document or photo</>}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={handleProofUpload} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FileText size={14} color={C.midGreen} />
              <a href={item.proof_url} target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-bold underline"
                style={{ color: C.midGreen }}>
                {item.proof_filename || "View uploaded proof"}
              </a>
            </div>
          )}

          {item.notes && (
            <p className="text-[11px]" style={{ color: C.mutedText }}>{item.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}