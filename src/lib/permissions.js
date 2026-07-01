export const FOUNDER_EMAIL = 'misty.stonerock88@gmail.com';

export function isFounder(user) {
  return user?.role === 'founder' && user?.email?.toLowerCase() === FOUNDER_EMAIL;
}

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function isAdminOrFounder(user) {
  return isFounder(user) || isAdmin(user);
}

export function isAdminSessionValid(user) {
  if (isFounder(user)) return true;
  if (!isAdmin(user)) return false;
  if (!user.admin_session_valid_until) return false;
  return new Date(user.admin_session_valid_until) > new Date();
}

export function hasAdminPermission(adminPermissions, permission) {
  if (!adminPermissions?.is_active) return false;
  return Array.isArray(adminPermissions.permissions) && adminPermissions.permissions.includes(permission);
}

export function canAdminManageResource(user, adminPermissions, resource) {
  if (isFounder(user)) return true;
  if (!isAdminSessionValid(user)) return false;
  if (!hasAdminPermission(adminPermissions, 'manage_local_resources') && !hasAdminPermission(adminPermissions, 'manage_assigned_county_resources') && !hasAdminPermission(adminPermissions, 'update_verified_services')) return false;

  const assignedCounties = adminPermissions?.assigned_counties || [];
  const countyAllowed = assignedCounties.length === 0 || assignedCounties.includes(resource?.county);
  const orgAllowed = !adminPermissions?.organization_id || !resource?.organization_id || adminPermissions.organization_id === resource.organization_id;
  return countyAllowed && orgAllowed;
}

export const ROLE_PERMISSION_SYSTEMS = {
  user: {
    key: 'family_owner',
    label: 'Parent / Family User',
    basis: ['record ownership', 'child relationship', 'family consent', 'access-code sharing'],
    defaultAccess: 'create-edit-own-family-records',
    editingBoundary: 'may edit family-owned records only',
  },
  founder: {
    key: 'platform_governance',
    label: 'Founder',
    basis: ['platform governance', 'security review', 'operations', 'compliance oversight'],
    defaultAccess: 'platform-governance-only',
    editingBoundary: 'may govern systems without casually taking ownership of family records',
  },
  admin: {
    key: 'restricted_operations',
    label: 'Admin',
    basis: ['admin session', 'assigned permissions', 'county or organization scope', 'support need'],
    defaultAccess: 'permission-scoped-operations',
    editingBoundary: 'may edit only assigned operational areas',
  },
  professional: {
    key: 'permission_based_collaboration',
    label: 'Professional / Assigned Support',
    basis: ['family assignment', 'consent category', 'access code', 'role-specific data segment'],
    defaultAccess: 'read-approved-progress',
    editingBoundary: 'may view approved data and cannot edit family-owned records by default',
  },
  organization: {
    key: 'licensed_organization',
    label: 'Organization / Agency',
    basis: ['licensed seat', 'organization scope', 'aggregate reporting', 'family consent'],
    defaultAccess: 'aggregate-or-consented-access',
    editingBoundary: 'may manage organization tools without unrestricted family record access',
  },
};

export function getRolePermissionSystem(user) {
  return ROLE_PERMISSION_SYSTEMS[user?.role] || ROLE_PERMISSION_SYSTEMS.user;
}