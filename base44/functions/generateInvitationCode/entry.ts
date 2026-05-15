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

    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existing = await base44.asServiceRole.entities.AccessCode.filter({ code });
      isUnique = existing.length === 0;
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await base44.asServiceRole.entities.AccessCode.create({
      code,
      created_by_user_id: user.id,
      created_by_email: user.email,
      created_by_name: user.full_name || user.email,
      role_type: 'professional',
      status: 'active',
      expires_at: expiresAt.toISOString(),
      child_name: child_name || ''
    });

    return Response.json({
      code,
      expiresAt: expiresAt.toISOString(),
      message: 'Professional access code generated successfully'
    });
  } catch (error) {
    console.error('Error generating code:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});