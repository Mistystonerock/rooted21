import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function daysUntil(value) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}

function dueSoon(value, windowDays = 3) {
  const days = daysUntil(value);
  return days !== null && days >= 0 && days <= windowDays;
}

async function send(base44, payload) {
  await base44.functions.invoke('notificationEngine', payload);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'founder'].includes(user.role)) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [courtAppointments, careEvents, caseTasks, safetyPlans, staleResources] = await Promise.all([
      base44.asServiceRole.entities.CourtAppointment.list('-appointment_date', 200),
      base44.asServiceRole.entities.CareCalendarEvent.list('-start_date', 200),
      base44.asServiceRole.entities.CaseTask.list('-due_date', 200),
      base44.asServiceRole.entities.SafetyPlan.list('-updated_date', 200),
      base44.asServiceRole.entities.ResourceListing.filter({ verification_status: 'needs_review' }, '-updated_date', 200)
    ]);

    let sent = 0;

    for (const item of courtAppointments.filter(a => dueSoon(a.appointment_date || a.hearing_date || a.date))) {
      await send(base44, { to: item.created_by, type: 'court_reminder', title: 'Gentle court reminder', body: `You have a court-related date coming up soon: ${item.title || 'court appointment'}. Take one small preparation step today.`, related_entity: 'CourtAppointment', related_id: item.id, related_link: '/court-dashboard' });
      sent++;
    }

    for (const item of careEvents.filter(e => dueSoon(e.start_date || e.event_date || e.date))) {
      await send(base44, { to: item.created_by, type: 'appointment_reminder', title: 'Upcoming appointment reminder', body: `An appointment is coming up soon: ${item.title || 'care calendar event'}.`, related_entity: 'CareCalendarEvent', related_id: item.id, related_link: '/care-calendar' });
      sent++;
    }

    for (const item of caseTasks.filter(t => dueSoon(t.due_date))) {
      await send(base44, { to: item.created_by, type: 'case_plan_reminder', title: 'Case-plan next step', body: `A case-plan task is coming due: ${item.title || 'case-plan item'}. You can take it one step at a time.`, related_entity: 'CaseTask', related_id: item.id, related_link: '/case-management' });
      sent++;
    }

    for (const item of safetyPlans.filter(p => dueSoon(p.review_date || p.next_review_date, 7))) {
      await send(base44, { to: item.created_by, type: 'safety_plan_reminder', title: 'Safety plan review reminder', body: 'It may be a good time to gently review your safety plan before it is needed.', related_entity: 'SafetyPlan', related_id: item.id, related_link: '/safety-plan' });
      sent++;
    }

    if (staleResources.length > 0) {
      await send(base44, { to: user.email, type: 'resource_update', title: 'Resource listings need review', body: `${staleResources.length} resource listing(s) are ready for verification review.`, related_entity: 'ResourceListing', related_link: '/founder-dashboard' });
      sent++;
    }

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role,
      event_type: 'system_job',
      entity_name: 'Notification',
      severity: 'info',
      summary: `Notification reminder job completed. ${sent} reminders queued or sent.`,
      occurred_at: new Date().toISOString()
    });

    return Response.json({ success: true, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});