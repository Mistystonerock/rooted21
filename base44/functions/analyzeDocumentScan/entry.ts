import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_base64, file_type } = await req.json();
    
    if (!file_base64) {
      return Response.json({ error: 'Missing file_base64' }, { status: 400 });
    }

    // Use AI to analyze the document
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a document analyzer for family law and child welfare documents. Analyze this document image and extract structured information.

Return a JSON object with these fields:
- title: Brief, descriptive title (e.g., "Court Order - Custody Agreement")
- description: Summary of document contents and key details
- category: One of: court_order, iep, medical, legal, school, therapy, financial, other
- tags: Array of 3-5 relevant tags (e.g., ["custody", "visitation", "modifications"])
- child_name: Name of child mentioned, if applicable
- key_dates: Array of important dates found (in YYYY-MM-DD format)
- deadlines: Array of action items with due dates
- important_contacts: Any professional contacts or parties mentioned
- summary: 2-3 sentence plain language summary

If you cannot determine a field, leave it as null.`,
      file_urls: [`data:${file_type};base64,${file_base64}`],
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          child_name: { type: "string" },
          key_dates: { type: "array", items: { type: "string" } },
          deadlines: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                due_date: { type: "string" },
              },
            },
          },
          important_contacts: { type: "array", items: { type: "string" } },
          summary: { type: "string" },
        },
      },
    });

    const parsed = response.data || {};

    return Response.json({
      success: true,
      parsed: {
        title: parsed.title || null,
        description: parsed.description || null,
        category: parsed.category || "other",
        tags: parsed.tags || [],
        child_name: parsed.child_name || null,
        key_dates: parsed.key_dates || [],
        deadlines: parsed.deadlines || [],
        important_contacts: parsed.important_contacts || [],
        summary: parsed.summary || null,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});