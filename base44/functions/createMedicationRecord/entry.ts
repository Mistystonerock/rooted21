import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Keywords that classify a medication as substance-use / MAT / 42 CFR Part 2 care.
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
    // Client-provided fields — parent_email / segment fields are IGNORED and set server-side.
    const child_name = String(body.child_name || "").trim();
    const medication_name = String(body.medication_name || "").trim();
    const dosage = String(body.dosage || "").trim();

    if (!child_name || !medication_name || !dosage) {
      return Response.json({ success: false, error: "child_name, medication_name and dosage are required." }, { status: 400 });
    }

    const classifyText = `${medication_name} ${body.reason || ""} ${body.notes || ""}`;
    const { permission_segment, part2_segmented } = classifySegment(classifyText);

    const record = await base44.asServiceRole.entities.MedicationRecord.create({
      child_name,
      child_profile_id: body.child_profile_id || null,
      medication_name,
      dosage,
      frequency: body.frequency || "once_daily",
      time_of_day: Array.isArray(body.time_of_day) ? body.time_of_day : [],
      prescriber_name: body.prescriber_name || "",
      prescriber_phone: body.prescriber_phone || "",
      pharmacy_name: body.pharmacy_name || "",
      pharmacy_phone: body.pharmacy_phone || "",
      refill_date: body.refill_date || null,
      reason: body.reason || "",
      side_effects_to_watch: body.side_effects_to_watch || "",
      notes: body.notes || "",
      is_active: body.is_active !== false,
      is_deleted: false,
      // Server-controlled trust fields:
      parent_email: user.email,
      permission_segment,
      part2_segmented,
    });

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "record_create",
      entity_name: "MedicationRecord",
      entity_id: record.id,
      severity: part2_segmented ? "warning" : "info",
      summary: `Medication created: "${medication_name}" for ${child_name} (segment: ${permission_segment}).`,
      metadata_json: JSON.stringify({ permission_segment, part2_segmented, child_name }),
      occurred_at: new Date().toISOString(),
    });

    return Response.json({ success: true, record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});