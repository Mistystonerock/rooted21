import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Professional roles (as stored on AssignedFamily.professional_role) that map to
// the SafeContactPreference approved-role vocabulary.
const ROLE_ALIASES = {
  Caseworker: ["caseworker", "cps worker", "cps caseworker"],
  Therapist: ["therapist", "counselor", "behavioral health worker"],
  CASA: ["casa", "casa_gal"],
  GuardianAdLitem: ["gal", "guardian ad litem"],
  Attorney: ["attorney"],
  CourtStaff: ["court staff"],
  SchoolStaff: ["school staff"],
  Probation: ["juvenile probation", "probation"],
  Mentor: ["mentor"],
  Administrator: ["administrator", "admin"],
};

function roleMatchesApproved(professionalRole, approvedRoles) {
  const pr = String(professionalRole || "").toLowerCase().trim();
  return approvedRoles.some((approved) => {
    if (String(approved).toLowerCase() === pr) return true;
    const aliases = ROLE_ALIASES[approved] || [];
    return aliases.includes(pr);
  });
}

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

    // ── Resolve safe-contact preferences (server-side privacy enforcement) ──
    let approvedRoles = ["Caseworker", "Therapist", "CASA", "GuardianAdLitem", "Attorney", "CourtStaff", "SchoolStaff", "Probation", "Mentor", "Administrator"];
    let approvedUserIds = null;
    let gpsAllowed = true;

    try {
      const prefs = await base44.asServiceRole.entities.SafeContactPreference.filter({ user_id: userId, is_deleted: false }, "-created_date", 1);
      if (prefs && prefs.length > 0) {
        const safePrefs = prefs[0];
        if (Array.isArray(safePrefs.approved_recipient_roles) && safePrefs.approved_recipient_roles.length > 0) {
          approvedRoles = safePrefs.approved_recipient_roles;
        }
        if (Array.isArray(safePrefs.approved_recipient_user_ids) && safePrefs.approved_recipient_user_ids.length > 0) {
          approvedUserIds = safePrefs.approved_recipient_user_ids;
        }
        gpsAllowed = safePrefs.gps_allowed !== false;
      }
    } catch (_e) { /* preferences optional */ }

    // Enforce GPS privacy server-side — client cannot override.
    let finalGpsCoordinates = gps_coordinates || null;
    let finalLocationShared = location_shared === true;
    if (!gpsAllowed) {
      finalGpsCoordinates = null;
      finalLocationShared = false;
    }

    // ── Create the SOS incident (GPS lives ONLY here) ──
    const incident = await base44.asServiceRole.entities.SOSIncident.create({
      user_id: userId,
      family_id: null,
      incident_type: "sos_support_request",
      description: message || "SOS support request",
      status: "active",
      urgency_level,
      gps_coordinates: finalGpsCoordinates,
      manual_location: manual_location || null,
      location_shared: finalLocationShared,
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
        event_type: "sos_alert",
        entity_name: "SOSIncident",
        entity_id: incidentId,
        severity: urgency_level === "critical" ? "critical" : "high",
        summary: `SOS support request sent by ${userName} — urgency: ${urgency_level}, GPS: ${finalGpsCoordinates ? "included" : "not included"}`,
        metadata_json: JSON.stringify({
          action: "sos_support_request",
          incident_id: incidentId,
          urgency_level,
          gps_included: !!finalGpsCoordinates,
          manual_location_provided: !!manual_location,
          location_shared: finalLocationShared,
          user_id: userId,
        }),
        occurred_at: new Date().toISOString(),
      });
    } catch (_e) { /* audit best-effort */ }

    // ── Notify approved support team (from AssignedFamily, in-app only, no message body) ──
    const notifiedUserIds = [];
    let notificationCount = 0;

    try {
      const assignments = await base44.asServiceRole.entities.AssignedFamily.filter({ family_email: userEmail, status: "active" }, "-created_date", 100);
      const now = new Date();

      const approvedAssignments = (assignments || []).filter((a) => {
        if (!a.professional_email) return false;
        if (a.expires_at && new Date(a.expires_at) < now) return false;
        if (approvedUserIds && approvedUserIds.length > 0) {
          return a.professional_user_id && approvedUserIds.includes(a.professional_user_id);
        }
        return roleMatchesApproved(a.professional_role, approvedRoles);
      });

      const seen = new Set();
      for (const a of approvedAssignments) {
        if (seen.has(a.professional_email)) continue;
        seen.add(a.professional_email);
        try {
          await base44.asServiceRole.entities.Notification.create({
            user_email: a.professional_email,
            type: "sos_alert",
            title: `SOS Support Request — ${urgency_level.toUpperCase()}`,
            body: `A family you support has sent an SOS support request. Urgency: ${urgency_level}. Open the dashboard for details.`,
            sensitive: true,
            delivery_channel: "in_app",
            related_entity: "SOSIncident",
            related_id: incidentId,
            read: false,
          });
          if (a.professional_user_id) notifiedUserIds.push(a.professional_user_id);
          notificationCount++;
        } catch (_e) { /* skip failed recipient */ }
      }
    } catch (_e) { /* no support team configured */ }

    if (notifiedUserIds.length > 0) {
      try {
        await base44.asServiceRole.entities.SOSIncident.update(incidentId, {
          notified_user_ids: notifiedUserIds,
          updated_by: userId,
        });
      } catch (_e) { /* non-fatal */ }
    }

    const confirmationMessage = notificationCount > 0
      ? `Your support team has been notified. ${notificationCount} professional(s) received an in-app alert. Your incident ID is ${incidentId}.`
      : `Your SOS request has been saved. Incident ID: ${incidentId}. No support team is currently configured. If you are in immediate danger, call or text 911. 988 Suicide & Crisis Lifeline is available 24/7.`;

    return Response.json({
      success: true,
      incidentId,
      timestamp: new Date().toISOString(),
      notified_count: notificationCount,
      notified_user_ids: notifiedUserIds,
      confirmation_message: confirmationMessage,
      crisis_resources: {
        emergency: "911",
        crisis_lifeline: "988",
        crisis_text_line: "Text HOME to 741741",
      },
    });
  } catch (error) {
    console.error("sendSosSupportMessage error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});