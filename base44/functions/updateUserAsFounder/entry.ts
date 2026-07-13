import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'founder') {
      return Response.json({ error: 'Founder access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, updates } = body;
    if (!userId || !updates) {
      return Response.json({ error: 'userId and updates are required' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.User.update(userId, updates);
    return Response.json({ user: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});