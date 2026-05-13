import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VALID_CATEGORIES = ["court_order", "iep", "medical", "legal", "school", "therapy", "financial", "other"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, file_base64, file_type, document_hint } = await req.json();
    if (!file_url && !file_base64) {
      return Response.json({ error: 'Missing document file' }, { status: 400 });
    }

    const fileUrls = file_url ? [file_url] : [`data:${file_type || 'image/jpeg'};base64,${file_base64}`];

    const parsed = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a secure document analyzer for Rooted 21, helping families manage court, CPS, IEP, school, medical, and legal paperwork.

Document hint from user: ${document_hint || 'none'}
Today's date: ${new Date().toISOString().split('T')[0]}

Extract the document text and return structured data. Focus especially on:
- court dates, hearing dates, review dates, appointment dates, meeting dates
- deadlines, due dates, required services, required documents, signatures, forms, evaluations, testing, IEP tasks
- child names, organizations, contacts, locations, medications, amounts/scores

Rules:
- Use YYYY-MM-DD for every date when possible.
- calendar_items should include only real dated items from the document.
- Use event_type: court_date, school_meeting, medication, therapy, appointment, activity, or other.
- Make titles short and clear.
- Put requirements without a clear date in requirements.
- If uncertain, use confidence medium or low and include a flag.`,
      file_urls: fileUrls,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          document_type: { type: "string" },
          description: { type: "string" },
          summary: { type: "string" },
          category: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          child_name: { type: "string" },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
          extracted_text: { type: "string" },
          key_dates: { type: "array", items: { type: "string" } },
          deadlines: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                due_date: { type: "string" }
              }
            }
          },
          requirements: { type: "array", items: { type: "string" } },
          names: { type: "array", items: { type: "string" } },
          organizations: { type: "array", items: { type: "string" } },
          important_contacts: { type: "array", items: { type: "string" } },
          medications: { type: "array", items: { type: "string" } },
          amounts: { type: "array", items: { type: "string" } },
          flags: { type: "array", items: { type: "string" } },
          calendar_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                date: { type: "string" },
                time: { type: "string" },
                event_type: { type: "string" },
                location: { type: "string" },
                requirement: { type: "string" },
                notes: { type: "string" }
              }
            }
          }
        }
      }
    });

    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : "other";
    const deadlines = Array.isArray(parsed.deadlines) ? parsed.deadlines : [];
    const requirements = Array.isArray(parsed.requirements) ? parsed.requirements : [];
    const calendarItems = Array.isArray(parsed.calendar_items) ? parsed.calendar_items : [];

    const analysis = {
      document_type: parsed.document_type || parsed.title || "Scanned Document",
      confidence: parsed.confidence || "medium",
      suggested_title: parsed.title || "Scanned Document",
      suggested_category: category,
      suggested_tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      summary_note: parsed.summary || parsed.description || "",
      extracted_text: parsed.extracted_text || "",
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      calendar_items: calendarItems,
      requirements,
      key_data: {
        dates: Array.isArray(parsed.key_dates) ? parsed.key_dates : [],
        names: Array.isArray(parsed.names) ? parsed.names : [],
        organizations: Array.isArray(parsed.organizations) ? parsed.organizations : [],
        action_items: [
          ...deadlines.map(d => `${d.task || 'Task'}${d.due_date ? ` — due ${d.due_date}` : ''}`),
          ...requirements,
        ],
        medications: Array.isArray(parsed.medications) ? parsed.medications : [],
        amounts: Array.isArray(parsed.amounts) ? parsed.amounts : [],
      },
    };

    return Response.json({
      success: true,
      analysis,
      parsed: {
        title: analysis.suggested_title,
        description: analysis.summary_note,
        category,
        tags: analysis.suggested_tags,
        child_name: parsed.child_name || null,
        key_dates: analysis.key_data.dates,
        deadlines,
        requirements,
        important_contacts: Array.isArray(parsed.important_contacts) ? parsed.important_contacts : [],
        summary: analysis.summary_note,
        calendar_items: calendarItems,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});