import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function mapRole(testerRole) {
  if (testerRole === 'Professional') return 'professional';
  if (testerRole === 'Court Staff') return 'professional';
  return 'user';
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const code = String(body.code || '').trim().toUpperCase();
    if (!code) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    const matches = await base44.asServiceRole.entities.BetaTesterCode.filter({ code }, '', 1);
    if (matches.length === 0) {
      return Response.json({ error: 'Invalid beta tester code' }, { status: 400 });
    }

    const betaCode = matches[0];
    if (betaCode.status === 'used') {
      return Response.json({ error: 'This beta tester code has already been used' }, { status: 400 });
    }
    if (betaCode.status === 'revoked') {
      return Response.json({ error: 'This beta tester code has been revoked' }, { status: 400 });
    }
    if (new Date(betaCode.expires_at) < new Date()) {
      return Response.json({ error: 'This beta tester code has expired' }, { status: 400 });
    }

    await base44.asServiceRole.entities.BetaTesterCode.update(betaCode.id, {
      status: 'used',
      used_by_email: user.email,
      used_at: new Date().toISOString(),
    });

    await base44.auth.updateMe({ role: mapRole(betaCode.tester_role) });

    return Response.json({ success: true, role: betaCode.tester_role, message: 'Beta tester access activated' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});