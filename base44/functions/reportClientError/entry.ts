import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function getDeviceType(userAgent) {
  const ua = (userAgent || '').toLowerCase();
  if (ua.includes('mobile')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  if (ua) return 'desktop';
  return 'unknown';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_error) {
      user = null;
    }

    const payload = await req.json();
    const userAgent = req.headers.get('user-agent') || '';

    const report = await base44.asServiceRole.entities.ErrorReport.create({
      user_email: user?.email || payload.user_email || '',
      source: payload.source || 'frontend',
      severity: payload.severity || 'medium',
      message: String(payload.message || 'Unknown error').slice(0, 1000),
      safe_context: String(payload.safe_context || '').slice(0, 4000),
      route_path: payload.route_path || '',
      function_name: payload.function_name || '',
      browser_family: userAgent.slice(0, 160),
      device_type: payload.device_type || getDeviceType(userAgent),
      county: payload.county || '',
      state: payload.state || 'OH',
      status: 'open',
      reported_at: new Date().toISOString()
    });

    if (payload.severity === 'critical') {
      await base44.asServiceRole.entities.SystemOperationalLog.create({
        event_key: `critical_error_${report.id}`,
        category: 'system_health',
        severity: 'critical',
        summary: 'Critical client error reported',
        details: report.message,
        actor_email: user?.email || 'anonymous',
        actor_role: user?.role || 'unknown',
        entity_name: 'ErrorReport',
        entity_id: report.id,
        metadata_json: JSON.stringify({ route_path: report.route_path, source: report.source }),
        occurred_at: new Date().toISOString()
      });
    }

    return Response.json({ success: true, report_id: report.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});