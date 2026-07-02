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

    const body = await req.json();
    const {
      consent_type,
      accepted,
      consent_version,
      // Release of Information fields (only used when consent_type === 'release_of_information')
      owner_email,
      recipient_name,
      recipient_role,
      recipient_contact,
      allowed_segments,
      purpose,
      starts_at,
      expires_at,
      signature_name,
      signed_at,
    } = body;

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

    // When this is a Release of Information, ALSO create a ReleaseOfInformation
    // record — this is the entity the export functions check for gating decisions.
    let releaseId = null;
    if (consent_type === 'release_of_information' && accepted === true) {
      const nowIso = new Date().toISOString();
      const release = await base44.asServiceRole.entities.ReleaseOfInformation.create({
        owner_email: owner_email || user.email,
        recipient_name: recipient_name || 'Authorized recipient',
        recipient_role: recipient_role || 'other',
        recipient_contact: recipient_contact || '',
        allowed_segments: Array.isArray(allowed_segments) ? allowed_segments : [],
        purpose: purpose || 'Release of information',
        starts_at: starts_at || nowIso.split('T')[0],
        expires_at: expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        signature_name: signature_name || user.full_name || user.email,
        signed_at: signed_at || nowIso,
      });
      releaseId = release.id;
    }

    return Response.json({
      success: true,
      consentId: consentRecord.id,
      releaseId,
      message: `${consent_type} consent recorded`,
    });
  } catch (error) {
    console.error('Consent save error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});