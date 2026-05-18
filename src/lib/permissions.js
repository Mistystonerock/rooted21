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