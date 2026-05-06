import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  // Format as XXXX-XXXX for readability
  return code.slice(0, 4) + '-' + code.slice(4);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, recipientEmail, recipientName, accessNote } = await req.json();

    if (!documentId || !recipientEmail) {
      return Response.json({ error: 'documentId and recipientEmail are required' }, { status: 400 });
    }

    // Fetch the document to verify ownership
    const docs = await base44.asServiceRole.entities.SecureDocument.filter({ id: documentId });
    const doc = docs[0];

    if (!doc) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.owner_email !== user.email) {
      return Response.json({ error: 'You can only share documents you own' }, { status: 403 });
    }

    // Generate unique code
    const code = generateCode();

    // Set expiry to 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Save access code record
    const accessCodeRecord = await base44.asServiceRole.entities.DocumentAccessCode.create({
      code,
      document_id: documentId,
      document_title: doc.title,
      document_category: doc.category,
      granted_by_email: user.email,
      granted_by_name: user.full_name,
      recipient_email: recipientEmail,
      recipient_name: recipientName || recipientEmail,
      is_used: false,
      expires_at: expiresAt,
      is_revoked: false,
      access_note: accessNote || '',
    });

    // Also add recipient to doc's shared_with list
    const currentShared = doc.shared_with || [];
    if (!currentShared.includes(recipientEmail)) {
      await base44.asServiceRole.entities.SecureDocument.update(documentId, {
        shared_with: [...currentShared, recipientEmail],
        is_private: false,
      });
    }

    // Send email with the access code
    const categoryLabels = {
      court_order: 'Court Order',
      iep: 'IEP Document',
      medical: 'Medical Record',
      legal: 'Legal Document',
      school: 'School Record',
      therapy: 'Therapy Record',
      financial: 'Financial Document',
      other: 'Document',
    };
    const categoryLabel = categoryLabels[doc.category] || 'Document';

    const emailBody = `
Hello ${recipientName || recipientEmail},

${user.full_name} has shared a secure ${categoryLabel} with you through the Rooted Parenting Network.

📄 Document: ${doc.title}
${doc.child_name ? `👤 Child: ${doc.child_name}` : ''}
${accessNote ? `\n💬 Message from ${user.full_name}:\n"${accessNote}"` : ''}

Your Personal Access Code:

  ${code}

To access this document:
1. Open the Rooted Parenting Network app
2. Go to Secure Documents → Redeem Access Code
3. Enter your code: ${code}

This code expires on ${new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

This document may contain sensitive legal, medical, or educational information. Please keep your access code confidential.

— Rooted Parenting Network
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `🔐 Secure Document Access: "${doc.title}" — Your Access Code Inside`,
      body: emailBody,
    });

    return Response.json({
      success: true,
      code,
      expiresAt,
      accessCodeId: accessCodeRecord.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});