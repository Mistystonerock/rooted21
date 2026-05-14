import { AlertTriangle, CheckCircle2, Copy, MessageSquare, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const RISK = {
  low: { label: "Low Risk", color: C.midGreen, bg: "#EAF4EA", icon: CheckCircle2 },
  medium: { label: "Needs Care", color: "#B87A0A", bg: "#FEF9EC", icon: AlertTriangle },
  high: { label: "High Risk", color: "#C0392B", bg: "#FDECEC", icon: AlertTriangle },
};

export default function CommunicationAnalysisResult({ result }) {
  if (!result) return null;

  const risk = RISK[result.risk_level] || RISK.medium;
  const RiskIcon = risk.icon;

  function copyRewrite() {
    navigator.clipboard.writeText(result.rewrite || "");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: risk.bg, border: `1.5px solid ${risk.color}55` }}>
        <div className="flex items-center gap-3">
          <RiskIcon size={22} color={risk.color} />
          <div>
            <p className="font-bold text-sm" style={{ color: risk.color }}>{risk.label}</p>
            <p className="text-xs" style={{ color: C.mutedText }}>
              Tone: {result.overall_tone || "Not specified"} · Court-readiness: {result.court_readiness_score || 0}/100
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed mt-3" style={{ color: "#3a3028" }}>{result.summary}</p>
      </div>

      <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={15} color={C.darkGreen} />
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.darkGreen }}>COURT-APPROPRIATE REWRITE</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "#F0F6F0", border: `1px solid ${C.midGreen}55` }}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.darkGreen }}>{result.rewrite}</p>
        </div>
        <button onClick={copyRewrite} className="mt-3 rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2" style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
          <Copy size={13} /> Copy rewrite
        </button>
      </section>

      {result.flagged_phrases?.length > 0 && (
        <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-extrabold tracking-wider mb-3" style={{ color: C.mutedText }}>FLAGGED LANGUAGE</p>
          <div className="space-y-2">
            {result.flagged_phrases.map((item, index) => (
              <div key={index} className="rounded-xl p-3" style={{ background: C.offWhite }}>
                <p className="text-xs font-bold" style={{ color: "#C0392B" }}>“{item.phrase}”</p>
                <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>{item.concern}</p>
                <p className="text-[11px] mt-2 font-semibold" style={{ color: C.darkGreen }}>Try: “{item.safer_alternative}”</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <ListBlock title="Potential triggers" items={result.potential_triggers} danger />
        <ListBlock title="What to avoid" items={result.what_to_avoid} danger />
        <ListBlock title="Professional tips" items={result.communication_tips} />
      </div>
    </div>
  );
}

function ListBlock({ title, items = [], danger = false }) {
  if (!items.length) return null;
  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2 mb-2">
        {danger ? <AlertTriangle size={14} color="#B87A0A" /> : <ShieldCheck size={14} color={C.midGreen} />}
        <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>{title.toUpperCase()}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}