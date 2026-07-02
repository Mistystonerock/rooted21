import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ASSIGNED_ROLE_OPTIONS = ["Counselor", "Caseworker", "CPS Worker", "Court Staff", "Mentor", "Behavioral Health Worker", "School Staff", "Therapist", "Juvenile Probation", "Other"];
const DEFAULT_DAYS = 90;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const familyEmail = String(body.family_email || "").trim().toLowerCase();
    const professionalEmail = String(body.professional_email || "").trim().toLowerCase();
    const accessSource = String(body.access_source || "").trim();
    const accessReason = String(body.access_reason || "").trim();

    if (!familyEmail || !professionalEmail) {
      return Response.json({ success: false, error: "family_email and professional_email are required." }, { status: 400 });
    }

    const validSources = ["parent_approved", "invitation_code", "court_authorized", "admin_override", "founder_override"];
    if (!validSources.includes(accessSource)) {
      return Response.json({ success: false, error: "A valid access_source is required." }, { status: 400 });
    }

    const isFounder = user.role === "founder";
    const isAdmin = user.role === "admin";
    const now = new Date();

    async function denyAudit(reason) {
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role || "user",
        event_type: "security_alert",
        entity_name: "AssignedFamily",
        severity: "warning",
        summary: `Blocked family assignment attempt: ${reason} (family: ${familyEmail}, professional: ${professionalEmail}, source: ${accessSource}).`,
        metadata_json: JSON.stringify({ family_email: familyEmail, professional_email: professionalEmail, access_source: accessSource, reason }),
        occurred_at: now.toISOString(),
      });
    }

    let approvalRequestId = "";
    let approvedByEmail = "";
    let expiresAt = new Date(now.getTime() + DEFAULT_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // ── Authorization by source ──────────────────────────────────────
    if (accessSource === "parent_approved") {
      const requestId = String(body.approval_request_id || "").trim();
      if (!requestId) {
        await denyAudit("parent_approved missing approval_request_id");
        return Response.json({ success: false, error: "approval_request_id is required for parent_approved." }, { status: 403 });
      }
      const reqRec = await base44.asServiceRole.entities.AccessApprovalRequest.filter({ id: requestId }, "-created_date", 1);
      const appr = reqRec[0];
      if (!appr || appr.status !== "active") {
        await denyAudit("approval request not active");
        return Response.json({ success: false, error: "Approval request is not active." }, { status: 403 });
      }
      if (appr.professional_email?.toLowerCase() !== professionalEmail || appr.parent_email?.toLowerCase() !== familyEmail) {
        await denyAudit("approval request family/professional mismatch");
        return Response.json({ success: false, error: "Approval request does not match this family and professional." }, { status: 403 });
      }
      approvalRequestId = appr.id;
      approvedByEmail = appr.approved_by_email || appr.parent_email || "";
      if (appr.expires_at) expiresAt = appr.expires_at;
    } else if (accessSource === "invitation_code") {
      const code = String(body.access_code || "").trim().toUpperCase();
      if (!code) {
        await denyAudit("invitation_code missing code");
        return Response.json({ success: false, error: "access_code is required for invitation_code." }, { status: 403 });
      }
      const codes = await base44.asServiceRole.entities.AccessCode.filter({ code }, "-created_date", 1);
      const ac = codes[0];
      const codeValid = ac && (ac.status === "active" || ac.status === "used") && (!ac.expires_at || new Date(ac.expires_at) >= now);
      if (!codeValid) {
        await denyAudit("access code invalid or expired");
        return Response.json({ success: false, error: "Access code is invalid or expired." }, { status: 403 });
      }
      approvedByEmail = ac.created_by_email || familyEmail;
    } else if (accessSource === "court_authorized") {
      if (!(isAdmin || isFounder)) {
        await denyAudit("court_authorized by non-admin");
        return Response.json({ success: false, error: "Only an admin or founder may record court-authorized access." }, { status: 403 });
      }
      if (!accessReason) {
        await denyAudit("court_authorized missing reason");
        return Response.json({ success: false, error: "access_reason is required for court_authorized." }, { status: 400 });
      }
      approvedByEmail = user.email;
    } else if (accessSource === "admin_override") {
      if (!(isAdmin || isFounder)) {
        await denyAudit("admin_override by non-admin");
        return Response.json({ success: false, error: "Only an admin or founder may perform an admin override." }, { status: 403 });
      }
      if (!accessReason) {
        await denyAudit("admin_override missing reason");
        return Response.json({ success: false, error: "access_reason is required for admin_override." }, { status: 400 });
      }
      approvedByEmail = user.email;
    } else if (accessSource === "founder_override") {
      if (!isFounder) {
        await denyAudit("founder_override by non-founder");
        return Response.json({ success: false, error: "Only the founder may perform a founder override." }, { status: 403 });
      }
      if (!accessReason) {
        await denyAudit("founder_override missing reason");
        return Response.json({ success: false, error: "access_reason is required for founder_override." }, { status: 400 });
      }
      approvedByEmail = user.email;
    }

    const assignedRole = ASSIGNED_ROLE_OPTIONS.includes(body.professional_role) ? body.professional_role : "Behavioral Health Worker";
    const payload = {
      family_user_id: body.family_user_id || "",
      family_email: familyEmail,
      family_name: body.family_name || familyEmail,
      child_name: body.child_name || "",
      professional_user_id: body.professional_user_id || "",
      professional_email: professionalEmail,
      professional_name: body.professional_name || professionalEmail,
      professional_role: assignedRole,
      status: "active",
      // Server-controlled trust fields:
      expires_at: expiresAt,
      approval_request_id: approvalRequestId,
      approved_by_email: approvedByEmail,
      access_reason: accessReason,
      access_source: accessSource,
    };

    // Reuse an existing assignment row if present, else create.
    const existing = await base44.asServiceRole.entities.AssignedFamily.filter({ family_email: familyEmail, professional_email: professionalEmail }, "-created_date", 1);
    const assignment = existing[0]
      ? await base44.asServiceRole.entities.AssignedFamily.update(existing[0].id, payload)
      : await base44.asServiceRole.entities.AssignedFamily.create(payload);

    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "consent_change",
      entity_name: "AssignedFamily",
      entity_id: assignment.id,
      severity: accessSource.includes("override") ? "warning" : "info",
      summary: `Family ${familyEmail} assigned to ${professionalEmail} via ${accessSource}${accessReason ? ` — reason: ${accessReason}` : ""}.`,
      metadata_json: JSON.stringify({ family_email: familyEmail, professional_email: professionalEmail, access_source: accessSource, expires_at: expiresAt, approved_by_email: approvedByEmail }),
      occurred_at: now.toISOString(),
    });

    return Response.json({ success: true, assignment });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});