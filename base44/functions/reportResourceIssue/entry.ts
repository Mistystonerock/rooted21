import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function hashValue(value) {
  const encoded = new TextEncoder().encode(value || crypto.randomUUID());
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const body = await req.json();
    const now = new Date().toISOString();

    if (!body.resource_name || !body.report_type) {
      return Response.json({ error: 'Resource and report type are required' }, { status: 400 });
    }

    const report = await base44.asServiceRole.entities.ResourceReport.create({
      resource_id: body.resource_id || '',
      resource_name: body.resource_name,
      resource_county: body.resource_county || '',
      resource_category: body.resource_category || '',
      report_type: body.report_type,
      details: body.details || '',
      status: 'pending',
      anonymous_reporter_hash: await hashValue(user?.email || req.headers.get('user-agent') || ''),
      reported_at: now
    });

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_role: user?.role || 'anonymous_user',
      event_type: 'resource_review',
      entity_name: 'ResourceReport',
      entity_id: report.id,
      severity: body.report_type === 'unsafe_experience' || body.report_type === 'closed_agency' ? 'warning' : 'info',
      summary: `Community resource report submitted for ${body.resource_name}`,
      metadata_json: JSON.stringify({ report_type: body.report_type, county: body.resource_county || '' }),
      occurred_at: now
    });

    const users = await base44.asServiceRole.entities.User.list('', 1000);
    const recipients = users.filter(item => ['admin', 'founder'].includes(item.role) && item.email);
    await Promise.all(recipients.map(recipient => base44.asServiceRole.entities.Notification.create({
      user_email: recipient.email,
      type: 'system',
      title: 'Resource report needs review',
      body: `A private community report was submitted for ${body.resource_name}.`,
      related_link: '/resource-management'
    })));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});