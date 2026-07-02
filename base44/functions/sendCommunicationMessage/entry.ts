import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const threadType = String(body.thread_type || "");
    const text = String(body.body || "").trim();
    if (!text) return Response.json({ success: false, error: "Message body is required." }, { status: 400 });
    if (threadType !== "coparenting" && threadType !== "secure_message") {
      return Response.json({ success: false, error: "Invalid thread_type." }, { status: 400 });
    }

    const sentAt = new Date().toISOString();
    const contentHash = await sha256Hex(text);

    let created;
    let recipientEmail = "";
    let partnershipId = "";
    let topic = "";

    if (threadType === "coparenting") {
      partnershipId = String(body.partnership_id || "");
      if (!partnershipId) return Response.json({ success: false, error: "partnership_id is required." }, { status: 400 });

      const matches = await base44.asServiceRole.entities.CoParentingPartnership.filter({ id: partnershipId });
      const partnership = matches[0];
      if (!partnership) return Response.json({ success: false, error: "Partnership not found." }, { status: 404 });

      // Verify the caller is a real party on this partnership.
      const isParent1 = partnership.parent_1_email === user.email;
      const isParent2 = partnership.parent_2_email === user.email;
      if (!isParent1 && !isParent2) {
        await base44.asServiceRole.entities.RootedAuditEvent.create({
          actor_email: user.email, actor_role: user.role || "user",
          event_type: "security_alert", entity_name: "CoParentingMessage", entity_id: partnershipId,
          severity: "warning", summary: `Blocked message send by non-party on partnership ${partnershipId}.`,
          occurred_at: sentAt,
        });
        return Response.json({ success: false, error: "You are not a participant in this partnership." }, { status: 403 });
      }

      // Block messaging on inactive partnerships and no-contact (DV / survivor) orders.
      if (partnership.status !== "active") {
        return Response.json({ success: false, error: "This partnership is not active. Messaging is disabled." }, { status: 403 });
      }
      if (partnership.no_contact === true) {
        await base44.asServiceRole.entities.RootedAuditEvent.create({
          actor_email: user.email, actor_role: user.role || "user",
          event_type: "security_alert", entity_name: "CoParentingMessage", entity_id: partnershipId,
          severity: "warning", summary: `Blocked message send on no-contact partnership ${partnershipId}.`,
          occurred_at: sentAt,
        });
        return Response.json({ success: false, error: "A no-contact order is in place. Direct messaging is blocked." }, { status: 403 });
      }

      // Recipient and court are resolved from the partnership — never the client.
      recipientEmail = isParent1 ? partnership.parent_2_email : partnership.parent_1_email;
      topic = ["schedule", "health", "education", "behavior", "finances", "general"].includes(body.topic) ? body.topic : "general";

      created = await base44.asServiceRole.entities.CoParentingMessage.create({
        partnership_id: partnershipId,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        recipient_email: recipientEmail,
        court_email: partnership.court_email || "",
        body: text,
        topic,
        sent_at: sentAt,
        is_withdrawn: false,
      });
    } else {
      // secure_message
      const familyEmail = String(body.family_email || "");
      const professionalEmail = String(body.professional_email || "");
      if (!familyEmail || !professionalEmail) {
        return Response.json({ success: false, error: "family_email and professional_email are required." }, { status: 400 });
      }
      // Caller must be a party to this thread.
      if (user.email !== familyEmail && user.email !== professionalEmail) {
        await base44.asServiceRole.entities.RootedAuditEvent.create({
          actor_email: user.email, actor_role: user.role || "user",
          event_type: "security_alert", entity_name: "SecureMessage", entity_id: "",
          severity: "warning", summary: `Blocked secure message send by non-party (${familyEmail} ↔ ${professionalEmail}).`,
          occurred_at: sentAt,
        });
        return Response.json({ success: false, error: "You are not a participant in this thread." }, { status: 403 });
      }

      recipientEmail = user.email === familyEmail ? professionalEmail : familyEmail;
      const senderRole = user.email === familyEmail ? "parent" : (body.sender_role || user.role || "professional");

      created = await base44.asServiceRole.entities.SecureMessage.create({
        family_email: familyEmail,
        professional_email: professionalEmail,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        sender_role: senderRole,
        body: text,
        read: false,
        sent_at: sentAt,
        is_withdrawn: false,
      });
    }

    // Server-only immutable audit log with server-computed hash.
    await base44.asServiceRole.entities.MessageAuditLog.create({
      message_id: created.id,
      thread_type: threadType,
      action: "sent",
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      recipient_email: recipientEmail,
      body_preview: text.substring(0, 120),
      content_hash: contentHash,
      sent_at: sentAt,
      partnership_id: partnershipId,
      topic,
    });

    return Response.json({ success: true, message: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});