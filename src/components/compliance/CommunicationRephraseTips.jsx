import { MessageSquareQuote } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CommunicationRephraseTips({ tips = [] }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquareQuote size={17} color={C.gold} />
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Court-aligned rephrasing tips</p>
      </div>

      {tips.length === 0 ? (
        <p className="text-xs" style={{ color: C.mutedText }}>Run the AI scan to identify safer, calmer ways to phrase high-risk communication patterns.</p>
      ) : (
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="rounded-xl p-3 space-y-2" style={{ background: C.offWhite }}>
              <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: C.mutedText }}>{tip.original_pattern || "High-risk wording pattern"}</p>
              <p className="text-xs leading-relaxed" style={{ color: C.darkText }}>{tip.why_it_matters}</p>
              <div className="rounded-lg p-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.midGreen }}>Try this instead</p>
                <p className="text-xs font-bold leading-relaxed" style={{ color: C.darkGreen }}>{tip.court_aligned_rephrase}</p>
              </div>
              {tip.tip && <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{tip.tip}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}