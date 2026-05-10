import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { file_url, document_hint } = await req.json();
    if (!file_url) return Response.json({ error: "file_url is required" }, { status: 400 });

    // Use vision AI to perform OCR + structured analysis
    const analysisPrompt = `You are a document analysis assistant for a foster/adoptive family parenting platform called Rooted 21.

A parent has uploaded a photo or scan of a document. Your job is to:
1. Read and transcribe all visible text (OCR)
2. Identify the document type
3. Extract all key structured data
4. Write a clear 2-4 sentence summary note a parent could use in their case records
5. Suggest relevant case tags
6. Suggest the most appropriate category

Document hint from user: "${document_hint || "not provided"}"

Analyze the image and return a JSON object with EXACTLY this structure:
{
  "document_type": "string — e.g. IEP, Court Order, Medication Label, School Report Card, Medical Referral, Lab Results, Therapy Note, Legal Notice, Other",
  "suggested_category": "one of: court_order | iep | medical | legal | school | therapy | financial | other",
  "suggested_title": "string — a concise document title (max 60 chars)",
  "extracted_text": "string — full OCR transcription of visible text, preserving structure",
  "key_data": {
    "dates": ["array of dates found"],
    "names": ["array of names/people mentioned"],
    "organizations": ["schools, hospitals, courts, agencies mentioned"],
    "action_items": ["any deadlines, required actions, or next steps"],
    "medications": ["if medication label: name, dosage, instructions"],
    "amounts": ["dollar amounts, scores, test results, grades if present"]
  },
  "summary_note": "string — 2-4 sentence professional summary a parent can save as a case note. Start with the document type and date if found.",
  "suggested_tags": ["array of 3-6 short tags relevant for case management, e.g. 'iep', 'school-meeting', 'medication', 'court-date', 'deadline'"],
  "confidence": "high | medium | low",
  "flags": ["any urgent items, deadlines within 30 days, or safety concerns found in the document"]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      file_urls: [file_url],
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          document_type: { type: "string" },
          suggested_category: { type: "string" },
          suggested_title: { type: "string" },
          extracted_text: { type: "string" },
          key_data: {
            type: "object",
            properties: {
              dates: { type: "array", items: { type: "string" } },
              names: { type: "array", items: { type: "string" } },
              organizations: { type: "array", items: { type: "string" } },
              action_items: { type: "array", items: { type: "string" } },
              medications: { type: "array", items: { type: "string" } },
              amounts: { type: "array", items: { type: "string" } },
            },
          },
          summary_note: { type: "string" },
          suggested_tags: { type: "array", items: { type: "string" } },
          confidence: { type: "string" },
          flags: { type: "array", items: { type: "string" } },
        },
      },
    });

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    console.error("analyzeDocumentScan error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});