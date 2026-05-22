import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import StabilityMetricCard from "@/components/analytics/StabilityMetricCard";
import FamilyStabilityTrendChart from "@/components/analytics/FamilyStabilityTrendChart";
import FamilyStabilityInsights from "@/components/analytics/FamilyStabilityInsights";
import { C } from "@/lib/rooted-constants";
import { Loader2, TrendingUp } from "lucide-react";

function monthKey(dateString) {
  return String(dateString || "").slice(0, 7);
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short" });
}

function lastSixMonths() {
  const months = [];
  const date = new Date();
  date.setDate(1);
  for (let i = 5; i >= 0; i -= 1) {
    const current = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push(current.toISOString().slice(0, 7));
  }
  return months;
}

function riskToScore(entry) {
  if (typeof entry.court_readiness_score === "number") return entry.court_readiness_score;
  if (entry.ai_risk_level === "high") return 35;
  if (entry.ai_risk_level === "medium") return 65;
  if (entry.ai_risk_level === "low") return 90;
  return 75;
}

function average(values, fallback = 0) {
  const usable = values.filter(value => Number.isFinite(value));
  if (!usable.length) return fallback;
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

export default function FamilyStabilityAnalytics() {
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const me = await base44.auth.me();
    const [visitLogs, communications] = await Promise.all([
      base44.entities.VisitationLog.filter({ parent_email: me.email }, "-visit_date", 500),
      base44.entities.CommunicationJournalEntry.list("-entry_date", 500),
    ]);
    setUser(me);
    setVisits(visitLogs);
    setJournalEntries(communications);
    setLoading(false);
  }

  const analytics = useMemo(() => {
    const months = lastSixMonths();
    const monthlyTrends = months.map(key => {
      const monthVisits = visits.filter(visit => monthKey(visit.visit_date) === key);
      const monthEntries = journalEntries.filter(entry => monthKey(entry.entry_date || entry.created_date) === key);
      const completed = monthVisits.filter(visit => visit.attended !== false && visit.compliance_status !== "no_show").length;
      const visitationConsistency = monthVisits.length ? Math.round((completed / monthVisits.length) * 100) : 0;
      const toneScore = average(monthEntries.map(riskToScore), monthEntries.length ? 0 : 75);
      const stabilityScore = monthVisits.length || monthEntries.length ? average([toneScore, visitationConsistency || toneScore], toneScore) : 0;

      return {
        month: key,
        label: monthLabel(key),
        toneScore,
        visitationConsistency,
        stabilityScore,
        communicationEntries: monthEntries.length,
        visitsScheduled: monthVisits.length,
        visitsCompleted: completed,
        highTensionEntries: monthEntries.filter(entry => entry.ai_risk_level === "high").length,
        incidents: monthVisits.filter(visit => visit.incident_type && visit.incident_type !== "none").length,
      };
    });

    const allToneScores = journalEntries.map(riskToScore);
    const completedVisits = visits.filter(visit => visit.attended !== false && visit.compliance_status !== "no_show").length;
    const visitationRate = visits.length ? Math.round((completedVisits / visits.length) * 100) : 0;
    const toneAverage = average(allToneScores, journalEntries.length ? 0 : 75);
    const stabilityAverage = average(monthlyTrends.map(item => item.stabilityScore).filter(Boolean), average([toneAverage, visitationRate], 0));

    return {
      monthlyTrends,
      summary: {
        tone_average: toneAverage,
        visitation_consistency: visitationRate,
        stability_average: stabilityAverage,
        communication_entries: journalEntries.length,
        visitation_logs: visits.length,
        high_tension_entries: journalEntries.filter(entry => entry.ai_risk_level === "high").length,
        incidents: visits.filter(visit => visit.incident_type && visit.incident_type !== "none").length,
      }
    };
  }, [visits, journalEntries]);

  async function generateInsights() {
    setInsightsLoading(true);
    const response = await base44.functions.invoke("generateFamilyStabilityInsights", analytics);
    setInsights(response.data.insights);
    setInsightsLoading(false);
  }

  if (loading) {
    return <div className="min-h-screen" style={{ background: C.offWhite }}><MobileHeader title="Stability Analytics" backTo="/dashboard" /><div className="flex justify-center py-12"><Loader2 className="animate-spin" color={C.darkGreen} /></div></div>;
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Stability Analytics" subtitle="Tone, parenting-time consistency, and long-term trends" backTo="/dashboard" />
      <main className="mx-auto max-w-[760px] space-y-5 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-3">
            <TrendingUp size={24} color={C.cream} />
            <div>
              <p className="font-serif text-2xl font-black" style={{ color: C.cream }}>Family stability dashboard</p>
              <p className="mt-1 text-sm leading-6" style={{ color: C.lightGreen }}>Track communication tone and visitation consistency so patterns are easier to see and improve over time.</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StabilityMetricCard label="Tone score" value={`${analytics.summary.tone_average}%`} helper="Higher is calmer" tone="calm" />
          <StabilityMetricCard label="Visitation" value={`${analytics.summary.visitation_consistency}%`} helper="Completed visits" tone="default" />
          <StabilityMetricCard label="Stability" value={`${analytics.summary.stability_average}%`} helper="Combined trend" tone="calm" />
          <StabilityMetricCard label="Tension flags" value={analytics.summary.high_tension_entries} helper="High-risk entries" tone={analytics.summary.high_tension_entries ? "warm" : "default"} />
        </div>

        <FamilyStabilityTrendChart data={analytics.monthlyTrends} />
        <FamilyStabilityInsights insights={insights} loading={insightsLoading} onGenerate={generateInsights} />

        <section className="rounded-3xl border bg-white p-4 text-xs leading-6 shadow-sm" style={{ borderColor: C.cream, color: C.mutedText }}>
          <p className="font-black" style={{ color: C.darkGreen }}>How to use this</p>
          Review trends monthly, document facts consistently, and use the AI suggestions to choose one practical improvement focus at a time. This dashboard supports organization and reflection; it does not replace legal, clinical, or emergency guidance.
        </section>
      </main>
    </div>
  );
}