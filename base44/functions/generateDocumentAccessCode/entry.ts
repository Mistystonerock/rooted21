import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, recipient_email, recipient_name, access_note, document_record_type, permission_granularity } = await req.json();
    
    if (!document_id || !recipient_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch document
    const docs = await base44.asServiceRole.entities.SecureDocument.filter({ id: document_id });
    if (docs.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }
    
    const document = docs[0];

    // Generate unique code
    const code = generateCode(8);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create access code record
    const accessCode = await base44.asServiceRole.entities.DocumentAccessCode.create({
      code: code,
      document_id: document_id,
      document_title: document.title,
      document_category: document.category,
      document_record_type: document_record_type || document.document_record_type || "parent_record",
      permission_granularity: permission_granularity || "document_level",
      granted_by_email: user.email,
      granted_by_name: user.full_name,
      recipient_email: recipient_email.toLowerCase(),
      recipient_name: recipient_name || null,
      is_used: false,
      expires_at: expiresAt.toISOString(),
      is_revoked: false,
      access_note: access_note || null,
    });

    return Response.json({
      success: true,
      code: code,
      accessCodeId: accessCode.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});