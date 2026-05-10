import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { partnershipId, daysBack = 90 } = await req.json();

    // Fetch all relevant data
    const [partnership, messages, incidents, goals, behaviorLogs, caseFiles] = await Promise.all([
      base44.entities.CoParentingPartnership.filter({ id: partnershipId }),
      base44.entities.CoParentingMessage.filter({ partnership_id: partnershipId }, "-created_date", 500),
      base44.entities.IncidentReport.list("-incident_date", 200),
      base44.entities.Goal.list("-created_date", 100),
      base44.entities.BehaviorLog.list("-created_date", 300),
      base44.entities.CaseFile.list("-created_date", 50),
    ]);

    if (!partnership || partnership.length === 0) {
      return Response.json({ error: "Partnership not found" }, { status: 404 });
    }

    const pship = partnership[0];
    const childName = pship.child_name;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // Filter data by date range and child
    const recentMessages = messages.filter(m => new Date(m.created_date) >= cutoffDate);
    const recentIncidents = incidents.filter(i => 
      new Date(i.incident_date) >= cutoffDate && i.child_name === childName
    );
    const recentBehaviors = behaviorLogs.filter(b => new Date(b.created_date) >= cutoffDate);
    const relevantGoals = goals.filter(g => g.category === "co-parenting" || !g.category);

    // ── SENTIMENT ANALYSIS ──
    const sentimentPrompt = `Analyze the sentiment and tone of these co-parenting messages. For each message, rate sentiment as positive, neutral, or negative. Return JSON with overall_sentiment (average), trend (improving/stable/declining), and key_themes.

Messages:
${recentMessages.slice(0, 20).map(m => `"${m.body}"`).join("\n")}

Return ONLY valid JSON:
{
  "overall_sentiment": "positive|neutral|negative",
  "sentiment_score": 0-100,
  "trend": "improving|stable|declining",
  "key_themes": ["theme1", "theme2"],
  "communication_quality": "low|moderate|good|excellent"
}`;

    const sentimentResult = recentMessages.length > 0 
      ? await base44.integrations.Core.InvokeLLM({
          prompt: sentimentPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              overall_sentiment: { type: "string" },
              sentiment_score: { type: "number" },
              trend: { type: "string" },
              key_themes: { type: "array", items: { type: "string" } },
              communication_quality: { type: "string" },
            }
          }
        })
      : {
          overall_sentiment: "unknown",
          sentiment_score: 50,
          trend: "stable",
          key_themes: [],
          communication_quality: "insufficient_data",
        };

    // ── INCIDENT FREQUENCY & PATTERNS ──
    const incidentByWeek = {};
    recentIncidents.forEach(inc => {
      const date = new Date(inc.incident_date);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      incidentByWeek[weekKey] = (incidentByWeek[weekKey] || 0) + 1;
    });

    const incidentTrend = Object.values(incidentByWeek);
    const avgIncidentsPerWeek = incidentTrend.length > 0
      ? incidentTrend.reduce((a, b) => a + b, 0) / incidentTrend.length
      : 0;

    const incidentTrendStatus = incidentTrend.length >= 2
      ? incidentTrend[incidentTrend.length - 1] < incidentTrend[0] ? "improving" : "worsening"
      : "stable";

    // ── GOAL PROGRESS ──
    const goalMetrics = {
      total: relevantGoals.length,
      completed: relevantGoals.filter(g => g.progress === "completed").length,
      in_progress: relevantGoals.filter(g => g.progress === "in_progress").length,
      not_started: relevantGoals.filter(g => g.progress === "not_started").length,
    };

    const goalCompletionRate = goalMetrics.total > 0
      ? Math.round((goalMetrics.completed / goalMetrics.total) * 100)
      : 0;

    // ── BEHAVIOR/REGULATION TRENDS ──
    const avgChildRegulation = recentBehaviors.length > 0
      ? recentBehaviors.reduce((sum, b) => sum + (b.child_regulation || 5), 0) / recentBehaviors.length
      : 5;

    const avgParentCalmness = recentBehaviors.length > 0
      ? recentBehaviors.reduce((sum, b) => sum + (b.parent_calm || 5), 0) / recentBehaviors.length
      : 5;

    // ── CALCULATE HEALTH SCORE ──
    // Components: sentiment (25%), incident trend (25%), goal progress (25%), regulation/calmness (25%)
    const sentimentComponent = (sentimentResult.sentiment_score || 50) * 0.25;
    const incidentComponent = Math.max(0, 100 - (avgIncidentsPerWeek * 10)) * 0.25;
    const goalComponent = goalCompletionRate * 0.25;
    const regulationComponent = ((avgChildRegulation + avgParentCalmness) / 2 / 5 * 100) * 0.25;

    const healthScore = Math.round(
      sentimentComponent + incidentComponent + goalComponent + regulationComponent
    );

    // ── HEALTH LEVEL ──
    let healthLevel = "Needs Support";
    if (healthScore >= 80) healthLevel = "Thriving";
    else if (healthScore >= 65) healthLevel = "Progressing";
    else if (healthScore >= 50) healthLevel = "Stable";
    else if (healthScore >= 35) healthLevel = "Struggling";

    return Response.json({
      success: true,
      healthScore,
      healthLevel,
      daysAnalyzed: daysBack,
      sentiment: {
        overall: sentimentResult.overall_sentiment,
        score: sentimentResult.sentiment_score,
        trend: sentimentResult.trend,
        quality: sentimentResult.communication_quality,
        themes: sentimentResult.key_themes,
      },
      incidents: {
        total: recentIncidents.length,
        avgPerWeek: parseFloat(avgIncidentsPerWeek.toFixed(2)),
        trend: incidentTrendStatus,
        byWeek: incidentByWeek,
      },
      goals: goalMetrics,
      goalCompletionRate,
      regulation: {
        childRegulation: parseFloat(avgChildRegulation.toFixed(2)),
        parentCalmness: parseFloat(avgParentCalmness.toFixed(2)),
      },
      scoreBreakdown: {
        sentiment: Math.round(sentimentComponent),
        incidents: Math.round(incidentComponent),
        goals: Math.round(goalComponent),
        regulation: Math.round(regulationComponent),
      },
      messageCount: recentMessages.length,
    });
  } catch (error) {
    console.error("Error analyzing co-parenting health:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});