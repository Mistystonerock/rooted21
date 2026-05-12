import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Save user consent records to database with legal audit trail
 * Records: AI consent, child data consent, co-parenting message consent
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { consent_type, accepted, consent_version } = await req.json();

    if (!consent_type || typeof accepted !== 'boolean') {
      return Response.json(
        { error: 'Missing required fields: consent_type, accepted' },
        { status: 400 }
      );
    }

    // Get IP address from request headers
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Save consent record
    const consentRecord = await base44.asServiceRole.entities.Consent.create({
      user_email: user.email,
      consent_type,
      accepted,
      consent_version: consent_version || '1.0',
      timestamp: new Date().toISOString(),
      ip_address: ipAddress.split(',')[0].trim(),
      user_agent: userAgent,
    });

    // Create audit log
    await base44.asServiceRole.entities.AuditLog.create({
      action: `consent_${consent_type}_${accepted ? 'accepted' : 'declined'}`,
      user_email: user.email,
      timestamp: new Date().toISOString(),
      resource_type: 'consent',
      resource_id: consentRecord.id,
      ip_address: ipAddress.split(',')[0].trim(),
      status: 'success',
      details: `User ${accepted ? 'accepted' : 'declined'} ${consent_type} consent (v${consent_version || '1.0'})`,
    });

    return Response.json({
      success: true,
      consentId: consentRecord.id,
      message: `${consent_type} consent recorded`,
    });
  } catch (error) {
    console.error('Consent save error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});