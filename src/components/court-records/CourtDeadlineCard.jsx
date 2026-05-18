import { Clock } from "lucide-react";
import { deadlineStatus, formatDate } from "./courtRecordUtils";

const tones = {
  good: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  muted: "border-stone-200 bg-stone-50 text-stone-700"
};

export default function CourtDeadlineCard({ deadline }) {
  const status = deadlineStatus(deadline.date);

  return (
    <div className={`rounded-2xl border p-4 ${tones[status.tone]}`}>
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-bold">{deadline.title}</p>
          <p className="text-sm opacity-80">{formatDate(deadline.date)} · {status.label}</p>
          <p className="mt-1 text-xs opacity-70">{deadline.source}</p>
        </div>
      </div>
    </div>
  );
}