import { ChevronRight } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CourtPacketCard({ packet, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(packet)} className="w-full rounded-3xl border bg-white p-4 text-left shadow-sm" style={{ borderColor: C.cream }}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl" style={{ background: C.offWhite }}>⚖️</span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>{packet.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5" style={{ color: C.mutedText }}>{packet.usedFor}</p>
          {packet.emergency && <span className="mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-black" style={{ background: "#fff7ed", color: "#9a3412" }}>Safety-sensitive</span>}
        </div>
        <ChevronRight size={18} color={C.mutedText} />
      </div>
    </button>
  );
}