import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DEFAULT_ADMIN_PERMISSIONS = [
  'manage_local_resources',
  'update_verified_services',
  'moderate_community',
  'assist_users',
  'manage_assigned_county_resources',
  'view_admin_dashboard',
];

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const code = body.code?.trim().toUpperCase();
    if (!code) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    const codes = await base44.asServiceRole.entities.AdminAccessCode.filter({ code }, '', 1);
    if (codes.length === 0) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    const accessCode = codes[0];
    if (accessCode.used) {
      return Response.json({ error: 'Code has already been used' }, { status: 400 });
    }
    if (new Date(accessCode.expires_at) < new Date()) {
      return Response.json({ error: 'Code has expired' }, { status: 400 });
    }

    await base44.asServiceRole.entities.AdminAccessCode.update(accessCode.id, {
      used: true,
      used_by: user.email,
      used_at: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.User.update(user.id, {
      role: 'admin',
      onboarding_completed: true,
      organization_id: accessCode.organization_id || user.organization_id || '',
      organization_name: accessCode.organization_name || user.organization_name || '',
      county: accessCode.assigned_counties?.[0] || user.county || '',
      admin_session_valid_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      account_status: 'active',
    });

    const permissions = Array.isArray(accessCode.permissions) && accessCode.permissions.length ? accessCode.permissions : DEFAULT_ADMIN_PERMISSIONS;
    await base44.asServiceRole.entities.AdminPermissions.create({
      admin_email: user.email,
      admin_name: user.full_name || user.email,
      permissions,
      assigned_counties: accessCode.assigned_counties || [],
      organization_id: accessCode.organization_id || '',
      organization_name: accessCode.organization_name || '',
      created_by: accessCode.created_by,
      notes: 'Admin created via founder invitation code',
      is_active: true,
    });

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: 'admin',
      event_type: 'admin_promoted',
      entity_name: 'User',
      entity_id: user.id,
      severity: 'critical',
      summary: `${user.email} redeemed an admin invitation code`,
      metadata_json: JSON.stringify({ assigned_counties: accessCode.assigned_counties || [], organization_id: accessCode.organization_id || '' }),
      occurred_at: new Date().toISOString(),
    });

    return Response.json({ success: true, message: 'You are now an admin.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});