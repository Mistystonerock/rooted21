import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { AlertTriangle, CheckCircle2, Loader2, MessageCircle, Sparkles, X } from "lucide-react";

export default function IncomingMessageToneCoach({ message, onUseSuggestion }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissedId, setDismissedId] = useState(null);

  useEffect(() => {
    if (!message?.id || dismissedId === message.id) return;

    setLoading(true);
    setAnalysis(null);
    base44.functions.invoke("analyzeCommunicationText", {
      text: message.body,
      context: "incoming co-parenting message; identify tone, emotional volatility, escalation risk, and suggest a calm collaborative response"
    }).then((response) => {
      setAnalysis(response.data);
      setLoading(false);
    });
  }, [message?.id, dismissedId]);

  if (!message || dismissedId === message.id) return null;

  const risk = analysis?.risk_level || "low";
  const isElevated = risk === "medium" || risk === "high" || analysis?.emotional_volatility === "elevated" || analysis?.emotional_volatility === "high";
  const toneColor = risk === "high" ? "#C0392B" : risk === "medium" ? "#B87A0A" : C.midGreen;
  const toneBg = risk === "high" ? "#FDECEC" : risk === "medium" ? "#FEF9EC" : "#EAF4EA";

  return (
    <div className="px-4 py-3" style={{ background: C.white, borderTop: `1px solid ${C.cream}` }}>
      <div className="rounded-2xl p-3 space-y-3" style={{ background: toneBg, border: `1.5px solid ${toneColor}55` }}>
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            {loading ? <Loader2 size={16} className="animate-spin" color={toneColor} /> : isElevated ? <AlertTriangle size={16} color={toneColor} /> : <CheckCircle2 size={16} color={toneColor} />}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold" style={{ color: toneColor }}>
              Real-time tone coach
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: C.darkGreen }}>
              {loading ? "Analyzing the latest incoming message…" : `${analysis?.overall_tone || "Neutral"} tone · ${analysis?.emotional_volatility || "low"} volatility`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedId(message.id)}
            aria-label="Dismiss tone coach"
            style={{ background: "transparent", border: "none", color: C.mutedText, cursor: "pointer", minWidth: 32, minHeight: 32 }}
          >
            <X size={14} />
          </button>
        </div>

        {analysis && (
          <>
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>{analysis.summary}</p>

            {analysis.rewrite && (
              <div className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MessageCircle size={12} color={C.midGreen} />
                  <p className="text-[10px] font-bold" style={{ color: C.midGreen }}>SUGGESTED CALM RESPONSE</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>{analysis.rewrite}</p>
              </div>
            )}

            <div className="flex gap-2">
              {analysis.rewrite && (
                <button
                  type="button"
                  onClick={() => onUseSuggestion(analysis.rewrite)}
                  className="flex-1 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                  style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
                >
                  <Sparkles size={12} /> Use response
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}