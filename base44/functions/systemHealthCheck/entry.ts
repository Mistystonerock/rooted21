import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_error) {
      user = null;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

    const [openErrors, staleResources, unresolvedLogs, endpoints, countyConfigs] = await Promise.all([
      base44.asServiceRole.entities.ErrorReport.filter({ status: 'open' }, '-reported_at', 500),
      base44.asServiceRole.entities.ResourceListing.filter({ verification_status: 'needs_review' }, '-updated_date', 500),
      base44.asServiceRole.entities.SystemOperationalLog.filter({ resolved: false }, '-occurred_at', 500),
      base44.asServiceRole.entities.IntegrationEndpoint.list('-updated_date', 200),
      base44.asServiceRole.entities.StatewideCountyConfig.list('-updated_date', 200)
    ]);

    const criticalErrors = openErrors.filter(error => error.severity === 'critical' || error.severity === 'high');
    const staleVerifiedResources = staleResources.filter(resource => !resource.verified_at || resource.verified_at < sixtyDaysAgo);
    const blockedEndpoints = endpoints.filter(endpoint => endpoint.security_review_status === 'blocked');
    const pilotCounties = countyConfigs.filter(config => ['pilot', 'active'].includes(config.launch_status));

    const score = Math.max(0, 100 - (criticalErrors.length * 12) - (staleVerifiedResources.length * 2) - (blockedEndpoints.length * 10));
    const severity = score < 70 || criticalErrors.length > 0 ? 'critical' : score < 90 ? 'warning' : 'info';

    const log = await base44.asServiceRole.entities.SystemOperationalLog.create({
      event_key: `health_${now.toISOString().slice(0, 10)}`,
      category: 'system_health',
      severity,
      summary: `System health score: ${score}`,
      details: `Open errors: ${openErrors.length}; high/critical errors: ${criticalErrors.length}; stale resources: ${staleVerifiedResources.length}; blocked endpoints: ${blockedEndpoints.length}; pilot/active counties: ${pilotCounties.length}`,
      actor_email: user?.email || 'automation',
      actor_role: user?.role || 'system',
      metadata_json: JSON.stringify({ score, open_errors: openErrors.length, stale_resources: staleVerifiedResources.length, blocked_endpoints: blockedEndpoints.length, pilot_counties: pilotCounties.length, since: sevenDaysAgo }),
      occurred_at: now.toISOString()
    });

    if (severity !== 'info') {
      await base44.asServiceRole.entities.Notification.create({
        user_email: 'misty.stonerock88@gmail.com',
        type: 'system',
        title: 'Rooted 21 system health needs review',
        body: `Health score ${score}. Please review critical errors, stale resources, and integration readiness.`,
        related_id: log.id,
        related_link: '/founder-dashboard',
        read: false
      });
    }

    return Response.json({ success: true, score, severity, log_id: log.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});