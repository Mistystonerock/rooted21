import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, professional_role } = await req.json();
    const normalizedCode = String(code || '').toUpperCase().trim();

    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      return Response.json({ error: 'Please enter a valid 6-character access code.' }, { status: 400 });
    }

    const codes = await base44.asServiceRole.entities.AccessCode.filter({ code: normalizedCode, role_type: 'professional' });

    if (codes.length === 0) {
      return Response.json({ error: 'Invalid code' }, { status: 404 });
    }

    const accessCode = codes[0];

    if (accessCode.status !== 'active') {
      return Response.json({ error: 'This code is no longer active' }, { status: 400 });
    }

    if (new Date(accessCode.expires_at) < new Date()) {
      await base44.asServiceRole.entities.AccessCode.update(accessCode.id, { status: 'expired' });
      return Response.json({ error: 'This code has expired' }, { status: 400 });
    }

    const existingLinks = await base44.entities.ProfessionalFamilyAccess.filter({
      professional_user_id: user.id,
      parent_user_id: accessCode.created_by_user_id,
      status: 'active'
    });

    let professionalAccess = existingLinks[0];
    if (!professionalAccess) {
      professionalAccess = await base44.entities.ProfessionalFamilyAccess.create({
        professional_user_id: user.id,
        professional_email: user.email,
        professional_name: user.full_name || user.email,
        professional_role: professional_role || 'Other',
        parent_user_id: accessCode.created_by_user_id,
        parent_email: accessCode.created_by_email,
        parent_name: accessCode.created_by_name,
        child_name: accessCode.child_name || '',
        access_code_id: accessCode.id,
        status: 'active'
      });
    }

    const existingAssignments = await base44.entities.AssignedFamily.filter({
      professional_email: user.email,
      family_email: accessCode.created_by_email
    });

    let assignment = existingAssignments[0];
    if (!assignment) {
      assignment = await base44.entities.AssignedFamily.create({
        family_user_id: accessCode.created_by_user_id,
        family_email: accessCode.created_by_email,
        family_name: accessCode.created_by_name,
        child_name: accessCode.child_name || '',
        professional_user_id: user.id,
        professional_email: user.email,
        professional_name: user.full_name || user.email,
        professional_role: professional_role || 'Other',
        status: 'active'
      });
    }

    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      status: 'used',
      used_by_user_id: user.id,
      used_by_email: user.email,
      used_by_name: user.full_name || user.email,
      used_at: new Date().toISOString()
    });

    await base44.integrations.Core.SendEmail({
      to: accessCode.created_by_email,
      subject: 'Professional Linked to Your Rooted 21 Account',
      body: `Hi ${accessCode.created_by_name || 'there'},\n\n${user.full_name || user.email} (${professional_role || 'Professional'}) has successfully linked to your account using your professional access code.\n\nIf you did not authorize this, please review your support team access.\n\nRooted 21 Team`
    });

    return Response.json({
      success: true,
      message: 'Code redeemed successfully',
      professionalAccess,
      assignment: {
        family_name: accessCode.created_by_name || accessCode.created_by_email,
        professional_name: user.full_name || user.email,
        professional_role: professional_role || 'Other'
      }
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});