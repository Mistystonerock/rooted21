import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-time audit/backfill scanner for legacy SecureDocument records.
// DRY-RUN BY DEFAULT: returns a report and changes nothing unless { apply: true } is passed.

const SUBSTANCE_SIGNALS = ["substance", "42 cfr", "part 2", "part2", "addiction", "detox", "rehab", "opioid", "methadone", "suboxone", "buprenorphine", "naltrexone", "vivitrol", "mat", "medication assisted", "medication-assisted", "sud", "drug treatment", "alcohol treatment", "recovery program", "aa meeting", "na meeting", "relapse", "sobriety"];
const BEHAVIORAL_SIGNALS = ["behavioral health", "mental health", "psychiatric", "psychiatry", "psychotherapy", "counseling", "counselor", "therapy", "therapist", "depression", "anxiety", "bipolar", "ptsd", "diagnosis", "psychological eval", "treatment plan"];

const SENSITIVE_CATEGORIES = ["behavioral_health", "substance_use", "therapy"];

function classify(doc) {
  const blob = [
    doc.title, doc.description, doc.analysis_summary, doc.category, doc.document_record_type,
    (doc.tags || []).join(" "), doc.hearing_type,
  ].filter(Boolean).join(" ").toLowerCase();

  const substanceHit = SUBSTANCE_SIGNALS.find((s) => blob.includes(s));
  const behavioralHit = BEHAVIORAL_SIGNALS.find((s) => blob.includes(s));
  const categorySensitive = SENSITIVE_CATEGORIES.includes(doc.category);

  if (doc.category === "substance_use" || substanceHit) {
    return { segment: "substance_use", part2: true, hit: substanceHit || `category: ${doc.category}`, kind: "substance_use" };
  }
  if (doc.category === "behavioral_health" || doc.category === "therapy" || behavioralHit) {
    return { segment: "behavioral_health", part2: false, hit: behavioralHit || `category: ${doc.category}`, kind: "behavioral_health" };
  }
  if (categorySensitive) {
    return { segment: "behavioral_health", part2: false, hit: `category: ${doc.category}`, kind: "behavioral_health" };
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== "admin" && user.role !== "founder") {
      return Response.json({ error: 'Forbidden — admin or founder only.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const apply = body.apply === true;

    const all = await base44.asServiceRole.entities.SecureDocument.list("-created_date", 2000);
    const active = all.filter((d) => d.is_deleted !== true);

    const proposals = [];
    for (const doc of active) {
      const result = classify(doc);
      if (!result) continue;

      const currentSegment = doc.permission_segment || "general";
      const currentPart2 = doc.part2_segmented === true;
      const segmentWrong = currentSegment !== result.segment && (currentSegment === "general" || (result.kind === "substance_use" && currentSegment !== "substance_use"));
      const part2Wrong = result.part2 && !currentPart2;

      if (!segmentWrong && !part2Wrong) continue;

      // High-confidence when the category itself is sensitive or a substance signal is present;
      // free-text behavioral-only matches are flagged for human review.
      const highConfidence = SENSITIVE_CATEGORIES.includes(doc.category) || doc.category === "substance_use" || result.kind === "substance_use";

      proposals.push({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        matched_signal: result.hit,
        current: { permission_segment: currentSegment, part2_segmented: currentPart2 },
        proposed: { permission_segment: result.segment, part2_segmented: result.part2 || currentPart2 },
        part2_risk: result.part2 || currentPart2,
        confidence: highConfidence ? "high" : "needs_review",
      });
    }

    let appliedCount = 0;
    if (apply) {
      const now = new Date().toISOString();
      for (const p of proposals) {
        await base44.asServiceRole.entities.SecureDocument.update(p.id, {
          permission_segment: p.proposed.permission_segment,
          part2_segmented: p.proposed.part2_segmented,
        });
        await base44.asServiceRole.entities.RootedAuditEvent.create({
          actor_email: user.email,
          actor_role: user.role,
          event_type: "record_update",
          entity_name: "SecureDocument",
          entity_id: p.id,
          severity: p.part2_risk ? "warning" : "info",
          summary: `Segment backfill: "${p.title}" ${p.current.permission_segment} → ${p.proposed.permission_segment}${p.proposed.part2_segmented ? " (42 CFR Part 2)" : ""}.`,
          metadata_json: JSON.stringify({ action: "segment_backfill", ...p }),
          occurred_at: now,
        });
        appliedCount++;
      }
    }

    return Response.json({
      success: true,
      mode: apply ? "applied" : "dry_run",
      scanned: active.length,
      potentially_misclassified: proposals.length,
      part2_risk_count: proposals.filter((p) => p.part2_risk).length,
      high_confidence_count: proposals.filter((p) => p.confidence === "high").length,
      needs_review_count: proposals.filter((p) => p.confidence === "needs_review").length,
      applied: appliedCount,
      proposals,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});