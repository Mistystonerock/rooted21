import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Step 1: Generate the certified legal export
    const exportResponse = await base44.functions.invoke("generateCertifiedLegalExport", {
      recipient_role: "court",
    });
    const exportResult = exportResponse.data;

    if (!exportResult || !exportResult.success || !exportResult.base64) {
      return Response.json({ error: "Export failed", detail: exportResult });
    }

    // Step 2: Decode the full base64 PDF to binary
    const binary = atob(exportResult.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pdfText = binary; // latin1 equivalent

    // Step 3: Extract readable text from PDF streams
    const textChunks = [];
    const regex = /\(([^)]*)\)\s*Tj/g;
    let match;
    while ((match = regex.exec(pdfText)) !== null) {
      textChunks.push(match[1]);
    }
    const tjRegex = /\[([^\]]*)\]\s*TJ/g;
    while ((match = tjRegex.exec(pdfText)) !== null) {
      const inner = match[1].match(/\(([^)]*)\)/g);
      if (inner) {
        inner.forEach((m) => textChunks.push(m.replace(/[()]/g, "")));
      }
    }
    const fullText = textChunks.join(" ");

    // Step 4: Search for specific strings
    const searchTerms = [
      "P1-D-1 TEST",
      "SUD Treatment Record",
      "Substance Use",
      "42 CFR",
      "Part 2",
      "Therapy Notes",
      "Behavioral Health",
      "Test — SUD Treatment Record (42 CFR Part 2, Restricted)",
      "Test — Therapy Notes (Behavioral Health, Restricted)",
      "Test — Court Order (Unrestricted)",
      "REDACTED",
      "redacted",
      "blocked",
      "no active release",
      "restricted segment removed",
      "summary included",
      "blocked document",
      "document omitted",
      "content withheld",
      "42 CFR Part 2 document blocked",
      "Behavioral health document blocked",
      "This document has been blocked",
      "This document has been redacted",
      "Content not available",
      "Document excluded",
      "Restricted content",
      "methadone",
      "buprenorphine",
      "naltrexone",
      "overdose",
      "relapse prevention",
      "cognitive behavioral therapy",
      "exposure therapy",
      "trauma processing",
      "anxiety management",
      "depression screening",
    ];

    const findings = {};
    const lowerFull = fullText.toLowerCase();
    for (const term of searchTerms) {
      const idx = lowerFull.indexOf(term.toLowerCase());
      const found = idx !== -1;
      findings[term] = found;
      if (found) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(fullText.length, idx + term.length + 40);
        findings[term + "__context"] = fullText.substring(start, end);
      }
    }

    return Response.json({
      exportId: exportResult.id || exportResult.exportId || "unknown",
      pdfSizeBytes: bytes.length,
      totalTextLength: fullText.length,
      fullText: fullText.substring(0, 5000),
      findings,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});