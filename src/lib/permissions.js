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
  agency_administrator: {
    key: 'agency_oversight',
    label: 'Agency Administrator / Supervisor',
    basis: ['organization scope', 'assigned supervisory authority', 'documented compliance review', 'minimum necessary access'],
    defaultAccess: 'aggregate-agency-performance-staff-compliance-outcome-oversight',
    editingBoundary: 'may review, flag, approve, assign, and report; cannot alter client records, staff documentation, or audit logs',
  },
  agency_supervisor: {
    key: 'agency_oversight',
    label: 'Agency Supervisor',
    basis: ['organization scope', 'assigned staff supervision', 'documented authorization'],
    defaultAccess: 'staff-caseload-documentation-quality-compliance-outcome-review',
    editingBoundary: 'cannot edit provider documentation after submission or modify client records',
  },
  clinical_supervisor: {
    key: 'agency_oversight',
    label: 'Clinical Supervisor',
    basis: ['assigned supervisory authority', 'quality review', 'documented authorization'],
    defaultAccess: 'clinical-documentation-review-staff-feedback-compliance-monitoring',
    editingBoundary: 'may approve or provide feedback without changing original staff documentation',
  },
  program_supervisor: {
    key: 'agency_oversight',
    label: 'Program Supervisor',
    basis: ['program scope', 'staff oversight', 'outcome monitoring'],
    defaultAccess: 'program-performance-caseload-training-outcome-monitoring',
    editingBoundary: 'aggregate and assigned oversight only',
  },
  team_lead: {
    key: 'agency_oversight',
    label: 'Team Lead',
    basis: ['team scope', 'assigned staff support'],
    defaultAccess: 'team-caseload-productivity-documentation-completion-monitoring',
    editingBoundary: 'cannot override staff records or client documentation',
  },
  agency_director: {
    key: 'agency_oversight',
    label: 'Agency Director',
    basis: ['agency leadership', 'aggregate performance', 'compliance accountability'],
    defaultAccess: 'agency-wide-aggregate-analytics-outcomes-compliance-workforce-monitoring',
    editingBoundary: 'should primarily view aggregate data rather than confidential client records',
  },
  program_manager: {
    key: 'agency_oversight',
    label: 'Program Manager',
    basis: ['program scope', 'service delivery oversight'],
    defaultAccess: 'program-caseload-service-utilization-training-outcome-reporting',
    editingBoundary: 'cannot modify client records or audit logs',
  },
  quality_assurance_staff: {
    key: 'agency_oversight',
    label: 'Quality Assurance Staff',
    basis: ['QA assignment', 'audit need', 'compliance review'],
    defaultAccess: 'documentation-audits-quality-reports-trends-access-log-review',
    editingBoundary: 'may audit and flag concerns but cannot modify records',
  },
  compliance_officer: {
    key: 'agency_oversight',
    label: 'Compliance Officer',
    basis: ['compliance role', 'documented review need', 'security event review'],
    defaultAccess: 'hipaa-ferpa-part2-security-audit-compliance-monitoring',
    editingBoundary: 'cannot delete audit logs or alter submitted records',
  },
  executive_leadership: {
    key: 'agency_oversight',
    label: 'Executive Leadership',
    basis: ['leadership scope', 'aggregate analytics', 'growth and financial metrics'],
    defaultAccess: 'agency-wide-aggregate-outcomes-financial-growth-indicators',
    editingBoundary: 'client-level records require documented authorization',
  },
  contract_manager: {
    key: 'agency_oversight',
    label: 'Contract Manager',
    basis: ['contract scope', 'service utilization', 'grant or funder reporting'],
    defaultAccess: 'service-utilization-contract-performance-outcome-reporting',
    editingBoundary: 'aggregate and authorized records only',
  },
  grant_administrator: {
    key: 'agency_oversight',
    label: 'Grant Administrator',
    basis: ['grant scope', 'outcome reporting', 'aggregate impact metrics'],
    defaultAccess: 'grant-outcome-reporting-service-utilization-community-impact',
    editingBoundary: 'should use de-identified or aggregate data whenever possible',
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
  community_behavioral_health_worker: {
    key: 'behavioral_health_provider_view',
    label: 'Community Behavioral Health Worker (CHW)',
    basis: ['assigned client', 'family consent', 'approved record category', 'service delivery role'],
    defaultAccess: 'track-goals-coordinate-resources-document-service-delivery-monitor-family-progress',
    editingBoundary: 'cannot provide clinical diagnoses or alter family-generated records',
  },
  tbs_provider: {
    key: 'behavioral_health_provider_view',
    label: 'TBS Provider',
    basis: ['assigned client', 'family consent', 'behavioral intervention plan'],
    defaultAccess: 'track-behavioral-interventions-skill-building-goals-progress-reports',
    editingBoundary: 'may document interventions and skill building within approved records only',
  },
  cpst_provider: {
    key: 'behavioral_health_provider_view',
    label: 'CPST Provider',
    basis: ['assigned client', 'family consent', 'service coordination scope'],
    defaultAccess: 'coordinate-services-support-treatment-planning-track-engagement-document-rehabilitation',
    editingBoundary: 'may coordinate services without overriding provider decisions',
  },
  risk_management_specialist: {
    key: 'behavioral_health_provider_view',
    label: 'Risk Management Specialist',
    basis: ['assigned client', 'family consent', 'crisis prevention scope'],
    defaultAccess: 'document-crisis-prevention-stabilization-high-risk-monitoring-safety-summaries',
    editingBoundary: 'cannot make emergency decisions through the platform',
  },
  treatment_court_mentor: {
    key: 'behavioral_health_provider_view',
    label: 'Treatment Court Mentor',
    basis: ['assigned client', 'family consent', 'court/treatment authorization'],
    defaultAccess: 'track-participation-goal-completion-mentorship-contacts-progress-summaries',
    editingBoundary: 'cannot access protected treatment records without authorization',
  },
  substance_use_counselor: {
    key: 'behavioral_health_provider_view',
    label: 'Substance Use Counselor',
    basis: ['assigned client', 'explicit consent', '42 CFR Part 2 controls'],
    defaultAccess: 'track-recovery-goals-treatment-participation-recovery-supports-progress-reports',
    editingBoundary: 'substance-use records require segmented authorization and cannot be broadly shared',
  },
  behavioral_health_supervisor: {
    key: 'behavioral_health_provider_view',
    label: 'Behavioral Health Supervisor',
    basis: ['assigned client', 'family consent', 'supervisory treatment team scope'],
    defaultAccess: 'review-service-delivery-progress-risk-and-documentation-within-approved-records',
    editingBoundary: 'may support supervision and compliance review without overriding provider decisions',
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