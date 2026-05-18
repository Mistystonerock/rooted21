import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function sha256(value) {
  const data = new TextEncoder().encode(value || 'unknown');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const eventType = payload.event_type || 'device_seen';
    const severity = payload.severity || 'info';
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const ipHash = await sha256(forwardedFor.split(',')[0].trim());
    const userAgentHash = await sha256(userAgent);
    const deviceId = payload.device_id || userAgentHash.slice(0, 24);
    const now = new Date().toISOString();

    await base44.entities.SecurityEvent.create({
      user_email: user.email,
      event_type: eventType,
      severity,
      device_label: payload.device_label || payload.device_type || 'Unknown device',
      ip_hash: ipHash,
      user_agent: userAgent.slice(0, 250),
      details: payload.details || '',
      resolved: false
    });

    const existing = await base44.asServiceRole.entities.DeviceSession.filter({ user_email: user.email, device_id: deviceId }, '-updated_date', 1);
    if (existing.length > 0) {
      await base44.asServiceRole.entities.DeviceSession.update(existing[0].id, {
        last_seen_at: now,
        active: true,
        ip_hash: ipHash,
        user_agent_hash: userAgentHash
      });
    } else {
      await base44.asServiceRole.entities.DeviceSession.create({
        user_email: user.email,
        device_id: deviceId,
        device_label: payload.device_label || 'New device',
        device_type: payload.device_type || 'unknown',
        browser_name: payload.browser_name || '',
        ip_hash: ipHash,
        user_agent_hash: userAgentHash,
        trusted: false,
        active: true,
        last_seen_at: now
      });
    }

    if (severity === 'critical' || eventType === 'suspicious_activity') {
      await base44.asServiceRole.entities.AccountLockout.create({
        user_email: user.email,
        status: 'watch',
        reason: 'suspicious_activity',
        failed_attempt_count: 0,
        locked_at: now,
        notes: payload.details || 'Security review recommended'
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});