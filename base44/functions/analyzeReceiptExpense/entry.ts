import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, partnership_id } = await req.json();

    if (!file_url || !partnership_id) {
      return Response.json({ error: 'Missing file_url or partnership_id' }, { status: 400 });
    }

    // Use AI to analyze receipt and extract expense details
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this receipt image and extract expense information.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "vendor": "store or provider name",
  "amount": numeric amount,
  "category": "medical" | "education" | "childcare" | "clothing" | "activities" | "food" | "transportation" | "other",
  "description": "brief item description",
  "date": "YYYY-MM-DD format if visible, otherwise today's date",
  "court_ordered": false (set true only if this appears to be court-ordered support/obligation)
}

If you cannot identify these details, use reasonable estimates. Always return valid JSON.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          vendor: { type: "string" },
          amount: { type: "number" },
          category: { type: "string" },
          description: { type: "string" },
          date: { type: "string" },
          court_ordered: { type: "boolean" }
        }
      }
    });

    // Create expense record
    const expense = await base44.entities.SharedExpense.create({
      partnership_id,
      title: analysisResult.description || `${analysisResult.vendor} - ${analysisResult.category}`,
      category: analysisResult.category,
      total_amount: analysisResult.amount,
      paid_by_email: user.email,
      paid_by_name: user.full_name,
      split_type: "50_50",
      other_parent_email: null, // Will be filled by user later
      amount_owed: analysisResult.amount / 2,
      payment_status: "pending",
      date: analysisResult.date,
      receipt_url: file_url,
    });

    return Response.json({
      success: true,
      expense,
      analysis: analysisResult
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});