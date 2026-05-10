import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Upload, Loader2, FileText } from "lucide-react";

const SOURCES = [
  { value: "cps",          label: "CPS / Child Protective Services" },
  { value: "court",        label: "Court Order" },
  { value: "professional", label: "Professional / Caseworker" },
  { value: "manual",       label: "Other / I'll type it in" },
];

export default function ChecklistUploader({ onParsed }) {
  const [source, setSource] = useState("cps");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const response = await base44.functions.invoke("parseCasePlanDocument", { file_url, source });

    if (response.data?.success) {
      onParsed({
        source,
        source_document_url: file_url,
        source_document_name: file.name,
        title: response.data.title,
        summary: response.data.summary,
        rawItems: response.data.items || [],
      });
    } else {
      setError(response.data?.error || "Could not read the document. Please try a clearer scan.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-extrabold tracking-wider mb-1.5" style={{ color: C.mutedText }}>
          WHO SENT THIS CASE PLAN?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SOURCES.map(s => (
            <button key={s.value} onClick={() => setSource(s.value)}
              className="py-2.5 px-3 rounded-xl text-[11px] font-bold text-left transition-all"
              style={{
                background: source === s.value ? C.darkGreen : C.offWhite,
                color: source === s.value ? "#fff" : C.darkGreen,
                border: `1.5px solid ${source === s.value ? C.darkGreen : C.cream}`,
                cursor: "pointer",
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* File drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="rounded-2xl p-6 text-center cursor-pointer transition-all"
        style={{
          background: file ? "#EAF4EA" : C.offWhite,
          border: `2px dashed ${file ? C.midGreen : C.cream}`,
        }}>
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileText size={18} color={C.midGreen} />
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{file.name}</p>
          </div>
        ) : (
          <>
            <Upload size={22} color={C.midGreen} className="mx-auto mb-2" />
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Tap to upload your case plan</p>
            <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>PDF, photo, or image · The AI will read it</p>
          </>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.heic" className="hidden"
          onChange={e => setFile(e.target.files[0])} />
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "#FDECEC", color: "#C0392B" }}>{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
        style={{
          background: file && !uploading ? C.darkGreen : C.mutedText,
          color: "#fff", border: "none",
          cursor: file && !uploading ? "pointer" : "not-allowed",
          opacity: uploading ? 0.8 : 1,
        }}>
        {uploading
          ? <><Loader2 size={16} className="animate-spin" /> Reading your case plan…</>
          : <><Upload size={16} /> Analyze & Build Checklist</>}
      </button>

      {uploading && (
        <p className="text-center text-[11px]" style={{ color: C.mutedText }}>
          The AI is reading your document and extracting every task you need to complete. This takes about 15 seconds…
        </p>
      )}
    </div>
  );
}