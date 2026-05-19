import { CalendarDays, FileType, ListChecks, Tags } from "lucide-react";
import { C } from "@/lib/rooted-constants";

function PreviewRow({ icon: Icon, label, children }) {
  if (!children) return null;
  return (
    <div className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} color={C.midGreen} />
        <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function DocumentAnalysisPreview({ parsedData }) {
  if (!parsedData) return null;

  const dates = parsedData.key_dates || [];
  const requirements = parsedData.requirements || [];
  const tags = parsedData.tags || [];

  return (
    <div className="space-y-2 rounded-2xl p-3" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
      <div>
        <p className="text-xs font-black" style={{ color: C.darkGreen }}>AI extracted document details</p>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
          Review these details before saving. They will make this record easier to search later.
        </p>
      </div>

      <PreviewRow icon={FileType} label="Detected type">
        <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{parsedData.category || "Document"}</p>
      </PreviewRow>

      {dates.length > 0 && (
        <PreviewRow icon={CalendarDays} label="Key dates">
          <div className="flex flex-wrap gap-1.5">
            {dates.slice(0, 6).map(date => (
              <span key={date} className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: C.cream, color: C.darkGreen }}>{date}</span>
            ))}
          </div>
        </PreviewRow>
      )}

      {requirements.length > 0 && (
        <PreviewRow icon={ListChecks} label="Requirements found">
          <ul className="space-y-1">
            {requirements.slice(0, 4).map(item => (
              <li key={item} className="text-[11px] leading-snug" style={{ color: C.darkGreen }}>• {item}</li>
            ))}
          </ul>
        </PreviewRow>
      )}

      {tags.length > 0 && (
        <PreviewRow icon={Tags} label="Search tags">
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 8).map(tag => (
              <span key={tag} className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: C.darkGreen, color: C.cream }}>{tag}</span>
            ))}
          </div>
        </PreviewRow>
      )}
    </div>
  );
}