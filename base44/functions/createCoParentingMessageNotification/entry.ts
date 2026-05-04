import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event } = await req.json();

    if (event.type !== 'create' || event.entity_name !== 'CoParentingMessage') {
      return Response.json({ success: true });
    }

    const message = event.data;
    
    // Get partnership to find other parent
    const partnership = await base44.asServiceRole.entities.CoParentingPartnership.list()
      .then(ps => ps.find(p => p.id === message.partnership_id));

    if (!partnership) {
      return Response.json({ success: true });
    }

    // Determine which parent should receive the notification
    const receiverEmail = message.sender_email === partnership.parent_1_email 
      ? partnership.parent_2_email 
      : partnership.parent_1_email;

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: receiverEmail,
      type: 'message',
      title: `New message about ${partnership.child_name}`,
      body: `${message.sender_name} sent a message (${message.topic})`,
      related_id: message.id,
      related_link: `/co-parent-messaging/${partnership.id}`,
      read: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating message notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});