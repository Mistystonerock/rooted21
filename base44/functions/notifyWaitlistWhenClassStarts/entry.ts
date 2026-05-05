import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { classId } = await req.json();

    if (!classId) {
      return Response.json({ error: 'classId required' }, { status: 400 });
    }

    // Get the class
    const classes = await base44.asServiceRole.entities.LiveClass.filter({ id: classId });
    if (!classes.length) {
      return Response.json({ error: 'Class not found' }, { status: 404 });
    }
    const liveClass = classes[0];

    // Get waitlist for this class
    const waitlist = await base44.asServiceRole.entities.ClassWaitlist.filter({ class_id: classId });

    // Send email to each person on waitlist
    const emailPromises = waitlist.map(person => {
      const emailBody = `
Hi ${person.user_name},

Great news! The ${liveClass.title} (${liveClass.abbr}) is starting soon!

📅 Date: ${liveClass.date}
🕐 Time: ${liveClass.time}
🔗 Join Link: ${liveClass.join_url || 'Link will be shared soon'}

You were on the waitlist, and we wanted to make sure you didn't miss the class.

See you there!

Rooted 21 Team
      `.trim();

      return base44.asServiceRole.integrations.Core.SendEmail({
        to: person.user_email,
        subject: `${liveClass.title} is starting soon!`,
        body: emailBody,
        from_name: 'Rooted 21'
      }).catch(err => {
        console.error(`Failed to email ${person.user_email}:`, err);
        return null;
      });
    });

    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      emailsSent: waitlist.length,
      className: liveClass.title
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});