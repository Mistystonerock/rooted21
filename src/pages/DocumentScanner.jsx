import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import ScanUploader from "@/components/scanner/ScanUploader";
import ScanAnalysisResult from "@/components/scanner/ScanAnalysisResult";

export default function DocumentScanner() {
  const [phase, setPhase] = useState("upload"); // upload | analyzing | result | saving
  const [fileUrl, setFileUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [documentHint, setDocumentHint] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  async function handleFileReady(uploadedUrl, localPreview) {
    setFileUrl(uploadedUrl);
    setPreviewUrl(localPreview);
    if (uploadedUrl) {
      await handleAnalyze(uploadedUrl);
    }
  }

  async function handleAnalyze(uploadedUrl = fileUrl) {
    if (!uploadedUrl) return;
    setPhase("analyzing");
    setError(null);

    const res = await base44.functions.invoke("analyzeDocumentScan", {
      file_url: uploadedUrl,
      document_hint: documentHint,
    });

    if (res.data?.success && res.data?.analysis) {
      setAnalysis(res.data.analysis);
      setPhase("result");
    } else {
      setError(res.data?.error || "Analysis failed. Please try again.");
      setPhase("upload");
    }
  }

  function handleReset() {
    setPhase("upload");
    setFileUrl(null);
    setPreviewUrl(null);
    setDocumentHint("");
    setAnalysis(null);
    setError(null);
    setSaveSuccess(null);
  }

  function mapEventType(item, category) {
    const type = item?.event_type;
    const allowed = ["school_meeting", "medication", "therapy", "court_date", "appointment", "activity", "other"];
    if (allowed.includes(type)) return type;
    if (category === "court_order" || category === "legal") return "court_date";
    if (category === "iep" || category === "school") return "school_meeting";
    if (category === "medical") return "appointment";
    if (category === "therapy") return "therapy";
    return "other";
  }

  async function createCalendarEvents({ user, title, category, childName, documentId, addToCalendar }) {
    const items = addToCalendar ? (analysis?.calendar_items || []) : [];
    const created = [];
    for (const item of items) {
      if (!item?.date || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) continue;
      const event = await base44.entities.CareCalendarEvent.create({
        title: item.title || item.requirement || `${title} deadline`,
        event_type: mapEventType(item, category),
        date: item.date,
        time: item.time || "",
        location: item.location || "",
        notes: `${item.notes || item.requirement || "Extracted from scanned document."}\n\nSource document: ${title}\nDocument ID: ${documentId}`,
        status: "pending",
        family_email: user.email,
        added_by_email: user.email,
        added_by_name: user.full_name || user.email,
        recurrence: "none",
        child_name: childName || "",
      });
      created.push(event.id);
    }
    return created;
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function itemMatchesScan(item) {
    const scanText = normalizeText([
      analysis?.extracted_text,
      analysis?.summary_note,
      ...(analysis?.key_data?.action_items || []),
      ...(analysis?.requirements || []),
    ].join(" "));
    const itemText = normalizeText(item.text);
    if (!scanText || !itemText) return false;
    if (scanText.includes(itemText) || itemText.includes(scanText.slice(0, 80))) return true;
    const keywords = itemText.split(" ").filter(word => word.length > 4);
    return keywords.length >= 2 && keywords.filter(word => scanText.includes(word)).length >= Math.min(3, keywords.length);
  }

  async function updateCasePlanFromScan({ checklistId, fileUrl, title }) {
    if (!checklistId) return 0;
    const [checklist] = await base44.entities.CasePlanChecklist.filter({ id: checklistId }, "-created_date", 1);
    const items = (checklist.items || []).map(item => {
      if (item.completed || !itemMatchesScan(item)) return item;
      return {
        ...item,
        completed: true,
        completed_date: new Date().toISOString(),
        proof_url: fileUrl,
        proof_filename: title,
        notes: item.notes || "Completed from scanned document findings.",
      };
    });
    const updatedCount = items.filter((item, idx) => item.completed && !checklist.items[idx]?.completed).length;
    if (updatedCount === 0) return 0;
    await base44.entities.CasePlanChecklist.update(checklistId, {
      items,
      status: items.every(item => item.completed) ? "completed" : "active",
    });
    return updatedCount;
  }

  async function handleSave({ title, category, document_record_type, tags, summaryNote, caseId, childName, saveAsNote, addToCalendar, checklistId }) {
    setPhase("saving");
    const user = await base44.auth.me();

    // Save as SecureDocument
    const newDoc = await base44.entities.SecureDocument.create({
      owner_email: user.email,
      title,
      category,
      document_record_type: document_record_type || "parent_record",
      permission_granularity: "document_level",
      tags,
      description: summaryNote,
      file_url: fileUrl,
      file_name: `scan-${Date.now()}.jpg`,
      child_name: childName || "",
      case_id: caseId || "",
      is_private: true,
      scanner_source: true,
      analysis_summary: summaryNote,
      extracted_dates: analysis?.key_data?.dates || [],
      extracted_requirements: analysis?.key_data?.action_items || [],
    });

    const calendarEventIds = await createCalendarEvents({ user, title, category, childName, documentId: newDoc.id, addToCalendar });
    if (calendarEventIds.length > 0) {
      await base44.entities.SecureDocument.update(newDoc.id, { calendar_event_ids: calendarEventIds });
    }

    const updatedChecklistItems = await updateCasePlanFromScan({ checklistId, fileUrl, title });

    // Optionally also save as a CaseNote
    if (saveAsNote && caseId) {
      await base44.entities.CaseNote.create({
        case_id: caseId,
        author_email: user.email,
        author_name: user.full_name || user.email,
        author_role: "parent",
        note_type: "update",
        title: `[Scanned] ${title}`,
        body: `${summaryNote}\n\n---\n**AI-Extracted Text:**\n${analysis.extracted_text || ""}`,
        visible_to_team: true,
      });
    }

    setSaveSuccess({ title, category, calendarCount: calendarEventIds.length, updatedChecklistItems });
    setPhase("result");
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Document Scanner"
        subtitle="Camera capture, AI analysis & case plan updates"
        backTo="/documents"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>📷 Scan Any Document</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Take a photo or upload an image of any court letter, case plan, IEP, school report, medication label, or medical record. AI will read it automatically and can update matching case plan tasks.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl p-3 flex gap-2 items-start"
            style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
            <span>⚠️</span>
            <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
          </div>
        )}

        {/* Save success banner */}
        {saveSuccess && (
          <div className="rounded-xl p-3 flex gap-2 items-start"
            style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}` }}>
            <span>✅</span>
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
              "{saveSuccess.title}" saved to Secure Documents{saveSuccess.calendarCount ? `, ${saveSuccess.calendarCount} reminder${saveSuccess.calendarCount !== 1 ? "s" : ""} added to Care Calendar` : ""}{saveSuccess.updatedChecklistItems ? `, and ${saveSuccess.updatedChecklistItems} case plan item${saveSuccess.updatedChecklistItems !== 1 ? "s" : ""} marked complete` : ""}.
            </p>
          </div>
        )}

        {/* Upload phase */}
        {(phase === "upload" || phase === "analyzing") && (
          <ScanUploader
            previewUrl={previewUrl}
            documentHint={documentHint}
            onFileReady={handleFileReady}
            onHintChange={setDocumentHint}
            onAnalyze={handleAnalyze}
            analyzing={phase === "analyzing"}
            hasFile={!!fileUrl}
          />
        )}

        {/* Result phase */}
        {phase === "result" && analysis && (
          <ScanAnalysisResult
            analysis={analysis}
            previewUrl={previewUrl}
            onSave={handleSave}
            onRescan={handleReset}
            saving={phase === "saving"}
          />
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}