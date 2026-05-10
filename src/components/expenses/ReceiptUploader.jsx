import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Upload, Loader2, CheckCircle2, X } from "lucide-react";

export default function ReceiptUploader({ partnershipId, onExpenseAdded, onCancel }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  async function handleFileSelect(f) {
    if (!f.type.startsWith('image/')) {
      alert('Please upload an image (JPG, PNG, etc.)');
      return;
    }
    setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    try {
      // Upload file to storage
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadRes.file_url;

      // Analyze receipt
      setAnalyzing(true);
      const analysisRes = await base44.functions.invoke('analyzeReceiptExpense', {
        file_url: fileUrl,
        partnership_id: partnershipId,
      });

      if (analysisRes.data?.success) {
        setResult(analysisRes.data.expense);
        onExpenseAdded(analysisRes.data.expense);
      }
    } catch (error) {
      alert('Failed to analyze receipt: ' + error.message);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl p-5" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 size={22} color={C.midGreen} />
          <div>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Expense Created</p>
            <p className="text-[10px]" style={{ color: C.mutedText }}>${result.total_amount?.toFixed(2)} • {result.category}</p>
          </div>
        </div>
        <button
          onClick={() => { setResult(null); setFile(null); onCancel(); }}
          className="w-full py-2 rounded-lg font-bold text-xs"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />

      {!file ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center gap-3 py-6 rounded-xl border-2 border-dashed transition-all hover:opacity-80"
          style={{ borderColor: C.cream, background: C.offWhite, cursor: "pointer", border: "none" }}
        >
          <Upload size={28} color={C.midGreen} />
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Tap to upload receipt</p>
          <p className="text-[10px]" style={{ color: C.mutedText }}>JPG, PNG or other image format</p>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-lg flex items-center justify-between" style={{ background: C.offWhite }}>
            <p className="text-xs font-bold truncate" style={{ color: C.darkGreen }}>{file.name}</p>
            <button
              onClick={() => { setFile(null); fileInputRef.current && (fileInputRef.current.value = ''); }}
              className="p-1"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <X size={14} color={C.mutedText} />
            </button>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading || analyzing}
            className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: C.darkGreen,
              color: "#fff",
              border: "none",
              cursor: uploading || analyzing ? "default" : "pointer",
              opacity: uploading || analyzing ? 0.7 : 1
            }}
          >
            {uploading || analyzing
              ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
              : <><Upload size={14} /> Analyze Receipt</>
            }
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 rounded-lg font-bold text-xs"
            style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}