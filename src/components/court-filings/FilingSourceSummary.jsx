import { CheckSquare, MessageSquare, Mail, NotebookPen } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function FilingSourceSummary({ stats }) {
  const cards = [
    { label: "Checklist items", value: stats.checklistItems, icon: CheckSquare },
    { label: "Communication records", value: stats.communications, icon: MessageSquare },
    { label: "Agency emails", value: stats.agencyEmails, icon: Mail },
    { label: "Meeting notes", value: stats.meetingNotes, icon: NotebookPen },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <Icon size={16} color={C.midGreen} />
            <p className="font-serif font-bold text-2xl mt-2" style={{ color: C.darkGreen }}>{card.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.mutedText }}>{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}