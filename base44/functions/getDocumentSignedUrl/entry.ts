import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Segments that require the stricter owner-only / consent-gated check.
const SENSITIVE_SEGMENTS = ["behavioral_health", "substance_use"];

Deno.serve(async (req) => {
  const started = new Date().toISOString();
  let base44;
  let user;
  let documentId = "";

  async function logAccess(action, status, doc, reason) {
    try {
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user?.email || "unknown",
        actor_role: user?.role || "unknown",
        event_type: "data_access",
        entity_name: "SecureDocument",
        entity_id: documentId,
        severity: status === "denied" ? "warning" : "info",
        summary: `${action} ${status} for SecureDocument "${doc?.title || documentId}"${reason ? ` — ${reason}` : ""}.`,
        occurred_at: new Date().toISOString(),
      });
    } catch {
      // Never let audit failure block the security decision.
    }
  }

  try {
    base44 = createClientFromRequest(req);
    user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    documentId = body.document_id || body.id || "";
    const action = body.action === "download" ? "download" : "view";
    if (!documentId) return Response.json({ error: 'document_id is required' }, { status: 400 });

    const doc = await base44.asServiceRole.entities.SecureDocument.get(documentId).catch(() => null);
    if (!doc || doc.is_deleted) {
      await logAccess(action, "denied", doc, "not found or deleted");
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    const email = user.email;
    const isPrivileged = user.role === "founder" || user.role === "admin";
    const isOwner = doc.owner_email === email || doc.created_by === email;
    const isShared = Array.isArray(doc.shared_with) && doc.shared_with.includes(email);

    const isSensitive = doc.part2_segmented || SENSITIVE_SEGMENTS.includes(doc.permission_segment);

    // Stricter gate for behavioral-health / substance-use / 42 CFR Part 2:
    // only the owner may access — shared_with and admin/founder do NOT bypass segmented consent.
    let allowed;
    if (isSensitive) {
      allowed = isOwner;
    } else {
      allowed = isOwner || isShared || isPrivileged;
    }

    if (!allowed) {
      await logAccess(action, "denied", doc, isSensitive ? "segmented consent required" : "no access right");
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate signed URL server-side.
    let signedUrl = null;
    if (doc.private_file_uri) {
      const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: doc.private_file_uri,
        expires_in: 300,
      });
      signedUrl = res.signed_url;
    } else if (doc.file_url) {
      signedUrl = doc.file_url;
    }

    if (!signedUrl) {
      await logAccess(action, "denied", doc, "no file on record");
      return Response.json({ error: 'No file available for this document' }, { status: 404 });
    }

    await logAccess(action, "allowed", doc, null);
    return Response.json({ success: true, signed_url: signedUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});