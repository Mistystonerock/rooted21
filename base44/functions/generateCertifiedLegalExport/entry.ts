import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inDateRange(value, from, to) {
  const d = safeDate(value);
  if (!d) return true;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function formatDateTime(value) {
  const d = safeDate(value) || new Date();
  return d.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "long" });
}

async function sha256Hex(input) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(input || "")));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Restricted-document detection ───────────────────────────────
const SENSITIVE_TAG_PATTERNS = ["behavioral", "behavioral-health", "behavioral_health", "mental", "mental-health", "mental_health", "therapy", "therapist", "counseling", "psych", "substance", "substance-use", "substance_use", "sud", "mat", "detox", "rehab", "addiction", "part2", "part 2", "42 cfr"];
const SENSITIVE_CATEGORIES = ["medical", "therapy", "behavioral_health", "substance_use"];
const SENSITIVE_RECORD_TYPES = ["medical_record", "behavioral_health_record"];

function classifyDocumentRestriction(docItem) {
  const part2 = docItem.part2_segmented === true;
  const segment = String(docItem.permission_segment || "general").toLowerCase();
  const segmentRestricted = segment && segment !== "general";
  const tags = (docItem.tags || []).map(t => String(t).toLowerCase());
  const tagRestricted = tags.some(t => SENSITIVE_TAG_PATTERNS.some(p => t.includes(p)));
  const category = String(docItem.category || "").toLowerCase();
  const categoryRestricted = SENSITIVE_CATEGORIES.includes(category);
  const recordType = String(docItem.document_record_type || "").toLowerCase();
  const recordTypeRestricted = SENSITIVE_RECORD_TYPES.includes(recordType);

  const restricted = part2 || segmentRestricted || tagRestricted || categoryRestricted || recordTypeRestricted;
  const reasons = [];
  if (part2) reasons.push("part2_segmented");
  if (segmentRestricted) reasons.push(`permission_segment=${segment}`);
  if (tagRestricted) reasons.push("sensitive_tags");
  if (categoryRestricted) reasons.push(`category=${category}`);
  if (recordTypeRestricted) reasons.push(`record_type=${recordType}`);

  return { restricted, part2, segment, category, reasons };
}

// Returns { allowed: boolean, matchedRelease?, matchedConsent?, reason }
function evaluateReleaseAndConsent(classification, releases, consents, nowIso) {
  const now = new Date(nowIso);
  const seg = classification.segment;
  const cat = classification.category;

  const activeRelease = releases.find(r => {
    if (r.status !== "active") return false;
    if (r.revoked_at) return false;
    const exp = r.expires_at ? new Date(r.expires_at) : null;
    if (exp && exp < now) return false;
    const allowed = (r.allowed_segments || []).map(s => String(s).toLowerCase());
    return allowed.includes(seg) || (cat && allowed.includes(cat)) || allowed.includes("all");
  });
  if (activeRelease) {
    return { allowed: true, matchedRelease: activeRelease.id, reason: `Active ReleaseOfInformation ${activeRelease.id} covers segment/category` };
  }

  const matchingConsent = consents.find(c => {
    if (c.allowed !== true) return false;
    const dc = String(c.data_category || "").toLowerCase();
    return dc.includes(seg) || (cat && dc.includes(cat)) || dc.includes("behavioral") || dc.includes("substance");
  });
  if (matchingConsent) {
    return { allowed: true, matchedConsent: matchingConsent.id, reason: `ConsentPermission ${matchingConsent.id} allows category` };
  }

  return { allowed: false, reason: "No active ReleaseOfInformation or ConsentPermission on file for this restriction segment/category" };
}

async function logExportDecision(base44, user, action, resourceId, summary, metadata, severity) {
  await base44.asServiceRole.entities.RootedAuditEvent.create({
    actor_email: user.email,
    actor_role: user.role || "user",
    event_type: action === "message_integrity_check" ? "data_export" : "document_export",
    entity_name: "SecureDocument",
    entity_id: resourceId || "",
    severity: severity || "info",
    summary,
    metadata_json: JSON.stringify({ action, resource_type: action === "message_integrity_check" ? "messages" : "SecureDocument", ...metadata }),
    occurred_at: new Date().toISOString(),
  });
}

function randomAuthenticationCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => String(b % 100).padStart(2, "0")).join("").slice(0, 16);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();
    const {
      exportType = "combined_packet",
      recipientType = "attorney",
      purpose = "Legal/GAL/CASA review",
      dateFrom,
      dateTo,
      secureThreadKey,
      coparentingPartnershipId,
      documentIds = [],
      includeCertification = true,
    } = payload || {};

    const from = safeDate(dateFrom);
    const to = safeDate(dateTo);
    if (to) to.setHours(23, 59, 59, 999);

    const exportId = `R21-CERT-${Date.now().toString(36).toUpperCase()}`;
    const authenticationCode = randomAuthenticationCode();
    const generatedAtIso = new Date().toISOString();
    const generatedAt = formatDateTime(generatedAtIso);

    const [secureMessages, coParentMessages, documents, partnerships] = await Promise.all([
      base44.entities.SecureMessage.list("created_date", 1000),
      base44.entities.CoParentingMessage.list("created_date", 1000),
      base44.entities.SecureDocument.list("-created_date", 500),
      base44.entities.CoParentingPartnership.list("-created_date", 200),
    ]);

    let messages = [];
    let threadLabel = "Selected records";

    if ((exportType === "communication_thread" || exportType === "combined_packet") && secureThreadKey) {
      const [familyEmail, professionalEmail] = secureThreadKey.split("::");
      const selected = secureMessages.filter(m =>
        m.family_email === familyEmail &&
        m.professional_email === professionalEmail &&
        (m.family_email === user.email || m.professional_email === user.email) &&
        inDateRange(m.created_date, from, to)
      ).map(m => ({
        id: m.id,
        source: "Secure professional message",
        created_date: m.created_date,
        sender_email: m.sender_email,
        sender_name: m.sender_name,
        recipient_email: m.sender_email === familyEmail ? professionalEmail : familyEmail,
        body: m.body,
        topic: m.sender_role || "secure_message",
      }));
      messages = messages.concat(selected);
      threadLabel = `${familyEmail} ↔ ${professionalEmail}`;
    }

    if ((exportType === "communication_thread" || exportType === "combined_packet") && coparentingPartnershipId) {
      const partnership = partnerships.find(p => p.id === coparentingPartnershipId);
      if (!partnership || (partnership.parent_1_email !== user.email && partnership.parent_2_email !== user.email && partnership.court_email !== user.email)) {
        return Response.json({ error: "Forbidden: You do not have access to this co-parenting thread." }, { status: 403 });
      }
      const selected = coParentMessages.filter(m =>
        m.partnership_id === coparentingPartnershipId &&
        (m.sender_email === user.email || m.recipient_email === user.email || m.court_email === user.email) &&
        inDateRange(m.created_date, from, to)
      ).map(m => ({
        id: m.id,
        source: "Co-parenting message",
        created_date: m.created_date,
        sender_email: m.sender_email,
        sender_name: m.sender_name,
        recipient_email: m.recipient_email,
        body: m.body,
        topic: m.topic || "general",
      }));
      messages = messages.concat(selected);
      threadLabel = `Co-parenting thread${partnership.child_name ? ` · ${partnership.child_name}` : ""}`;
    }

    messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    // ── Message hash verification against MessageAuditLog ───────────
    const integrity = { total: 0, verified: 0, altered: 0, missing: 0 };
    for (const m of messages) {
      integrity.total += 1;
      const recomputed = await sha256Hex(m.body || "");
      let auditLogs = await base44.asServiceRole.entities.MessageAuditLog.filter({ message_id: m.id }).catch(() => []);
      if (!auditLogs || auditLogs.length === 0) {
        // Fallback: match by sender + timestamp when no direct message_id link exists.
        auditLogs = (await base44.asServiceRole.entities.MessageAuditLog.filter({ sender_email: m.sender_email }).catch(() => []))
          .filter(a => a.sent_at && m.created_date && Math.abs(new Date(a.sent_at) - new Date(m.created_date)) < 5000);
      }
      const auditEntry = (auditLogs || []).find(a => a.action === "sent") || (auditLogs || [])[0];
      if (!auditEntry || !auditEntry.content_hash) {
        m._integrity = "MISSING_AUDIT_RECORD";
        integrity.missing += 1;
      } else if (auditEntry.content_hash === recomputed) {
        m._integrity = "VERIFIED";
        integrity.verified += 1;
      } else {
        m._integrity = "ALTERED";
        integrity.altered += 1;
      }
    }
    await logExportDecision(base44, user, "message_integrity_check", "", `Message integrity check for certified export ${exportId}: ${integrity.verified} verified, ${integrity.altered} altered, ${integrity.missing} missing audit records (of ${integrity.total}).`, { export_id: exportId, ...integrity }, integrity.altered > 0 ? "critical" : "info");

    const requestedDocumentIds = Array.isArray(documentIds) ? documentIds : [];
    const ownedRequestedDocuments = (exportType === "case_documents" || exportType === "combined_packet")
      ? documents.filter(d => requestedDocumentIds.includes(d.id) && (d.owner_email === user.email || d.created_by === user.email || (d.shared_with || []).includes(user.email)))
      : [];

    // ── Server-side restricted-document consent/release gating ──────
    // Pull the requesting user's releases and consents once for evaluation.
    const [ownerReleases, ownerConsents] = await Promise.all([
      base44.asServiceRole.entities.ReleaseOfInformation.filter({ owner_email: user.email }).catch(() => []),
      base44.asServiceRole.entities.ConsentPermission.filter({ owner_email: user.email }).catch(() => []),
    ]);

    const selectedDocuments = [];   // documents actually embedded in the packet
    const redactedDocuments = [];   // restricted-but-not-part2 placeholders
    for (const d of ownedRequestedDocuments) {
      const classification = classifyDocumentRestriction(d);
      if (!classification.restricted) {
        selectedDocuments.push(d);
        await logExportDecision(base44, user, "export_include", d.id, `Included unrestricted document "${d.title || d.file_name || d.id}" in certified export.`, { reason: "Document not restricted", export_id: exportId }, "info");
        continue;
      }
      const decision = evaluateReleaseAndConsent(classification, ownerReleases, ownerConsents, generatedAtIso);
      if (decision.allowed) {
        selectedDocuments.push(d);
        await logExportDecision(base44, user, "export_include", d.id, `Included RESTRICTED document "${d.title || d.file_name || d.id}" — valid release/consent on file.`, { reason: decision.reason, restriction_reasons: classification.reasons, matched_release: decision.matchedRelease || null, matched_consent: decision.matchedConsent || null, export_id: exportId }, "warning");
      } else if (classification.part2) {
        // 42 CFR Part 2 — block entirely, no placeholder in the export body.
        await logExportDecision(base44, user, "export_block", d.id, `BLOCKED 42 CFR Part 2 document "${d.title || d.file_name || d.id}" from certified export — no active release.`, { reason: decision.reason, restriction_reasons: classification.reasons, export_id: exportId }, "critical");
      } else {
        // Restricted but not Part 2 — redact with a placeholder.
        redactedDocuments.push({ id: d.id, title: d.title || d.file_name || "Restricted document", reasons: classification.reasons });
        await logExportDecision(base44, user, "export_redact", d.id, `REDACTED restricted document "${d.title || d.file_name || d.id}" — no active release on file.`, { reason: decision.reason, restriction_reasons: classification.reasons, export_id: exportId }, "warning");
      }
    }

    const records = [];
    messages.forEach((m, index) => records.push({
      order: records.length + 1,
      type: "message",
      id: m.id,
      timestamp: m.created_date,
      source: m.source,
      summary: `${m.sender_email} to ${m.recipient_email}`,
      body: m.body || "",
      raw: m,
    }));
    selectedDocuments.forEach(d => records.push({
      order: records.length + 1,
      type: "document",
      id: d.id,
      timestamp: d.created_date,
      source: "Secure document vault",
      summary: d.title || d.file_name || "Document",
      body: `${d.category || "document"} · ${d.description || ""}`,
      raw: d,
    }));

    let previousHash = "ROOTED21_CERTIFIED_EXPORT_START";
    const manifest = [];
    for (const record of records) {
      const recordHash = await sha256Hex(JSON.stringify({ previousHash, record }));
      manifest.push({ ...record, previousHash, recordHash });
      previousHash = recordHash;
    }
    const hashChainRoot = previousHash;
    const packetHash = await sha256Hex(JSON.stringify({ exportId, authenticationCode, generatedBy: user.email, generatedAtIso, exportType, recipientType, purpose, threadLabel, dateFrom, dateTo, hashChainRoot, count: records.length }));

    await base44.asServiceRole.entities.CertifiedExportLog.create({
      export_id: exportId,
      authentication_code: authenticationCode,
      export_type: exportType,
      recipient_type: recipientType,
      purpose,
      record_count: records.length,
      document_count: selectedDocuments.length,
      message_count: messages.length,
      date_from: dateFrom || "",
      date_to: dateTo || "",
      thread_label: threadLabel,
      generated_by_email: user.email,
      generated_by_name: user.full_name || user.email,
      generated_at: generatedAtIso,
      packet_hash: packetHash,
      hash_chain_root: hashChainRoot,
      certification_standard: "FRE_902_11_business_record_certification_support",
      legal_notice: "This export is designed to support authentication and business-record certification workflows. Rooted 21 does not guarantee admissibility; consult legal counsel and local court rules.",
    });

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const ML = 16;
    const CW = PW - ML * 2;
    let y = 18;
    const DARK = [27, 68, 44];
    const MID = [88, 140, 100];
    const GOLD = [166, 124, 82];
    const TEXT = [40, 35, 30];
    const MUTED = [110, 100, 88];
    const LIGHT = [245, 237, 226];

    function footer() {
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text(`Rooted 21 Certified Legal Export · ${exportId} · Auth ${authenticationCode}`, ML, PH - 7);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, PW - ML - 18, PH - 7);
    }

    function pageBreak(space = 20) {
      if (y + space > PH - 18) {
        footer();
        doc.addPage();
        y = 18;
      }
    }

    function addLines(text, size = 9, color = TEXT, bold = false) {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ""), CW);
      pageBreak(lines.length * size * 0.5 + 5);
      doc.text(lines, ML, y);
      y += lines.length * size * 0.45 + 4;
    }

    doc.setFillColor(...DARK);
    doc.roundedRect(ML, y, CW, 34, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("CERTIFIED LEGAL EXPORT PACKET", PW / 2, y + 12, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(245, 230, 200);
    doc.text("Tamper-evident · Thread-based · Documented chain of records · FRE 902(11)-style support", PW / 2, y + 21, { align: "center" });
    doc.text("For juvenile dependency, legal counsel, GAL/CASA, court team, or case review preparation", PW / 2, y + 27, { align: "center" });
    y += 44;

    doc.setFillColor(...GOLD);
    doc.roundedRect(PW / 2 - 35, y, 70, 9, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`AUTH CODE ${authenticationCode}`, PW / 2, y + 6, { align: "center" });
    y += 16;

    doc.setFillColor(...LIGHT);
    doc.roundedRect(ML, y, CW, 50, 2, 2, "F");
    const meta = [
      ["Export ID", exportId],
      ["Generated by", `${user.full_name || user.email} (${user.email})`],
      ["Generated at", generatedAt],
      ["Recipient type", recipientType.replace(/_/g, " ")],
      ["Purpose", purpose],
      ["Thread / scope", threadLabel],
      ["Records included", `${records.length} total · ${messages.length} messages · ${selectedDocuments.length} documents`],
      ["Packet SHA-256", packetHash],
      ["Hash-chain root", hashChainRoot],
    ];
    let metaY = y + 6;
    meta.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...MID);
      doc.text(`${label}:`, ML + 3, metaY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      doc.text(doc.splitTextToSize(String(value || "—"), CW - 43), ML + 38, metaY);
      metaY += label.includes("SHA") || label.includes("root") ? 7 : 5;
    });
    y += 60;

    // Prominent message integrity summary
    if (integrity.total > 0) {
      const anyProblem = integrity.altered > 0 || integrity.missing > 0;
      doc.setFillColor(anyProblem ? 250 : 240, anyProblem ? 240 : 247, anyProblem ? 240 : 242);
      doc.setDrawColor(anyProblem ? 192 : 88, anyProblem ? 57 : 140, anyProblem ? 43 : 100);
      doc.setLineWidth(0.5);
      doc.roundedRect(ML, y, CW, 24, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(anyProblem ? 192 : 27, anyProblem ? 57 : 68, anyProblem ? 43 : 44);
      doc.text("MESSAGE INTEGRITY VERIFICATION", ML + 4, y + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...TEXT);
      doc.text(`Total messages: ${integrity.total}   ·   Verified: ${integrity.verified}   ·   Altered: ${integrity.altered}   ·   Missing audit record: ${integrity.missing}`, ML + 4, y + 14);
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text(anyProblem
        ? "One or more messages could not be verified against the tamper-evident audit trail. Review flagged entries in the transcript."
        : "All included messages match their SHA-256 audit-trail hashes recorded at send time.", ML + 4, y + 20);
      y += 30;
    }

    if (includeCertification) {
      addLines("Federal Rule of Evidence 902(11)-Style Certification Support", 11, DARK, true);
      addLines("This packet is prepared to support a business-record certification workflow. It identifies the authenticated user who generated the export, the date and time of generation, selected record scope, ordered records, record-level hashes, a chained integrity root, and a 16-digit authentication code. A qualified custodian or authorized records representative may use this packet to prepare or support a certification that records were made at or near the time by a person with knowledge, kept in the course of a regularly conducted activity, and made as a regular practice of that activity. This tool does not itself guarantee admissibility; admissibility remains subject to attorney review, court rules, and judicial determination.", 8.5, TEXT);
      addLines("Confidentiality Notice", 10, DARK, true);
      addLines("This export may contain confidential child-welfare, juvenile dependency, education, medical, behavioral-health, or family information. Share only with authorized legal counsel, GAL/CASA, court staff, agency staff, or support professionals with appropriate consent or legal authority.", 8.5, TEXT);
    }

    doc.addPage();
    y = 18;
    addLines("Certified Record Manifest", 12, DARK, true);
    addLines(`Records are listed in export order. Each record hash is generated from the previous hash plus the current record payload, creating a tamper-evident chain. Final chain root: ${hashChainRoot}`, 8, MUTED);

    manifest.forEach((record) => {
      pageBreak(32);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...LIGHT);
      doc.roundedRect(ML, y, CW, 28, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...GOLD);
      doc.text(`#${record.order} · ${record.type.toUpperCase()} · ${formatDateTime(record.timestamp)}`, ML + 3, y + 5);
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(doc.splitTextToSize(record.summary || "Record", CW - 6), ML + 3, y + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text(`Source: ${record.source || "Rooted 21"}`, ML + 3, y + 16);
      doc.text(`Record ID: ${record.id}`, ML + 3, y + 20);
      doc.text(`SHA-256: ${record.recordHash.substring(0, 48)}…`, ML + 3, y + 24);
      y += 32;
    });

    if (messages.length > 0) {
      doc.addPage();
      y = 18;
      addLines("Communication Transcript", 12, DARK, true);
      messages.forEach((m, index) => {
        const bodyLines = doc.splitTextToSize(m.body || "", CW - 8);
        const boxHeight = 24 + bodyLines.length * 4;
        pageBreak(boxHeight + 5);
        doc.setFillColor(index % 2 === 0 ? 250 : 242, index % 2 === 0 ? 250 : 248, index % 2 === 0 ? 248 : 242);
        doc.setDrawColor(...LIGHT);
        doc.roundedRect(ML, y, CW, boxHeight, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        doc.text(`${index + 1}. ${m.sender_name || m.sender_email} → ${m.recipient_email || "recipient"}`, ML + 4, y + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...MID);
        doc.text(`${m.source} · ${formatDateTime(m.created_date)} ET · Topic: ${m.topic || "general"}`, ML + 4, y + 11);
        // Integrity badge
        const badgeColor = m._integrity === "VERIFIED" ? MID : [192, 57, 43];
        const badgeText = m._integrity === "VERIFIED" ? "✓ VERIFIED" : m._integrity === "ALTERED" ? "⚠ ALTERED" : "⚠ NO AUDIT RECORD";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...badgeColor);
        doc.text(badgeText, PW - ML - 4, y + 6, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...TEXT);
        doc.text(bodyLines, ML + 4, y + 18);
        y += boxHeight + 4;
      });
    }

    if (selectedDocuments.length > 0) {
      doc.addPage();
      y = 18;
      addLines("Selected Case Documentation Inventory", 12, DARK, true);
      addLines("This section lists selected secure-vault documents and their metadata. Original files remain in the secure document vault and should be produced separately when requested by counsel, GAL/CASA, or the court.", 8, MUTED);
      selectedDocuments.forEach((d, index) => {
        pageBreak(34);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...LIGHT);
        doc.roundedRect(ML, y, CW, 30, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text(`${index + 1}. ${d.title || d.file_name || "Document"}`, ML + 4, y + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...TEXT);
        doc.text(`Category: ${d.category || "other"} · Child: ${d.child_name || "not specified"} · Uploaded: ${formatDateTime(d.created_date)}`, ML + 4, y + 12);
        doc.text(`File: ${d.file_name || "stored file"} · Document ID: ${d.id}`, ML + 4, y + 17);
        const description = doc.splitTextToSize(d.description || d.analysis_summary || "No description provided.", CW - 8);
        doc.text(description, ML + 4, y + 23);
        y += 34;
      });
    }

    if (redactedDocuments.length > 0) {
      pageBreak(20);
      addLines("Restricted Documents — Excluded / Redacted", 12, DARK, true);
      addLines("The following requested documents contain sensitive (behavioral-health, mental-health, therapy, or medical) content and were REDACTED because no active Release of Information or consent was on file for the applicable segment. 42 CFR Part 2 substance-use documents, when restricted, are blocked entirely and are not listed here.", 8, MUTED);
      redactedDocuments.forEach((d, index) => {
        pageBreak(14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(192, 57, 43);
        doc.text(`${index + 1}. ${d.title} — RESTRICTED (no active release on file)`, ML + 2, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(`Reason: ${d.reasons.join(", ")}`, ML + 4, y);
        y += 6;
      });
    }

    doc.addPage();
    y = 18;
    addLines("Closing Certification Page", 12, DARK, true);
    addLines(`Export ${exportId} contains ${records.length} selected record(s), ${messages.length} communication message(s), and ${selectedDocuments.length} document metadata record(s). The ordered manifest hash-chain root is ${hashChainRoot}. The packet hash is ${packetHash}. Authentication code: ${authenticationCode}.`, 9, TEXT);
    addLines("Signature of Requesting Parent/Caregiver", 10, DARK, true);
    y += 8;
    doc.setDrawColor(...MUTED);
    doc.line(ML, y, ML + 82, y);
    doc.line(ML + 102, y, PW - ML, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Signature", ML, y);
    doc.text("Date", ML + 102, y);
    y += 12;
    addLines("Records Custodian / Qualified Certification Use", 10, DARK, true);
    y += 8;
    doc.line(ML, y, ML + 82, y);
    doc.line(ML + 102, y, PW - ML, y);
    y += 5;
    doc.setFontSize(8);
    doc.text("Custodian / Authorized Representative", ML, y);
    doc.text("Date", ML + 102, y);

    footer();
    const pdfBytes = doc.output("arraybuffer");
    const base64 = arrayBufferToBase64(pdfBytes);

    return Response.json({
      success: true,
      base64,
      fileName: `Rooted21-Certified-Legal-Export-${exportId}.pdf`,
      exportId,
      authenticationCode,
      packetHash,
      hashChainRoot,
      summary: { recordCount: records.length, messageCount: messages.length, documentCount: selectedDocuments.length, redactedDocumentCount: redactedDocuments.length },
      integrity,
    });
  } catch (error) {
    console.error("generateCertifiedLegalExport error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});