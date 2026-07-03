import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const releaseId = "6a46f5a1b5192080c230d98b";
    await base44.asServiceRole.entities.ReleaseOfInformation.update(releaseId, {
      status: "revoked",
      revoked_at: new Date().toISOString(),
    });
    const updated = await base44.asServiceRole.entities.ReleaseOfInformation.filter({ id: releaseId });
    return Response.json({ status: updated[0]?.status, revoked_at: updated[0]?.revoked_at });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});