import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function sha256(text) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function verificationId() {
  return `R21-${crypto.randomUUID().slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const now = new Date().toISOString();
    const ownerEmail = user.email;
    const previousRecords = await base44.entities.ImmutableFamilyRecord.filter({ owner_email: ownerEmail }, '-submitted_at', 1);
    const previousHash = previousRecords[0]?.record_hash || '';
    const summary = String(payload.summary || '').trim();
    if (!summary) {
      return Response.json({ error: 'Summary is required' }, { status: 400 });
    }

    const verification_id = verificationId();
    const hashInput = JSON.stringify({ ownerEmail, record_type: payload.record_type || 'other', source_entity: payload.source_entity || '', source_entity_id: payload.source_entity_id || '', summary, previousHash, submitted_at: now, verification_id });
    const record_hash = await sha256(hashInput);

    const record = await base44.entities.ImmutableFamilyRecord.create({
      owner_email: ownerEmail,
      child_id: payload.child_id || '',
      record_type: payload.record_type || 'other',
      source_entity: payload.source_entity || '',
      source_entity_id: payload.source_entity_id || '',
      occurred_at: payload.occurred_at || now,
      submitted_at: now,
      summary,
      record_hash,
      previous_hash: previousHash,
      verification_id,
      gps_latitude: payload.gps_latitude,
      gps_longitude: payload.gps_longitude,
      sealed: true,
      part2_segmented: payload.part2_segmented === true,
      permission_segment: payload.permission_segment || 'general'
    });

    await base44.entities.RootedAuditEvent.create({
      actor_email: ownerEmail,
      actor_role: user.role || '',
      event_type: 'record_create',
      entity_name: 'ImmutableFamilyRecord',
      entity_id: record.id,
      severity: 'info',
      summary: `Immutable family record sealed: ${verification_id}`,
      metadata_json: JSON.stringify({ record_type: record.record_type, permission_segment: record.permission_segment }),
      occurred_at: now
    });

    return Response.json({ record, verification_id, record_hash });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});