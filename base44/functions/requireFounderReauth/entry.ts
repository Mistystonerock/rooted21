import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOUNDER_EMAIL = 'misty.stonerock88@gmail.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isFounder = user.role === 'founder' && user.email?.toLowerCase() === FOUNDER_EMAIL;
    if (!isFounder) {
      return Response.json({ error: 'Forbidden: Founder access required' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const now = new Date();
    const lastReauth = user.sensitive_action_reauth_at ? new Date(user.sensitive_action_reauth_at) : null;
    const reauthWindowMinutes = Number(user.founder_reauth_required_after_minutes || 10);
    const reauthFresh = lastReauth && ((now.getTime() - lastReauth.getTime()) / 60000) <= reauthWindowMinutes;

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role,
      event_type: reauthFresh ? 'data_access' : 'security_alert',
      severity: reauthFresh ? 'info' : 'critical',
      summary: reauthFresh ? `Founder sensitive action allowed: ${payload.action || 'unspecified action'}` : `Founder re-auth required: ${payload.action || 'unspecified action'}`,
      metadata_json: JSON.stringify({ action: payload.action || null }),
      occurred_at: now.toISOString(),
    });

    return Response.json({ allowed: !!reauthFresh, reauth_required: !reauthFresh });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});