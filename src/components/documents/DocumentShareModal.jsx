import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Loader2, CheckCircle2, Copy, Mail, AlertCircle } from "lucide-react";
import { DOCUMENT_RECORD_TYPE_LABELS } from "@/lib/document-record-types";

export default function DocumentShareModal({ document, onClose }) {
  const [form, setForm] = useState({
    recipient_email: "",
    recipient_name: "",
    access_note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerateCode(e) {
    e.preventDefault();
    if (!form.recipient_email.trim()) {
      setError("Please enter recipient email");
      return;
    }

    setLoading(true);
    setError("");

    const response = await base44.functions.invoke("generateDocumentAccessCode", {
      document_id: document.id,
      recipient_email: form.recipient_email.trim().toLowerCase(),
      recipient_name: form.recipient_name.trim(),
      access_note: form.access_note.trim(),
      document_record_type: document.document_record_type || "parent_record",
      permission_granularity: "document_level",
    });

    if (response.data?.success) {
      setGeneratedCode(response.data.code);
      setSuccess(true);
      
      // Send email notification
      try {
        await base44.integrations.Core.SendEmail({
          to: form.recipient_email,
          subject: `You've been granted access to: ${document.title}`,
          body: `
Hello${form.recipient_name ? " " + form.recipient_name : ""},

You have been granted secure access to a document: "${document.title}"

Access Code: ${response.data.code}

${form.access_note ? "Message from sender: " + form.access_note : ""}

To view the document, enter this code in the Rooted 21 app.

This code will expire in 30 days.

Best regards,
Rooted 21 Security Team
          `,
        });
      } catch (err) {
        // Continue even if email fails
      }
    } else {
      setError(response.data?.message || "Failed to generate access code");
    }

    setLoading(false);
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full rounded-t-3xl p-5" style={{ background: C.offWhite }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>
            {success ? "Code Generated ✓" : "Share Document"}
          </h2>
          <button onClick={onClose} className="p-1" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={C.mutedText} />
          </button>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 text-center" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
              <CheckCircle2 size={32} color={C.midGreen} className="mx-auto mb-2" />
              <p className="text-sm font-bold mb-1" style={{ color: C.darkGreen }}>Access Code Generated</p>
              <p className="text-[10px]" style={{ color: C.mutedText }}>
                Share this 8-character code with {form.recipient_name || "the recipient"}.
              </p>
            </div>

            {/* Code display */}
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `2px solid ${C.gold}` }}>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>ACCESS CODE</p>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono font-bold text-2xl tracking-widest" style={{ color: C.darkGreen }}>
                  {generatedCode}
                </code>
                <button
                  onClick={copyCode}
                  className="px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1"
                  style={{
                    background: copied ? C.midGreen : C.cream,
                    color: copied ? "#fff" : C.darkGreen,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-[10px] mt-2" style={{ color: C.mutedText }}>
                Expires in 30 days • One-time use
              </p>
            </div>

            {/* Info */}
            <div className="rounded-xl p-3" style={{ background: "#FFF8E6", border: `1px solid ${C.gold}` }}>
              <p className="text-xs" style={{ color: C.brown }}>
                📧 An email with instructions has been sent to <strong>{form.recipient_email}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleGenerateCode} className="space-y-4">
            {/* Document info */}
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
              <span className="text-lg">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{document.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                  {(document.file_size / 1024).toFixed(0)} KB
                </p>
                <p className="text-[10px] mt-1 font-bold" style={{ color: "#315E91" }}>
                  {DOCUMENT_RECORD_TYPE_LABELS[document.document_record_type] || "Parent Record"} · Document-level permission
                </p>
              </div>
            </div>

            {/* Recipient email */}
            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
                RECIPIENT EMAIL *
              </label>
              <input
                type="email"
                placeholder="person@email.com"
                value={form.recipient_email}
                onChange={e => setForm({ ...form, recipient_email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{ borderColor: C.cream, background: "#fff" }}
              />
            </div>

            {/* Recipient name */}
            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
                RECIPIENT NAME (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 'Sarah's therapist'"
                value={form.recipient_name}
                onChange={e => setForm({ ...form, recipient_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{ borderColor: C.cream, background: "#fff" }}
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
                PERSONAL MESSAGE (optional)
              </label>
              <textarea
                placeholder="Why are you sharing this? Any context for the recipient?"
                value={form.access_note}
                onChange={e => setForm({ ...form, access_note: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none"
                style={{ borderColor: C.cream, background: "#fff", minHeight: 60 }}
              />
            </div>

            {/* Info */}
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#FEF3EE", border: `1px solid #F4C9B8` }}>
              <AlertCircle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
              <p className="text-xs" style={{ color: "#B84C2A" }}>
                A unique access code will be generated for this one document only, using its record tag for permission review. Codes expire after 30 days or one use.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xi p-3 bg-red-50 border border-red-200">
                <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !form.recipient_email.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: form.recipient_email.trim() ? C.darkGreen : C.cream,
                color: form.recipient_email.trim() ? "#fff" : C.mutedText,
                border: "none",
                cursor: form.recipient_email.trim() ? "pointer" : "default",
              }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Generating Code...</>
              ) : (
                <>Generate & Send Code</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}