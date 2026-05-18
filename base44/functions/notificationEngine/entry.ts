import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TYPE_TO_PREF = {
  resource_update: 'resource_updates',
  court_reminder: 'court_reminders',
  appointment_reminder: 'appointment_reminders',
  case_plan_reminder: 'case_plan_reminders',
  visitation_reminder: 'visitation_reminders',
  benefits_reminder: 'benefits_recertification_reminders',
  iep_meeting_reminder: 'iep_meeting_reminders',
  medication_reminder: 'medication_reminders',
  resource_verification_reminder: 'resource_verification_reminders',
  safety_plan_reminder: 'safety_plan_reminders',
  beta_update: 'beta_updates'
};

const SENSITIVE_TYPES = new Set(['court_reminder', 'case_plan_reminder', 'visitation_reminder', 'benefits_reminder', 'iep_meeting_reminder', 'medication_reminder', 'safety_plan_reminder']);

function calmBody(type, title, body) {
  if (body) return `${body}\n\nOne step at a time. — Rooted 21`;
  if (type === 'court_reminder') return `Reminder: You have a hearing coming up. One step at a time. — Rooted 21`;
  if (type === 'case_plan_reminder') return `You're making progress. A case-plan step is coming due soon. — Rooted 21`;
  return `${title || 'You have a Rooted 21 reminder.'}\n\nOne step at a time. — Rooted 21`;
}

async function log(base44, data) {
  await base44.asServiceRole.entities.NotificationDeliveryLog.create({ ...data, sent_at: new Date().toISOString() });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    const targetEmail = payload.to || user.email;
    if (targetEmail !== user.email && !['admin', 'founder'].includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const type = payload.type || 'resource_update';
    const title = payload.title || 'Rooted 21 reminder';
    const body = calmBody(type, title, payload.body);
    const prefRows = await base44.asServiceRole.entities.NotificationPreference.filter({ user_email: targetEmail }, '-updated_date', 1);
    const prefs = prefRows[0] || { email_enabled: true, in_app_enabled: true };
    const prefKey = TYPE_TO_PREF[type];
    const sensitive = payload.sensitive ?? SENSITIVE_TYPES.has(type);

    if (prefKey && prefs[prefKey] === false) {
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'in_app', status: 'skipped', subject: title, message_preview: body.slice(0, 180), metadata_json: JSON.stringify({ reason: 'preference_disabled' }) });
      return Response.json({ success: true, skipped: true, reason: 'preference_disabled' });
    }

    if (sensitive && prefs.mute_sensitive_notifications) {
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'in_app', status: 'skipped', subject: title, message_preview: 'Sensitive notification muted', metadata_json: JSON.stringify({ reason: 'sensitive_muted' }) });
      return Response.json({ success: true, skipped: true, reason: 'sensitive_muted' });
    }

    const results = [];
    if (prefs.in_app_enabled !== false) {
      const notification = await base44.asServiceRole.entities.Notification.create({
        user_email: targetEmail,
        type,
        title,
        body,
        sensitive,
        delivery_channel: 'in_app',
        related_entity: payload.related_entity || '',
        related_id: payload.related_id || '',
        related_link: payload.related_link || '/notifications',
        read: false
      });
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'in_app', status: 'sent', subject: title, message_preview: body.slice(0, 180), related_entity: payload.related_entity || '', related_id: payload.related_id || '' });
      results.push({ channel: 'in_app', status: 'sent', id: notification.id });
    }

    if (prefs.email_enabled !== false) {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: targetEmail, subject: title, body, from_name: 'Rooted 21' });
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'email', status: 'sent', subject: title, message_preview: body.slice(0, 180), related_entity: payload.related_entity || '', related_id: payload.related_id || '' });
      results.push({ channel: 'email', status: 'sent' });
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});