import { Activity, AlertTriangle, CalendarClock, FileText } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const riskColors = {
  low: "#2F855A",
  medium: "#A67C52",
  high: "#B84C2A",
};

export default function InsightSummaryCards({ insights, counts }) {
  const risk = insights?.overall_risk_level || "medium";

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <AlertTriangle size={18} color={riskColors[risk]} />
        <p className="mt-2 text-xs font-bold" style={{ color: C.mutedText }}>Case-plan risk</p>
        <p className="text-lg font-black capitalize" style={{ color: riskColors[risk] }}>{risk}</p>
      </div>
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <CalendarClock size={18} color={C.midGreen} />
        <p className="mt-2 text-xs font-bold" style={{ color: C.mutedText }}>Flagged deadlines</p>
        <p className="text-lg font-black" style={{ color: C.darkText }}>{insights?.deadlines?.length || 0}</p>
      </div>
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <Activity size={18} color={C.midGreen} />
        <p className="mt-2 text-xs font-bold" style={{ color: C.mutedText }}>Behavior logs scanned</p>
        <p className="text-lg font-black" style={{ color: C.darkText }}>{counts?.behavior_logs || 0}</p>
      </div>
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <FileText size={18} color={C.midGreen} />
        <p className="mt-2 text-xs font-bold" style={{ color: C.mutedText }}>Documents scanned</p>
        <p className="text-lg font-black" style={{ color: C.darkText }}>{counts?.documents || 0}</p>
      </div>
    </div>
  );
}