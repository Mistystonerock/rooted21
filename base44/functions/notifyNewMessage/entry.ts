import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { data } = payload;
    if (!data) return Response.json({ ok: true });

    const { family_email, professional_email, sender_email, sender_name, sender_role, body } = data;

    // Determine recipient: if sender is the family, notify the professional, and vice versa
    const recipientEmail = sender_email === family_email ? professional_email : family_email;
    const recipientLabel = sender_email === family_email ? "your assigned professional" : "your family";

    const preview = body?.length > 120 ? body.slice(0, 117) + "…" : body;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `New message from ${sender_name || sender_role || "your team"}`,
      body: `
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2C3E2D;">
  <div style="background: #2F4B3A; padding: 20px 24px; border-radius: 12px 12px 0 0;">
    <h2 style="color: #EAE3D5; margin: 0; font-size: 18px;">🌿 New Secure Message</h2>
    <p style="color: #8FAF82; margin: 4px 0 0; font-size: 12px;">HALO Project · Rooted 21</p>
  </div>
  <div style="background: #ffffff; padding: 20px 24px; border: 1px solid #EAE3D5; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 8px; font-size: 14px;">You have a new message from <strong>${sender_name || sender_role || "your team"}</strong>:</p>
    <div style="background: #F7F4EF; border-left: 3px solid #2F4B3A; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
      <p style="margin: 0; font-size: 14px; color: #2C3E2D; font-style: italic;">"${preview}"</p>
    </div>
    <p style="margin: 16px 0 0; font-size: 13px; color: #8B7355;">Log in to the HALO app to read and reply to this message.</p>
    <p style="margin: 4px 0 0; font-size: 11px; color: #B0A090;">All messages are private and secure between you and ${recipientLabel}.</p>
  </div>
</div>
      `.trim(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});