import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

    if (!betaCode) {
      return Response.json({ valid: false, error: 'Invalid enrollment code. Please check the code and try again.' }, { status: 400 });
    }
    if (betaCode.status === 'used') {
      return Response.json({ valid: false, error: 'This enrollment code has already been used.' }, { status: 400 });
    }
    if (betaCode.status === 'revoked') {
      return Response.json({ valid: false, error: 'This enrollment code has been revoked.' }, { status: 400 });
    }
    if (new Date(betaCode.expires_at) < new Date()) {
      return Response.json({ valid: false, error: 'This enrollment code has expired.' }, { status: 400 });
    }

    return Response.json({ valid: true });
  } catch (error) {
    return Response.json({ valid: false, error: 'Unable to verify code. Please try again.' }, { status: 500 });
  }
});