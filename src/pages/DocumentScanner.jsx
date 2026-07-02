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

  async function handleSave({ title, category, document_record_type, tags, summaryNote, caseId, childName, saveAsNote, addToCalendar, checklistId }) {
    setPhase("saving");

    // Server-side persistence: creates the SecureDocument with server-set trust fields,
    // creates calendar events, and performs case-plan matching/completion + audit history.
    const res = await base44.functions.invoke("saveScannedDocument", {
      title,
      category,
      document_record_type: document_record_type || "parent_record",
      tags,
      summaryNote,
      caseId,
      childName,
      saveAsNote,
      addToCalendar,
      checklistId,
      file_url: fileUrl,
      analysis,
    });

    if (!res.data?.success) {
      setError(res.data?.error || "Failed to save document. Please try again.");
      setPhase("result");
      return;
    }

    const summary = res.data.summary || {};
    setSaveSuccess({ title: summary.title || title, category: summary.category || category, calendarCount: summary.calendarCount || 0, updatedChecklistItems: summary.updatedChecklistItems || 0 });
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