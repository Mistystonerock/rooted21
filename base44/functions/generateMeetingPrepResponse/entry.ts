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

    const systemPrompt = `You are an expert meeting prep coach helping parents prepare for difficult meetings about their child's care (school IEPs, court hearings, therapy sessions, CPS meetings, etc.).

CASE CONTEXT:
${caseContext}

CONVERSATION HISTORY:
${historyText}

Your role is to:
1. Help parents simulate realistic meetings by role-playing as school staff, judges, doctors, or caseworkers
2. Ask tough but fair questions they might face
3. Provide feedback on their answers
4. Suggest stronger arguments or talking points
5. Build confidence through practice

Keep responses concise (2-3 sentences max), conversational, and supportive. Use the case context to make simulations realistic. If the parent asks about specific strategies or talking points, provide actionable advice based on their case details.

Always be encouraging and help them prepare effectively.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: userMessage,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" }
        }
      },
      add_context_from_internet: false,
    });

    return Response.json({ response: response.response });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});