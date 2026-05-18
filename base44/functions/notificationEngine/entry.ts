import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TYPE_TO_PREF = {
  welcome: 'welcome_emails',
  password_reset: 'password_reset_emails',
  resource_update: 'resource_update_reminders',
  court_reminder: 'court_reminders',
  appointment_reminder: 'appointment_reminders',
  case_plan_reminder: 'case_plan_reminders',
  crisis_alert: 'crisis_alerts',
  safety_plan_reminder: 'safety_plan_reminders',
  verification: 'verification_emails',
  admin_alert: 'admin_alerts',
  beta_update: 'beta_updates'
};

const TYPE_TO_IN_APP = {
  court_reminder: 'appointment',
  appointment_reminder: 'appointment',
  case_plan_reminder: 'system',
  crisis_alert: 'system',
  resource_update: 'system',
  safety_plan_reminder: 'system',
  admin_alert: 'system',
  beta_update: 'system',
  welcome: 'system',
  verification: 'system',
  password_reset: 'system'
};

function gentleMessage(type, title, body) {
  const prefix = type === 'crisis_alert'
    ? 'Safety comes first. '
    : 'A gentle Rooted 21 reminder: ';
  return `${prefix}${body || title || 'You have an update waiting for you.'}\n\nYou are not alone. Take the next small step when you are ready. — Rooted 21`;
}

async function log(base44, data) {
  await base44.asServiceRole.entities.NotificationDeliveryLog.create({
    ...data,
    sent_at: new Date().toISOString()
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const targetEmail = payload.to || user.email;
    const type = payload.type || 'admin_alert';
    const title = payload.title || 'Rooted 21 update';
    const body = gentleMessage(type, title, payload.body);
    const relatedLink = payload.related_link || '/notifications';

    if (targetEmail !== user.email && !['admin', 'founder'].includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const prefRows = await base44.asServiceRole.entities.NotificationPreference.filter({ user_email: targetEmail }, '-updated_date', 1);
    const prefs = prefRows[0] || { email_enabled: true, in_app_enabled: true, sms_enabled: false, push_enabled: false, [TYPE_TO_PREF[type]]: true };
    const prefKey = TYPE_TO_PREF[type];
    const enabledForType = prefs[prefKey] !== false;
    const results = [];

    if (!enabledForType) {
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'in_app', status: 'skipped', subject: title, message_preview: body.slice(0, 180), metadata_json: JSON.stringify({ reason: 'preference_disabled' }) });
      return Response.json({ success: true, skipped: true, reason: 'preference_disabled' });
    }

    if (prefs.in_app_enabled !== false) {
      const notification = await base44.asServiceRole.entities.Notification.create({
        user_email: targetEmail,
        type: TYPE_TO_IN_APP[type] || 'system',
        title,
        body,
        related_id: payload.related_id || '',
        related_link: relatedLink,
        read: false
      });
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'in_app', status: 'sent', subject: title, message_preview: body.slice(0, 180), related_entity: payload.related_entity || '', related_id: payload.related_id || '' });
      results.push({ channel: 'in_app', status: 'sent', id: notification.id });
    }

    if (prefs.email_enabled !== false) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: targetEmail,
        subject: title,
        body
      });
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'email', status: 'sent', subject: title, message_preview: body.slice(0, 180), related_entity: payload.related_entity || '', related_id: payload.related_id || '' });
      results.push({ channel: 'email', status: 'sent' });
    }

    if (prefs.sms_enabled) {
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'sms', status: 'queued', subject: title, message_preview: body.slice(0, 180), metadata_json: JSON.stringify({ architecture_ready: true }) });
      results.push({ channel: 'sms', status: 'queued' });
    }

    if (prefs.push_enabled) {
      await log(base44, { user_email: targetEmail, notification_type: type, channel: 'push', status: 'queued', subject: title, message_preview: body.slice(0, 180), metadata_json: JSON.stringify({ architecture_ready: true }) });
      results.push({ channel: 'push', status: 'queued' });
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});