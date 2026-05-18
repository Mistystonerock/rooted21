import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOUNDER_EMAIL = 'misty.stonerock88@gmail.com';
const ALLOWED_PERMISSIONS = [
  'manage_local_resources',
  'update_verified_services',
  'moderate_community',
  'assist_users',
  'manage_assigned_county_resources',
  'view_admin_dashboard',
];

function requireFounder(user) {
  return user?.role === 'founder' && user.email?.toLowerCase() === FOUNDER_EMAIL;
}

function requireFreshFounderSession(user) {
  const lastReauth = user.sensitive_action_reauth_at ? new Date(user.sensitive_action_reauth_at) : null;
  return requireFounder(user) && !!lastReauth && ((Date.now() - lastReauth.getTime()) / 60000) <= Number(user.founder_reauth_required_after_minutes || 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!requireFreshFounderSession(user)) return Response.json({ error: 'Founder password confirmation required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'update_permissions') {
      const permissions = (body.permissions || []).filter(p => ALLOWED_PERMISSIONS.includes(p));
      const updated = await base44.asServiceRole.entities.AdminPermissions.update(body.adminPermissionId, {
        permissions,
        assigned_counties: Array.isArray(body.assigned_counties) ? body.assigned_counties : [],
        organization_id: body.organization_id || '',
        organization_name: body.organization_name || '',
        is_active: body.is_active !== false,
      });
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role,
        event_type: 'role_change',
        entity_name: 'AdminPermissions',
        entity_id: updated.id,
        severity: 'critical',
        summary: `Founder updated admin permissions for ${updated.admin_email}`,
        occurred_at: new Date().toISOString(),
      });
      return Response.json(updated);
    }

    if (action === 'remove_admin') {
      const adminPermission = await base44.asServiceRole.entities.AdminPermissions.update(body.adminPermissionId, { is_active: false });
      const users = await base44.asServiceRole.entities.User.filter({ email: adminPermission.admin_email }, '', 1);
      if (users[0] && users[0].role === 'admin') {
        await base44.asServiceRole.entities.User.update(users[0].id, { role: 'user', admin_session_valid_until: null });
      }
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role,
        event_type: 'admin_removed',
        entity_name: 'AdminPermissions',
        entity_id: adminPermission.id,
        severity: 'critical',
        summary: `Founder removed admin access for ${adminPermission.admin_email}`,
        occurred_at: new Date().toISOString(),
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});