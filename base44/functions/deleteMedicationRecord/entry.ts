import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
        summary: `Blocked unauthorized medication delete attempt on "${record.medication_name}".`,
        metadata_json: JSON.stringify({ owner: record.parent_email }),
        occurred_at: new Date().toISOString(),
      });
      return Response.json({ success: false, error: "You are not authorized to delete this medication." }, { status: 403 });
    }

    // SOFT delete only — the record is never hard-removed. Its dose logs are also soft-deleted.
    await base44.asServiceRole.entities.MedicationRecord.update(recordId, { is_deleted: true, is_active: false });

    const doseLogs = await base44.asServiceRole.entities.MedicationDoseLog.filter({ medication_record_id: recordId });
    for (const log of doseLogs) {
      if (!log.is_deleted) {
        await base44.asServiceRole.entities.MedicationDoseLog.update(log.id, { is_deleted: true });
      }
    }

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "record_delete_attempt",
      entity_name: "MedicationRecord",
      entity_id: recordId,
      severity: record.part2_segmented ? "warning" : "info",
      summary: `Medication soft-deleted: "${record.medication_name}" for ${record.child_name} (${doseLogs.length} dose logs soft-deleted).`,
      metadata_json: JSON.stringify({ permission_segment: record.permission_segment, dose_logs_removed: doseLogs.length }),
      occurred_at: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});