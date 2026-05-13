import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode() {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'founder') {
      return Response.json({ error: 'Forbidden: Founder access required' }, { status: 403 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    const codes = [];
    while (codes.length < 10) {
      const code = generateCode();
      const existing = await base44.asServiceRole.entities.BetaTesterCode.filter({ code }, '', 1);
      if (existing.length === 0 && !codes.some(c => c.code === code)) {
        codes.push({
          code,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          notes: '',
          tester_role: 'Parent',
          created_by_email: user.email,
        });
      }
    }

    const created = await base44.asServiceRole.entities.BetaTesterCode.bulkCreate(codes);
    return Response.json({ success: true, codes: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});