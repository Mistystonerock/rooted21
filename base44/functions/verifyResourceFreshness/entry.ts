import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

function daysSince(dateValue) {
  if (!dateValue) return 9999;
  const time = new Date(dateValue).getTime();
  if (Number.isNaN(time)) return 9999;
  return Math.floor((Date.now() - time) / (24 * 60 * 60 * 1000));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const resources = await base44.asServiceRole.entities.ResourceListing.list('-updated_date', 1000);
    const staleResources = resources.filter(resource => {
      if (resource.verification_status === 'archived') return false;
      return daysSince(resource.verified_at || resource.updated_date || resource.created_date) >= 60;
    });

    const updatedResources = [];
    for (const resource of staleResources) {
      const updated = await base44.asServiceRole.entities.ResourceListing.update(resource.id, {
        verification_status: 'outdated',
        last_review_reminder_at: now.toISOString()
      });
      updatedResources.push(updated);

      await base44.asServiceRole.entities.RootedAuditEvent.create({
        event_type: 'resource_review',
        entity_name: 'ResourceListing',
        entity_id: resource.id,
        severity: resource.crisis_priority ? 'critical' : 'warning',
        summary: `Resource needs verification: ${resource.name}`,
        metadata_json: JSON.stringify({ county: resource.county || '', category: resource.category || '', days_since_verified: daysSince(resource.verified_at) }),
        occurred_at: now.toISOString()
      });
    }

    const admins = await base44.asServiceRole.entities.User.list('', 500);
    const adminRecipients = admins.filter(user => ['admin', 'founder'].includes(user.role) && user.email);
    const founder = adminRecipients.find(user => user.role === 'founder') || adminRecipients[0];

    if (staleResources.length > 0 && founder?.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: founder.email,
        subject: `Rooted 21 resource verification needed: ${staleResources.length} listings`,
        body: `Rooted 21 found ${staleResources.length} resource listing(s) that have not been verified in 60+ days.\n\nPlease review the Founder Dashboard resource verification queue. Crisis-priority resources should be reviewed first.\n\nThis helps families see accurate, trusted support options.`
      });

      await base44.asServiceRole.entities.Notification.create({
        user_email: founder.email,
        type: 'system',
        title: 'Resource verification needed',
        body: `${staleResources.length} resource listing(s) are outdated and need admin review.`,
        related_link: '/founder-dashboard'
      });
    }

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      event_type: 'system_job',
      severity: 'info',
      summary: `Resource freshness job completed. ${staleResources.length} outdated resources flagged.`,
      metadata_json: JSON.stringify({ checked_count: resources.length, outdated_count: staleResources.length }),
      occurred_at: now.toISOString()
    });

    return Response.json({ checked: resources.length, outdated: staleResources.length, updated: updatedResources.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});