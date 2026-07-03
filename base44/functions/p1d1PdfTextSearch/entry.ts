import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";
import { jsPDF } from "npm:jspdf@4.2.1";

async function sha256Hex(input) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(input || "")));
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const SENSITIVE_TAG_PATTERNS = ["behavioral", "behavioral-health", "behavioral_health", "mental", "mental-health", "mental_health", "therapy", "therapist", "counseling", "psych", "substance", "substance-use", "substance_use", "sud", "mat", "detox", "rehab", "addiction", "part2", "part 2", "42 cfr"];
const SENSITIVE_CATEGORIES = ["medical", "therapy", "behavioral_health", "substance_use"];
const SENSITIVE_RECORD_TYPES = ["medical_record", "behavioral_health_record"];

function classifyDocumentRestriction(docItem) {
  const part2 = docItem.part2_segmented === true;
  const segment = String(docItem.permission_segment || "general").toLowerCase();
  const segmentRestricted = segment && segment !== "general";
  const tags = (docItem.tags || []).map((t) => String(t).toLowerCase());
  const tagRestricted = tags.some((t) => SENSITIVE_TAG_PATTERNS.some((p) => t.includes(p)));
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

function evaluateReleaseAndConsent(classification, releases, consents, nowIso, recipientRole) {
  const now = new Date(nowIso);
  const seg = classification.segment;
  const cat = classification.category;
  const role = String(recipientRole || "").toLowerCase();
  const activeRelease = releases.find((r) => {
    if (r.status !== "active") return false;
    if (r.revoked_at) return false;
    const exp = r.expires_at ? new Date(r.expires_at) : null;
    if (exp && exp < now) return false;
    if (role && r.recipient_role && String(r.recipient_role).toLowerCase() !== role) return false;
    const allowed = (r.allowed_segments || []).map((s) => String(s).toLowerCase());
    return allowed.includes(seg) || (cat && allowed.includes(cat)) || allowed.includes("all");
  });
  if (activeRelease) return { allowed: true, via: "release" };
  const matchingConsent = consents.find((c) => {
    if (c.allowed !== true) return false;
    const dc = String(c.data_category || "").toLowerCase();
    return dc.includes(seg) || (cat && dc.includes(cat)) || dc.includes("behavioral") || dc.includes("substance");
  });
  if (matchingConsent) return { allowed: true, via: "consent" };
  return { allowed: false, via: null };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const recipientRole = "court";
    const nowIso = new Date().toISOString();

    // Select documents owned by the caller (combined_packet behavior).
    const documents = await base44.entities.SecureDocument.list("-created_date", 500);
    const ownedDocuments = documents.filter((d) => d.owner_email === user.email || d.created_by === user.email || (d.shared_with || []).includes(user.email));

    const [ownerReleases, ownerConsents] = await Promise.all([
      base44.asServiceRole.entities.ReleaseOfInformation.filter({ owner_email: user.email }).catch(() => []),
      base44.asServiceRole.entities.ConsentPermission.filter({ owner_email: user.email }).catch(() => []),
    ]);

    const selectedDocuments = [];
    const redactedDocuments = [];
    for (const d of ownedDocuments) {
      const classification = classifyDocumentRestriction(d);
      if (!classification.restricted) {
        selectedDocuments.push(d);
        continue;
      }
      const decision = evaluateReleaseAndConsent(classification, ownerReleases, ownerConsents, nowIso, recipientRole);
      if (decision.allowed) {
        selectedDocuments.push(d);
      } else if (classification.part2) {
        // blocked entirely — not listed
      } else {
        redactedDocuments.push({ id: d.id, title: d.title || d.file_name || "Restricted document", reasons: classification.reasons });
      }
    }

    // Build a PDF mirroring the export's document sections.
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const ML = 16;
    const CW = PW - ML * 2;
    let y = 18;

    function line(text, size = 9) {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(String(text || ""), CW);
      if (y > 270) { doc.addPage(); y = 18; }
      doc.text(lines, ML, y);
      y += lines.length * size * 0.5 + 4;
    }

    line("CERTIFIED LEGAL EXPORT PACKET (P1-D-1 test render)", 14);
    line("Selected Case Documentation Inventory", 12);
    selectedDocuments.forEach((d, i) => {
      line(`${i + 1}. ${d.title || d.file_name || "Document"}`, 9);
      line(`Category: ${d.category || "other"} · Document ID: ${d.id}`, 8);
      line(d.description || d.analysis_summary || "No description provided.", 8);
    });

    if (redactedDocuments.length > 0) {
      line("Restricted Documents — Excluded / Redacted", 12);
      redactedDocuments.forEach((d, i) => {
        line(`${i + 1}. ${d.title} — RESTRICTED (no active release on file)`, 9);
        line("[REDACTED — Restricted content removed. Requires valid release for full access.]", 8);
        line(`Reason: ${d.reasons.join(", ")}`, 8);
      });
    }

    const pdfBytes = doc.output("arraybuffer");
    const bytes = new Uint8Array(pdfBytes);

    // Extract text from the generated PDF.
    let pdfText = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      pdfText += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }

    const textChunks = [];
    const regex = /\(([^)]*)\)\s*Tj/g;
    let match;
    while ((match = regex.exec(pdfText)) !== null) textChunks.push(match[1]);
    const tjRegex = /\[([^\]]*)\]\s*TJ/g;
    while ((match = tjRegex.exec(pdfText)) !== null) {
      const inner = match[1].match(/\(([^)]*)\)/g);
      if (inner) inner.forEach((m) => textChunks.push(m.replace(/[()]/g, "")));
    }
    const fullText = textChunks.join(" ");

    const searchTerms = [
      "P1-D-1", "SUD Treatment", "Substance Use", "42 CFR", "Part 2",
      "Therapy Notes", "Behavioral Health", "Court Order",
      "REDACTED", "redacted", "blocked", "no active release",
      "restricted segment", "blocked document", "document omitted",
      "content withheld", "Document excluded", "Restricted content",
      "methadone", "buprenorphine", "naltrexone", "overdose",
      "relapse prevention", "cognitive behavioral", "exposure therapy",
      "trauma processing", "anxiety management", "depression screening",
      "Test — SUD", "Test — Therapy", "Test — Court",
    ];

    const findings = {};
    const lowerFull = fullText.toLowerCase();
    for (const term of searchTerms) {
      const idx = lowerFull.indexOf(term.toLowerCase());
      if (idx >= 0) {
        const start = Math.max(0, idx - 50);
        const end = Math.min(fullText.length, idx + term.length + 50);
        findings[term] = { found: true, context: fullText.substring(start, end) };
      } else {
        findings[term] = { found: false };
      }
    }

    return Response.json({
      selectedCount: selectedDocuments.length,
      redactedCount: redactedDocuments.length,
      selectedTitles: selectedDocuments.map((d) => d.title || d.file_name || d.id),
      redactedTitles: redactedDocuments.map((d) => d.title),
      pdfSizeBytes: bytes.length,
      totalTextLength: fullText.length,
      fullTextPreview: fullText.substring(0, 3000),
      findings,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});