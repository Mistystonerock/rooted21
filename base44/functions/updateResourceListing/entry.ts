import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function adminCanManage(adminPermission, resourceData) {
  if (!adminPermission?.is_active) return false;
  const permissions = adminPermission.permissions || [];
  if (!permissions.includes('manage_local_resources') && !permissions.includes('manage_assigned_county_resources')) return false;
  const counties = adminPermission.assigned_counties || [];
  const countyAllowed = !resourceData.county || counties.includes(resourceData.county);
  const orgAllowed = !resourceData.organization_id || !adminPermission.organization_id || adminPermission.organization_id === resourceData.organization_id;
  return countyAllowed && orgAllowed;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['admin', 'founder'].includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { resourceId, data } = await req.json();
    if (!data?.name || !data?.category) return Response.json({ error: 'Resource name and category are required' }, { status: 400 });

    if (user.role !== 'founder') {
      const permissionRows = await base44.asServiceRole.entities.AdminPermissions.filter({ admin_email: user.email, is_active: true }, '-created_date', 1);
      const existing = resourceId ? await base44.asServiceRole.entities.ResourceListing.get(resourceId) : null;
      const target = { ...(existing || {}), ...data };
      if (!adminCanManage(permissionRows[0], target)) {
        return Response.json({ error: 'Forbidden: This admin can only manage assigned county or organization resources.' }, { status: 403 });
      }
      delete data.assigned_admin_email;
    }

    const normalized = { ...data };
    if (normalized.verification_status === 'verified') {
      normalized.verified_at = new Date().toISOString();
      normalized.verified_by = user.email;
    }
    if (normalized.verification_status === 'closed' || normalized.verification_status === 'archived') {
      normalized.archived_at = new Date().toISOString();
    }

    const saved = resourceId
      ? await base44.asServiceRole.entities.ResourceListing.update(resourceId, normalized)
      : await base44.asServiceRole.entities.ResourceListing.create(normalized);

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role,
      event_type: 'verification_action',
      entity_name: 'ResourceListing',
      entity_id: saved.id,
      severity: normalized.verification_status === 'closed' ? 'warning' : 'info',
      summary: `${user.role === 'founder' ? 'Founder' : 'Admin'} updated resource: ${saved.name}`,
      metadata_json: JSON.stringify({ status: saved.verification_status, county: saved.county || '', category: saved.category || '' }),
      occurred_at: new Date().toISOString()
    });

    return Response.json({ resource: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});