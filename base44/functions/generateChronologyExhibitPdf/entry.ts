import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";
import { jsPDF } from "npm:jspdf@4.2.1";

function safeStr(v) { return v == null ? "" : String(v); }

async function sha256Hex(input) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(input || "")));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── P1-D-1 restricted-document detection ───────────────────────
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
    return { allowed: true, via: "release", matchedRelease: activeRelease.id, reason: `Valid active release covers segment: ${seg}` };
  }

  const matchingConsent = consents.find(c => {
    if (c.allowed !== true) return false;
    const dc = String(c.data_category || "").toLowerCase();
    return dc.includes(seg) || (cat && dc.includes(cat)) || dc.includes("behavioral") || dc.includes("substance");
  });
  if (matchingConsent) {
    return { allowed: true, via: "consent", matchedConsent: matchingConsent.id, reason: `ConsentPermission ${matchingConsent.id} allows category` };
  }

  return { allowed: false, via: null, reason: "No active ReleaseOfInformation or ConsentPermission on file for this restriction segment/category" };
}

async function logExportDecision(base44, user, action, resourceId, summary, metadata, severity) {
  await base44.asServiceRole.entities.RootedAuditEvent.create({
    actor_email: user.email,
    actor_role: user.role || "user",
    event_type: action === "message_integrity_check" ? "data_export" : "document_export",
    entity_name: action === "message_integrity_check" ? "EvidenceTimelineItem" : "SecureDocument",
    entity_id: resourceId || "",
    severity: severity || "info",
    summary,
    metadata_json: JSON.stringify({ action, ...metadata }),
    occurred_at: new Date().toISOString(),
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Client may pass advisory filters only — no evidence content, dates, or IDs of record content.
    const body = await req.json().catch(() => ({}));
    const childName = safeStr(body?.childName || "").trim();
    const category = safeStr(body?.category || "").trim();

    // ── Server generates identity, IDs, timestamps, disclaimer ──
    const reportId = `R21-EXH-${Date.now().toString(36).toUpperCase()}`;
    const nowIso = new Date().toISOString();
    const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "long" });

    // ── Read trusted records directly, scoped to authenticated user ──
    const [itemsRaw, docsRaw, releasesRaw, consentsRaw] = await Promise.all([
      base44.asServiceRole.entities.EvidenceTimelineItem.filter({ owner_email: user.email }, "event_date", 500).catch(() => []),
      base44.asServiceRole.entities.SecureDocument.filter({ owner_email: user.email }, "-created_date", 300).catch(() => []),
      base44.asServiceRole.entities.ReleaseOfInformation.filter({ owner_email: user.email }).catch(() => []),
      base44.asServiceRole.entities.ConsentPermission.filter({ owner_email: user.email }).catch(() => []),
    ]);

    const now = new Date(nowIso);
    const ownerReleases = (releasesRaw || []).filter(r => {
      if (r.is_deleted === true) return false;
      if (r.status !== "active") return false;
      if (r.revoked_at) return false;
      if (r.expires_at && new Date(r.expires_at) < now) return false;
      if (r.starts_at && new Date(r.starts_at) > now) return false;
      return true;
    });

    const ownedDocs = (docsRaw || []).filter(d => d.owner_email === user.email && d.is_deleted !== true);
    const docsById = Object.fromEntries(ownedDocs.map(d => [d.id, d]));

    // Server re-applies advisory filters against its own trusted reads.
    const items = (itemsRaw || []).filter(item => {
      if (childName && safeStr(item.child_name).toLowerCase() !== childName.toLowerCase()) return false;
      if (category && category !== "all" && !(item.case_categories || []).includes(category)) return false;
      return true;
    });

    // ── Message integrity verification (P1-C / P1-D-1) for message evidence ──
    const integrity = { total: 0, verified: 0, altered: 0, missing: 0 };
    for (const item of items) {
      if (item.evidence_type === "message" && item.message_text) {
        integrity.total += 1;
        const recomputed = await sha256Hex(item.message_text);
        const auditLogs = await base44.asServiceRole.entities.MessageAuditLog.filter({ message_id: item.id }).catch(() => []);
        const auditEntry = (auditLogs || []).find(a => a.action === "sent") || (auditLogs || [])[0];
        if (!auditEntry || !auditEntry.content_hash) {
          item._integrity = "MISSING_AUDIT_RECORD";
          integrity.missing += 1;
        } else if (auditEntry.content_hash === recomputed) {
          item._integrity = "VERIFIED";
          integrity.verified += 1;
        } else {
          item._integrity = "ALTERED";
          integrity.altered += 1;
        }
      }
    }
    if (integrity.total > 0) {
      await logExportDecision(base44, user, "message_integrity_check", "", `Message integrity check for chronology exhibit ${reportId}: ${integrity.verified} verified, ${integrity.altered} altered, ${integrity.missing} missing (of ${integrity.total}).`, { report_id: reportId, ...integrity }, integrity.altered > 0 ? "critical" : "info");
    }

    // ── P1-D-1 gating for cross-referenced SecureDocuments ──
    const documentsSummary = { total: 0, included: 0, blocked: 0, redacted: 0, allowed_with_release: 0 };
    // allowedDocIds: docs safe to cross-reference in the exhibit
    const allowedDocIds = new Set();
    const referencedDocIds = new Set();
    items.forEach(item => (item.related_document_ids || []).forEach(id => { if (docsById[id]) referencedDocIds.add(id); }));

    for (const docId of referencedDocIds) {
      const d = docsById[docId];
      documentsSummary.total += 1;
      const classification = classifyDocumentRestriction(d);
      if (!classification.restricted) {
        allowedDocIds.add(docId);
        documentsSummary.included += 1;
        await logExportDecision(base44, user, "export_include", docId, `Included unrestricted cross-referenced document "${d.title || d.file_name || docId}" in chronology exhibit ${reportId}.`, { report_id: reportId, reason: "Document not restricted" }, "info");
        continue;
      }
      const decision = evaluateReleaseAndConsent(classification, ownerReleases, consentsRaw, nowIso);
      if (decision.allowed) {
        allowedDocIds.add(docId);
        documentsSummary.allowed_with_release += 1;
        await logExportDecision(base44, user, "export_allow_with_release", docId, `Restricted cross-referenced document included "${d.title || d.file_name || docId}" — ${decision.reason}.`, { report_id: reportId, reason: decision.reason, restriction_reasons: classification.reasons, release_id: decision.matchedRelease || null, matched_consent: decision.matchedConsent || null }, "info");
      } else if (classification.part2) {
        documentsSummary.blocked += 1;
        await logExportDecision(base44, user, "export_block", docId, `Blocked cross-referenced document "${d.title || d.file_name || docId}" — 42 CFR Part 2, no active release.`, { report_id: reportId, reason: "42 CFR Part 2 document blocked — no active release on file", restriction_reasons: classification.reasons }, "warning");
      } else {
        documentsSummary.redacted += 1;
        await logExportDecision(base44, user, "export_redact", docId, `Redacted cross-referenced document "${d.title || d.file_name || docId}" — restricted, no active release.`, { report_id: reportId, reason: "Document redacted — restricted segment removed", restriction_reasons: classification.reasons }, "warning");
      }
    }

    // ── PDF (all text/numbering server-owned) ──
    const doc = new jsPDF();
    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Chronology Exhibit", 14, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`Report ID: ${reportId}  ·  Generated: ${generatedAt} ET`, 14, y);
    y += 6;
    doc.setTextColor(30, 30, 30);
    const disclaimer = "Prepared server-side from the Rooted 21 Evidence Timeline. Exhibit numbering, dates, and cross-references are generated from stored records. Verify all documents, filing requirements, admissibility rules, and exhibit formatting with the court clerk, attorney, legal aid, or official court website before filing.";
    const dLines = doc.splitTextToSize(disclaimer, 180);
    doc.text(dLines, 14, y);
    y += dLines.length * 5 + 4;

    // Server-assigned exhibit numbering
    items.forEach((item, index) => {
      if (y > 260) { doc.addPage(); y = 18; }
      const exhibitNo = index + 1;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Exhibit ${exhibitNo}: ${safeStr(item.title)}`, 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Date: ${safeStr(item.event_date)}${item.event_time ? ` · Time: ${item.event_time}` : ""} · Type: ${safeStr(item.evidence_type)}`, 14, y);
      y += 5;
      doc.text(`Categories: ${(item.case_categories || []).join(", ") || "None"}`, 14, y);
      y += 5;
      const sumLines = doc.splitTextToSize(`Summary: ${safeStr(item.summary)}`, 180);
      doc.text(sumLines, 14, y);
      y += sumLines.length * 5;

      if (item.evidence_type === "message" && item.message_text) {
        const badge = item._integrity === "VERIFIED" ? "[VERIFIED]" : item._integrity === "ALTERED" ? "[ALTERED]" : "[NO AUDIT RECORD]";
        const mLines = doc.splitTextToSize(`Message/Text ${badge}: ${safeStr(item.message_text)}`, 180);
        doc.text(mLines, 14, y + 1);
        y += mLines.length * 5 + 1;
      }
      if (item.file_name) {
        doc.text(`Evidence file: ${safeStr(item.file_name)}`, 14, y + 1);
        y += 6;
      }

      const linked = (item.related_document_ids || []).filter(id => allowedDocIds.has(id)).map(id => docsById[id]);
      const withheldCount = (item.related_document_ids || []).filter(id => referencedDocIds.has(id) && !allowedDocIds.has(id)).length;
      if (linked.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Cross-referenced court documents:", 14, y + 1);
        y += 6;
        doc.setFont("helvetica", "normal");
        linked.forEach(ref => {
          const line = doc.splitTextToSize(`• ${safeStr(ref.title)}${ref.category ? ` (${ref.category})` : ""}${ref.court_case_number ? ` · Case ${ref.court_case_number}` : ""}`, 172);
          doc.text(line, 18, y);
          y += line.length * 5;
        });
      }
      if (withheldCount > 0) {
        doc.setTextColor(184, 76, 42);
        doc.text(`• ${withheldCount} restricted document(s) withheld (no active release on file).`, 18, y);
        doc.setTextColor(30, 30, 30);
        y += 6;
      }
      y += 7;
    });

    if (items.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("No evidence timeline items found for the selected filters.", 14, y);
    }

    const pdfBytes = doc.output("arraybuffer");
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // TEMP P1-D-2 QA: search decoded PDF text for markers, return compact booleans only. Removed after QA.
    let _qaMarkers = undefined;
    if (body?.__qaDecode === true) {
      const pdfText = new TextDecoder("latin1").decode(new Uint8Array(pdfBytes));
      _qaMarkers = {
        sud_marker_present: pdfText.includes("SUDSECRETMARKER") || pdfText.includes("MATCONFIDENTIAL") || pdfText.includes("SUD Treatment"),
        bh_marker_present: pdfText.includes("BHSECRETMARKER") || pdfText.includes("BHCONFIDENTIAL") || pdfText.includes("Behavioral Health Therapy"),
        court_marker_present: pdfText.includes("COURTPUBLICMARKER") || pdfText.includes("Court Order Custody"),
        court_case_present: pdfText.includes("P1DTEST-2026-CV-001"),
        withheld_line_present: pdfText.includes("restricted document") && pdfText.includes("withheld"),
      };
      console.log("QA_MARKERS " + JSON.stringify(_qaMarkers));
    }

    // ── Summary audit ──
    await base44.asServiceRole.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "document_export",
      entity_name: "EvidenceTimelineItem",
      entity_id: "",
      severity: documentsSummary.blocked > 0 || integrity.altered > 0 ? "warning" : "info",
      summary: `Generated Chronology Exhibit PDF ${reportId} — ${items.length} exhibit(s), documents: ${JSON.stringify(documentsSummary)}.`,
      metadata_json: JSON.stringify({ action: "chronology_exhibit_export", report_id: reportId, exhibit_count: items.length, documents_summary: documentsSummary, integrity, child_name: childName || "all", category: category || "all" }),
      occurred_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      _qaMarkers,
      reportId,
      summary: { exhibits: items.length },
      documents_summary: documentsSummary,
      integrity,
      fileName: `chronology-exhibit-${nowIso.slice(0, 10)}.pdf`,
      base64,
    });
  } catch (error) {
    console.error("generateChronologyExhibitPdf error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});