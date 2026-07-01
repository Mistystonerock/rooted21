import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const requests = await base44.asServiceRole.entities.AccessApprovalRequest.list('-updated_date', 500);
    let expiredRequests = 0;
    let expiredAssignments = 0;

    for (const request of requests) {
      const pendingExpired = request.status === 'pending' && request.request_expires_at && new Date(request.request_expires_at) < now;
      const activeExpired = request.status === 'active' && request.expires_at && new Date(request.expires_at) < now;
      if (!pendingExpired && !activeExpired) continue;

      await base44.asServiceRole.entities.AccessApprovalRequest.update(request.id, { status: 'expired' });
      expiredRequests += 1;

      if (activeExpired) {
        const assignments = await base44.asServiceRole.entities.AssignedFamily.filter({
          family_email: request.parent_email,
          professional_email: request.professional_email,
          status: 'active'
        });
        for (const assignment of assignments) {
          await base44.asServiceRole.entities.AssignedFamily.update(assignment.id, { status: 'on_hold' });
          expiredAssignments += 1;
        }
      }
    }

    if (expiredRequests > 0) {
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        event_type: 'system_job',
        entity_name: 'AccessApprovalRequest',
        severity: 'info',
        summary: `Expired ${expiredRequests} professional access request(s)`,
        metadata_json: JSON.stringify({ expiredAssignments }),
        occurred_at: now.toISOString()
      });
    }

    return Response.json({ success: true, expiredRequests, expiredAssignments });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});