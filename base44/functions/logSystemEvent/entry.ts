import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const payload = await req.json();

    const event = await base44.asServiceRole.entities.SystemOperationalLog.create({
      event_key: payload.event_key || crypto.randomUUID(),
      category: payload.category || 'system_health',
      severity: payload.severity || 'info',
      summary: payload.summary || 'System event recorded',
      details: payload.details || '',
      actor_email: user?.email || payload.actor_email || 'system',
      actor_role: user?.role || payload.actor_role || 'system',
      entity_name: payload.entity_name || '',
      entity_id: payload.entity_id || '',
      county: payload.county || '',
      state: payload.state || 'OH',
      metadata_json: payload.metadata_json || '',
      resolved: false,
      occurred_at: new Date().toISOString()
    });

    return Response.json({ success: true, event });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});