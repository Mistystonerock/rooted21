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

    // Only founder can create admin codes
    if (user.role !== 'founder') {
      return Response.json({ error: 'Founder access required' }, { status: 403 });
    }

    const { professional_email, professional_name, professional_role } = await req.json();

    if (!professional_email || !professional_name) {
      return Response.json({ error: 'Professional email and name required' }, { status: 400 });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existing = await base44.entities.AccessCode.filter(
        { code, used: false }
      );
      isUnique = existing.length === 0;
    }

    // Create access code with no expiration (owner code)
    const accessCode = await base44.entities.AdminAccessCode.create({
      code,
      created_by: user.email,
      created_for: professional_name,
      used: false,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });

    return Response.json({
      success: true,
      code,
      message: 'Admin access code created successfully'
    });
  } catch (error) {
    console.error('Error creating owner code:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});