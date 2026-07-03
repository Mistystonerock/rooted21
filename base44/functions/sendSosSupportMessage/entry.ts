import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";
import twilio from "npm:twilio@5.3.0";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { message, urgency_level, gps_coordinates, manual_location, location_shared } = body || {};

    if (!urgency_level || !["low", "medium", "high", "critical"].includes(urgency_level)) {
      return Response.json({ success: false, error: "Valid urgency_level required (low, medium, high, critical)" }, { status: 400 });
    }

    const userId = currentUser.id;
    const userName = currentUser.full_name || "Unknown";
    const userEmail = currentUser.email || "Unknown";

    // ── Create the SOS incident (GPS lives ONLY here) ──
    const incident = await base44.asServiceRole.entities.SOSIncident.create({
      user_id: userId,
      family_id: null,
      incident_type: "sos_support_request",
      description: message || "SOS support request — no message provided",
      status: "active",
      urgency_level,
      gps_coordinates: gps_coordinates || null,
      manual_location: manual_location || null,
      location_shared: location_shared === true,
      user_name: userName,
      user_email: userEmail,
      notified_user_ids: [],
      updated_by: userId,
    });
    const incidentId = incident.id;

    // ── Audit event (never includes coordinates, only whether GPS was included) ──
    try {
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: userEmail,
        actor_role: currentUser.role || "user",
        event_type: "security_alert",
        entity_name: "SOSIncident",
        entity_id: incidentId,
        severity: urgency_level === "critical" ? "critical" : "warning",
        summary: `SOS support request sent by ${userName} — urgency: ${urgency_level}, GPS: ${gps_coordinates ? "included" : "not included"}`,
        metadata_json: JSON.stringify({
          action: "sos_support_request",
          incident_id: incidentId,
          urgency_level,
          gps_included: !!gps_coordinates,
          manual_location_provided: !!manual_location,
          location_shared: location_shared === true,
          user_id: userId,
        }),
        occurred_at: new Date().toISOString(),
      });
    } catch (_e) { /* audit best-effort */ }

    // ── Query SupportContact records — only active + SOS-approved + not deleted ──
    let supportContacts = [];
    try {
      supportContacts = await base44.asServiceRole.entities.SupportContact.filter({
        user_id: userId,
        active: true,
        can_receive_sos_alerts: true,
        is_deleted: false,
      });
    } catch (_e) { /* no contacts configured */ }

    // ── Twilio client (best-effort — SMS delivery must never block the SOS save) ──
    let twilioClient = null;
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (twilioAccountSid && twilioAuthToken && twilioFromNumber) {
      try {
        twilioClient = twilio(twilioAccountSid, twilioAuthToken);
      } catch (_e) { twilioClient = null; }
    }

    // ── Process each approved contact ──
    const notifiedUserIds = [];
    const notifiedContacts = [];
    const externalDeliveries = [];
    const deliveryLogRows = [];

    async function logDelivery(contactName, method, status, errorMessage, gpsIncluded, messageIncluded) {
      deliveryLogRows.push({
        user_id: userId,
        incident_id: incidentId,
        contact_name: contactName,
        method,
        status,
        error_message: errorMessage || undefined,
        gps_included: !!gpsIncluded,
        message_included: !!messageIncluded,
        sent_at: new Date().toISOString(),
      });
    }

    for (const contact of supportContacts) {
      const contactName = contact.contact_name || "Unknown";
      const contactMethod = contact.preferred_contact_method || "in_app";
      const gpsShared = !!(contact.can_receive_gps && gps_coordinates && location_shared);
      const messageShared = !!(contact.can_receive_message_details && message);

      const notifTitle = `SOS Alert — ${urgency_level.toUpperCase()}`;
      let notifBody = `${userName} has sent an SOS support request. Urgency: ${urgency_level}.`;
      if (messageShared) notifBody += ` Message: "${message}"`;
      if (gpsShared) notifBody += ` Location: ${gps_coordinates.lat}, ${gps_coordinates.lng}`;
      if (contact.can_receive_message_details && manual_location && !gps_coordinates) notifBody += ` Manual location: ${manual_location}`;

      // ── In-app delivery for linked platform users ──
      if (contact.linked_user_id) {
        try {
          const linkedUser = await base44.asServiceRole.entities.User.filter({ id: contact.linked_user_id }, "", 1);
          const linkedEmail = linkedUser && linkedUser[0] ? linkedUser[0].email : null;
          if (linkedEmail) {
            await base44.asServiceRole.entities.Notification.create({
              user_email: linkedEmail,
              type: "system",
              title: notifTitle,
              body: notifBody,
              sensitive: true,
              delivery_channel: "in_app",
              related_entity: "SOSIncident",
              related_id: incidentId,
              read: false,
            });
            notifiedUserIds.push(contact.linked_user_id);
            notifiedContacts.push({ name: contactName, method: "in_app", gps_shared: gpsShared, message_shared: messageShared });
            continue;
          }
        } catch (_e) { /* fall through to external delivery below */ }
      }

      // ── External SMS delivery ──
      const canSms = ["sms", "text", "phone"].includes(contactMethod) && !!contact.phone_number;
      if (canSms) {
        let smsBody = `Rooted 21 Safety Alert: ${userName} has requested support (urgency: ${urgency_level}).`;
        if (messageShared) smsBody += ` Note: "${message}"`;
        if (gpsShared) smsBody += ` Location: https://maps.google.com/?q=${gps_coordinates.lat},${gps_coordinates.lng}`;
        smsBody += " Please check in with them.";

        if (twilioClient) {
          try {
            await twilioClient.messages.create({ body: smsBody, from: twilioFromNumber, to: contact.phone_number });
            await logDelivery(contactName, "sms", "success", null, gpsShared, messageShared);
            externalDeliveries.push({ name: contactName, method: "sms", status: "success" });
          } catch (smsError) {
            await logDelivery(contactName, "sms", "failed", smsError?.message || "SMS delivery failed", gpsShared, messageShared);
            externalDeliveries.push({ name: contactName, method: "sms", status: "failed" });
          }
        } else {
          await logDelivery(contactName, "sms", "failed", "SMS not configured", gpsShared, messageShared);
          externalDeliveries.push({ name: contactName, method: "sms", status: "failed" });
        }
      }

      // ── External email delivery ──
      const canEmail = contactMethod === "email" && !!contact.email;
      if (canEmail) {
        let emailBody = `${userName} has sent a Rooted 21 safety alert requesting support.\n\nUrgency: ${urgency_level}`;
        if (messageShared) emailBody += `\n\nNote from ${userName}: "${message}"`;
        if (gpsShared) emailBody += `\n\nLocation: https://maps.google.com/?q=${gps_coordinates.lat},${gps_coordinates.lng}`;
        emailBody += "\n\nPlease check in with them as soon as you can.";

        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: contact.email,
            subject: `Rooted 21 Safety Alert — ${urgency_level.toUpperCase()}`,
            body: emailBody,
          });
          await logDelivery(contactName, "email", "success", null, gpsShared, messageShared);
          externalDeliveries.push({ name: contactName, method: "email", status: "success" });
        } catch (emailError) {
          await logDelivery(contactName, "email", "failed", emailError?.message || "Email delivery failed", gpsShared, messageShared);
          externalDeliveries.push({ name: contactName, method: "email", status: "failed" });
        }
      }

      if (!contact.linked_user_id && !canSms && !canEmail) {
        // No usable delivery channel for this contact — nothing to send, nothing to log.
      }
    }

    // ── Persist delivery logs (best-effort, never blocks the SOS) ──
    if (deliveryLogRows.length > 0) {
      try {
        await base44.asServiceRole.entities.SOSDeliveryLog.bulkCreate(deliveryLogRows);
      } catch (_e) { /* logging best-effort */ }
    }

    // ── Update SOSIncident with notified user IDs ──
    if (notifiedUserIds.length > 0) {
      try {
        await base44.asServiceRole.entities.SOSIncident.update(incidentId, { notified_user_ids: notifiedUserIds, updated_by: userId });
      } catch (_e) { /* non-fatal */ }
    }

    // ── Audit contact notifications (no GPS coordinates or message content — GPS included is boolean-only) ──
    const externalSuccesses = externalDeliveries.filter((d) => d.status === "success");
    const externalFailures = externalDeliveries.filter((d) => d.status === "failed");

    if (notifiedContacts.length > 0 || externalDeliveries.length > 0) {
      try {
        await base44.asServiceRole.entities.RootedAuditEvent.create({
          actor_email: userEmail,
          actor_role: currentUser.role || "user",
          event_type: "security_alert",
          entity_name: "SOSIncident",
          entity_id: incidentId,
          severity: "info",
          summary: `SOS notifications for incident ${incidentId}: ${notifiedContacts.length} in-app, ${externalSuccesses.length} external delivered, ${externalFailures.length} external failed`,
          metadata_json: JSON.stringify({
            incident_id: incidentId,
            in_app_notifications: notifiedContacts.map((c) => ({ name: c.name, gps_included: c.gps_shared, message_included: c.message_shared })),
            external_deliveries: externalDeliveries.map((d) => ({ name: d.name, method: d.method, status: d.status })),
          }),
          occurred_at: new Date().toISOString(),
        });
      } catch (_e) { /* audit best-effort */ }
    }

    const timestamp = new Date().toISOString();
    const totalNotified = notifiedContacts.length + externalSuccesses.length;

    let confirmationMessage;
    if (totalNotified > 0 || externalFailures.length > 0) {
      const parts = [];
      if (notifiedContacts.length > 0) parts.push(`${notifiedContacts.length} in-app notification(s) sent`);
      if (externalSuccesses.length > 0) parts.push(`${externalSuccesses.length} contact(s) notified by SMS/email`);
      if (externalFailures.length > 0) parts.push(`${externalFailures.length} delivery attempt(s) failed`);
      confirmationMessage = `Your SOS has been saved (Incident ID: ${incidentId}). ${parts.join(", ")}. If you are in immediate danger, call or text 911. The 988 Suicide & Crisis Lifeline is available 24/7.`;
    } else {
      confirmationMessage = `Your SOS request has been saved. Incident ID: ${incidentId}. No support contacts are configured to receive alerts. If you are in immediate danger, call or text 911. The 988 Suicide & Crisis Lifeline is available 24/7.`;
    }

    return Response.json({
      success: true,
      incidentId,
      timestamp,
      notified_count: totalNotified,
      failed_count: externalFailures.length,
      notified_user_ids: notifiedUserIds,
      notified_contacts: notifiedContacts,
      external_deliveries: externalDeliveries,
      confirmation_message: confirmationMessage,
      crisis_resources: { emergency: "911", crisis_lifeline: "988", crisis_text_line: "Text HOME to 741741" },
    });
  } catch (error) {
    console.error("sendSosSupportMessage error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});