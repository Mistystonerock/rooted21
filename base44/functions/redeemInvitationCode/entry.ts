import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { code, professional_role } = await req.json();
    const normalizedCode = String(code || '').toUpperCase().trim();

    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      return Response.json({ error: 'Please enter a valid 6-character access code.' }, { status: 400 });
    }

    const codes = await base44.asServiceRole.entities.AccessCode.filter({ code: normalizedCode, role_type: 'professional' });
    if (codes.length === 0) return Response.json({ error: 'Invalid code' }, { status: 404 });

    const accessCode = codes[0];
    if (accessCode.status !== 'active') return Response.json({ error: 'This code is no longer active' }, { status: 400 });

    if (new Date(accessCode.expires_at) < new Date()) {
      await base44.asServiceRole.entities.AccessCode.update(accessCode.id, { status: 'expired' });
      return Response.json({ error: 'This code has expired' }, { status: 400 });
    }

    const existingRequests = await base44.asServiceRole.entities.ProfessionalFamilyAccess.filter({
      professional_user_id: user.id,
      parent_user_id: accessCode.created_by_user_id
    });
    const reusableRequest = existingRequests.find(item => item.status === 'pending' || item.status === 'active');

    const now = new Date();
    const requestExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const professionalAccess = reusableRequest || await base44.asServiceRole.entities.ProfessionalFamilyAccess.create({
      professional_user_id: user.id,
      professional_email: user.email,
      professional_name: user.full_name || user.email,
      professional_role: professional_role || 'Other',
      parent_user_id: accessCode.created_by_user_id,
      parent_email: accessCode.created_by_email,
      parent_name: accessCode.created_by_name,
      child_name: accessCode.child_name || '',
      access_code_id: accessCode.id,
      status: 'pending',
      requested_at: now.toISOString(),
      request_expires_at: requestExpiresAt
    });

    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      status: 'requested',
      used_by_user_id: user.id,
      used_by_email: user.email,
      used_by_name: user.full_name || user.email,
      used_at: now.toISOString()
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: accessCode.created_by_email,
      subject: 'Rooted 21 professional access request',
      body: `Hi ${accessCode.created_by_name || 'there'},\n\n${user.full_name || user.email} (${professional_role || 'Professional'}) scanned your Rooted 21 QR/access code and is requesting access. No data has been shared yet. Please open Rooted 21 to approve or decline this request. If approved, access expires automatically in 90 days.\n\nRooted 21 Team`
    });

    return Response.json({
      success: true,
      pending_approval: true,
      message: 'Access request sent. The parent must approve before any data is shared.',
      professionalAccess
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});