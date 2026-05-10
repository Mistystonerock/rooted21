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
          <p className="text-[9px] mt-2" style={{ color: C.mutedText }}>
            {(doc.file_size / 1024).toFixed(0)} KB
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 mt-2 pt-2" style={{ borderTop: `1px solid ${C.cream}` }}>
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold text-[10px]"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer", textDecoration: "none" }}
        >
          <Eye size={12} /> View
        </a>
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