import { ExternalLink, FileText, BookOpen, Video, Headphones, Bookmark } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { useSaved } from "./SavedResourcesContext";

export const TYPE_META = {
  pdf:     { icon: FileText,    label: "PDF Guide",     color: "#B84C2A" },
  article: { icon: BookOpen,    label: "Article",       color: "#5B8DB8" },
  video:   { icon: Video,       label: "Video",         color: "#7A5200" },
  audio:   { icon: Headphones,  label: "Podcast/Audio", color: "#C4862A" },
  book:    { icon: BookOpen,    label: "Book",          color: "#2E7D60" },
  link:    { icon: ExternalLink,label: "Resource",      color: "#3A5D8C" },
};

export default function ResourceCard({ r }) {
  const { isSaved, toggle } = useSaved();
  const meta = TYPE_META[r.type] || TYPE_META.link;
  const Icon = meta.icon;
  const saved = isSaved(r.id);

  return (
    <div
      className="rounded-2xl p-3.5 transition-all hover:shadow-md"
      style={{ background: C.white, border: `1.5px solid ${saved ? C.midGreen : C.cream}` }}
    >
      <div className="flex gap-3">
        {/* Type icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}15` }}>
          <Icon size={16} color={meta.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5 mb-0.5">
            <div className="flex items-start gap-1.5 flex-wrap flex-1 min-w-0">
              <p className="font-bold text-sm leading-snug" style={{ color: C.darkGreen }}>{r.title}</p>
              {r.featured && (
                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${C.gold}25`, color: C.brown }}>★ FEATURED</span>
              )}
            </div>
            {/* Save button */}
            <button
              onClick={e => { e.preventDefault(); toggle(r.id); }}
              aria-label={saved ? "Remove from saved" : "Save resource"}
              className="flex-shrink-0 p-1 rounded-lg transition-colors"
              style={{ background: saved ? `${C.midGreen}15` : "transparent", border: "none", cursor: "pointer" }}
            >
              <Bookmark size={14} color={saved ? C.midGreen : C.mutedText} fill={saved ? C.midGreen : "none"} />
            </button>
          </div>

          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>{r.author}</p>
          <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{r.desc}</p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${meta.color}15`, color: meta.color }}>
                {meta.label}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: r.free ? `${C.midGreen}15` : `${C.gold}15`, color: r.free ? C.midGreen : C.brown }}>
                {r.free ? "Free" : "Paid/Book"}
              </span>
            </div>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] font-bold"
              style={{ color: C.midGreen, textDecoration: "none" }}
            >
              Open <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}