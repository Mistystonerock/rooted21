import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Upload, Loader2, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import DocumentAnalysisPreview from "@/components/documents/DocumentAnalysisPreview";
import DocumentCalendarSyncPanel from "@/components/documents/DocumentCalendarSyncPanel";

const CATEGORIES = [
  { value: "court_order", label: "Court Order", segment: "legal" },
  { value: "iep", label: "IEP / 504 School Plan", segment: "education" },
  { value: "medical", label: "Medical Record", segment: "medical" },
  { value: "behavioral_health", label: "Behavioral Health Record", segment: "behavioral_health" },
  { value: "substance_use", label: "Substance Use / 42 CFR Part 2", segment: "substance_use", part2: true },
  { value: "safety_plan", label: "Safety Plan", segment: "safety" },
  { value: "case_plan", label: "Case Plan", segment: "legal" },
  { value: "visitation", label: "Visitation Log", segment: "general" },
  { value: "resource_referral", label: "Resource Referral", segment: "general" },
  { value: "legal", label: "Legal Document", segment: "legal" },
  { value: "school", label: "School Document", segment: "education" },
  { value: "therapy", label: "Therapy Record", segment: "behavioral_health" },
  { value: "financial", label: "Financial", segment: "general" },
  { value: "other", label: "Other", segment: "general" },
];

