import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { events } = await req.json();

    if (!events || !Array.isArray(events)) {
      return Response.json({ error: "Invalid events payload" }, { status: 400 });
    }

    // Check if user has Google Calendar connected via app-user connector
    // For MVP, we'll store sync preference and suggest using Google Calendar native export
    // Full implementation would require app-user connector setup

    // Create a calendar file that can be imported into Google Calendar
    const iCalData = generateICalendar(events, user);

    // Store sync record in a hypothetical CalendarSyncLog entity
    const syncRecord = {
      user_email: user.email,
      synced_at: new Date().toISOString(),
      event_count: events.length,
      calendar_type: "google",
      status: "pending_user_import",
    };

    // In production, this would write to CalendarSyncLog entity
    // base44.entities.CalendarSyncLog.create(syncRecord);

    return Response.json({
      success: true,
      message: "Calendar export ready - user should import .ics file into Google Calendar",
      iCalData,
      exportFileName: `Rooted21-LegalCalendar-${new Date().toISOString().split("T")[0]}.ics`,
      instructions: "Download the .ics file and import it into Google Calendar: Calendar settings > Import & export > Import",
    });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateICalendar(events, user) {
  const now = new Date();
  const prodId = "-//Rooted21//Legal Calendar//EN";

  // iCal header
  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:${prodId}
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Rooted 21 Legal Calendar
X-WR-TIMEZONE:America/New_York
X-WR-CALDESC:Court deadlines, visitation schedules, and task reminders
BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:STANDARD
DTSTART:20231105T020000
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
TZNAME:EST
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:20230312T020000
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
TZNAME:EDT
END:DAYLIGHT
END:VTIMEZONE
`;

  // Add events
  events.forEach((event, i) => {
    const eventDate = new Date(event.date);
    const uid = `event-${i}-${user.email}-${now.getTime()}`;

    // Format date
    const dateStr = eventDate
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");

    // Format time if provided
    let startTime = `${dateStr}`;
    if (event.time) {
      const [hours, minutes] = event.time.split(":").map(x => x.padStart(2, "0"));
      startTime = `${dateStr}T${hours}${minutes}00`;
    }

    const eventType = event.event_type || "task";
    const emoji =
      eventType === "court_deadline"
        ? "⚖️"
        : eventType === "visitation"
          ? "👥"
          : "✓";

    const description = `${emoji} ${event.event_type?.replace(/_/g, " ").toUpperCase() || "TASK"}${
      event.location ? `\nLocation: ${event.location}` : ""
    }${event.description ? `\n\n${event.description}` : ""}`;

    // Determine alert time based on event type
    let alarmOffset = "P1D"; // 1 day before
    if (eventType === "court_deadline") {
      alarmOffset = "P7D"; // 7 days before for court deadlines
    } else if (eventType === "visitation") {
      alarmOffset = "PT2H"; // 2 hours before for visitations
    }

    const iCalEvent = `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now.toISOString().replace(/[:-]/g, "").split(".")[0]}Z
DTSTART;TZID=America/New_York:${startTime}
SUMMARY:${sanitizeText(event.title)}
DESCRIPTION:${sanitizeText(description)}
LOCATION:${sanitizeText(event.location || "")}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-${alarmOffset}
ACTION:DISPLAY
DESCRIPTION:${sanitizeText(event.title)} reminder
END:VALARM
END:VEVENT
`;

    ics += iCalEvent;
  });

  // iCal footer
  ics += "END:VCALENDAR";

  return ics;
}

function sanitizeText(text) {
  if (!text) return "";
  return text
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .substring(0, 255); // Limit field length for iCal spec
}