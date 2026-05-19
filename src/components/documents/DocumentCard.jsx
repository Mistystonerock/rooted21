import { C } from "@/lib/rooted-constants";
import { FileText, Eye, Share2, Trash2, Lock } from "lucide-react";
import { format } from "date-fns";

export default function DocumentCard({ doc, onShare, onDelete }) {
  // Get icon by category
  const getCategoryIcon = (cat) => {
    const icons = {
      court_order: "⚖️",
      iep: "🎓",
      medical: "🏥",
      behavioral_health: "🧠",
      substance_use: "🔒",
      safety_plan: "🛡️",
      case_plan: "🧭",
      visitation: "🤝",
      resource_referral: "🌿",
      legal: "📋",
      school: "🏫",
      therapy: "🧠",
      financial: "💰",
      other: "📄",
    };
    return icons[cat] || "📄";
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      court_order: "Court Order",
      iep: "IEP",
      medical: "Medical",
      behavioral_health: "Behavioral Health",
      substance_use: "Part 2 Protected",
      safety_plan: "Safety Plan",
      case_plan: "Case Plan",
      visitation: "Visitation",
      resource_referral: "Resource Referral",
      legal: "Legal",
      school: "School",
      therapy: "Therapy",
      financial: "Financial",
      other: "Other",
    };
    return labels[cat] || "Document";
  };

  return (
    <div className="rounded-xl p-3.5 border" style={{ background: "#fff", borderColor: C.cream }}>
      <div className="flex items-start gap-3 mb-2">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">{getCategoryIcon(doc.category)}</div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-xs font-bold leading-tight" style={{ color: C.darkGreen }}>
                {doc.title}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                {getCategoryLabel(doc.category)} • {format(new Date(doc.created_date), "MMM d, yyyy")}
              </p>
            </div>
            {doc.is_private && (
              <Lock size={12} color={C.mutedText} className="flex-shrink-0 mt-0.5" />
            )}
          </div>

          {/* Description */}
          {doc.description && (
            <p className="text-[10px] leading-relaxed mt-1 line-clamp-2" style={{ color: "#3a3028" }}>
              {doc.description}
            </p>
          )}

          {doc.extracted_dates?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {doc.extracted_dates.slice(0, 3).map(date => (
                <span key={date} className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "#EEF4FF", color: "#315E91" }}>
                  📅 {date}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {doc.tags.map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: C.cream, color: C.darkGreen }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* File info */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[9px]" style={{ color: C.mutedText }}>
              {(doc.file_size / 1024).toFixed(0)} KB
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "#EAF4EA", color: C.darkGreen }}>
              Private vault
            </span>
            {doc.part2_segmented && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "#FEF3EE", color: "#9A3412" }}>
                Part 2 segmented
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 mt-2 pt-2" style={{ borderTop: `1px solid ${C.cream}` }}>
        {doc.file_url ? (
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold text-[10px]"
            style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer", textDecoration: "none" }}
          >
            <Eye size={12} /> View
          </a>
        ) : (
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold text-[10px]"
            style={{ background: C.cream, color: C.darkGreen, border: "none" }}
            title="Private vault files require signed access"
          >
            <Eye size={12} /> Vaulted
          </button>
        )}
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold text-[10px]"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
        >
          <Share2 size={12} /> Share
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold text-[10px]"
          style={{ background: "#FEF3EE", color: "#B84C2A", border: "none", cursor: "pointer" }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}