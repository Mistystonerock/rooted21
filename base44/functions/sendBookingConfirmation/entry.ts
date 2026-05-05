import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { booking_id } = await req.json();
    if (!booking_id) return Response.json({ error: 'booking_id required' }, { status: 400 });

    const bookings = await base44.asServiceRole.entities.ConsultationBooking.filter({ id: booking_id });
    const booking = bookings[0];
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    const dateStr = new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Email to parent
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: booking.parent_email,
      from_name: 'Rooted 21 Parenting Network',
      subject: `✅ Consultation Booked with ${booking.professional_name}`,
      body: `
<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #2c3e2d;">
  <div style="background: #2F4B3A; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #F0EAD6; font-size: 20px; margin: 0;">🌳 Consultation Confirmed</h1>
    <p style="color: #8BAD8B; margin: 4px 0 0; font-size: 13px;">Rooted 21 Parenting Network</p>
  </div>
  <div style="background: #fff; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e8e0d0;">
    <p style="font-size: 15px;">Hi ${booking.parent_name || booking.parent_email},</p>
    <p>Your consultation has been booked! Here are the details:</p>
    <div style="background: #f8f4ee; border-radius: 10px; padding: 16px; margin: 16px 0; border-left: 4px solid #2F4B3A;">
      <p style="margin: 4px 0;"><strong>Professional:</strong> ${booking.professional_name}</p>
      <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin: 4px 0;"><strong>Time:</strong> ${booking.time_slot}</p>
      <p style="margin: 4px 0;"><strong>Format:</strong> ${booking.session_type === 'virtual' ? '💻 Virtual' : '📍 In-Person'}</p>
      ${booking.reason ? `<p style="margin: 4px 0;"><strong>Topic:</strong> ${booking.reason}</p>` : ''}
    </div>
    <p style="color: #8B7355; font-size: 13px;">
      Status: <strong style="color: #C9973E;">Pending confirmation from the professional.</strong>
      You will receive another email once they confirm.
    </p>
    <hr style="border: none; border-top: 1px solid #e8e0d0; margin: 20px 0;">
    <p style="color: #888; font-size: 12px;">In crisis? Call or text <strong>988</strong>. In danger, call <strong>911</strong>.</p>
  </div>
</div>
      `.trim(),
    });

    // Email to professional (if email available)
    if (booking.professional_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: booking.professional_email,
        from_name: 'Rooted 21 Parenting Network',
        subject: `📅 New Consultation Booking Request — ${dateStr} at ${booking.time_slot}`,
        body: `
<div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #2c3e2d;">
  <div style="background: #2F4B3A; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #F0EAD6; font-size: 20px; margin: 0;">📅 New Booking Request</h1>
    <p style="color: #8BAD8B; margin: 4px 0 0; font-size: 13px;">Rooted 21 Parenting Network</p>
  </div>
  <div style="background: #fff; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e8e0d0;">
    <p>A parent has booked a consultation slot with you:</p>
    <div style="background: #f8f4ee; border-radius: 10px; padding: 16px; margin: 16px 0; border-left: 4px solid #C9973E;">
      <p style="margin: 4px 0;"><strong>Parent:</strong> ${booking.parent_name || booking.parent_email}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${booking.parent_email}</p>
      <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin: 4px 0;"><strong>Time:</strong> ${booking.time_slot}</p>
      <p style="margin: 4px 0;"><strong>Format:</strong> ${booking.session_type === 'virtual' ? '💻 Virtual' : '📍 In-Person'}</p>
      ${booking.reason ? `<p style="margin: 4px 0;"><strong>Reason:</strong> ${booking.reason}</p>` : ''}
    </div>
    <p style="color: #8B7355; font-size: 13px;">Please confirm or reschedule directly with the parent at <a href="mailto:${booking.parent_email}">${booking.parent_email}</a>.</p>
  </div>
</div>
        `.trim(),
      });
    }

    // Mark confirmation sent
    await base44.asServiceRole.entities.ConsultationBooking.update(booking_id, { confirmation_sent: true });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});