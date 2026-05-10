import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { AlertTriangle, CheckCircle2, Loader2, X, RefreshCw, Send } from "lucide-react";

/**
 * Analyzes a draft message for high-conflict language before sending.
 * Props:
 *   message      — the draft text to analyze
 *   onSendOriginal(text)  — send the original text as-is
 *   onSendRevised(text)   — send a suggested revision
 *   onCancel     — go back to editing
 */
export default function ConflictLanguageChecker({ message, onSendOriginal, onSendRevised, onCancel }) {
  const [phase, setPhase] = useState("idle"); // idle | analyzing | result
  const [result, setResult] = useState(null);

  async function analyze() {
    setPhase("analyzing");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a co-parenting communication coach specializing in court-admissible, conflict-free messaging.

Analyze this co-parenting message for high-conflict language. Look for:
- Accusatory or blaming language ("you always", "you never", "you did")
- Emotional/inflammatory words (hate, lazy, irresponsible, disgusting, crazy)
- Threats or ultimatums
- Opinions stated as facts about the other parent's character
- Sarcasm or passive aggression
- All-caps or excessive punctuation suggesting hostility

Message to analyze:
"${message}"

Respond ONLY with valid JSON:
{
  "risk_level": "low" | "medium" | "high",
  "flags": ["brief description of each issue found"],
  "revised": "a neutral, factual, objective rewrite that conveys the same information without conflict — suitable for court records. If the original is already fine, return it unchanged.",
  "explanation": "1-2 sentence plain-English explanation of the main issues (or confirmation that the message looks fine)"
}`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_level: { type: "string" },
          flags: { type: "array", items: { type: "string" } },
          revised: { type: "string" },
          explanation: { type: "string" },
        }
      }
    });

    setResult(res);
    setPhase("result");
  }

  // Auto-analyze on mount
  if (phase === "idle") {
    analyze();
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="w-full max-w-[480px] rounded-2xl p-6 flex flex-col items-center gap-3" style={{ background: "#fff" }}>
          <Loader2 size={28} color={C.midGreen} className="animate-spin" />
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Checking message tone…</p>
        </div>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="w-full max-w-[480px] rounded-2xl p-6 flex flex-col items-center gap-3" style={{ background: "#fff" }}>
          <Loader2 size={28} color={C.midGreen} className="animate-spin" />
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Checking message tone…</p>
          <p className="text-xs" style={{ color: C.mutedText }}>Scanning for language that could harm your case</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { risk_level, flags, revised, explanation } = result;
  const isClean = risk_level === "low" && (!flags || flags.length === 0);
  const revisedIsSame = revised?.trim() === message.trim();

  const riskConfig = {
    low:    { color: C.midGreen,  bg: "#EAF4EA", border: `${C.midGreen}55`, icon: <CheckCircle2 size={18} color={C.midGreen} />, label: "Looks Good" },
    medium: { color: "#B87A0A",   bg: "#FEF9EC", border: "#E8C96A",          icon: <AlertTriangle size={18} color="#B87A0A" />,   label: "Minor Concerns" },
    high:   { color: "#C0392B",   bg: "#FDECEC", border: "#F5BEBE",          icon: <AlertTriangle size={18} color="#C0392B" />,   label: "High Conflict" },
  }[risk_level] || { color: C.midGreen, bg: "#EAF4EA", border: `${C.midGreen}55`, icon: <CheckCircle2 size={18} color={C.midGreen} />, label: "Looks Good" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="w-full max-w-[480px] rounded-t-3xl overflow-hidden flex flex-col" style={{ background: "#fff", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: riskConfig.bg, borderBottom: `2px solid ${riskConfig.border}` }}>
          <div className="flex items-center gap-2">
            {riskConfig.icon}
            <div>
              <p className="font-bold text-sm" style={{ color: riskConfig.color }}>
                {riskConfig.label}
              </p>
              <p className="text-[10px]" style={{ color: C.mutedText }}>
                Court language analysis
              </p>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.mutedText} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Explanation */}
          <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{explanation}</p>

          {/* Flags */}
          {flags && flags.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>FLAGGED ISSUES</p>
              {flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg"
                  style={{ background: riskConfig.bg, border: `1px solid ${riskConfig.border}` }}>
                  <AlertTriangle size={11} color={riskConfig.color} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: riskConfig.color }}>{flag}</p>
                </div>
              ))}
            </div>
          )}

          {/* Original message */}
          <div>
            <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>YOUR DRAFT</p>
            <div className="rounded-xl px-3.5 py-3" style={{ background: C.offWhite, border: `1.5px solid ${C.cream}` }}>
              <p className="text-sm leading-relaxed" style={{ color: C.darkGreen }}>{message}</p>
            </div>
          </div>

          {/* Revised suggestion — only show if different */}
          {!revisedIsSame && !isClean && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>SUGGESTED REVISION</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#EAF4EA", color: C.midGreen }}>
                  AI rewrite
                </span>
              </div>
              <div className="rounded-xl px-3.5 py-3" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}55` }}>
                <p className="text-sm leading-relaxed" style={{ color: C.darkGreen }}>{revised}</p>
              </div>
            </div>
          )}

          {/* Court tip */}
          <div className="rounded-xl px-3 py-2.5 flex gap-2" style={{ background: "#F0F6F0", border: `1px solid ${C.midGreen}30` }}>
            <span className="text-sm flex-shrink-0">⚖️</span>
            <p className="text-[10px] leading-relaxed" style={{ color: C.darkGreen }}>
              <strong>Court record tip:</strong> Neutral, factual language shows cooperation and strengthens your position. Conflict language can be used against you.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-6 pt-3 flex-shrink-0 space-y-2" style={{ borderTop: `1px solid ${C.cream}` }}>
          {!isClean && !revisedIsSame && (
            <button
              onClick={() => onSendRevised(revised)}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              <Send size={14} /> Send Revised Version
            </button>
          )}
          <button
            onClick={() => onSendOriginal(message)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: isClean ? C.darkGreen : C.cream,
              color: isClean ? "#fff" : C.mutedText,
              border: "none", cursor: "pointer"
            }}
          >
            {isClean ? <><Send size={14} /> Send Message</> : "Send Original Anyway"}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "transparent", color: C.mutedText, border: "none", cursor: "pointer" }}
          >
            ✏️ Edit Message
          </button>
        </div>
      </div>
    </div>
  );
}