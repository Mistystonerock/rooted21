import { AlertTriangle, CheckCircle2, MessageSquareText } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CommunicationAnalysisPanel({ analysis }) {
  if (!analysis) return null;

  const highRisk = analysis.risk_level === "high" || analysis.emotional_volatility === "high";

  return (
    <section className="space-y-3 rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: highRisk ? "#fed7aa" : C.cream }}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: highRisk ? "#fff7ed" : "#eaf4ea" }}>
          {highRisk ? <AlertTriangle size={18} color="#9a3412" /> : <CheckCircle2 size={18} color={C.darkGreen} />}
        </div>
        <div>
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>AI communication check</p>
          <p className="mt-1 text-xs leading-5" style={{ color: C.mutedText }}>{analysis.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-2xl p-2" style={{ background: C.offWhite }}><p className="font-black">Tone</p><p>{analysis.overall_tone || "—"}</p></div>
        <div className="rounded-2xl p-2" style={{ background: C.offWhite }}><p className="font-black">Risk</p><p>{analysis.risk_level || "—"}</p></div>
        <div className="rounded-2xl p-2" style={{ background: C.offWhite }}><p className="font-black">Score</p><p>{analysis.court_readiness_score ?? "—"}</p></div>
      </div>

      {analysis.flagged_phrases?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-wide" style={{ color: C.mutedText }}>Flagged language</p>
          <div className="space-y-2">
            {analysis.flagged_phrases.map((item, index) => (
              <div key={`${item.phrase}-${index}`} className="rounded-2xl p-3 text-xs leading-5" style={{ background: "#fff7ed", color: "#9a3412" }}>
                <p><strong>Phrase:</strong> {item.phrase}</p>
                <p><strong>Concern:</strong> {item.concern}</p>
                <p><strong>Try:</strong> {item.safer_alternative}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.rewrite && (
        <div className="rounded-2xl p-3" style={{ background: C.offWhite }}>
          <p className="mb-2 flex items-center gap-2 text-xs font-black" style={{ color: C.darkGreen }}><MessageSquareText size={14} /> Collaborative re-phrase</p>
          <p className="text-sm leading-6" style={{ color: C.darkText }}>{analysis.rewrite}</p>
        </div>
      )}
    </section>
  );
}