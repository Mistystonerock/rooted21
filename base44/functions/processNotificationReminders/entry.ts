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

    const [courtAppointments, careEvents, caseTasks, visitationLogs, benefitReminders, medicationRecords, staleResources] = await Promise.all([
      base44.asServiceRole.entities.CourtAppointment.list('-date', 200),
      base44.asServiceRole.entities.CareCalendarEvent.list('-start_date', 200),
      base44.asServiceRole.entities.CaseTask.list('-due_date', 200),
      base44.asServiceRole.entities.VisitationLog.list('-visit_date', 200),
      base44.asServiceRole.entities.BenefitReminder.list('-due_date', 200),
      base44.asServiceRole.entities.MedicationRecord.list('-refill_date', 200),
      base44.asServiceRole.entities.ResourceListing.filter({ verification_status: 'needs_review' }, '-updated_date', 200)
    ]);

    let sent = 0;

    for (const item of courtAppointments.filter(a => dueSoon(a.date || a.court_date || a.appointment_date || a.hearing_date, 1))) {
      const recipients = [item.parent_1_email, item.parent_2_email, item.parent_email, item.created_by].filter(Boolean);
      for (const email of [...new Set(recipients)]) {
        await send(base44, { to: email, type: 'court_reminder', title: 'Reminder: You have a hearing tomorrow.', body: `${item.title || 'Your hearing'} is coming up. Take one small preparation step today.`, related_entity: 'CourtAppointment', related_id: item.id, related_link: '/court-dashboard', sensitive: true });
        sent++;
      }
    }

    for (const item of caseTasks.filter(t => dueSoon(t.due_date, 3) && !['completed', 'cancelled'].includes(t.status))) {
      await send(base44, { to: item.assigned_to_email || item.created_by, type: 'case_plan_reminder', title: "You're making progress.", body: `${item.title || 'A case-plan step'} is coming due soon. One step at a time.`, related_entity: 'CaseTask', related_id: item.id, related_link: '/case-management', sensitive: true });
      sent++;
    }

    for (const item of visitationLogs.filter(v => dueSoon(v.visit_date, 1))) {
      await send(base44, { to: item.parent_email || item.created_by, type: 'visitation_reminder', title: 'Gentle visitation reminder', body: `${item.child_name || 'Your child'} has a visit coming up${item.visit_time ? ` at ${item.visit_time}` : ''}.`, related_entity: 'VisitationLog', related_id: item.id, related_link: '/visitation-tracker', sensitive: true });
      sent++;
    }

    for (const item of benefitReminders.filter(b => b.status !== 'done' && dueSoon(b.due_date, 7))) {
      await send(base44, { to: item.created_by, type: 'benefits_reminder', title: 'Benefits recertification reminder', body: `${item.title || 'A benefit recertification'} is coming up. Gathering one document today can help.`, related_entity: 'BenefitReminder', related_id: item.id, related_link: '/housing-resources', sensitive: true });
      sent++;
    }

    for (const item of careEvents.filter(e => dueSoon(e.start_date || e.event_date || e.date, 3))) {
      const title = `${item.title || ''}`.toLowerCase().includes('iep') ? 'IEP meeting reminder' : 'Upcoming appointment reminder';
      const type = title.includes('IEP') ? 'iep_meeting_reminder' : 'appointment_reminder';
      await send(base44, { to: item.created_by, type, title, body: `${item.title || 'An appointment'} is coming up soon. You can prepare one question or note today.`, related_entity: 'CareCalendarEvent', related_id: item.id, related_link: '/care-calendar', sensitive: type === 'iep_meeting_reminder' });
      sent++;
    }

    for (const item of medicationRecords.filter(m => m.is_active !== false && dueSoon(m.refill_date, 5))) {
      await send(base44, { to: item.parent_email || item.created_by, type: 'medication_reminder', title: 'Medication refill reminder', body: `${item.medication_name || 'A medication'} may need attention soon. One step at a time.`, related_entity: 'MedicationRecord', related_id: item.id, related_link: '/medication-manager', sensitive: true });
      sent++;
    }

    if (staleResources.length > 0) {
      await send(base44, { to: user.email, type: 'resource_verification_reminder', title: 'Resource verification reminder', body: `${staleResources.length} resource listing(s) are ready for a calm verification review.`, related_entity: 'ResourceListing', related_link: '/resource-management', sensitive: false });
      sent++;
    }

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role,
      event_type: 'system_job',
      entity_name: 'Notification',
      severity: 'info',
      summary: `Trauma-informed notification reminder job completed. ${sent} reminders queued or sent.`,
      occurred_at: new Date().toISOString()
    });

    return Response.json({ success: true, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});