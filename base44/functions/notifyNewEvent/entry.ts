import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EVENT_LABELS = {
  appointment: "🏥 Appointment",
  court_date: "⚖️ Court Date",
  meeting: "🤝 Meeting",
  therapy: "💛 Therapy",
  school: "🏫 School",
  other: "📅 Event",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { data } = payload;
    if (!data) return Response.json({ ok: true });

    const { family_email, added_by_email, added_by_name, added_by_role, title, event_type, date, time, location, notes } = data;

    // Notify the other side: if family added it, notify professionals; if professional added it, notify family
    const notifyFamily = added_by_email !== family_email;
    const recipientEmail = notifyFamily ? family_email : null;

    // Also notify all professionals assigned to this family
    const assignments = await base44.asServiceRole.entities.AssignedFamily.filter({ family_email });

    const recipients = [];
    if (notifyFamily && family_email) recipients.push(family_email);
    if (!notifyFamily) {
      assignments.forEach(a => {
        if (a.professional_email && a.professional_email !== added_by_email) {
          recipients.push(a.professional_email);
        }
      });
    }

    if (recipients.length === 0) return Response.json({ ok: true, note: "no recipients" });

    const typeLabel = EVENT_LABELS[event_type] || "📅 Event";
    const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    for (const to of recipients) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject: `New calendar event added: ${title}`,
        body: `
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2C3E2D;">
  <div style="background: #2F4B3A; padding: 20px 24px; border-radius: 12px 12px 0 0;">
    <h2 style="color: #EAE3D5; margin: 0; font-size: 18px;">${typeLabel} Added to Your Calendar</h2>
    <p style="color: #8FAF82; margin: 4px 0 0; font-size: 12px;">HALO Project · Rooted 21</p>
  </div>
  <div style="background: #ffffff; padding: 20px 24px; border: 1px solid #EAE3D5; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 12px; font-size: 14px;"><strong>${added_by_name || added_by_role || "Your team"}</strong> added a new event to your family calendar:</p>
    <div style="background: #F7F4EF; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px;">
      <p style="margin: 0 0 6px; font-size: 16px; font-weight: bold; color: #2F4B3A;">${title}</p>
      <p style="margin: 0 0 4px; font-size: 13px; color: #5B7A5C;">📅 ${formattedDate}${time ? ` · ${time}` : ""}</p>
      ${location ? `<p style="margin: 0 0 4px; font-size: 13px; color: #8B7355;">📍 ${location}</p>` : ""}
      ${notes ? `<p style="margin: 6px 0 0; font-size: 12px; color: #9E8E78; font-style: italic;">${notes}</p>` : ""}
    </div>
    <p style="margin: 0; font-size: 13px; color: #8B7355;">Log in to the HALO app to view your full family calendar.</p>
  </div>
</div>
        `.trim(),
      });
    }

    return Response.json({ ok: true, sent: recipients.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});