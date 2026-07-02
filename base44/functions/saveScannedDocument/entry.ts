import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Server-side segment/Part 2 derivation (mirrors createSecureDocument) ──
const CATEGORY_SEGMENT_MAP = {
  court_order: { segment: "legal", part2: false },
  iep: { segment: "education", part2: false },
  medical: { segment: "medical", part2: false },
  behavioral_health: { segment: "behavioral_health", part2: false },
  substance_use: { segment: "substance_use", part2: true },
  safety_plan: { segment: "safety", part2: false },
  case_plan: { segment: "legal", part2: false },
  visitation: { segment: "general", part2: false },
  resource_referral: { segment: "general", part2: false },
  legal: { segment: "legal", part2: false },
  school: { segment: "education", part2: false },
  therapy: { segment: "behavioral_health", part2: false },
  financial: { segment: "general", part2: false },
  other: { segment: "general", part2: false },
};
const ALLOWED_CATEGORIES = Object.keys(CATEGORY_SEGMENT_MAP);
const ALLOWED_RECORD_TYPES = ["parent_record", "child_record", "school_record", "medical_record", "court_record", "behavioral_health_record"];

function deriveSegment(category, textSignals) {
  const safeCategory = ALLOWED_CATEGORIES.includes(category) ? category : "other";
  let { segment, part2 } = CATEGORY_SEGMENT_MAP[safeCategory];
  const blob = String(textSignals || "").toLowerCase();
  const substanceSignals = ["substance", "42 cfr", "part 2", "addiction", "detox", "rehab", "opioid", "methadone", "suboxone", "sud ", "drug treatment", "alcohol treatment"];
  const behavioralSignals = ["behavioral health", "mental health", "psychiatric", "psychotherapy", "counseling", "therapy", "depression", "anxiety diagnosis"];
  if (substanceSignals.some(s => blob.includes(s))) {
    segment = "substance_use";
    part2 = true;
  } else if (behavioralSignals.some(s => blob.includes(s)) && segment === "general") {
    segment = "behavioral_health";
  }
  return { category: safeCategory, segment, part2 };
}

