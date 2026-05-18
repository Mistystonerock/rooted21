import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const now = new Date().toISOString();
    const sessions = await base44.asServiceRole.entities.DeviceSession.filter({ user_email: user.email, active: true }, '-last_seen_at', 100);
    const targetSessions = payload.device_id
      ? sessions.filter(session => session.device_id === payload.device_id)
      : sessions;

    for (const session of targetSessions) {
      await base44.asServiceRole.entities.DeviceSession.update(session.id, {
        active: false,
        trusted: false,
        revoked_at: now,
        revoked_reason: payload.device_id ? 'User revoked this device' : 'User requested logout on all tracked devices'
      });
    }

    await base44.entities.SecurityEvent.create({
      user_email: user.email,
      event_type: payload.device_id ? 'device_revoked' : 'logout_all_devices',
      severity: 'warning',
      details: payload.device_id ? 'A tracked device was revoked.' : 'All tracked device sessions were revoked.',
      resolved: true
    });

    return Response.json({ success: true, revoked_count: targetSessions.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});