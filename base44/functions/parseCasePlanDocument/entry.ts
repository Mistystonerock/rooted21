import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { file_url, source } = await req.json();
    if (!file_url) return Response.json({ error: "file_url is required" }, { status: 400 });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a child welfare case plan analyzer for families in the Rooted 21 parenting support system.

A family has uploaded a case plan document from ${source === "cps" ? "CPS (Child Protective Services)" : source === "court" ? "the court" : "a professional"}.

Your job is to:
1. Extract EVERY task, requirement, service, or obligation the FAMILY (parent/caregiver) must complete
2. Generate a plain-language summary the parent can understand
3. Categorize each item

Return ONLY a JSON object — no extra text.

Categories: "service" (classes, therapy, counseling), "appointment" (meetings, visits, evaluations), "document" (forms, paperwork, proof), "court_order" (court-mandated items), "behavioral" (behavior goals, parenting requirements), "housing" (housing stability, safety), "employment" (jobs, income, financial), "other"

Required JSON format:
{
  "title": "Brief descriptive title for this case plan",
  "summary": "2-3 sentence plain-language explanation of what this case plan requires and why, written directly to the parent in a supportive tone",
  "items": [
    {
      "text": "Complete and attend 12-week parenting skills class",
      "category": "service",
      "due_date": "2026-08-01"
    }
  ]
}

Only include due_date if explicitly stated in the document. Keep item text clear and action-oriented. Write as if speaking to the parent ("Complete...", "Attend...", "Submit...").`,
      file_urls: [file_url],
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                category: { type: "string" },
                due_date: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("parseCasePlanDocument error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});