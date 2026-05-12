import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'founder') {
      return Response.json({ error: 'Unauthorized: Founder access required' }, { status: 403 });
    }

    const body = await req.json();
    const { codeId } = body;

    if (!codeId) {
      return Response.json({ error: 'Missing codeId' }, { status: 400 });
    }

    // Update the code to mark it as revoked
    await base44.entities.AdminAccessCode.update(codeId, {
      used: true,
      used_by: 'revoked',
      used_at: new Date().toISOString(),
    });

    return Response.json({ success: true, message: 'Code revoked successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});