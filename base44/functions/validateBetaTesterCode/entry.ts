import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const base44 = createClientFromRequest(req);
    const code = String(body.code || '').trim().toUpperCase();

    if (!code) {
      return Response.json({ valid: true });
    }

    const matches = await base44.asServiceRole.entities.BetaTesterCode.filter({ code }, '', 1);
    const betaCode = matches[0];

    if (!betaCode || betaCode.status !== 'active' || new Date(betaCode.expires_at) < new Date()) {
      return Response.json({ valid: false }, { status: 400 });
    }

    return Response.json({ valid: true });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});