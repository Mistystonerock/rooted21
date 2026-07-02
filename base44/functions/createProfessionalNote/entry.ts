import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const familyEmail = String(body.family_email || "").trim().toLowerCase();
    const note = String(body.note || "").trim();
    if (!familyEmail || !note) {
      return Response.json({ success: false, error: "family_email and note are required." }, { status: 400 });
    }

    const isFounder = user.role === "founder";
    const now = new Date();

    // ── Active, unexpired assignment gate (founder exempt) ──
    let assignment = null;
    if (!isFounder) {
      const assignments = await base44.asServiceRole.entities.AssignedFamily.filter(
        { professional_email: user.email, family_email: familyEmail },
        "-created_date",
        5,
      );
      assignment = assignments.find((a) => a.status === "active") || null;

      const expired = assignment?.expires_at && new Date(assignment.expires_at) < now;
      if (!assignment || expired) {
        await base44.asServiceRole.entities.RootedAuditEvent.create({
          actor_email: user.email,
          actor_role: user.role || "user",
          event_type: "security_alert",
          entity_name: "ProfessionalNote",
          entity_id: assignment?.id || "",
          severity: "warning",
          summary: `Blocked note creation: ${!assignment ? "no active assignment" : "assignment expired"} (family: ${familyEmail}).`,
          metadata_json: JSON.stringify({ family_email: familyEmail, reason: !assignment ? "no_active_assignment" : "expired" }),
          occurred_at: now.toISOString(),
        });
        return Response.json({ success: false, error: "You do not have an active assignment to this family." }, { status: 403 });
      }
    }

    const created = await base44.asServiceRole.entities.ProfessionalNote.create({
      family_email: familyEmail,
      child_name: body.child_name || assignment?.child_name || "",
      note,
      recommendation: String(body.recommendation || "").trim(),
      // Server-set author fields — client cannot spoof.
      professional_name: user.full_name || "",
      professional_role: assignment?.professional_role || (isFounder ? "Founder" : ""),
      professional_email: user.email,
    });

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "record_create",
      entity_name: "ProfessionalNote",
      entity_id: created.id,
      severity: "info",
      summary: `Professional note created for ${familyEmail}.`,
      metadata_json: JSON.stringify({ family_email: familyEmail, assignment_id: assignment?.id || null }),
      occurred_at: now.toISOString(),
    });

    return Response.json({ success: true, note: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});