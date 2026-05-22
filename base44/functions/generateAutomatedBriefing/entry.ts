import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const briefingType = payload.briefingType || 'Statement of Facts';
    const packetTitle = payload.packetTitle || 'General Court Filing';
    const focus = payload.focus || '';

    const [timelineItems, secureDocuments] = await Promise.all([
      base44.entities.EvidenceTimelineItem.filter({ owner_email: user.email }, 'event_date', 500),
      base44.entities.SecureDocument.list('-created_date', 200),
    ]);

    const courtDocuments = secureDocuments.filter(doc =>
      doc.auto_populate_court_packet ||
      doc.court_case_number ||
      doc.court_packet_tags?.length ||
      ['court_order', 'legal', 'visitation', 'safety_plan', 'case_plan'].includes(doc.category)
    );

    const evidence = timelineItems.map((item, index) => ({
      exhibit_number: index + 1,
      date: item.event_date,
      time: item.event_time,
      title: item.title,
      summary: item.summary,
      evidence_type: item.evidence_type,
      categories: item.case_categories || [],
      message_text: item.message_text,
      source_note: item.source_note,
      related_document_ids: item.related_document_ids || [],
    }));

    const documents = courtDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      court_case_number: doc.court_case_number,
      judge_name: doc.judge_name,
      court_name: doc.court_name,
      hearing_type: doc.hearing_type,
      court_packet_tags: doc.court_packet_tags || [],
      verified_or_uploaded_at: doc.uploaded_at || doc.created_date,
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are helping a self-represented caregiver organize facts for a legal filing. Do not provide legal advice. Draft a plain-language ${briefingType} for the packet/topic: ${packetTitle}.

Required style:
- Neutral, factual, court-appropriate language.
- Chronological when possible.
- Avoid accusations, diagnosis, exaggeration, or legal conclusions.
- Cross-reference evidence as Exhibit 1, Exhibit 2, etc.
- Cross-reference related court/document vault records by title when available.
- Include a verification/reminder section telling the user to review with the court clerk, attorney, legal aid, or official court website before filing.
- If facts are missing, list questions to verify rather than inventing information.

User focus: ${focus || 'No special focus provided.'}

Evidence Timeline JSON:
${JSON.stringify(evidence, null, 2)}

Court Packet / Document Vault JSON:
${JSON.stringify(documents, null, 2)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          briefing_type: { type: 'string' },
          draft_markdown: { type: 'string' },
          exhibit_cross_references: { type: 'array', items: { type: 'string' } },
          document_cross_references: { type: 'array', items: { type: 'string' } },
          questions_to_verify: { type: 'array', items: { type: 'string' } },
          filing_readiness_notes: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'briefing_type', 'draft_markdown']
      }
    });

    return Response.json({ briefing: result, evidence_count: evidence.length, document_count: documents.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});