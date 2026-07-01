import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { request_id, approve } = await req.json();
    if (!request_id) return Response.json({ error: 'Missing request_id' }, { status: 400 });

    const request = await base44.asServiceRole.entities.ProfessionalFamilyAccess.get(request_id);
    if (!request) return Response.json({ error: 'Request not found' }, { status: 404 });
    if (request.parent_user_id !== user.id && request.parent_email !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (request.status !== 'pending') {
      return Response.json({ error: 'This request is no longer pending' }, { status: 400 });
    }
    if (request.request_expires_at && new Date(request.request_expires_at) < new Date()) {
      await base44.asServiceRole.entities.ProfessionalFamilyAccess.update(request.id, { status: 'expired' });
      return Response.json({ error: 'This approval request has expired' }, { status: 400 });
    }

    if (approve === false) {
      const revoked = await base44.asServiceRole.entities.ProfessionalFamilyAccess.update(request.id, {
        status: 'revoked',
        revoked_at: new Date().toISOString()
      });
      return Response.json({ success: true, status: 'revoked', request: revoked });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const activeRequest = await base44.asServiceRole.entities.ProfessionalFamilyAccess.update(request.id, {
      status: 'active',
      approved_at: now.toISOString(),
      approved_by_email: user.email,
      expires_at: expiresAt
    });

    const existing = await base44.asServiceRole.entities.AssignedFamily.filter({
      family_email: request.parent_email,
      professional_email: request.professional_email
    });

    const assignmentPayload = {
      family_user_id: request.parent_user_id,
      family_email: request.parent_email,
      family_name: request.parent_name || request.parent_email,
      child_name: request.child_name || '',
      professional_user_id: request.professional_user_id,
      professional_email: request.professional_email,
      professional_name: request.professional_name || request.professional_email,
      professional_role: request.professional_role || 'Other',
      status: 'active',
      access_request_id: request.id,
      access_expires_at: expiresAt,
      approved_by_email: user.email,
      approved_at: now.toISOString()
    };

    const assignment = existing[0]
      ? await base44.asServiceRole.entities.AssignedFamily.update(existing[0].id, assignmentPayload)
      : await base44.asServiceRole.entities.AssignedFamily.create(assignmentPayload);

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: request.professional_email,
      subject: 'Rooted 21 access approved',
      body: `Hi ${request.professional_name || 'there'},\n\n${user.full_name || user.email} approved your Rooted 21 family access request. This access expires automatically in 90 days.\n\nRooted 21 Team`
    });

    return Response.json({ success: true, request: activeRequest, assignment, expires_at: expiresAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});