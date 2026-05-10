import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code || !code.trim()) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    // Find the code
    const codes = await base44.asServiceRole.entities.AdminAccessCode.filter({
      code: code.trim().toUpperCase(),
    });

    if (codes.length === 0) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    const accessCode = codes[0];

    // Check if already used
    if (accessCode.used) {
      return Response.json({ error: 'Code has already been used' }, { status: 400 });
    }

    // Check if expired
    if (new Date(accessCode.expires_at) < new Date()) {
      return Response.json({ error: 'Code has expired' }, { status: 400 });
    }

    // Mark code as used
    await base44.asServiceRole.entities.AdminAccessCode.update(accessCode.id, {
      used: true,
      used_by: user.email,
      used_at: new Date().toISOString(),
    });

    // Update user role to admin
    await base44.auth.updateMe({ role: 'admin' });

    return Response.json({ success: true, message: 'You are now an admin!' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});