export default function DocumentUploadModal({ user, onDocumentUploaded, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    tags: [],
    child_name: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");
  const fileInputRef = useRef(null);

  async function handleFileSelect(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only PDF, JPG, PNG, or WebP files are allowed");
      return;
    }

    // Max 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File must be smaller than 10MB");
      return;
    }

    setFile(selectedFile);
    setError("");

    // Auto-analyze PDFs and photos for dates, document type, and metadata
    if (selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf") {
      await parseDocument(selectedFile);
    }
  }

  async function parseDocument(fileToparse) {
    setParsing(true);
    
    try {
      // Upload file first
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(",")[1];
        
        // Call AI parser
        const response = await base44.functions.invoke("analyzeDocumentScan", {
          file_base64: base64,
          file_type: fileToparse.type,
          document_hint: fileToparse.name,
        });

        if (response.data?.success) {
          const parsed = response.data.parsed;
          setParsedData(parsed);
          
          // Auto-fill form with parsed data
          setForm(prev => ({
            ...prev,
            title: parsed.title || prev.title,
            description: parsed.description || prev.description,
            category: parsed.category || prev.category,
            tags: parsed.tags || prev.tags,
            child_name: parsed.child_name || prev.child_name,
          }));
        } else {
          setError("Could not parse document. Please fill in details manually.");
        }
        setParsing(false);
      };
      reader.readAsDataURL(fileToparse);
    } catch (err) {
      setError("Failed to parse document");
      setParsing(false);
    }
  }

  function addTag() {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  }

  function removeTag(tag) {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !form.title.trim()) {
      setError("Please select a file and enter a title");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload file via integration
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(",")[1];
        
        // Upload to private encrypted vault storage
        const uploadResponse = await base44.integrations.Core.UploadPrivateFile({
          file: base64,
        });

        if (!uploadResponse.file_uri) {
          throw new Error("Upload failed");
        }

        const selectedCategory = CATEGORIES.find(cat => cat.value === form.category) || CATEGORIES[CATEGORIES.length - 1];

        // Create secure document record with segmented permission metadata
        const newDoc = await base44.entities.SecureDocument.create({
          owner_email: user?.email,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          permission_segment: selectedCategory.segment,
          part2_segmented: !!selectedCategory.part2,
          tags: form.tags,
          private_file_uri: uploadResponse.file_uri,
          storage_class: "private_vault",
          encryption_standard: "AES-256 at rest; TLS in transit",
          file_name: file.name,
          file_size: file.size,
          child_name: form.child_name.trim(),
          is_private: true,
          uploaded_at: new Date().toISOString(),
          version: 1,
          scanner_source: !!parsedData,
          analysis_summary: parsedData?.summary || parsedData?.description || "",
          extracted_dates: parsedData?.key_dates || [],
          extracted_requirements: parsedData?.requirements || [],
        });

        if (syncToCalendar && parsedData) {
          const syncResponse = await base44.functions.invoke("syncDocumentDeadlinesToCalendar", {
            document_id: newDoc.id,
            document_title: newDoc.title,
            child_name: newDoc.child_name,
            calendar_items: parsedData.calendar_items || [],
            deadlines: parsedData.deadlines || [],
            key_dates: parsedData.key_dates || [],
          });
          onDocumentUploaded({ ...newDoc, calendar_event_ids: (syncResponse.data.events || []).map(event => event.id) });
        } else {
          onDocumentUploaded(newDoc);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || "Failed to upload document");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full rounded-t-3xl max-h-[90vh] overflow-y-auto p-5" style={{ background: C.offWhite }}>
        <div className="flex items-center justify-between mb-4 sticky top-0" style={{ background: C.offWhite, paddingBottom: 12 }}>
          <h2 className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>
            Smart Document Upload
          </h2>
          <button onClick={onClose} className="p-1" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={C.mutedText} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File upload */}
          <div>
            <label className="text-[10px] font-bold block mb-2" style={{ color: C.mutedText }}>
              SELECT FILE *
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
              style={{
                borderColor: file ? C.midGreen : C.cream,
                background: file ? "#EAF4EA" : "#fff",
                cursor: "pointer",
              }}
            >
              {file ? (
                <>
                  <CheckCircle2 size={24} color={C.midGreen} />
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{file.name}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload size={24} color={C.midGreen} />
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Upload document</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>PDF or photo · AI extracts dates and details</p>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              style={{ display: "none" }}
            />
          </div>

          {/* Parsing status */}
          {parsing && (
            <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#EEF4FF", border: `1px solid #B0C8F0` }}>
              <Loader2 size={14} color="#4A6FA5" className="animate-spin" />
              <p className="text-xs" style={{ color: "#4A6FA5" }}>Analyzing dates, document type, and metadata...</p>
            </div>
          )}

          <DocumentAnalysisPreview parsedData={parsedData} />
          <DocumentCalendarSyncPanel parsedData={parsedData} enabled={syncToCalendar} onChange={setSyncToCalendar} />

          {/* Title */}
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>DOCUMENT TITLE *</label>
            <input
              type="text"
              placeholder="e.g., 'Court Order - Custody Agreement'"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ borderColor: C.cream, background: "#fff" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>DESCRIPTION</label>
            <textarea
              placeholder="Key details, important dates, or notes..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none"
              style={{ borderColor: C.cream, background: "#fff", minHeight: 60 }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>CATEGORY</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ borderColor: C.cream, background: "#fff" }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {form.category === "substance_use" && (
              <p className="text-[10px] mt-2 leading-relaxed" style={{ color: "#9A3412" }}>
                This will be marked for segmented 42 CFR Part 2 permission handling.
              </p>
            )}
          </div>

          {/* Child name */}
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>CHILD NAME (OPTIONAL)</label>
            <input
              type="text"
              placeholder="Which child is this for?"
              value={form.child_name}
              onChange={e => setForm({ ...form, child_name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ borderColor: C.cream, background: "#fff" }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-bold block mb-2" style={{ color: C.mutedText }}>TAGS (optional)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl text-xs border outline-none"
                style={{ borderColor: C.cream, background: "#fff" }}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-xl font-bold text-xs"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
              >
                <Plus size={14} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map(tag => (
                  <div key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: C.darkGreen, color: "#fff" }}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0 leading-none"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#fff" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <AlertCircle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
              <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || parsing || !file || !form.title.trim()}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: file && form.title.trim() ? C.darkGreen : C.cream,
              color: file && form.title.trim() ? "#fff" : C.mutedText,
              border: "none",
              cursor: file && form.title.trim() ? "pointer" : "default",
            }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading...</>
            ) : (
              <>{syncToCalendar && parsedData ? "✓ Upload & Sync Calendar" : "✓ Upload Document"}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}