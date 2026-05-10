import { C } from "@/lib/rooted-constants";
import { AlertTriangle, TrendingUp, CheckCircle2, Lightbulb } from "lucide-react";

export default function TensionAlert({ alert, tensionLevel, suggestions, onDismiss }) {
  if (!alert && tensionLevel === "stable") return null;

  const getAlertConfig = () => {
    if (tensionLevel === "high") {
      return {
        bg: "#FDECEC",
        border: "#F5BEBE",
        icon: <AlertTriangle size={16} color="#C0392B" />,
        title: "⚠️ Escalating Tension Detected",
        color: "#C0392B",
        severity: "high",
      };
    }
    if (tensionLevel === "moderate") {
      return {
        bg: "#FEF9EC",
        border: "#E8C96A",
        icon: <TrendingUp size={16} color="#B87A0A" />,
        title: "📈 Rising Tension",
        color: "#B87A0A",
        severity: "medium",
      };
    }
    if (tensionLevel === "improving") {
      return {
        bg: "#EAF4EA",
        border: C.midGreen,
        icon: <CheckCircle2 size={16} color={C.midGreen} />,
        title: "✓ Tension Improving",
        color: C.midGreen,
        severity: "low",
      };
    }
    return null;
  };

  const config = getAlertConfig();
  if (!config) return null;

  return (
    <div className="space-y-3">
      {/* Main alert banner */}
      <div className="rounded-xl p-3.5 flex gap-3" style={{ background: config.bg, border: `1.5px solid ${config.border}` }}>
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: config.color }}>
            {config.title}
          </p>
          {alert && alert.message && (
            <p className="text-xs mt-1" style={{ color: config.color }}>
              {alert.message}
            </p>
          )}
          {alert && alert.triggers && alert.triggers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {alert.triggers.slice(0, 3).map((trigger, i) => (
                <span
                  key={i}
                  className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.1)", color: config.color }}
                >
                  {trigger}
                </span>
              ))}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{ background: "none", border: "none", cursor: "pointer", color: config.color, fontSize: "18px" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, idx) => {
            if (suggestion.type === "de-escalation_tip") {
              return (
                <div
                  key={idx}
                  className="rounded-xl p-3"
                  style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb size={14} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
                        💡 {suggestion.tip}
                      </p>
                      <p className="text-[10px] mt-1 italic" style={{ color: C.mutedText }}>
                        "{suggestion.example}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Message rephrasing suggestion
            return (
              <div
                key={idx}
                className="rounded-xl overflow-hidden"
                style={{ border: `1.5px solid ${config.border}`, background: "#fff" }}
              >
                <div className="px-3 py-2" style={{ background: config.bg }}>
                  <p className="text-[10px] font-bold" style={{ color: config.color }}>
                    ✏️ SUGGESTED REPHRASING
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  <div>
                    <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>Your message:</p>
                    <p className="text-xs italic p-2 rounded-lg" style={{ background: C.offWhite, color: C.darkGreen }}>
                      "{suggestion.originalMessage}"
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-1" style={{ color: C.midGreen }}>
                      💬 Court-ready version:
                    </p>
                    <p className="text-xs p-2 rounded-lg" style={{ background: "#EAF4EA", color: C.darkGreen }}>
                      "{suggestion.suggestedRephrase}"
                    </p>
                  </div>
                  {suggestion.rationale && (
                    <div>
                      <p className="text-[9px] font-bold" style={{ color: C.mutedText }}>Why this works:</p>
                      <p className="text-[9px] mt-0.5" style={{ color: C.mutedText }}>
                        {suggestion.rationale}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}