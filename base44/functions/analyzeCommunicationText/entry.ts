import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, context = 'co-parent or agency communication' } = await req.json();
    const cleanedText = String(text || '').trim();

    if (!cleanedText) {
      return Response.json({ error: 'Please provide communication text to analyze.' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a trauma-informed communication coach helping parents keep written messages professional, neutral, and court-appropriate.

Analyze the pasted communication thread or draft below. Focus on tone, emotional volatility, escalation risk, potential emotional/legal triggers, and how the parent can respond in a factual, calm, child-focused, collaborative way.

Context: ${context}

Communication text:
"""
${cleanedText.slice(0, 12000)}
"""

Return only valid JSON with:
- overall_tone: concise tone label
- emotional_volatility: low, elevated, or high
- risk_level: low, medium, or high
- court_readiness_score: 0-100 where 100 is very professional and court-appropriate
- summary: 2-3 sentence plain-English summary
- potential_triggers: specific phrases, themes, or dynamics that could escalate conflict
- flagged_phrases: exact or near-exact phrases that may read poorly in court, with safer alternatives
- rewrite: a professional, neutral message the user could send next or use as a cleaned-up version
- communication_tips: practical tips for keeping the thread professional
- what_to_avoid: actions or wording to avoid

Do not give legal advice. Keep the rewrite factual, brief, child-focused, and non-accusatory.`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_tone: { type: 'string' },
          emotional_volatility: { type: 'string' },
          risk_level: { type: 'string' },
          court_readiness_score: { type: 'number' },
          summary: { type: 'string' },
          potential_triggers: { type: 'array', items: { type: 'string' } },
          flagged_phrases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                phrase: { type: 'string' },
                concern: { type: 'string' },
                safer_alternative: { type: 'string' }
              }
            }
          },
          rewrite: { type: 'string' },
          communication_tips: { type: 'array', items: { type: 'string' } },
          what_to_avoid: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('Communication analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});