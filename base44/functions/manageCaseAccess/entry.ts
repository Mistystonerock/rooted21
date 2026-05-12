import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Admin-only function to assign/revoke access to cases
 * Admins and founders can manage case assignments
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.role !== 'founder')) {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { action, case_id, assigned_email, assigned_role, permissions } = await req.json();

    if (!action || !case_id) {
      return Response.json(
        { error: 'Missing required fields: action, case_id' },
        { status: 400 }
      );
    }

    if (action === 'assign') {
      if (!assigned_email || !assigned_role) {
        return Response.json(
          { error: 'Missing fields for assign: assigned_email, assigned_role' },
          { status: 400 }
        );
      }

      // Fetch the case to validate it exists
      const cases = await base44.asServiceRole.entities.CaseFile.filter(
        { id: case_id },
        undefined,
        1
      );

      if (!cases.length) {
        return Response.json({ error: 'Case not found' }, { status: 404 });
      }

      const caseRecord = cases[0];

      // Create access record
      const accessRecord = await base44.asServiceRole.entities.CaseAccess.create({
        case_id,
        assigned_email,
        assigned_name: assigned_email.split('@')[0],
        assigned_role,
        child_name: caseRecord.child_name,
        case_number: caseRecord.case_number,
        permissions: permissions || ['view_case', 'add_notes'],
        assigned_by: user.email,
        assigned_date: new Date().toISOString(),
        is_active: true,
      });

      return Response.json({
        success: true,
        message: `${assigned_email} assigned to case ${case_id}`,
        access_record: accessRecord,
      });
    }

    if (action === 'revoke') {
      // Find and deactivate access record
      const accessRecords = await base44.asServiceRole.entities.CaseAccess.filter(
        { case_id, assigned_email },
        undefined,
        1
      );

      if (!accessRecords.length) {
        return Response.json(
          { error: 'Access record not found' },
          { status: 404 }
        );
      }

      const accessRecord = accessRecords[0];

      await base44.asServiceRole.entities.CaseAccess.update(accessRecord.id, {
        is_active: false,
        removed_date: new Date().toISOString(),
      });

      return Response.json({
        success: true,
        message: `Access revoked for ${assigned_email}`,
      });
    }

    if (action === 'list') {
      // List all users assigned to a case
      const accessRecords = await base44.asServiceRole.entities.CaseAccess.filter(
        { case_id },
        '-assigned_date',
        100
      );

      return Response.json({
        case_id,
        assigned_users: accessRecords.map(r => ({
          email: r.assigned_email,
          name: r.assigned_name,
          role: r.assigned_role,
          permissions: r.permissions,
          is_active: r.is_active,
          assigned_date: r.assigned_date,
        })),
      });
    }

    return Response.json(
      { error: 'Invalid action. Use: assign, revoke, list' },
      { status: 400 }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});