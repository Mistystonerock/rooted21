import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'founder') {
      return Response.json({ error: 'Forbidden: Founder access required' }, { status: 403 });
    }

    const payload = await req.json();
    const now = new Date();
    const lastReauth = user.last_sensitive_reauth_at ? new Date(user.last_sensitive_reauth_at) : null;
    const reauthWindowMinutes = user.founder_reauth_required_after_minutes || 10;
    const reauthFresh = lastReauth && ((now.getTime() - lastReauth.getTime()) / 60000) <= reauthWindowMinutes;

    await base44.entities.SecurityEvent.create({
      user_email: user.email,
      event_type: reauthFresh ? 'founder_sensitive_action' : 'founder_reauth_required',
      severity: reauthFresh ? 'info' : 'critical',
      details: payload.action || 'Founder sensitive action check',
      resolved: reauthFresh
    });

    return Response.json({ allowed: !!reauthFresh, reauth_required: !reauthFresh });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});