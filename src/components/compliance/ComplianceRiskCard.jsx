import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function ComplianceRiskCard({ risk }) {
  const severityColor = risk.severity === "high" ? "#B84C2A" : risk.severity === "medium" ? C.gold : C.midGreen;
  const Icon = risk.severity === "low" ? CheckCircle2 : risk.timeline ? Clock : AlertTriangle;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${severityColor}55` }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${severityColor}20` }}>
          <Icon size={18} color={severityColor} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>{risk.title}</p>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase" style={{ background: `${severityColor}20`, color: severityColor }}>
              {risk.severity || "medium"}
            </span>
          </div>
          {risk.timeline && <p className="text-[10px] font-bold mt-1" style={{ color: severityColor }}>{risk.timeline}</p>}
        </div>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: C.darkText }}>{risk.reason}</p>

      {risk.evidence?.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: C.offWhite }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>Evidence found</p>
          <ul className="space-y-1">
            {risk.evidence.slice(0, 4).map((item, index) => (
              <li key={index} className="text-[11px] leading-relaxed" style={{ color: C.darkText }}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}