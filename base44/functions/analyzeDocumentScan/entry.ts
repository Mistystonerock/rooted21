import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VALID_CATEGORIES = ["court_order", "iep", "medical", "legal", "school", "therapy", "financial", "behavioral_health", "substance_use", "safety_plan", "case_plan", "visitation", "resource_referral", "other"];

const COURT_PACKET_TITLES = [
  "Shared Parenting", "Emergency Custody / Ex Parte", "Full Custody", "Custody Modification", "Visitation / Parenting Time Change", "Child Support", "Protection Order", "Civil Protection Order", "Domestic Violence Protection Order", "Juvenile Court Support", "Probate / Guardianship", "Kinship Caregiver Support", "Foster / Caregiver Court Support", "Record Sealing / Expungement", "Name Change", "Divorce / Dissolution Support", "Contempt / Enforcing a Court Order", "School / IEP Court-Related Documentation", "CPS Case Plan / Court Preparation", "Family Treatment Court Support", "Juvenile Treatment Court Support", "Reentry / Criminal Record Support", "Housing Court / Eviction Support", "Benefits Appeal Support", "General Court Meeting Preparation"
];

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

Extract the document text and return structured data. Focus especially on OCR from scanned physical documents:
- court dates, hearing dates, review dates, pretrial dates, arraignment dates, appointment dates, meeting dates
- court case numbers, docket numbers, file numbers, cause numbers, judge names, magistrate names, courtroom numbers, court names
- deadlines, due dates, required services, required documents, signatures, forms, evaluations, testing, IEP tasks
- child names, organizations, contacts, locations, medications, amounts/scores

Rules:
- Use YYYY-MM-DD for every date when possible.
- calendar_items should include only real dated items from the document.
- Use event_type: court_date, school_meeting, medication, therapy, appointment, activity, or other.
- Make titles short and clear.
- Put requirements without a clear date in requirements.
- If uncertain, use confidence medium or low and include a flag.
- For court_packet_tags, suggest only from this list when relevant: ${COURT_PACKET_TITLES.join(", ")}.
- If this is court-related, set is_court_document true and include court_dates even when calendar_items also includes the same date.`,
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
          is_court_document: { type: "boolean" },
          primary_case_number: { type: "string" },
          case_numbers: { type: "array", items: { type: "string" } },
          primary_judge_name: { type: "string" },
          judge_names: { type: "array", items: { type: "string" } },
          court_name: { type: "string" },
          hearing_type: { type: "string" },
          court_packet_tags: { type: "array", items: { type: "string" } },
          court_dates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                time: { type: "string" },
                hearing_type: { type: "string" },
                judge_name: { type: "string" },
                case_number: { type: "string" },
                courtroom: { type: "string" },
                location: { type: "string" },
                notes: { type: "string" },
                confidence: { type: "string" }
              }
            }
          },
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
    const courtDates = Array.isArray(parsed.court_dates) ? parsed.court_dates : [];
    const caseNumbers = Array.isArray(parsed.case_numbers) ? parsed.case_numbers : [];
    const judgeNames = Array.isArray(parsed.judge_names) ? parsed.judge_names : [];
    const courtPacketTags = Array.isArray(parsed.court_packet_tags) ? parsed.court_packet_tags.filter(tag => COURT_PACKET_TITLES.includes(tag)) : [];
    const isCourtDocument = parsed.is_court_document === true || category === "court_order" || category === "legal" || courtDates.length > 0 || caseNumbers.length > 0 || judgeNames.length > 0;

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
      court_dates: courtDates,
      requirements,
      court_metadata: {
        is_court_document: isCourtDocument,
        primary_case_number: parsed.primary_case_number || caseNumbers[0] || "",
        case_numbers: caseNumbers,
        primary_judge_name: parsed.primary_judge_name || judgeNames[0] || "",
        judge_names: judgeNames,
        court_name: parsed.court_name || "",
        hearing_type: parsed.hearing_type || "",
        court_packet_tags: courtPacketTags,
      },
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
        case_numbers: caseNumbers,
        judges: judgeNames,
        court_name: parsed.court_name || "",
        hearing_type: parsed.hearing_type || "",
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
        confidence: analysis.confidence,
        is_court_document: isCourtDocument,
        primary_case_number: analysis.court_metadata.primary_case_number,
        case_numbers: caseNumbers,
        primary_judge_name: analysis.court_metadata.primary_judge_name,
        judge_names: judgeNames,
        court_name: analysis.court_metadata.court_name,
        hearing_type: analysis.court_metadata.hearing_type,
        court_packet_tags: courtPacketTags,
        court_dates: courtDates,
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