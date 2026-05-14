import { CalendarDays, Clock, AlertTriangle } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function DeadlineSummaryCard({ label, value, detail, tone = "green" }) {
  const Icon = tone === "urgent" ? AlertTriangle : tone === "date" ? CalendarDays : Clock;
  const color = tone === "urgent" ? "#B84C2A" : tone === "date" ? C.gold : C.midGreen;

  return (
    <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={17} color={color} />
        </div>
        <p className="text-[10px] font-extrabold tracking-wider uppercase" style={{ color: C.mutedText }}>{label}</p>
      </div>
      <p className="font-serif font-bold text-2xl" style={{ color: C.darkGreen }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: C.mutedText }}>{detail}</p>
    </div>
  );
}