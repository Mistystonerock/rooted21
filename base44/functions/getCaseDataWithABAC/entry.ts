import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ROLE_PERMISSIONS = {
  founder: ['view_all_cases', 'manage_all_cases'],
  admin: ['view_assigned_cases', 'manage_assigned_cases'],
  caseworker: ['view_assigned_cases', 'manage_assigned_cases'],
  therapist: ['view_assigned_cases'],
  parent: ['view_own_case'],
  professional: ['view_assigned_cases'],
};

async function canAccessCase(base44, user, caseId) {
  if (!user || !caseId) return false;
  if (user.role === 'founder') return true;

  const caseAccess = await base44.asServiceRole.entities.CaseAccess.filter(
    { case_id: caseId, assigned_email: user.email, is_active: true },
    undefined,
    1
  );

  return caseAccess.length > 0;
}

function filterDataByRole(data, role) {
  const filtered = { ...data };
  if (role === 'parent') {
    delete filtered.clinical_notes;
    delete filtered.professional_assessment;
  }
  if (role !== 'admin' && role !== 'founder') {
    delete filtered.billing_info;
  }
  return filtered;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { case_id } = await req.json();

    if (!case_id) {
      return Response.json(
        { error: 'Missing case_id parameter' },
        { status: 400 }
      );
    }

    // Check ABAC
    const hasAccess = await canAccessCase(base44, user, case_id);
    if (!hasAccess) {
      return Response.json(
        { error: 'Access denied to this case' },
        { status: 403 }
      );
    }

    // Fetch case
    const cases = await base44.asServiceRole.entities.CaseFile.filter(
      { id: case_id },
      undefined,
      1
    );

    if (!cases.length) {
      return Response.json({ error: 'Case not found' }, { status: 404 });
    }

    const caseRecord = cases[0];
    if (caseRecord.parent_email !== user.email && user.role !== 'founder') {
      const assigned = await base44.asServiceRole.entities.CaseAccess.filter({ case_id, assigned_email: user.email, is_active: true }, undefined, 1);
      if (!assigned.length) {
        return Response.json({ error: 'Access denied to this case' }, { status: 403 });
      }
    }

    // Fetch related data
    const [documents, caseNotes] = await Promise.all([
      base44.asServiceRole.entities.SecureDocument.filter(
        { case_id },
        '-created_date',
        50
      ),
      base44.asServiceRole.entities.CaseNote.filter(
        { case_id },
        '-created_date',
        100
      ),
    ]);

    const response = {
      case: filterDataByRole(caseRecord, user.role),
      documents: documents.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        created_date: d.created_date,
      })),
      notes: caseNotes
        .filter(note =>
          user.role === 'parent'
            ? note.note_type === 'parent' || note.note_type === 'general'
            : true
        )
        .map(note => ({
          id: note.id,
          author: note.author_name,
          type: note.note_type,
          content: note.content,
          created_date: note.created_date,
        })),
      accessed_by: user.email,
      accessed_role: user.role,
    };

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});