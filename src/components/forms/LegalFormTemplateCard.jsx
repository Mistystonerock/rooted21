import { ChevronRight, FileSignature } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function LegalFormTemplateCard({ template, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-2xl p-4 text-left flex items-start gap-3"
      style={{
        background: selected ? "#EAF4EA" : C.white,
        border: `1.5px solid ${selected ? C.midGreen : C.cream}`,
        cursor: "pointer",
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: C.cream }}>
        <FileSignature size={18} color={C.midGreen} />
      </div>
      <div className="flex-1">
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>{template.title}</p>
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.mutedText }}>{template.description}</p>
      </div>
      <ChevronRight size={16} color={C.mutedText} />
    </button>
  );
}