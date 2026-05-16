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

    const requestedDocumentIds = Array.isArray(documentIds) ? documentIds : [];
    const selectedDocuments = (exportType === "case_documents" || exportType === "combined_packet")
      ? documents.filter(d => requestedDocumentIds.includes(d.id) && (d.owner_email === user.email || d.created_by === user.email || (d.shared_with || []).includes(user.email)))
      : [];

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
      summary: { recordCount: records.length, messageCount: messages.length, documentCount: selectedDocuments.length },
    });
  } catch (error) {
    console.error("generateCertifiedLegalExport error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});