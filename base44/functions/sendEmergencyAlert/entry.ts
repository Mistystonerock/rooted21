import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { situation, caseId, caseName, childName, location } = await req.json();

    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // 1. Load the user's team contacts with phone numbers
    const allContacts = await base44.asServiceRole.entities.TeamContact.filter({
      parent_email: user.email,
    });
    const smsTargets = allContacts.filter(
      (c) => c.phone && ["attorney", "caseworker", "casa", "gal", "supervisor", "therapist"].includes(c.role)
    );

    // 2. Build the SMS message
    const childRef = childName || caseName || "their child";
    const situationText = situation || "an emergency situation";
    const locationText = location ? ` Location: ${location}.` : "";
    const smsBody =
      `🚨 EMERGENCY ALERT from Rooted 21\n` +
      `${user.full_name} is reporting an emergency involving ${childRef}.\n` +
      `Situation: ${situationText}.${locationText}\n` +
      `Time: ${timestamp}\n` +
      `Please contact them immediately.`;

    // 3. Send SMS via Twilio to each contact
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_PHONE_NUMBER");
    const smsResults = [];

    for (const contact of smsTargets) {
      try {
        const phone = contact.phone.replace(/\D/g, "");
        const e164 = phone.startsWith("1") ? `+${phone}` : `+1${phone}`;
        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ To: e164, From: twilioFrom, Body: smsBody }),
          }
        );
        const data = await twilioRes.json();
        smsResults.push({ name: contact.name, role: contact.role, status: data.status || "sent", sid: data.sid });
      } catch (err) {
        smsResults.push({ name: contact.name, role: contact.role, status: "failed", error: err.message });
      }
    }

    // 4. Create an urgent CaseNote / incident entry on the case timeline
    let caseNoteId = null;
    const noteBody =
      `🚨 EMERGENCY ALERT ACTIVATED\n\n` +
      `Reported by: ${user.full_name} (${user.email})\n` +
      `Time: ${timestamp}\n` +
      `Situation: ${situationText}\n` +
      (location ? `Location: ${location}\n` : "") +
      `\nSupport team notified via SMS: ${smsTargets.map((c) => `${c.name} (${c.role})`).join(", ") || "No contacts with phone numbers found"}`;

    if (caseId) {
      const note = await base44.asServiceRole.entities.CaseNote.create({
        case_id: caseId,
        author_email: user.email,
        author_name: user.full_name,
        author_role: user.role || "parent",
        note_type: "concern",
        title: `🚨 Emergency Alert — ${timestamp}`,
        body: noteBody,
        visible_to_team: true,
      });
      caseNoteId = note.id;
    }

    // 5. Also create an IncidentReport record
    const incidentDesc =
      `Emergency alert activated at ${timestamp}. ` +
      `Situation: ${situationText}. ` +
      (location ? `Location: ${location}. ` : "") +
      `Support team notified: ${smsTargets.map((c) => c.name).join(", ") || "none"}. ` +
      `SMS results: ${smsResults.map((r) => `${r.name} (${r.status})`).join(", ")}`;

    const incident = await base44.asServiceRole.entities.IncidentReport.create({
      child_name: childName || childRef,
      incident_type: "other",
      incident_date: new Date().toISOString().split("T")[0],
      incident_time: new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
      description: incidentDesc,
      parent_response: "Emergency alert sent to support team via Rooted 21 app.",
      caseworker_notified: smsTargets.some((c) => c.role === "caseworker"),
      parent_email: user.email,
      status: "submitted",
    });

    return Response.json({
      success: true,
      smsCount: smsResults.filter((r) => r.status !== "failed").length,
      totalContacts: smsTargets.length,
      smsResults,
      caseNoteId,
      incidentId: incident.id,
      timestamp,
    });
  } catch (error) {
    console.error("sendEmergencyAlert error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});