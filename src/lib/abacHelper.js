/**
 * Attribute-Based Access Control (ABAC) Helper
 * Validates user access to case data based on case association and role
 */

export const ROLE_PERMISSIONS = {
  founder: ['view_all_cases', 'manage_all_cases', 'view_all_users'],
  admin: ['view_assigned_cases', 'manage_assigned_cases'],
  caseworker: ['view_assigned_cases', 'manage_assigned_cases', 'add_notes'],
  therapist: ['view_assigned_cases', 'add_clinical_notes'],
  parent: ['view_own_case', 'add_journal_entries', 'view_child_data'],
  professional: ['view_assigned_cases', 'add_professional_notes'],
};

/**
 * Check if user has access to a specific case
 * @param {Object} user - Authenticated user object with email and role
 * @param {string} caseId - The case ID to check access for
 * @param {Array} caseAccessRecords - Array of CaseAccess records from DB
 * @returns {boolean} Whether user has access to this case
 */
export async function canAccessCase(user, caseId, caseAccessRecords) {
  if (!user || !caseId) return false;

  // Founder and admin can access all cases
  if (user.role === 'founder' || user.role === 'admin') {
    return true;
  }

  // Check if user has explicit case assignment
  const hasAccess = caseAccessRecords.some(record => {
    return (
      record.case_id === caseId &&
      record.assigned_email === user.email &&
      record.is_active !== false
    );
  });

  return hasAccess;
}

/**
 * Get all cases accessible by a user
 * @param {Object} user - Authenticated user object
 * @param {Array} caseAccessRecords - All CaseAccess records
 * @param {Array} allCases - All CaseFile records
 * @returns {Array} Cases user can access
 */
export function getAccessibleCases(user, caseAccessRecords, allCases) {
  if (user.role === 'founder' || user.role === 'admin') {
    return allCases;
  }

  const accessibleCaseIds = caseAccessRecords
    .filter(
      record =>
        record.assigned_email === user.email && record.is_active !== false
    )
    .map(record => record.case_id);

  return allCases.filter(c => accessibleCaseIds.includes(c.id));
}

/**
 * Filter sensitive data based on user role
 * @param {Object} data - The data to filter
 * @param {string} role - User's role
 * @returns {Object} Filtered data appropriate for the role
 */
export function filterDataByRole(data, role) {
  const filtered = { ...data };

  // Parents should not see professional clinical notes
  if (role === 'parent') {
    delete filtered.clinical_notes;
    delete filtered.professional_assessment;
    delete filtered.caseworker_risk_assessment;
  }

  // Therapists should not see caseworker risk assessments
  if (role === 'therapist') {
    delete filtered.caseworker_risk_assessment;
  }

  // Non-admins should not see billing or agency data
  if (role !== 'admin' && role !== 'founder') {
    delete filtered.billing_info;
    delete filtered.agency_metadata;
  }

  return filtered;
}

/**
 * Enforce ABAC in backend function
 * Call this at the start of any function that accesses case data
 * @param {Object} base44 - Base44 SDK instance
 * @param {string} caseId - Case ID being accessed
 * @param {Array} requiredPermissions - Array of permission strings required
 * @returns {Object} { allowed: boolean, user: Object, error?: string }
 */
export async function enforceABAC(base44, caseId, requiredPermissions = []) {
  try {
    const user = await base44.auth.me();
    if (!user) {
      return { allowed: false, error: 'User not authenticated', status: 401 };
    }

    // Fetch case access records
    const caseAccess = await base44.asServiceRole.entities.CaseAccess.filter(
      { case_id: caseId },
      '-created_date',
      100
    );

    // Check if user can access this case
    const hasAccess = await canAccessCase(user, caseId, caseAccess);
    if (!hasAccess) {
      return {
        allowed: false,
        error: 'Access denied to this case',
        status: 403,
      };
    }

    // Check specific permissions if required
    if (requiredPermissions.length > 0) {
      const userPerms = ROLE_PERMISSIONS[user.role] || [];
      const hasRequiredPerms = requiredPermissions.some(perm =>
        userPerms.includes(perm)
      );

      if (!hasRequiredPerms) {
        return {
          allowed: false,
          error: `Insufficient permissions: requires ${requiredPermissions.join(', ')}`,
          status: 403,
        };
      }
    }

    return { allowed: true, user };
  } catch (error) {
    return {
      allowed: false,
      error: `ABAC check failed: ${error.message}`,
      status: 500,
    };
  }
}