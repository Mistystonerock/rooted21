import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PROFESSIONAL_ROLES = [
  "admin", "founder", "professional", "behavioral_health_worker", "behavioral_health_provider",
  "treatment_team_member", "community_behavioral_health_worker", "tbs_provider", "cpst_provider",
  "peer_support_specialist", "risk_management_specialist", "recovery_coach", "ohiorise_care_coordinator",
  "treatment_court_mentor", "substance_use_counselor", "behavioral_health_supervisor", "therapist",
  "counselor", "caseworker", "peer_mentor",
];

// Behavioral-health / substance-use signals used to segment sensitive records.
const SUBSTANCE_USE_KEYWORDS = [
  "suboxone", "buprenorphine", "methadone", "naltrexone", "vivitrol", "narcan", "naloxone",
  "mat", "medication assisted", "medication-assisted", "detox", "rehab", "opioid", "substance use",
  "substance abuse", "addiction", "withdrawal", "relapse", "sober", "sobriety", "aa meeting", "na meeting",
];

function isSubstanceUseRecord(record) {
  const t = `${record.behavior_description || ""} ${record.trigger || ""} ${record.outcome || ""} ${record.note || ""} ${record.parent_response || ""}`.toLowerCase();
  return SUBSTANCE_USE_KEYWORDS.some((k) => t.includes(k));
}

