import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const firstName = String(body.first_name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const roleType = String(body.role_type || '').trim();

    if (!firstName || !email || !roleType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const created = await base44.asServiceRole.entities.WaitlistSignup.create({
      first_name: firstName,
      full_name: firstName,
      email,
      role_type: roleType,
      signed_up_at: new Date().toISOString(),
      notified_at_launch: false,
    });

    return Response.json({ success: true, signup: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});