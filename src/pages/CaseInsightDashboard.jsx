import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import InsightSummaryCards from "@/components/insights/InsightSummaryCards";
import InsightSection from "@/components/insights/InsightSection";
import { Loader2, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";

export default function CaseInsightDashboard() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");

  async function runScan() {
    setLoading(true);
    setError("");
    const response = await base44.functions.invoke("scanCaseInsights", {});
    setInsights(response.data.insights);
    setCounts(response.data.scanned_counts);
    setLoading(false);
  }

  useEffect(() => {
    runScan().catch(err => {
      setError(err?.message || "Unable to scan your case data right now.");
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="✨ AI Case Insights" subtitle="Deadlines, actions, and risk flags" backTo="/dashboard" />

      <main className="mx-auto max-w-[560px] space-y-4 px-4 py-5">
        <div className="rounded-3xl p-5" style={{ background: C.darkGreen, color: C.cream }}>
          <div className="flex items-start gap-3">
            <Sparkles size={22} color={C.cream} />
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: C.cream }}>Proactive case-plan scan</h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.cream }}>
                Moxie reviews your uploaded document summaries, behavior logs, court dates, and case-plan requirements to help you prepare.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-3xl p-8" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <Loader2 className="animate-spin" size={18} color={C.midGreen} />
            <span className="text-sm font-bold" style={{ color: C.mutedText }}>Scanning your case data…</span>
          </div>
        ) : error ? (
          <div className="rounded-3xl p-5" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
            <p className="font-bold" style={{ color: "#B84C2A" }}>{error}</p>
          </div>
        ) : (
          <>
            <InsightSummaryCards insights={insights} counts={counts} />

            <section className="rounded-3xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-sm leading-relaxed" style={{ color: C.darkText }}>{insights?.summary}</p>
              <button onClick={runScan} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>
                <RefreshCw size={15} /> Refresh scan
              </button>
            </section>

            <InsightSection
              title="Upcoming deadlines"
              items={insights?.deadlines}
              emptyText="No urgent deadlines were flagged from the current records."
              renderItem={(item, colors) => (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold" style={{ color: C.darkText }}>{item.title}</p>
                    <span className="rounded-full px-2 py-1 text-[10px] font-black uppercase" style={{ background: `${colors[item.urgency] || C.gold}22`, color: colors[item.urgency] || C.gold }}>{item.urgency}</span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: C.mutedText }}>{item.due_date || "Date not listed"} · {item.source}</p>
                  <p className="mt-2 text-sm" style={{ color: C.darkText }}>{item.action}</p>
                </>
              )}
            />

            <InsightSection
              title="Preparation actions"
              items={insights?.preparation_actions}
              emptyText="No preparation actions were suggested yet. Add documents, tasks, or case-plan items for stronger insights."
              renderItem={(item, colors) => (
                <>
                  <p className="font-bold" style={{ color: C.darkText }}>{item.title}</p>
                  <p className="mt-1 text-sm" style={{ color: C.mutedText }}>{item.reason}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm" style={{ color: C.darkText }}>
                    {(item.steps || []).map(step => <li key={step}>{step}</li>)}
                  </ul>
                  <p className="mt-2 text-xs font-black uppercase" style={{ color: colors[item.priority] || C.gold }}>Priority: {item.priority}</p>
                </>
              )}
            />

            <InsightSection
              title="Potential risks"
              items={insights?.risks}
              emptyText="No major risks were flagged from the current records."
              renderItem={(item, colors) => (
                <>
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={16} color={colors[item.risk_level] || C.gold} />
                    <p className="font-bold" style={{ color: C.darkText }}>{item.title}</p>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: C.mutedText }}>{item.why_it_matters}</p>
                  <p className="mt-2 text-sm font-bold" style={{ color: C.darkGreen }}>{item.reduce_risk}</p>
                </>
              )}
            />

            <InsightSection
              title="Documentation gaps"
              items={insights?.documentation_gaps}
              emptyText="No documentation gaps were identified."
              renderItem={(item) => (
                <>
                  <p className="font-bold" style={{ color: C.darkText }}>{item.title}</p>
                  <p className="mt-1 text-sm" style={{ color: C.mutedText }}>Missing: {item.missing_item}</p>
                  <p className="mt-2 text-sm" style={{ color: C.darkText }}>Suggested proof: {item.suggested_proof}</p>
                </>
              )}
            />
          </>
        )}

        <div className="rounded-2xl p-3 text-xs leading-relaxed" style={{ background: "#FEF3EE", color: "#9A3412", border: "1px solid #F4C9B8" }}>
          Moxie provides preparation support and legal information, not legal advice. For case-specific legal advice, contact an attorney or the court clerk.
        </div>
      </main>
    </div>
  );
}