// A valid, active, unexpired ReleaseOfInformation covering substance_use for this professional.
function hasSubstanceUseRelease(releases, professionalEmail) {
  const now = new Date();
  return releases.some((roi) => {
    if (roi.status !== "active") return false;
    if (roi.revoked_at) return false;
    if (roi.expires_at && new Date(roi.expires_at) < now) return false;
    const segments = Array.isArray(roi.allowed_segments) ? roi.allowed_segments : [];
    const coversSegment = segments.includes("substance_use");
    return coversSegment;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (!PROFESSIONAL_ROLES.includes(user.role)) {
      return Response.json({ success: false, error: "Professional access required." }, { status: 403 });
    }

    const body = await req.json();
    const familyEmail = String(body.family_email || "").trim().toLowerCase();
    if (!familyEmail) return Response.json({ success: false, error: "family_email is required." }, { status: 400 });

    const isFounder = user.role === "founder";
    const isAdmin = user.role === "admin";

    // ── Assignment gate ──────────────────────────────────────────────
    // Find the professional's assignment to this family (founder may view any).
    const now = new Date();
    let assignment = null;

    if (isFounder) {
      const found = await base44.asServiceRole.entities.AssignedFamily.filter({ family_email: familyEmail }, "-created_date", 1);
      assignment = found[0] || null;
    } else {
      const assignments = await base44.asServiceRole.entities.AssignedFamily.filter(
        { professional_email: user.email, family_email: familyEmail },
        "-created_date",
        5,
      );
      assignment = assignments.find((a) => a.status === "active") || assignments[0] || null;
    }

    async function denyAudit(reason, extra = {}) {
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: user.role || "user",
        event_type: "security_alert",
        entity_name: "AssignedFamily",
        entity_id: assignment?.id || "",
        severity: "warning",
        summary: `Blocked professional family-data access: ${reason} (family: ${familyEmail}).`,
        metadata_json: JSON.stringify({ family_email: familyEmail, reason, ...extra }),
        occurred_at: now.toISOString(),
      });
    }

    if (!isFounder) {
      if (!assignment) {
        await denyAudit("no assignment");
        return Response.json({ success: false, error: "You are not assigned to this family." }, { status: 403 });
      }
      if (assignment.status !== "active") {
        await denyAudit("assignment not active", { status: assignment.status });
        return Response.json({ success: false, error: "This assignment is not active." }, { status: 403 });
      }
      if (assignment.expires_at && new Date(assignment.expires_at) < now) {
        await denyAudit("assignment expired", { expires_at: assignment.expires_at });
        return Response.json({ success: false, error: "This assignment has expired." }, { status: 403 });
      }
      // A non-override source must be backed by an approval request or a recognized source.
      const validSources = ["parent_approved", "invitation_code", "court_authorized", "admin_override", "founder_override"];
      if (!assignment.access_source || !validSources.includes(assignment.access_source)) {
        await denyAudit("no valid access source", { access_source: assignment.access_source || null });
        return Response.json({ success: false, error: "This assignment has no valid access authorization." }, { status: 403 });
      }
      if (assignment.access_source === "parent_approved") {
        if (!assignment.approval_request_id) {
          await denyAudit("parent_approved without approval request");
          return Response.json({ success: false, error: "Missing linked parent approval." }, { status: 403 });
        }
        const reqRec = await base44.asServiceRole.entities.AccessApprovalRequest.filter({ id: assignment.approval_request_id }, "-created_date", 1);
        const appr = reqRec[0];
        const approvalValid = appr && appr.status === "active" && (!appr.expires_at || new Date(appr.expires_at) >= now);
        if (!approvalValid) {
          await denyAudit("approval request invalid or expired", { approval_status: appr?.status });
          return Response.json({ success: false, error: "Parent approval is no longer valid." }, { status: 403 });
        }
      }
    }

    // ── Fetch family data via service role (professional is not created_by) ──
    const [checkins, lessons, goals, notes, behaviorLogs, releases] = await Promise.all([
      base44.asServiceRole.entities.CheckIn.filter({ created_by: familyEmail }, "-created_date", 60).catch(() => []),
      base44.asServiceRole.entities.LessonProgress.filter({ created_by: familyEmail }, "-created_date", 200).catch(() => []),
      base44.asServiceRole.entities.Goal.filter({ created_by: familyEmail }, "-created_date", 100).catch(() => []),
      base44.asServiceRole.entities.ProfessionalNote.filter({ family_email: familyEmail }, "-created_date", 20).catch(() => []),
      base44.asServiceRole.entities.BehaviorLog.filter({ created_by: familyEmail }, "-created_date", 60).catch(() => []),
      base44.asServiceRole.entities.ReleaseOfInformation.filter({ owner_email: familyEmail }, "-created_date", 50).catch(() => []),
    ]);

    // ── 42 CFR Part 2 / substance-use segmentation ──
    const substanceUseReleaseValid = hasSubstanceUseRelease(releases, user.email);
    let redactedCount = 0;
    const filterSensitive = (rows) => rows.filter((r) => {
      if (isSubstanceUseRecord(r) && !substanceUseReleaseValid) {
        redactedCount += 1;
        return false;
      }
      return true;
    });

    const safeCheckins = filterSensitive(checkins);
    const safeBehaviorLogs = filterSensitive(behaviorLogs);
    const safeGoals = filterSensitive(goals);

    // ── Mandatory view audit ──
    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "record_view",
      entity_name: "AssignedFamily",
      entity_id: assignment?.id || "",
      severity: redactedCount > 0 ? "warning" : "info",
      summary: `Professional viewed assigned family data for ${familyEmail} (${safeCheckins.length} check-ins, ${safeBehaviorLogs.length} behavior logs; ${redactedCount} sensitive records redacted).`,
      metadata_json: JSON.stringify({
        family_email: familyEmail,
        access_source: assignment?.access_source || (isFounder ? "founder_override" : null),
        substance_use_release_valid: substanceUseReleaseValid,
        redacted_count: redactedCount,
      }),
      occurred_at: now.toISOString(),
    });

    return Response.json({
      success: true,
      family_email: familyEmail,
      data: {
        checkins: safeCheckins,
        lessons,
        goals: safeGoals,
        notes,
        behaviorLogs: safeBehaviorLogs,
      },
      sensitivity: {
        substance_use_release_valid: substanceUseReleaseValid,
        redacted_count: redactedCount,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});