function mapEventType(item, category) {
  const type = item?.event_type;
  const allowed = ["school_meeting", "medication", "therapy", "court_date", "appointment", "activity", "other"];
  if (allowed.includes(type)) return type;
  if (category === "court_order" || category === "legal") return "court_date";
  if (category === "iep" || category === "school") return "school_meeting";
  if (category === "medical") return "appointment";
  if (category === "therapy") return "therapy";
  return "other";
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function itemMatchesScan(item, analysis) {
  const scanText = normalizeText([
    analysis?.extracted_text,
    analysis?.summary_note,
    ...(analysis?.key_data?.action_items || []),
    ...(analysis?.requirements || []),
  ].join(" "));
  const itemText = normalizeText(item.text);
  if (!scanText || !itemText) return false;
  if (scanText.includes(itemText) || itemText.includes(scanText.slice(0, 80))) return true;
  const keywords = itemText.split(" ").filter(word => word.length > 4);
  return keywords.length >= 2 && keywords.filter(word => scanText.includes(word)).length >= Math.min(3, keywords.length);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const analysis = body.analysis || {};
    const title = String(body.title || "").trim();
    if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });

    const fileUrl = body.file_url || "";
    const recordType = ALLOWED_RECORD_TYPES.includes(body.document_record_type) ? body.document_record_type : "parent_record";
    const textSignals = [title, body.summaryNote, analysis.extracted_text, (body.tags || []).join(" "), body.category].join(" ");
    const { category, segment, part2 } = deriveSegment(body.category, textSignals);

    const now = new Date().toISOString();

    // ── 1. Create SecureDocument with server-set trust fields ──
    const doc = await base44.asServiceRole.entities.SecureDocument.create({
      owner_email: user.email,
      author_role: user.role || "user",
      permission_segment: segment,
      part2_segmented: part2,
      is_private: true,
      shared_with: [],
      permission_granularity: "document_level",
      storage_class: "legacy_public_url",
      encryption_standard: "AES-256 at rest; TLS in transit",
      is_deleted: false,

      title,
      category,
      document_record_type: recordType,
      tags: Array.isArray(body.tags) ? body.tags : [],
      description: body.summaryNote || "",
      file_url: fileUrl,
      file_name: `scan-${Date.now()}.jpg`,
      child_name: String(body.childName || "").trim(),
      case_id: body.caseId || "",
      scanner_source: true,
      analysis_summary: body.summaryNote || "",
      extracted_dates: analysis?.key_data?.dates || [],
      extracted_requirements: analysis?.key_data?.action_items || [],
      uploaded_at: now,
      version: 1,
    });

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "document_upload",
      entity_name: "SecureDocument",
      entity_id: doc.id,
      severity: part2 ? "warning" : "info",
      summary: `Scanned SecureDocument "${title}" saved (segment: ${segment}${part2 ? ", 42 CFR Part 2" : ""}).`,
      occurred_at: now,
    });

    // ── 2. Server-side calendar events ──
    const calendarEventIds = [];
    if (body.addToCalendar) {
      const items = analysis?.calendar_items || [];
      for (const item of items) {
        if (!item?.date || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) continue;
        const event = await base44.asServiceRole.entities.CareCalendarEvent.create({
          title: item.title || item.requirement || `${title} deadline`,
          event_type: mapEventType(item, category),
          date: item.date,
          time: item.time || "",
          location: item.location || "",
          notes: `${item.notes || item.requirement || "Extracted from scanned document."}\n\nSource document: ${title}\nDocument ID: ${doc.id}`,
          status: "pending",
          family_email: user.email,
          added_by_email: user.email,
          added_by_name: user.full_name || user.email,
          recurrence: "none",
          child_name: String(body.childName || "").trim(),
        });
        calendarEventIds.push(event.id);
      }
      if (calendarEventIds.length > 0) {
        await base44.asServiceRole.entities.SecureDocument.update(doc.id, { calendar_event_ids: calendarEventIds });
      }
    }

    // ── 3. Server-side case-plan checklist matching/completion ──
    let updatedChecklistItems = 0;
    if (body.checklistId) {
      const checklist = await base44.asServiceRole.entities.CasePlanChecklist.get(body.checklistId).catch(() => null);
      // Only act on a checklist the requesting user owns.
      if (checklist && (checklist.parent_email === user.email || checklist.owner_email === user.email || checklist.created_by === user.email)) {
        const originalItems = checklist.items || [];
        const completedTitles = [];
        const items = originalItems.map(item => {
          if (item.completed || !itemMatchesScan(item, analysis)) return item;
          completedTitles.push(item.text || "item");
          return {
            ...item,
            completed: true,
            completed_date: now,
            proof_url: fileUrl,
            proof_filename: title,
            notes: item.notes || "Completed from scanned document findings.",
          };
        });
        updatedChecklistItems = completedTitles.length;
        if (updatedChecklistItems > 0) {
          await base44.asServiceRole.entities.CasePlanChecklist.update(body.checklistId, {
            items,
            status: items.every(item => item.completed) ? "completed" : "active",
          });
          // Audit + event history for each evidence-based completion.
          await base44.asServiceRole.entities.RootedAuditEvent.create({
            actor_email: user.email,
            actor_role: user.role || "user",
            event_type: "record_update",
            entity_name: "CasePlanChecklist",
            entity_id: body.checklistId,
            severity: "warning",
            summary: `${updatedChecklistItems} case-plan checklist item(s) marked complete based on scanned document "${title}" (${doc.id}): ${completedTitles.join("; ")}.`,
            occurred_at: now,
          });
        }
      }
    }

    // ── 4. Optional CaseNote — role set server-side ──
    if (body.saveAsNote && body.caseId) {
      await base44.asServiceRole.entities.CaseNote.create({
        case_id: body.caseId,
        author_email: user.email,
        author_name: user.full_name || user.email,
        author_role: user.role || "user",
        note_type: "update",
        title: `[Scanned] ${title}`,
        body: `${body.summaryNote || ""}\n\n---\n**AI-Extracted Text:**\n${analysis.extracted_text || ""}`,
        visible_to_team: true,
      });
    }

    return Response.json({
      success: true,
      document: doc,
      summary: {
        title,
        category,
        calendarCount: calendarEventIds.length,
        updatedChecklistItems,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});