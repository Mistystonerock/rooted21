import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agency_name, staff_size, contact_email, message } = await req.json();

    if (!agency_name || !contact_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email to Misty with inquiry details
    await base44.integrations.Core.SendEmail({
      to: 'misty@rooted21.org',
      subject: `Agency Pricing Inquiry: ${agency_name}`,
      body: `Agency Pricing Inquiry\n\nAgency Name: ${agency_name}\nStaff Size: ${staff_size || 'Not specified'}\nContact Email: ${contact_email}\nRequester: ${user.full_name || user.email}\n\nMessage: ${message || 'No additional message'}\n\n---\nReply directly to ${contact_email} or through the app.`
    });

    // Send confirmation to the requester
    await base44.integrations.Core.SendEmail({
      to: contact_email,
      subject: 'Rooted 21 - Agency Pricing Information Requested',
      body: `Hi ${agency_name},\n\nThank you for your interest in Rooted 21 for your agency!\n\nWe've received your inquiry and Misty Stonerock will reach out within 2 business days with customized pricing options based on your team's needs.\n\nIn the meantime, feel free to explore the app or reach out if you have any questions.\n\nBest,\nRooted 21 Team`
    });

    return Response.json({ success: true, message: 'Pricing inquiry sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});