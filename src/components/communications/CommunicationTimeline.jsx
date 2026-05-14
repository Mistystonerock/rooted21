import { CalendarDays, Mail, MessageSquare, NotebookPen, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const ICONS = {
  coparent: MessageSquare,
  agency_email: Mail,
  secure_message: ShieldCheck,
  meeting_note: NotebookPen,
};

const LABELS = {
  coparent: "Co-parent message",
  agency_email: "Agency email",
  secure_message: "Professional message",
  meeting_note: "Case meeting note",
};

export default function CommunicationTimeline({ items }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
        <CalendarDays size={28} color={C.gold} className="mx-auto mb-3" />
        <p className="font-serif font-bold" style={{ color: C.darkGreen }}>No communications found</p>
        <p className="text-xs mt-1" style={{ color: C.mutedText }}>Try changing filters or add an agency email log.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(item => {
        const Icon = ICONS[item.type] || MessageSquare;
        return (
          <div key={`${item.type}-${item.id}`} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.midGreen}18` }}>
                <Icon size={17} color={C.midGreen} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold tracking-wider uppercase" style={{ color: C.gold }}>{LABELS[item.type]}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: C.darkGreen }}>{item.title}</p>
                  </div>
                  <p className="text-[10px] text-right flex-shrink-0" style={{ color: C.mutedText }}>{item.dateLabel}</p>
                </div>
                <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>{item.participants}</p>
                <p className="text-sm mt-3 leading-relaxed whitespace-pre-wrap" style={{ color: C.darkText }}>{item.body}</p>
                {item.meta && <p className="text-[10px] mt-3 rounded-full inline-flex px-2 py-1" style={{ background: C.offWhite, color: C.mutedText }}>{item.meta}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}