import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, professional_role } = await req.json();

    if (!code || !code.trim()) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    // Find the invitation code
    const invitations = await base44.entities.InvitationCode.filter(
      { code: code.toUpperCase().trim() }
    );

    if (invitations.length === 0) {
      return Response.json({ error: 'Invalid code' }, { status: 404 });
    }

    const invitation = invitations[0];

    // Check if already used
    if (invitation.used) {
      return Response.json({ error: 'This code has already been used' }, { status: 400 });
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return Response.json({ error: 'This code has expired' }, { status: 400 });
    }

    // Mark as used
    await base44.entities.InvitationCode.update(invitation.id, {
      used: true,
      used_by_email: user.email,
      used_by_name: user.full_name,
      used_at: new Date().toISOString()
    });

    // Create AssignedFamily link (auto-links professional to parent)
    const assignment = await base44.entities.AssignedFamily.create({
      family_email: invitation.parent_email,
      family_name: invitation.parent_name,
      child_name: invitation.child_name,
      professional_email: user.email,
      professional_role: professional_role || 'Other',
      status: 'active'
    });

    // Send confirmation email to parent
    await base44.integrations.Core.SendEmail({
      to: invitation.parent_email,
      subject: 'Professional Linked to Your Rooted 21 Account',
      body: `Hi ${invitation.parent_name},\n\n${user.full_name} (${professional_role || 'Professional'}) has successfully linked to your account using your invitation code.\n\nYou can now share your family's data with them through secure messaging and see their updates in your support team.\n\nIf you did not authorize this, please remove them from your support team immediately.\n\nRooted 21 Team`
    });

    return Response.json({
      success: true,
      message: 'Code redeemed successfully',
      assignment: {
        family_name: invitation.parent_name,
        professional_name: user.full_name,
        professional_role: professional_role || 'Other'
      }
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});