import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Webhook handler for Twilio recording completion
 * Stores recording URL, generates transcript, and updates call record
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { call_id, recording_url, duration, call_sid, from, to } = body;

    if (!call_id || !recording_url) {
      return Response.json(
        { error: 'Missing call_id or recording_url' },
        { status: 400 }
      );
    }

    // Fetch the call record
    const calls = await base44.asServiceRole.entities.CoParentingCall.filter(
      { id: call_id },
      undefined,
      1
    );

    if (!calls.length) {
      return Response.json({ error: 'Call not found' }, { status: 404 });
    }

    const callRecord = calls[0];

    // Update call with recording URL
    await base44.asServiceRole.entities.CoParentingCall.update(call_id, {
      recording_url,
      status: 'ended',
    });

    // Trigger transcript generation asynchronously
    try {
      const transcriptResponse = await base44.functions.invoke('generateCallTranscript', {
        call_id,
        recording_url,
        initiator_name: callRecord.initiator_name,
        recipient_name: callRecord.recipient_name,
      });

      if (transcriptResponse.data?.transcript) {
        // Update with transcript and tension analysis
        await base44.asServiceRole.entities.CoParentingCall.update(call_id, {
          transcript: transcriptResponse.data.transcript,
          tension_detected: transcriptResponse.data.tension_detected,
          tension_summary: transcriptResponse.data.tension_summary,
        });
      }
    } catch (err) {
      console.error('Transcript generation failed:', err);
      // Continue even if transcript fails - recording is saved
    }

    // Create audit log
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'coparenting_call_completed',
      user_email: callRecord.initiator_email,
      case_id: null,
      resource_type: 'coparenting_call',
      resource_id: call_id,
      timestamp: new Date().toISOString(),
      status: 'success',
      details: `Call recorded: ${duration}s from ${from} to ${to}`,
    });

    return Response.json({ success: true, message: 'Recording processed' });
  } catch (error) {
    console.error('Twilio webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});