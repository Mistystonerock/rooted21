import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Generate AI transcript and analyze tone of a recorded call
 * Uses LLM to create readable transcript and detect conflict
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { call_id, recording_url, initiator_name, recipient_name } = await req.json();

    if (!call_id || !recording_url) {
      return Response.json(
        { error: 'Missing call_id or recording_url' },
        { status: 400 }
      );
    }

    // Use InvokeLLM to generate transcript and analyze tone
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a court-ready transcription and analysis expert. A recording of a co-parenting call between ${initiator_name} and ${recipient_name} is available at: ${recording_url}

Please provide:
1. A clear, timestamped transcript of the call (format: HH:MM - SPEAKER: text)
2. A tone analysis (calm, tense, heated, etc.)
3. Whether conflict was detected (yes/no)
4. A brief summary suitable for court review

Format your response as JSON:
{
  "transcript": "complete transcript here",
  "tone": "overall tone",
  "tension_detected": true/false,
  "tension_summary": "brief conflict analysis or 'No significant tension detected'",
  "court_summary": "one paragraph suitable for court filing"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          transcript: { type: 'string' },
          tone: { type: 'string' },
          tension_detected: { type: 'boolean' },
          tension_summary: { type: 'string' },
          court_summary: { type: 'string' },
        },
        required: ['transcript', 'tone', 'tension_detected', 'tension_summary'],
      },
    });

    if (!llmResponse.data) {
      return Response.json(
        { error: 'Failed to generate transcript' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      transcript: llmResponse.data.transcript || '',
      tone: llmResponse.data.tone,
      tension_detected: llmResponse.data.tension_detected || false,
      tension_summary: llmResponse.data.tension_summary || 'No analysis available',
      court_summary: llmResponse.data.court_summary || '',
    });
  } catch (error) {
    console.error('Transcript generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});