import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SUBSTANCE_USE_KEYWORDS = [
  "suboxone", "buprenorphine", "subutex", "methadone", "naltrexone", "vivitrol",
  "sublocade", "zubsolv", "bunavail", "naloxone", "narcan", "acamprosate", "campral",
  "disulfiram", "antabuse", "mat", "medication assisted", "medication-assisted",
  "detox", "detoxification", "rehab", "opioid use", "substance use", "substance abuse",
  "addiction", "withdrawal", "opioid treatment", "otp",
];
const BEHAVIORAL_HEALTH_KEYWORDS = [
  "depression", "anxiety", "bipolar", "psychosis", "schizophrenia", "ptsd",
  "antidepressant", "antipsychotic", "mood stabilizer", "ssri", "snri",
  "sertraline", "zoloft", "fluoxetine", "prozac", "lexapro", "escitalopram",
  "risperidone", "abilify", "aripiprazole", "lithium", "seroquel", "quetiapine",
];

function classifySegment(text) {
  const t = (text || "").toLowerCase();
  if (SUBSTANCE_USE_KEYWORDS.some((k) => t.includes(k))) {
    return { permission_segment: "substance_use", part2_segmented: true };
  }
  if (BEHAVIORAL_HEALTH_KEYWORDS.some((k) => t.includes(k))) {
    return { permission_segment: "behavioral_health", part2_segmented: false };
  }
  return { permission_segment: "general", part2_segmented: false };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const recordId = String(body.record_id || body.id || "");
    if (!recordId) return Response.json({ success: false, error: "record_id is required." }, { status: 400 });

    const existing = await base44.asServiceRole.entities.MedicationRecord.filter({ id: recordId });
    if (existing.length === 0) return Response.json({ success: false, error: "Medication not found." }, { status: 404 });
    const record = existing[0];

    // Ownership check.
    const isOwner = record.parent_email === user.email;
    const isAdmin = user.role === "admin" || user.role === "founder";
    if (!isOwner && !isAdmin) {
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role || "user",
        event_type: "security_alert",
        entity_name: "MedicationRecord",
        entity_id: recordId,
        severity: "warning",
        summary: `Blocked unauthorized medication update attempt on "${record.medication_name}".`,
        metadata_json: JSON.stringify({ owner: record.parent_email }),
        occurred_at: new Date().toISOString(),
      });
      return Response.json({ success: false, error: "You are not authorized to update this medication." }, { status: 403 });
    }

    // Re-classify from the new text; never allow a DOWNGRADE below the stored sensitivity.
    const classifyText = `${body.medication_name ?? record.medication_name} ${body.reason ?? record.reason ?? ""} ${body.notes ?? record.notes ?? ""}`;
    const classified = classifySegment(classifyText);
    const rank = { general: 0, behavioral_health: 1, substance_use: 2 };
    const keepSegment = rank[classified.permission_segment] >= rank[record.permission_segment || "general"]
      ? classified.permission_segment
      : record.permission_segment;
    const keepPart2 = record.part2_segmented === true || classified.part2_segmented === true;

    const updates = {
      child_name: body.child_name ?? record.child_name,
      child_profile_id: body.child_profile_id ?? record.child_profile_id ?? null,
      medication_name: body.medication_name ?? record.medication_name,
      dosage: body.dosage ?? record.dosage,
      frequency: body.frequency ?? record.frequency,
      time_of_day: Array.isArray(body.time_of_day) ? body.time_of_day : record.time_of_day,
      prescriber_name: body.prescriber_name ?? record.prescriber_name,
      prescriber_phone: body.prescriber_phone ?? record.prescriber_phone,
      pharmacy_name: body.pharmacy_name ?? record.pharmacy_name,
      pharmacy_phone: body.pharmacy_phone ?? record.pharmacy_phone,
      refill_date: body.refill_date ?? record.refill_date ?? null,
      reason: body.reason ?? record.reason,
      side_effects_to_watch: body.side_effects_to_watch ?? record.side_effects_to_watch,
      notes: body.notes ?? record.notes,
      is_active: body.is_active !== undefined ? body.is_active : record.is_active,
      // Server-controlled — client can never spoof these.
      parent_email: record.parent_email,
      permission_segment: keepSegment,
      part2_segmented: keepPart2,
    };

    const updated = await base44.asServiceRole.entities.MedicationRecord.update(recordId, updates);

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "record_update",
      entity_name: "MedicationRecord",
      entity_id: recordId,
      severity: keepPart2 ? "warning" : "info",
      summary: `Medication updated: "${updates.medication_name}" (segment: ${keepSegment}).`,
      metadata_json: JSON.stringify({ permission_segment: keepSegment, part2_segmented: keepPart2 }),
      occurred_at: new Date().toISOString(),
    });

    return Response.json({ success: true, record: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});