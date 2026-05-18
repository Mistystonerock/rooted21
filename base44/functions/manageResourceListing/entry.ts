import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOUNDER_EMAIL = 'misty.stonerock88@gmail.com';

function isFounder(user) {
  return user?.role === 'founder' && user.email?.toLowerCase() === FOUNDER_EMAIL;
}

function hasPermission(admin, permission) {
  return admin?.is_active !== false && Array.isArray(admin?.permissions) && admin.permissions.includes(permission);
}

function canManageResource(user, admin, resource) {
  if (isFounder(user)) return true;
  if (user?.role !== 'admin') return false;
  if (!hasPermission(admin, 'manage_local_resources') && !hasPermission(admin, 'manage_assigned_county_resources') && !hasPermission(admin, 'update_verified_services')) return false;

  const assignedCounties = admin.assigned_counties || [];
  const countyAllowed = assignedCounties.length === 0 || assignedCounties.includes(resource.county);
  const orgAllowed = !admin.organization_id || !resource.organization_id || admin.organization_id === resource.organization_id;
  return countyAllowed && orgAllowed;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const adminRecords = user.role === 'admin'
      ? await base44.asServiceRole.entities.AdminPermissions.filter({ admin_email: user.email, is_active: true }, '-created_date', 1)
      : [];
    const admin = adminRecords[0] || null;

    if (!isFounder(user) && user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (action === 'create') {
      const data = body.resource || {};
      if (!canManageResource(user, admin, data)) return Response.json({ error: 'Resource is outside assigned county or organization' }, { status: 403 });
      const created = await base44.asServiceRole.entities.ResourceListing.create(data);
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role,
        event_type: 'record_create',
        entity_name: 'ResourceListing',
        entity_id: created.id,
        severity: 'info',
        summary: `${user.role} created resource listing ${created.name}`,
        occurred_at: new Date().toISOString(),
      });
      return Response.json(created);
    }

    if (!body.resourceId) return Response.json({ error: 'resourceId is required' }, { status: 400 });
    const resources = await base44.asServiceRole.entities.ResourceListing.filter({ id: body.resourceId }, '', 1);
    const existing = resources[0];
    if (!existing) return Response.json({ error: 'Resource not found' }, { status: 404 });
    if (!canManageResource(user, admin, existing)) return Response.json({ error: 'Resource is outside assigned county or organization' }, { status: 403 });

    if (action === 'update') {
      const data = body.resource || {};
      if (!isFounder(user)) {
        data.county = existing.county;
        data.organization_id = existing.organization_id || data.organization_id || '';
      }
      const updated = await base44.asServiceRole.entities.ResourceListing.update(existing.id, data);
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role,
        event_type: 'resource_review',
        entity_name: 'ResourceListing',
        entity_id: updated.id,
        severity: 'info',
        summary: `${user.role} updated resource listing ${updated.name}`,
        occurred_at: new Date().toISOString(),
      });
      return Response.json(updated);
    }

    if (action === 'verify') {
      const updated = await base44.asServiceRole.entities.ResourceListing.update(existing.id, {
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: user.email,
      });
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role,
        event_type: 'verification_action',
        entity_name: 'ResourceListing',
        entity_id: updated.id,
        severity: 'info',
        summary: `${user.role} verified resource listing ${updated.name}`,
        occurred_at: new Date().toISOString(),
      });
      return Response.json(updated);
    }

    if (action === 'archive') {
      const updated = await base44.asServiceRole.entities.ResourceListing.update(existing.id, {
        verification_status: 'archived',
        archived_at: new Date().toISOString(),
      });
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role,
        event_type: 'resource_review',
        entity_name: 'ResourceListing',
        entity_id: updated.id,
        severity: 'warning',
        summary: `${user.role} archived resource listing ${updated.name}`,
        occurred_at: new Date().toISOString(),
      });
      return Response.json(updated);
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});