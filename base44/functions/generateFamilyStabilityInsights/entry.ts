import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { monthlyTrends = [], summary = {} } = await req.json();

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a trauma-informed family stability coach. Review communication tone and visitation consistency trends, then provide neutral, practical insights for long-term improvement. Do not give legal advice. Keep language supportive, factual, and action-oriented.

Summary metrics: ${JSON.stringify(summary)}
Monthly trends: ${JSON.stringify(monthlyTrends)}

Return only valid JSON with:
- stability_summary: 3-4 sentence overview of family stability trends
- strengths: array of positive patterns to reinforce
- risk_patterns: array of recurring tension, consistency, or logistical patterns to watch
- actionable_steps: array of specific next steps the parent can take this month
- documentation_tips: array of court-appropriate documentation tips
- focus_area: one concise recommended focus area for the next 30 days`,
      response_json_schema: {
        type: 'object',
        properties: {
          stability_summary: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          risk_patterns: { type: 'array', items: { type: 'string' } },
          actionable_steps: { type: 'array', items: { type: 'string' } },
          documentation_tips: { type: 'array', items: { type: 'string' } },
          focus_area: { type: 'string' }
        }
      }
    });

    return Response.json({ success: true, insights: result });
  } catch (error) {
    console.error('Family stability insights error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});