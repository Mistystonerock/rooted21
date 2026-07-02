import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Server-side segment/Part 2 derivation ──
// The client's claimed category may NOT downgrade sensitive material to "general".
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

// Detect segmentation from free-text signals so a mislabeled doc can't slip through as "general".
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Fields the client legitimately controls
    const title = String(body.title || "").trim();
    if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });

    const recordType = ALLOWED_RECORD_TYPES.includes(body.document_record_type) ? body.document_record_type : "parent_record";

    // Derive segment/part2 server-side from category + text signals — never trust client claims.
    const textSignals = [title, body.description, body.analysis_summary, (body.tags || []).join(" "), body.category].join(" ");
    const { category, segment, part2 } = deriveSegment(body.category, textSignals);

    const now = new Date().toISOString();

    const doc = await base44.asServiceRole.entities.SecureDocument.create({
      // ── Server-set trust fields (client values ignored) ──
      owner_email: user.email,
      author_role: user.role || "user",
      permission_segment: segment,
      part2_segmented: part2,
      is_private: true,
      shared_with: [],
      permission_granularity: "document_level",
      storage_class: body.private_file_uri ? "private_vault" : "legacy_public_url",
      encryption_standard: "AES-256 at rest; TLS in transit",
      is_deleted: false,

      // ── Client-described fields ──
      title,
      description: String(body.description || "").trim(),
      category,
      document_record_type: recordType,
      tags: Array.isArray(body.tags) ? body.tags : [],
      private_file_uri: body.private_file_uri || "",
      file_url: body.file_url || "",
      file_name: body.file_name || "",
      file_size: body.file_size || 0,
      child_name: String(body.child_name || "").trim(),
      case_id: body.case_id || "",
      uploaded_at: now,
      version: 1,
      scanner_source: !!body.scanner_source,
      analysis_summary: body.analysis_summary || "",
      extracted_dates: body.extracted_dates || [],
      extracted_requirements: body.extracted_requirements || [],
      court_case_number: body.court_case_number || "",
      extracted_case_numbers: body.extracted_case_numbers || [],
      judge_name: body.judge_name || "",
      extracted_judges: body.extracted_judges || [],
      court_name: body.court_name || "",
      hearing_type: body.hearing_type || "",
      extracted_court_dates: body.extracted_court_dates || [],
      court_packet_tags: body.court_packet_tags || [],
      ocr_confidence: body.ocr_confidence || "",
      auto_populate_court_packet: body.auto_populate_court_packet === true,
    });

    // ── Server-side audit ──
    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "document_upload",
      entity_name: "SecureDocument",
      entity_id: doc.id,
      severity: part2 ? "warning" : "info",
      summary: `Created SecureDocument "${title}" (segment: ${segment}${part2 ? ", 42 CFR Part 2" : ""}).`,
      occurred_at: now,
    });

    return Response.json({ success: true, document: doc });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});