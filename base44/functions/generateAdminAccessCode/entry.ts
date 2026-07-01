import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOUNDER_EMAIL = 'misty.stonerock88@gmail.com';
const DEFAULT_ADMIN_PERMISSIONS = [
  'manage_users',
  'manage_resources',
  'manage_classes',
  'view_analytics',
];

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function requireFreshFounderSession(user) {
  const isFounder = user.role === 'founder' && user.email?.toLowerCase() === FOUNDER_EMAIL;
  if (!isFounder) return false;
  const lastReauth = user.sensitive_action_reauth_at ? new Date(user.sensitive_action_reauth_at) : null;
  return !!lastReauth && ((Date.now() - lastReauth.getTime()) / 60000) <= Number(user.founder_reauth_required_after_minutes || 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!requireFreshFounderSession(user)) {
      return Response.json({ error: 'Founder password confirmation required before creating admin codes' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existing = await base44.asServiceRole.entities.AdminAccessCode.filter({ code }, '', 1);
      isUnique = existing.length === 0;
    }

    const accessCode = await base44.asServiceRole.entities.AdminAccessCode.create({
      code,
      created_by: user.email,
      created_for: body.created_for || null,
      assigned_counties: Array.isArray(body.assigned_counties) ? body.assigned_counties : [],
      organization_id: body.organization_id || '',
      organization_name: body.organization_name || '',
      permissions: Array.isArray(body.permissions) && body.permissions.length ? body.permissions : DEFAULT_ADMIN_PERMISSIONS,
      used: false,
      expires_at: expiresAt.toISOString(),
    });

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role,
      event_type: 'admin_invitation_created',
      entity_name: 'AdminAccessCode',
      entity_id: accessCode.id,
      severity: 'critical',
      summary: `Founder created admin invitation code for ${body.created_for || 'an admin'}`,
      metadata_json: JSON.stringify({ assigned_counties: accessCode.assigned_counties || [], organization_id: accessCode.organization_id || '' }),
      occurred_at: new Date().toISOString(),
    });

    return Response.json(accessCode);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});