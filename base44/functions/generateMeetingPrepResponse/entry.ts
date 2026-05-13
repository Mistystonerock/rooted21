import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userMessage, caseContext, conversationHistory, childName, caseType } = await req.json();

    if (!userMessage || !caseContext) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build conversation history for context
    const historyText = conversationHistory
      .slice(-10)
      .map(m => `${m.role === "user" ? "Parent" : "Assistant"}: ${m.content}`)
      .join("\n");

    const systemPrompt = `You are an expert, plain-spoken meeting prep coach helping parents prepare for difficult meetings about their child's care, including IEP meetings, court hearings, CPS meetings, therapy sessions, medical appointments, and school discipline meetings.

CASE CONTEXT:
${caseContext}

CONVERSATION HISTORY:
${historyText}

CRITICAL BOUNDARIES:
- Do not give legal advice or tell the parent what to file.
- Do not diagnose or provide medical advice.
- Do help them organize facts, questions, documents, dates, concerns, and calm talking points.
- For legal strategy, tell them to speak with an attorney or legal aid.

HOW TO RESPOND:
1. Talk like a supportive person sitting beside them.
2. Every case is different. If you do not have enough facts, ask 2-4 clear follow-up questions before giving a detailed plan.
3. Use the case context and child's name naturally.
4. If they are preparing for court, ask about hearing type, county/state, deadlines, current orders, what documents they have, and what outcome they are hoping for.
5. If they are preparing for an IEP/school meeting, ask about grade, disability/concerns, current supports, incidents, evaluations, and desired accommodations.
6. Keep it concise, practical, and nonjudgmental.

Parent message: ${userMessage}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: systemPrompt,
      model: "gpt_5_5",
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" }
        }
      },
      add_context_from_internet: false,
    });

    return Response.json({ response: response.response || response.response_text || response });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});