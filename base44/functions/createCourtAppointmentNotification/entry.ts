import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event } = await req.json();

    if (event.type !== 'create' || event.entity_name !== 'CourtAppointment') {
      return Response.json({ success: true });
    }

    const appointment = event.data;

    // Only notify if notify_parents is true
    if (!appointment.notify_parents) {
      return Response.json({ success: true });
    }

    // Get partnership to find parents
    const partnership = await base44.asServiceRole.entities.CoParentingPartnership.list()
      .then(ps => ps.find(p => p.id === appointment.partnership_id));

    if (!partnership) {
      return Response.json({ success: true });
    }

    // Notify both parents
    const parents = [partnership.parent_1_email, partnership.parent_2_email];

    for (const parentEmail of parents) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: parentEmail,
        type: 'appointment',
        title: `New court appointment scheduled`,
        body: `${appointment.title} on ${appointment.date}${appointment.time ? ` at ${appointment.time}` : ''}`,
        related_id: appointment.id,
        related_link: `/co-parent-portal`,
        read: false,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating appointment notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});