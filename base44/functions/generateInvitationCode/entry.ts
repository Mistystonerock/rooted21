import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { child_name } = await req.json();

    // Generate unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existing = await base44.entities.InvitationCode.filter(
        { code, used: false }
      );
      isUnique = existing.length === 0;
    }

    // Create invitation code (expires in 30 days)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invitation = await base44.entities.InvitationCode.create({
      code,
      parent_email: user.email,
      parent_name: user.full_name,
      child_name: child_name || 'Not specified',
      expires_at: expiresAt.toISOString(),
      used: false
    });

    return Response.json({
      code,
      expiresAt: expiresAt.toISOString(),
      message: 'Invitation code generated successfully'
    });
  } catch (error) {
    console.error('Error generating code:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});