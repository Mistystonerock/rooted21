import { ShieldAlert, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function ComplianceRiskScore({ score = 0 }) {
  const level = score >= 70 ? "High" : score >= 40 ? "Moderate" : "Low";
  const color = score >= 70 ? "#B84C2A" : score >= 40 ? C.gold : C.midGreen;
  const Icon = score >= 40 ? ShieldAlert : ShieldCheck;

  return (
    <div className="rounded-3xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon size={24} color={color} />
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: C.mutedText }}>Predicted compliance risk</p>
          <p className="font-serif font-bold text-3xl" style={{ color }}>{level}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-serif font-bold text-4xl" style={{ color }}>{score}</p>
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>/ 100</p>
        </div>
      </div>
      <div className="h-3 rounded-full mt-4 overflow-hidden" style={{ background: C.cream }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(score, 100)}%`, background: color }} />
      </div>
    </div>
  );
}