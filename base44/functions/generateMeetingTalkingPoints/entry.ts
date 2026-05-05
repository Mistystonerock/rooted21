import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseContext, conversationHistory, childName, caseType } = await req.json();

    if (!caseContext || !conversationHistory) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build conversation summary
    const conversationSummary = conversationHistory
      .map(m => `${m.role === "user" ? "Parent" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const prompt = `Based on this meeting prep conversation, generate a structured "talking points" cheat sheet the parent can use during their actual meeting.

CASE CONTEXT:
${caseContext}

MEETING PREP CONVERSATION:
${conversationSummary}

Create a markdown document with:

1. **Meeting Overview** - Type of meeting, who will be there, expected duration
2. **Opening Statement** - A 30-second introduction of concerns
3. **Key Talking Points** - 5-7 bullet points with specific evidence/examples from the case
4. **Challenging Questions & Responses** - 3-4 tough questions they might face with suggested responses
5. **What You're Asking For** - Specific outcomes/accommodations/decisions
6. **If They Say No** - Alternative requests or next steps
7. **Follow-Up Actions** - What to request in writing, who to contact, timeline

Keep language clear, parent-friendly, and grounded in their specific case. Include specific examples from their notes where relevant.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          talkingPoints: { type: "string" }
        }
      },
    });

    return Response.json({ talkingPoints: response.talkingPoints });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});