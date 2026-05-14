import { CheckSquare, MessageSquare, Mail, CalendarClock } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function ComplianceSourceStats({ stats }) {
  const cards = [
    { label: "Open checklist items", value: stats.openItems, icon: CheckSquare },
    { label: "Due soon / overdue", value: stats.timeSensitiveItems, icon: CalendarClock },
    { label: "Audit log entries", value: stats.auditLogs, icon: MessageSquare },
    { label: "Agency emails", value: stats.agencyEmails, icon: Mail },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <Icon size={16} color={C.midGreen} />
            <p className="font-serif font-bold text-2xl mt-2" style={{ color: C.darkGreen }}>{card.value}</p>
            <p className="text-[10px] uppercase font-extrabold tracking-wider" style={{ color: C.mutedText }}>{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}