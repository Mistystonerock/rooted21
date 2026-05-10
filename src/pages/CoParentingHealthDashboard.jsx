import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import HealthScoreCard from "@/components/coparenting/HealthScoreCard";
import HealthMetricsPanel from "@/components/coparenting/HealthMetricsPanel";
import { Loader2, RotateCw, AlertTriangle } from "lucide-react";

export default function CoParentingHealthDashboard() {
  const { partnershipId } = useParams();
  const [partnership, setPartnership] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [daysBack, setDaysBack] = useState(90);

  useEffect(() => {
    fetchData();
  }, [partnershipId, daysBack]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // Get partnership info
      const partnerships = await base44.entities.CoParentingPartnership.filter({
        id: partnershipId,
      });
      if (!partnerships || partnerships.length === 0) {
        setError("Partnership not found");
        setLoading(false);
        return;
      }
      setPartnership(partnerships[0]);

      // Analyze health
      setAnalyzing(true);
      const response = await base44.functions.invoke("analyzeCoParentingHealth", {
        partnershipId,
        daysBack,
      });

      if (response.data?.success) {
        setHealthData(response.data);
      } else {
        setError(response.data?.error || "Failed to analyze partnership health");
      }
    } catch (err) {
      setError("Error loading partnership data");
      console.error(err);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Co-Parenting Health" subtitle="Partnership analysis" backTo="/co-parent-portal" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Co-Parenting Health" backTo="/co-parent-portal" />
        <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{error || "Partnership not found"}</p>
        </div>
      </div>
    );
  }

  const coparent = partnership.parent_1_email === (partnership.current_user_email || "")
    ? partnership.parent_2_name
    : partnership.parent_1_name;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title={`${coparent}'s Co-Parenting Health`}
        subtitle={`📊 ${partnership.child_name}`}
        backTo="/co-parent-portal"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Refresh button and time period selector */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={fetchData}
            disabled={analyzing}
            className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-xs"
            style={{
              background: C.darkGreen,
              color: "#fff",
              border: "none",
              cursor: analyzing ? "default" : "pointer",
              opacity: analyzing ? 0.7 : 1,
            }}
          >
            {analyzing ? (
              <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
            ) : (
              <><RotateCw size={12} /> Refresh</>
            )}
          </button>

          <div className="flex gap-1">
            {[30, 90, 180].map(days => (
              <button
                key={days}
                onClick={() => setDaysBack(days)}
                className="px-3 py-2 rounded-lg font-bold text-xs transition-all"
                style={{
                  background: daysBack === days ? C.darkGreen : C.cream,
                  color: daysBack === days ? "#fff" : C.darkGreen,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl p-3.5 flex gap-2" style={{ background: "#FDECEC", border: "1.5px solid #F5BEBE" }}>
            <AlertTriangle size={14} color="#C0392B" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: "#C0392B" }}>{error}</p>
          </div>
        )}

        {/* Main health score card */}
        {healthData && (
          <>
            <HealthScoreCard
              score={healthData.healthScore}
              level={healthData.healthLevel}
              breakdown={healthData.scoreBreakdown}
            />

            {/* Detailed metrics */}
            <HealthMetricsPanel
              sentiment={healthData.sentiment}
              incidents={healthData.incidents}
              goals={healthData.goals}
              regulation={healthData.regulation}
            />

            {/* Data summary footer */}
            <div className="rounded-xl p-3" style={{ background: C.cream }}>
              <p className="text-[10px]" style={{ color: C.mutedText }}>
                Analysis based on {healthData.messageCount} messages, {healthData.incidents.total} incidents, and {healthData.goals.total} goals over the last {healthData.daysAnalyzed} days.
              </p>
            </div>
          </>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}