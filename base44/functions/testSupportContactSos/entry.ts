import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const results: Record<string, unknown> = {};
    const testUserId = "test_user_sos_sc";

    // TEST 1: Create support contact with GPS + SOS + message permissions
    try {
      const contact = await base44.asServiceRole.entities.SupportContact.create({
        user_id: testUserId,
        contact_name: "Test Support Person",
        contact_relationship: "Sponsor",
        phone_number: "555-0100",
        email: "test.support@example.com",
        preferred_contact_method: "in_app",
        can_receive_sos_alerts: true,
        can_receive_gps: true,
        can_receive_message_details: true,
        safe_word: "pineapple",
        active: true,
        linked_user_id: "test_linked_user_1",
        updated_by: testUserId,
      });
      results.test1 = { passed: !!contact.id, contactId: contact.id };
    } catch (e) {
      results.test1 = { passed: false, error: e.message };
    }

    // TEST 2: Send SOS with GPS — contact has GPS permission
    try {
      const sos = await base44.asServiceRole.entities.SOSIncident.create({
        user_id: testUserId,
        incident_type: "sos_support_request",
        description: "TEST 2 - GPS allowed",
        status: "active",
        urgency_level: "high",
        gps_coordinates: { lat: 39.9612, lng: -82.9988 },
        location_shared: true,
        user_name: "Test User",
        user_email: "test@example.com",
        notified_user_ids: [],
        updated_by: testUserId,
      });

      const contacts = await base44.asServiceRole.entities.SupportContact.filter({
        user_id: testUserId, active: true, can_receive_sos_alerts: true, is_deleted: false,
      });

      const notifDetails = [];
      for (const c of contacts) {
        let body = "Test User sent SOS. Urgency: high.";
        if (c.can_receive_message_details) body += ' Message: "TEST 2 - GPS allowed"';
        if (c.can_receive_gps && sos.gps_coordinates) body += " Location: 39.9612, -82.9988";

        const notif = await base44.asServiceRole.entities.Notification.create({
          user_email: "test.linked@example.com",
          type: "system",
          title: "SOS Alert",
          body: body,
          sensitive: true,
          delivery_channel: "in_app",
          related_entity: "SOSIncident",
          related_id: sos.id,
          read: false,
        });
        notifDetails.push({ gps_in_notif: c.can_receive_gps, msg_in_notif: c.can_receive_message_details, notifId: notif.id });
      }

      results.test2 = { passed: !!sos.id && notifDetails.length > 0, incidentId: sos.id, gpsInIncident: !!sos.gps_coordinates, notifDetails };
    } catch (e) {
      results.test2 = { passed: false, error: e.message };
    }

    // TEST 3: Disable GPS permission, send SOS with GPS
    try {
      const contacts = await base44.asServiceRole.entities.SupportContact.filter({ user_id: testUserId, is_deleted: false });
      await base44.asServiceRole.entities.SupportContact.update(contacts[0].id, { can_receive_gps: false, updated_by: testUserId });

      const sos = await base44.asServiceRole.entities.SOSIncident.create({
        user_id: testUserId,
        incident_type: "sos_support_request",
        description: "TEST 3 - GPS not approved",
        status: "active",
        urgency_level: "high",
        gps_coordinates: { lat: 39.9612, lng: -82.9988 },
        location_shared: true,
        user_name: "Test User",
        user_email: "test@example.com",
        notified_user_ids: [],
        updated_by: testUserId,
      });

      const contacts2 = await base44.asServiceRole.entities.SupportContact.filter({ user_id: testUserId, active: true, can_receive_sos_alerts: true, is_deleted: false });
      let notifBody = "Test User sent SOS. Urgency: high.";
      if (contacts2[0]?.can_receive_message_details) notifBody += ' Message: "TEST 3"';
      if (contacts2[0]?.can_receive_gps && sos.gps_coordinates) notifBody += " Location: 39.9612, -82.9988";

      results.test3 = { passed: !!sos.gps_coordinates && !notifBody.includes("Location:"), gpsInIncident: !!sos.gps_coordinates, gpsInNotif: notifBody.includes("Location:"), notifBody };
    } catch (e) {
      results.test3 = { passed: false, error: e.message };
    }

    // TEST 4: Disable message details, send SOS with message
    try {
      const contacts = await base44.asServiceRole.entities.SupportContact.filter({ user_id: testUserId, is_deleted: false });
      await base44.asServiceRole.entities.SupportContact.update(contacts[0].id, { can_receive_message_details: false, updated_by: testUserId });

      const sos = await base44.asServiceRole.entities.SOSIncident.create({
        user_id: testUserId,
        incident_type: "sos_support_request",
        description: "TEST 4 - sensitive message content",
        status: "active",
        urgency_level: "medium",
        gps_coordinates: null,
        location_shared: false,
        user_name: "Test User",
        user_email: "test@example.com",
        notified_user_ids: [],
        updated_by: testUserId,
      });

      const contacts2 = await base44.asServiceRole.entities.SupportContact.filter({ user_id: testUserId, active: true, can_receive_sos_alerts: true, is_deleted: false });
      let notifBody = "Test User sent SOS. Urgency: medium.";
      if (contacts2[0]?.can_receive_message_details) notifBody += ' Message: "TEST 4 - sensitive message content"';

      results.test4 = { passed: !notifBody.includes("TEST 4"), msgInNotif: notifBody.includes("TEST 4"), notifBody };
    } catch (e) {
      results.test4 = { passed: false, error: e.message };
    }

    // TEST 5: Mark contact inactive, send SOS
    try {
      const contacts = await base44.asServiceRole.entities.SupportContact.filter({ user_id: testUserId, is_deleted: false });
      await base44.asServiceRole.entities.SupportContact.update(contacts[0].id, { active: false, updated_by: testUserId });

      const activeContacts = await base44.asServiceRole.entities.SupportContact.filter({ user_id: testUserId, active: true, can_receive_sos_alerts: true, is_deleted: false });
      results.test5 = { passed: activeContacts.length === 0, activeContactsFound: activeContacts.length };
    } catch (e) {
      results.test5 = { passed: false, error: e.message };
    }

    // TEST 7: Privacy audit — check GPS not in audit events
    try {
      const audits = await base44.asServiceRole.entities.RootedAuditEvent.filter({ actor_email: "test@example.com" }, "-occurred_at", 20);
      let gpsInAudit = false;
      for (const a of audits) {
        const s = JSON.stringify(a);
        if (s.includes("39.9612") || s.includes("-82.9988")) gpsInAudit = true;
      }
      results.test7 = { passed: !gpsInAudit, gpsInAudit, auditCount: audits.length };
    } catch (e) {
      results.test7 = { passed: false, error: e.message };
    }

    // CLEANUP
    try {
      const allContacts = await base44.asServiceRole.entities.SupportContact.filter({ user_id: testUserId });
      for (const c of allContacts) {
        await base44.asServiceRole.entities.SupportContact.update(c.id, { is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: "test_cleanup" });
      }
      const allIncidents = await base44.asServiceRole.entities.SOSIncident.filter({ user_id: testUserId });
      for (const i of allIncidents) {
        await base44.asServiceRole.entities.SOSIncident.update(i.id, { is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: "test_cleanup" });
      }
      results.cleanup = { contacts: allContacts.length, incidents: allIncidents.length };
    } catch (e) {
      results.cleanup = { error: e.message };
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});