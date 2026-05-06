import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase().replace(/\s/g, '');

    // Look up the code
    const records = await base44.asServiceRole.entities.DocumentAccessCode.filter({ code: normalizedCode });
    const record = records[0];

    if (!record) {
      return Response.json({ error: 'Invalid access code. Please check and try again.' }, { status: 404 });
    }

    if (record.is_revoked) {
      return Response.json({ error: 'This access code has been revoked by the document owner.' }, { status: 403 });
    }

    if (new Date(record.expires_at) < new Date()) {
      return Response.json({ error: 'This access code has expired. Please request a new one.' }, { status: 403 });
    }

    // Verify recipient email matches
    if (record.recipient_email.toLowerCase() !== user.email.toLowerCase()) {
      return Response.json({ error: 'This access code was not issued to your email address.' }, { status: 403 });
    }

    // Fetch the actual document
    const docs = await base44.asServiceRole.entities.SecureDocument.filter({ id: record.document_id });
    const doc = docs[0];

    if (!doc) {
      return Response.json({ error: 'The document associated with this code no longer exists.' }, { status: 404 });
    }

    // Mark code as used (but still allow repeated access)
    if (!record.is_used) {
      await base44.asServiceRole.entities.DocumentAccessCode.update(record.id, {
        is_used: true,
        used_at: new Date().toISOString(),
      });
    }

    // Ensure recipient is in shared_with
    const currentShared = doc.shared_with || [];
    if (!currentShared.includes(user.email)) {
      await base44.asServiceRole.entities.SecureDocument.update(doc.id, {
        shared_with: [...currentShared, user.email],
        is_private: false,
      });
    }

    return Response.json({
      success: true,
      document: {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        file_url: doc.file_url,
        file_name: doc.file_name,
        child_name: doc.child_name,
        description: doc.description,
        tags: doc.tags,
      },
      grantedBy: record.granted_by_name,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});