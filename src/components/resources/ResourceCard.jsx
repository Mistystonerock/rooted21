import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { FileText, Headphones, Video, BookOpen, Globe, ExternalLink, Bookmark } from "lucide-react";
import { useSaved } from "@/components/resources/SavedResourcesContext";

export const TYPE_META = {
  article: { label: "Article",   icon: FileText,   color: "#3a7a4a" },
  pdf:     { label: "PDF",       icon: FileText,   color: "#4a6a9a" },
  audio:   { label: "Audio",     icon: Headphones, color: "#7a5a9a" },
  video:   { label: "Video",     icon: Video,      color: "#9a4a3a" },
  book:    { label: "Book",      icon: BookOpen,   color: "#7a6a2a" },
  website: { label: "Website",   icon: Globe,      color: "#2a7a7a" },
};

export default function ResourceCard({ r }) {
  const { saved, toggle } = useSaved();
  const isSaved = saved.includes(r.id);
  const meta = TYPE_META[r.type] || TYPE_META.article;
  const Icon = meta.icon;

  return (
    <div
      className="rounded-2xl p-4 flex gap-3"
      style={{
        background: C.white,
        border: `1.5px solid ${isSaved ? `${C.midGreen}40` : C.cream}`,
        boxShadow: isSaved ? `0 0 0 1px ${C.midGreen}20` : "none",
        transition: "border 0.2s",
      }}
    >
      {/* Type badge */}
      <div
        className="flex-shrink-0 rounded-xl flex items-center justify-center"
        style={{ width: 40, height: 40, background: `${meta.color}18` }}
      >
        <Icon size={18} color={meta.color} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span
                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: `${meta.color}15`, color: meta.color }}
              >
                {meta.label}
              </span>
              {r.free && (
                <span
                  className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: `${C.midGreen}15`, color: C.midGreen }}
                >
                  Free
                </span>
              )}
            </div>
            <p className="font-bold text-sm leading-snug" style={{ color: C.darkGreen }}>
              {r.title}
            </p>
            {r.author && (
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                {r.author}
              </p>
            )}
          </div>

          {/* Bookmark */}
          <button
            onClick={() => toggle(r.id)}
            className="flex-shrink-0 rounded-xl flex items-center justify-center"
            style={{
              width: 32, height: 32,
              background: isSaved ? `${C.midGreen}15` : C.offWhite,
              border: `1px solid ${isSaved ? C.midGreen : C.cream}`,
              cursor: "pointer",
            }}
          >
            <Bookmark size={13} color={isSaved ? C.midGreen : C.mutedText} fill={isSaved ? C.midGreen : "none"} />
          </button>
        </div>

        {/* Description */}
        {r.desc && (
          <p className="text-xs leading-relaxed mt-1.5" style={{ color: "#3a3028" }}>
            {r.desc}
          </p>
        )}

        {/* Link */}
        {r.url && (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold mt-2 px-2.5 py-1 rounded-lg"
            style={{
              background: `${C.darkGreen}10`,
              color: C.darkGreen,
              textDecoration: "none",
            }}
          >
            <ExternalLink size={9} /> View Resource
          </a>
        )}
      </div>
    </div>
  );
}