import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Segments that require an explicit, active Release of Information / consent before sharing.
const SENSITIVE_SEGMENTS = ["behavioral_health", "substance_use"];

function generateCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Does this document require consent to share? (sensitive segment OR 42 CFR Part 2)
function isSensitiveDocument(doc) {
  return doc.part2_segmented === true || SENSITIVE_SEGMENTS.includes(doc.permission_segment);
}

// Find an active, in-window Release of Information owned by the sharer that covers this segment.
function hasValidRelease(releases, doc) {
  const today = new Date().toISOString().slice(0, 10);
  return releases.some((r) => {
    if (r.status !== "active") return false;
    if (r.starts_at && r.starts_at > today) return false;
    if (r.expires_at && r.expires_at < today) return false;
    const segments = Array.isArray(r.allowed_segments) ? r.allowed_segments : [];
    return segments.includes(doc.permission_segment) || (doc.part2_segmented === true && segments.includes("substance_use"));
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const documentId = String(body.document_id || "");
    const recipientEmail = String(body.recipient_email || "").trim().toLowerCase();
    const recipientName = String(body.recipient_name || "").trim();
    const accessNote = String(body.access_note || "").trim();

    if (!documentId || !recipientEmail) {
      return Response.json({ error: 'Missing document_id or recipient_email' }, { status: 400 });
    }

    const docs = await base44.asServiceRole.entities.SecureDocument.filter({ id: documentId });
    if (docs.length === 0) return Response.json({ error: 'Document not found' }, { status: 404 });
    const document = docs[0];

    const now = new Date().toISOString();
    const isOwner = document.owner_email === user.email || document.created_by === user.email;
    const isAdmin = user.role === "admin" || user.role === "founder";
    const canShare = isOwner || isAdmin;

    // Shared helper: write BOTH audit trails for every attempt (allowed or denied).
    async function audit(outcome, reason, severity) {
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role || "user",
        event_type: "data_access",
        entity_name: "SecureDocument",
        entity_id: documentId,
        severity,
        summary: `Share ${outcome}: "${document.title}" → ${recipientEmail}. ${reason}`,
        metadata_json: JSON.stringify({ action: "share", outcome, reason, recipient_email: recipientEmail, permission_segment: document.permission_segment, part2_segmented: document.part2_segmented === true }),
        occurred_at: now,
      });
      await base44.asServiceRole.entities.DocumentAuditLog.create({
        case_id: document.case_id || "none",
        document_id: documentId,
        document_title: document.title,
        action: "shared",
        performed_by_email: user.email,
        performed_by_name: user.full_name || "",
        performed_by_role: user.role || "user",
        timestamp: now,
        notes: `${outcome.toUpperCase()} — ${reason} (recipient: ${recipientEmail})`,
      });
    }

    // 1. Authorization gate.
    if (!canShare) {
      await audit("denied", "Requester does not own and is not authorized to share this document.", "warning");
      return Response.json({ success: false, error: "You are not authorized to share this document." }, { status: 403 });
    }

    // 2. Sensitive-segment consent gate.
    if (isSensitiveDocument(document)) {
      const releases = await base44.asServiceRole.entities.ReleaseOfInformation.filter({ owner_email: document.owner_email });
      if (!hasValidRelease(releases, document)) {
        await audit("denied", `Sensitive document (segment: ${document.permission_segment}${document.part2_segmented ? ", 42 CFR Part 2" : ""}) requires an active Release of Information / consent covering this segment.`, "warning");
        return Response.json({
          success: false,
          error: "This document is protected behavioral health / substance use information. Sharing requires an active signed Release of Information covering this record before a code can be issued.",
          requires_release: true,
          permission_segment: document.permission_segment,
        }, { status: 403 });
      }
    }

    // 3. Approved — generate the access code server-side ONLY.
    const code = generateCode(8);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const accessCode = await base44.asServiceRole.entities.DocumentAccessCode.create({
      code,
      document_id: documentId,
      document_title: document.title,
      document_category: document.category,
      document_record_type: document.document_record_type || "parent_record",
      permission_granularity: "document_level",
      granted_by_email: user.email,
      granted_by_name: user.full_name || "",
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      is_used: false,
      expires_at: expiresAt.toISOString(),
      is_revoked: false,
      access_note: accessNote || null,
    });

    // Server-controlled shared_with — the client never writes this field directly.
    const existingShared = Array.isArray(document.shared_with) ? document.shared_with : [];
    const nextShared = existingShared.includes(recipientEmail) ? existingShared : [...existingShared, recipientEmail];
    await base44.asServiceRole.entities.SecureDocument.update(documentId, { shared_with: nextShared, is_private: false });

    await audit("approved", `Access code issued${isSensitiveDocument(document) ? " under an active Release of Information" : ""}.`, isSensitiveDocument(document) ? "warning" : "info");

    return Response.json({ success: true, code, accessCodeId: accessCode.id, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});