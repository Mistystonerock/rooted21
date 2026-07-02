import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const medicationRecordId = String(body.medication_record_id || "");
    if (!medicationRecordId) return Response.json({ success: false, error: "medication_record_id is required." }, { status: 400 });

    // The dose log MUST be tied to a medication the caller owns.
    const meds = await base44.asServiceRole.entities.MedicationRecord.filter({ id: medicationRecordId });
    if (meds.length === 0) return Response.json({ success: false, error: "Medication not found." }, { status: 404 });
    const med = meds[0];

    const isOwner = med.parent_email === user.email;
    const isAdmin = user.role === "admin" || user.role === "founder";
    if (!isOwner && !isAdmin) {
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role || "user",
        event_type: "security_alert",
        entity_name: "MedicationDoseLog",
        entity_id: medicationRecordId,
        severity: "warning",
        summary: `Blocked unauthorized dose-log attempt against "${med.medication_name}".`,
        metadata_json: JSON.stringify({ owner: med.parent_email }),
        occurred_at: new Date().toISOString(),
      });
      return Response.json({ success: false, error: "You are not authorized to log a dose for this medication." }, { status: 403 });
    }

    if (med.is_deleted) {
      return Response.json({ success: false, error: "Cannot log a dose for a removed medication." }, { status: 400 });
    }

    const log = await base44.asServiceRole.entities.MedicationDoseLog.create({
      // Server-controlled ownership + sensitivity, inherited from the medication.
      parent_email: med.parent_email,
      permission_segment: med.permission_segment || "general",
      part2_segmented: med.part2_segmented === true,
      child_name: med.child_name,
      medication_record_id: med.id,
      medication_name: med.medication_name,
      dosage: med.dosage,
      administered_date: body.administered_date || new Date().toISOString().split("T")[0],
      administered_time: body.administered_time || "",
      time_of_day_slot: body.time_of_day_slot || "morning",
      given: body.given !== false,
      skipped_reason: body.skipped_reason || "",
      side_effects_observed: body.side_effects_observed || "",
      notes: body.notes || "",
      is_deleted: false,
    });

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "record_create",
      entity_name: "MedicationDoseLog",
      entity_id: log.id,
      severity: med.part2_segmented ? "warning" : "info",
      summary: `Dose logged for "${med.medication_name}" (${log.given ? "given" : "skipped"}) — ${med.child_name}.`,
      metadata_json: JSON.stringify({ medication_record_id: med.id, given: log.given, permission_segment: med.permission_segment }),
      occurred_at: new Date().toISOString(),
    });

    return Response.json({ success: true, log });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});