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
    label: 'Other Approved Professional',
    basis: ['family assignment', 'consent category', 'access code', 'role-specific data segment'],
    defaultAccess: 'read-approved-progress',
    editingBoundary: 'may view approved data and cannot edit family-owned records by default',
  },
  therapist: {
    key: 'therapist_view',
    label: 'Therapist',
    basis: ['family assignment', 'behavioral consent segment', 'shared documents'],
    defaultAccess: 'view-behavior-parenting-progress-shared-documents',
    editingBoundary: 'cannot edit family records or view private journals',
  },
  behavioral_health_provider: {
    key: 'behavioral_health_provider_view',
    label: 'Behavioral Health Provider / Treatment Team Member',
    basis: ['assigned client', 'family consent', 'approved record category', 'treatment team role'],
    defaultAccess: 'view-assigned-client-behavior-goals-crisis-resources-service-history',
    editingBoundary: 'may document service coordination and goals but cannot delete history, modify court orders, or alter family-generated records',
  },
  behavioral_health_worker: {
    key: 'behavioral_health_provider_view',
    label: 'Behavioral Health Provider / Treatment Team Member',
    basis: ['assigned client', 'family consent', 'approved record category', 'treatment team role'],
    defaultAccess: 'view-assigned-client-behavior-goals-crisis-resources-service-history',
    editingBoundary: 'may document service coordination and goals but cannot delete history, modify court orders, or alter family-generated records',
  },
  treatment_team_member: {
    key: 'behavioral_health_provider_view',
    label: 'Behavioral Health Provider / Treatment Team Member',
    basis: ['assigned client', 'family consent', 'approved record category', 'treatment team role'],
    defaultAccess: 'view-assigned-client-behavior-goals-crisis-resources-service-history',
    editingBoundary: 'may document service coordination and goals but cannot delete history, modify court orders, or alter family-generated records',
  },
  peer_support_specialist: {
    key: 'behavioral_health_provider_view',
    label: 'Peer Support Specialist',
    basis: ['assigned client', 'family consent', 'approved record category', 'treatment team role'],
    defaultAccess: 'view-assigned-client-behavior-goals-crisis-resources-service-history',
    editingBoundary: 'may document peer support and resource coordination without altering family-generated records',
  },
  recovery_coach: {
    key: 'behavioral_health_provider_view',
    label: 'Recovery Coach',
    basis: ['assigned client', 'family consent', 'approved record category', 'treatment team role'],
    defaultAccess: 'view-assigned-client-behavior-goals-crisis-resources-service-history',
    editingBoundary: 'may document recovery support and referrals without altering family-generated records',
  },
  ohiorise_care_coordinator: {
    key: 'behavioral_health_provider_view',
    label: 'OhioRISE Care Coordinator',
    basis: ['assigned client', 'family consent', 'approved record category', 'treatment team role'],
    defaultAccess: 'view-assigned-client-behavior-goals-crisis-resources-service-history',
    editingBoundary: 'may coordinate services and goals without deleting historical documentation',
  },
  cps_worker: {
    key: 'cps_worker_view_upload',
    label: 'CPS Worker',
    basis: ['family assignment', 'case-plan consent segment', 'compliance document lane'],
    defaultAccess: 'view-case-plan-milestones-compliance-documents',
    editingBoundary: 'may upload case plans and court orders but cannot modify parent-entered logs',
  },
  school_personnel: {
    key: 'school_limited_view',
    label: 'School Personnel',
    basis: ['family assignment', 'education consent segment', 'school document lane'],
    defaultAccess: 'view-attendance-iep-school-communications',
    editingBoundary: 'cannot view behavioral health records',
  },
  attorney_gal: {
    key: 'legal_read_only_review',
    label: 'Attorney / GAL',
    basis: ['family assignment', 'legal consent segment', 'approved court packet'],
    defaultAccess: 'read-only-court-packet-reports-communication-logs',
    editingBoundary: 'read-only access',
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