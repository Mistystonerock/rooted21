import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Camera, Upload, Loader2, Scan } from "lucide-react";

const HINT_SUGGESTIONS = [
  "Court letter", "IEP document", "Medication label", "School report card",
  "Medical referral", "Therapy notes", "Lab results", "Legal notice",
];

export default function ScanUploader({
  previewUrl, documentHint, onFileReady, onHintChange, onAnalyze, analyzing, hasFile
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onFileReady(file_url, localPreview);
    setUploading(false);
  }

  const busy = uploading || analyzing;

  return (
    <div className="space-y-4">
      {/* Image preview or drop zone */}
      {previewUrl ? (
        <div className="rounded-2xl overflow-hidden relative" style={{ border: `2px solid ${C.midGreen}` }}>
          <img src={previewUrl} alt="Document preview" className="w-full object-contain max-h-64" />
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold"
            style={{ background: C.darkGreen, color: "#fff" }}>
            ✓ Ready
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl flex flex-col items-center justify-center py-10 gap-3 cursor-pointer transition-all hover:opacity-80"
          style={{ border: `2px dashed ${C.midGreen}`, background: C.white }}
        >
          <Upload size={32} color={C.midGreen} />
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Tap to upload an image</p>
          <p className="text-[10px]" style={{ color: C.mutedText }}>JPG, PNG, HEIC — up to 10MB</p>
        </div>
      )}

      {/* Upload / camera buttons */}
      {!previewUrl && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.white, border: `1.5px solid ${C.cream}`, color: C.darkGreen, cursor: "pointer" }}
          >
            <Upload size={15} /> Upload File
          </button>
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={busy}
            className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.darkGreen, border: "none", color: "#fff", cursor: "pointer" }}
          >
            <Camera size={15} /> Take Photo
          </button>
        </div>
      )}

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => handleFile(e.target.files?.[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => handleFile(e.target.files?.[0])} />

      {/* Document hint */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <label className="block text-[10px] font-bold" style={{ color: C.mutedText }}>
          DOCUMENT TYPE HINT (optional — helps AI accuracy)
        </label>
        <input
          value={documentHint}
          onChange={e => onHintChange(e.target.value)}
          placeholder="e.g. medication label, court letter…"
          className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
          style={{ borderColor: C.cream, background: C.offWhite }}
        />
        <div className="flex flex-wrap gap-1.5 mt-1">
          {HINT_SUGGESTIONS.map(h => (
            <button key={h} onClick={() => onHintChange(h)}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
              style={{
                background: documentHint === h ? C.darkGreen : C.offWhite,
                color: documentHint === h ? "#fff" : C.darkGreen,
                border: `1px solid ${documentHint === h ? C.darkGreen : C.cream}`,
                cursor: "pointer",
              }}>
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Uploading state */}
      {uploading && (
        <div className="flex items-center gap-2 justify-center py-2">
          <Loader2 size={15} className="animate-spin" color={C.midGreen} />
          <p className="text-xs font-bold" style={{ color: C.midGreen }}>Uploading image…</p>
        </div>
      )}

      {/* Analyze button */}
      {hasFile && !uploading && (
        <>
          <button
            onClick={onAnalyze}
            disabled={analyzing}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: C.darkGreen, color: "#fff", border: "none",
              cursor: analyzing ? "not-allowed" : "pointer",
              opacity: analyzing ? 0.75 : 1,
            }}
          >
            {analyzing ? (
              <><Loader2 size={17} className="animate-spin" /> Analyzing with AI…</>
            ) : (
              <><Scan size={17} /> Analyze Document</>
            )}
          </button>
          {analyzing && (
            <p className="text-center text-[11px]" style={{ color: C.mutedText }}>
              Reading text and extracting key data… this takes 10–20 seconds.
            </p>
          )}
          {!analyzing && (
            <button
              onClick={() => { onFileReady(null, null); }}
              className="w-full text-center text-[11px] font-bold"
              style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedText }}
            >
              ✕ Remove image and start over
            </button>
          )}
        </>
      )}
    </div>
  );
}