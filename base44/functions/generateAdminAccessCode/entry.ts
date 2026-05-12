import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'founder') {
      return Response.json({ error: 'Unauthorized: Founder access required' }, { status: 403 });
    }

    const body = await req.json();
    const { created_for } = body;

    // Generate unique 6-digit code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existing = await base44.entities.AdminAccessCode.filter({ code }, "", 1);
      isUnique = existing.length === 0;
    }

    // Calculate expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create the access code
    const accessCode = await base44.entities.AdminAccessCode.create({
      code,
      created_by: user.email,
      created_for: created_for || null,
      used: false,
      expires_at: expiresAt.toISOString(),
    });

    return Response.json({ 
      id: accessCode.id,
      code: accessCode.code,
      expires_at: accessCode.expires_at,
      created_at: accessCode.created_date,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});