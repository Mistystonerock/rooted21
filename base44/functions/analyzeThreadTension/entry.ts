import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { partnershipId, threadType = "coparenting", lastN = 10 } = await req.json();

    // Fetch recent messages
    let messages = [];
    if (threadType === "coparenting") {
      messages = await base44.entities.CoParentingMessage.filter(
        { partnership_id: partnershipId },
        "-created_date",
        lastN
      );
    } else if (threadType === "secure") {
      messages = await base44.entities.SecureMessage.filter(
        { partnership_id: partnershipId },
        "-created_date",
        lastN
      );
    }

    if (messages.length === 0) {
      return Response.json({
        success: true,
        tensionLevel: "none",
        tensionScore: 0,
        alert: null,
        suggestions: [],
        messageCount: 0,
      });
    }

    // Reverse to get chronological order
    messages = messages.reverse();

    // Analyze tension trajectory
    const tensionAnalysisPrompt = `Analyze the tension level in this message thread and detect escalation patterns. Score each message's tension on a 1-5 scale (1=calm, 5=highly escalated). Identify:
1. Overall thread tension trajectory (escalating/stable/de-escalating)
2. Peak tension point and what caused it
3. Specific escalation triggers or language patterns
4. For the MOST RECENT message: suggest a neutral, factual, court-ready rephrasing that maintains the point but removes inflammatory language

Messages (chronological order):
${messages.map((m, i) => `[${i + 1}] ${m.sender_name || "Unknown"}: "${m.body}"`).join("\n")}

Return ONLY valid JSON:
{
  "overall_trajectory": "escalating|stable|de-escalating",
  "trajectory_score": 0-100,
  "peak_tension_point": number (1-based message index),
  "escalation_triggers": ["trigger1", "trigger2"],
  "tension_by_message": [1-5, 1-5, ...],
  "latest_message_rephrasing": {
    "original": "original message text",
    "suggested": "neutral, court-ready rephrasing",
    "explanation": "brief explanation of changes made"
  },
  "key_pattern": "brief observation of communication pattern"
}`;

    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: tensionAnalysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_trajectory: { type: "string" },
          trajectory_score: { type: "number" },
          peak_tension_point: { type: "number" },
          escalation_triggers: { type: "array", items: { type: "string" } },
          tension_by_message: { type: "array", items: { type: "number" } },
          latest_message_rephrasing: {
            type: "object",
            properties: {
              original: { type: "string" },
              suggested: { type: "string" },
              explanation: { type: "string" },
            },
          },
          key_pattern: { type: "string" },
        },
      },
    });

    // Determine tension level
    let tensionLevel = "none";
    let alertType = null;
    let alertMessage = null;

    if (analysisResult.trajectory_score >= 70) {
      tensionLevel = "high";
      alertType = "escalating";
      alertMessage = analysisResult.key_pattern;
    } else if (analysisResult.trajectory_score >= 50) {
      tensionLevel = "moderate";
      alertType = "rising";
      alertMessage = analysisResult.key_pattern;
    } else if (analysisResult.trajectory === "de-escalating") {
      tensionLevel = "improving";
    } else {
      tensionLevel = "stable";
    }

    const alert =
      alertType && alertMessage
        ? {
            type: alertType,
            message: alertMessage,
            triggers: analysisResult.escalation_triggers || [],
          }
        : null;

    // Prepare suggestions
    const suggestions = [];
    if (analysisResult.latest_message_rephrasing) {
      suggestions.push({
        originalMessage: analysisResult.latest_message_rephrasing.original,
        suggestedRephrase: analysisResult.latest_message_rephrasing.suggested,
        rationale: analysisResult.latest_message_rephrasing.explanation,
        isCourtReady: true,
      });
    }

    // Generate additional de-escalation tips if tension is high
    if (tensionLevel === "high" || tensionLevel === "moderate") {
      const tipsPrompt = `Given this escalating co-parenting message thread, provide 2-3 brief, actionable de-escalation tips. Focus on:
- Specific communication shifts that could help
- What NOT to do in the next message
- A reframing approach

Format as JSON array of tip objects with "tip" and "example" fields.

Thread context: ${analysisResult.key_pattern}
Triggers: ${(analysisResult.escalation_triggers || []).join(", ")}`;

      const tipsResult = await base44.integrations.Core.InvokeLLM({
        prompt: tipsPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tip: { type: "string" },
                  example: { type: "string" },
                },
              },
            },
          },
        },
      });

      if (tipsResult.tips && Array.isArray(tipsResult.tips)) {
        tipsResult.tips.forEach((t) => {
          suggestions.push({
            type: "de-escalation_tip",
            tip: t.tip,
            example: t.example,
          });
        });
      }
    }

    return Response.json({
      success: true,
      tensionLevel,
      tensionScore: analysisResult.trajectory_score,
      trajectory: analysisResult.overall_trajectory,
      alert,
      suggestions,
      messageCount: messages.length,
      peakTensionAt: analysisResult.peak_tension_point,
      tensionByMessage: analysisResult.tension_by_message,
    });
  } catch (error) {
    console.error("Error analyzing thread tension:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});