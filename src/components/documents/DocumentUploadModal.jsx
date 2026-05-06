import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Upload, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "court_order", label: "Court Order", emoji: "⚖️" },
  { value: "iep", label: "IEP Document", emoji: "🏫" },
  { value: "medical", label: "Medical Record", emoji: "🏥" },
  { value: "legal", label: "Legal Document", emoji: "📜" },
  { value: "school", label: "School Record", emoji: "📚" },
  { value: "therapy", label: "Therapy Record", emoji: "💙" },
  { value: "financial", label: "Financial", emoji: "💰" },
  { value: "other", label: "Other", emoji: "📄" },
];

export default function DocumentUploadModal({ user, cases, onClose, onUploaded }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    child_name: "",
    case_id: "",
    tags: "",
    expiry_date: "",
    is_private: true,
    shared_with: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !form.title || !form.category) return;
    setLoading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const shared_with = form.shared_with.split(",").map(e => e.trim()).filter(Boolean);

    await base44.entities.SecureDocument.create({
      owner_email: user.email,
      title: form.title,
      description: form.description,
      category: form.category,
      child_name: form.child_name,
      case_id: form.case_id || undefined,
      tags,
      file_url,
      file_name: file.name,
      file_size: file.size,
      shared_with,
      is_private: form.is_private,
      expiry_date: form.expiry_date || undefined,
      version: 1,
    });

    setLoading(false);
    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-[520px] rounded-t-3xl overflow-y-auto" style={{ background: C.offWhite, maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Upload Document</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.cream }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          {/* File drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById("doc-file-input").click()}
            className="rounded-2xl flex flex-col items-center justify-center py-8 cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragOver ? C.midGreen : C.cream}`,
              background: dragOver ? "#EAF4EA" : "#fff",
            }}
          >
            <Upload size={28} color={file ? C.midGreen : C.mutedText} />
            <p className="text-xs font-bold mt-2" style={{ color: file ? C.darkGreen : C.mutedText }}>
              {file ? file.name : "Tap to select or drag a file here"}
            </p>
            {file && (
              <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
            <input
              id="doc-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>

          {/* Title */}
          <div>
            <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>DOCUMENT TITLE *</p>
            <input
              type="text"
              placeholder="e.g. John's IEP 2024"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              style={{ borderColor: C.cream, background: "#fff" }}
              required
            />
          </div>

          {/* Category */}
          <div>
            <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>CATEGORY *</p>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className="rounded-xl py-2.5 px-1 flex flex-col items-center gap-1 transition-all"
                  style={{
                    background: form.category === cat.value ? C.darkGreen : "#fff",
                    border: `1.5px solid ${form.category === cat.value ? C.darkGreen : C.cream}`,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                  <span className="text-[9px] font-bold text-center leading-tight" style={{ color: form.category === cat.value ? C.cream : C.darkGreen }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Child name & case */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>CHILD'S NAME</p>
              <input
                type="text"
                placeholder="e.g. John"
                value={form.child_name}
                onChange={e => setForm({ ...form, child_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                style={{ borderColor: C.cream, background: "#fff" }}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>LINK TO CASE</p>
              <select
                value={form.case_id}
                onChange={e => setForm({ ...form, case_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                style={{ borderColor: C.cream, background: "#fff" }}
              >
                <option value="">None</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.child_name} ({c.case_type})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>DESCRIPTION</p>
            <textarea
              placeholder="Brief notes about this document..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm resize-none"
              style={{ borderColor: C.cream, background: "#fff", minHeight: 60 }}
            />
          </div>

          {/* Tags */}
          <div>
            <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>TAGS (comma-separated)</p>
            <input
              type="text"
              placeholder="e.g. 2024, special-ed, signed"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              style={{ borderColor: C.cream, background: "#fff" }}
            />
          </div>

          {/* Expiry date */}
          <div>
            <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>EXPIRY / REVIEW DATE (optional)</p>
            <input
              type="date"
              value={form.expiry_date}
              onChange={e => setForm({ ...form, expiry_date: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              style={{ borderColor: C.cream, background: "#fff" }}
            />
          </div>

          {/* Sharing */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Keep Private</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Only you can see this document</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_private: !form.is_private })}
                className="rounded-full transition-all"
                style={{
                  width: 44, height: 26, background: form.is_private ? C.midGreen : C.cream,
                  border: "none", cursor: "pointer", position: "relative",
                }}
              >
                <span
                  className="absolute top-1 rounded-full transition-all"
                  style={{
                    width: 18, height: 18, background: "#fff",
                    left: form.is_private ? "calc(100% - 22px)" : "4px",
                  }}
                />
              </button>
            </div>

            {!form.is_private && (
              <div>
                <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>SHARE WITH (emails, comma-separated)</p>
                <input
                  type="text"
                  placeholder="e.g. therapist@example.com, teacher@school.edu"
                  value={form.shared_with}
                  onChange={e => setForm({ ...form, shared_with: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !file || !form.title}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: C.darkGreen, color: "#fff", border: "none",
              cursor: loading || !file || !form.title ? "default" : "pointer",
              opacity: loading || !file || !form.title ? 0.6 : 1,
            }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : "Upload Document"}
          </button>

          <div className="pb-4" />
        </form>
      </div>
    </div>
  );
}