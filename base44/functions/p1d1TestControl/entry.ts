import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    if (action === "revoke_release") {
      const releaseId = body.release_id;
      await base44.asServiceRole.entities.ReleaseOfInformation.update(releaseId, {
        status: "revoked",
        revoked_at: new Date().toISOString(),
      });
      return Response.json({ success: true, action: "revoked", release_id: releaseId });
    }

    if (action === "create_release") {
      const newRecord = await base44.asServiceRole.entities.ReleaseOfInformation.create({
        owner_email: "misty.stonerock88@gmail.com",
        recipient_name: "P1-D-1 Test Recipient",
        purpose: "P1-D-1 retest — restricted document export",
        starts_at: "2026-07-03",
        allowed_segments: ["substance_use", "behavioral_health"],
        status: "active",
        expires_at: "2027-12-31T00:00:00.000Z",
        revoked_at: null,
      });
      return Response.json({ success: true, action: "created", release_id: newRecord.id });
    }

    if (action === "fix_document") {
      const documentId = body.document_id;
      await base44.asServiceRole.entities.SecureDocument.update(documentId, {
        permission_segment: "",
      });
      return Response.json({ success: true, action: "fixed", document_id: documentId });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});