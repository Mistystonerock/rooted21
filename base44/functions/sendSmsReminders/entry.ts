import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EVENT_LABELS = {
  appointment: "🏥 Appointment",
  court_date: "⚖️ Court Date",
  meeting: "🤝 Meeting",
  therapy: "💛 Therapy",
  school: "🏫 School",
  school_meeting: "🏫 School Meeting",
  medication: "💊 Medication",
  activity: "🎯 Activity",
  other: "📅 Event",
};

async function sendSms(to, body) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_PHONE_NUMBER");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    }
  );
  return response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only allow admin or scheduled calls
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get tomorrow's date in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Fetch all events happening tomorrow
    const familyEvents = await base44.asServiceRole.entities.FamilyEvent.filter({ date: tomorrowStr });
    const careEvents = await base44.asServiceRole.entities.CareCalendarEvent.filter({ date: tomorrowStr });
    const events = [
      ...familyEvents,
      ...careEvents.map(e => ({ ...e, added_by_role: "care_calendar" }))
    ];

    if (events.length === 0) {
      return Response.json({ ok: true, note: "No events tomorrow", sent: 0 });
    }

    // Collect unique family emails from events
    const familyEmails = [...new Set(events.map(e => e.family_email).filter(Boolean))];

    // Fetch all users with phone numbers and SMS reminders enabled
    const allUsers = await base44.asServiceRole.entities.User.list();
    const userMap = {};
    for (const u of allUsers) {
      if (u.email && u.phone && u.sms_reminders !== false) {
        userMap[u.email] = u;
      }
    }

    let sent = 0;
    const results = [];

    for (const familyEmail of familyEmails) {
      const familyUser = userMap[familyEmail];
      if (!familyUser) continue;

      const familyEvents = events.filter(e => e.family_email === familyEmail);

      for (const evt of familyEvents) {
        const typeLabel = EVENT_LABELS[evt.event_type] || "📅 Event";
        const dateStr = new Date(evt.date + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric"
        });

        let message = `Rooted 21 Reminder: "${evt.title}" is tomorrow (${dateStr})`;
        if (evt.time) message += ` at ${evt.time}`;
        if (evt.location) message += ` — ${evt.location}`;
        message += `. You've got this. 🌳`;

        const result = await sendSms(familyUser.phone, message);
        results.push({ to: familyUser.phone, event: evt.title, sid: result.sid, status: result.status });
        sent++;
      }

      // Also notify assigned professionals who have phones
      const assignments = await base44.asServiceRole.entities.AssignedFamily.filter({ family_email: familyEmail });
      for (const assignment of assignments) {
        const proUser = userMap[assignment.professional_email];
        if (!proUser) continue;

        for (const evt of familyEvents) {
          const dateStr = new Date(evt.date + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric"
          });

          let message = `Rooted 21: Reminder for ${assignment.family_name || familyEmail} — "${evt.title}" is tomorrow (${dateStr})`;
          if (evt.time) message += ` at ${evt.time}`;
          message += `.`;

          const result = await sendSms(proUser.phone, message);
          results.push({ to: proUser.phone, event: evt.title, sid: result.sid, status: result.status });
          sent++;
        }
      }
    }

    return Response.json({ ok: true, sent, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});