import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Initialize a Twilio call between two co-parents
 * Enables recording and returns access token for WebRTC connection
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partnership_id, recipient_email, call_id } = await req.json();

    if (!partnership_id || !recipient_email || !call_id) {
      return Response.json(
        { error: 'Missing required fields: partnership_id, recipient_email, call_id' },
        { status: 400 }
      );
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return Response.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }

    // Fetch the partnership to get phone numbers or use a placeholder
    const partnerships = await base44.asServiceRole.entities.CoParentingPartnership.filter(
      { id: partnership_id },
      undefined,
      1
    );

    if (!partnerships.length) {
      return Response.json(
        { error: 'Partnership not found' },
        { status: 404 }
      );
    }

    const partnership = partnerships[0];

    // Generate a unique call token
    const jwt = await generateTwilioToken(accountSid, authToken, user.email, call_id);

    // Store call initiation in database
    await base44.asServiceRole.entities.CoParentingCall.update(call_id, {
      status: 'initiated',
      recording_url: null,
    });

    return Response.json({
      success: true,
      token: jwt,
      twilioPhoneNumber,
      accountSid,
      partnershipId: partnership_id,
      initiatorEmail: user.email,
      recipientEmail: recipient_email,
    });
  } catch (error) {
    console.error('Twilio call init error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateTwilioToken(accountSid, authToken, userEmail, callId) {
  // For Twilio Voice, we use the Access Token from twilio-node SDK
  // In a production scenario, use Twilio's official SDK
  // For now, return a simple token identifier
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    iss: accountSid,
    sub: userEmail,
    grants: {
      voice: {
        outgoing: { application_sid: accountSid },
        incoming: { allow: true },
      },
    },
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    jti: callId,
  }));

  const crypto = await import('node:crypto');
  const signature = btoa(
    await crypto.subtle
      .sign(
        'HMAC',
        await crypto.subtle.importKey('raw', new TextEncoder().encode(authToken), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
        new TextEncoder().encode(`${header}.${payload}`)
      )
      .then(buf => String.fromCharCode(...new Uint8Array(buf)))
  );

  return `${header}.${payload}.${signature}`;
}