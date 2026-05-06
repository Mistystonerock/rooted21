import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Send, Copy, CheckCircle2, Loader2, KeyRound } from "lucide-react";

export default function SendAccessCodeModal({ doc, granterName, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [accessNote, setAccessNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null); // { code, expiresAt }
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!recipientEmail.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("generateDocumentAccessCode", {
        documentId: doc.id,
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim(),
        accessNote: accessNote.trim(),
      });
      setSent({ code: res.data.code, expiresAt: res.data.expiresAt });
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sent.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-[520px] rounded-t-3xl overflow-y-auto" style={{ background: C.offWhite, maxHeight: "85vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: C.darkGreen }}>
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>🔐 Send Access Code</p>
            <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>{doc.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.cream }}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-5 space-y-4">
          {!sent ? (
            <>
              {/* Info banner */}
              <div className="rounded-xl p-3 flex gap-3" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}` }}>
                <KeyRound size={16} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
                  A unique personal access code will be generated and emailed directly to the recipient. Only they can use it to view this document.
                </p>
              </div>

              {/* Recipient email */}
              <div>
                <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>RECIPIENT EMAIL *</p>
                <input
                  type="email"
                  placeholder="therapist@example.com"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ borderColor: C.cream, background: "#fff" }}
                />
              </div>

              {/* Recipient name */}
              <div>
                <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>RECIPIENT NAME (optional)</p>
                <input
                  type="text"
                  placeholder="Dr. Smith"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ borderColor: C.cream, background: "#fff" }}
                />
              </div>

              {/* Note */}
              <div>
                <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>PERSONAL MESSAGE (optional)</p>
                <textarea
                  placeholder="e.g. Please review this IEP before our meeting on Friday."
                  value={accessNote}
                  onChange={e => setAccessNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm resize-none"
                  style={{ borderColor: C.cream, background: "#fff", minHeight: 70 }}
                />
              </div>

              {error && (
                <p className="text-xs font-bold" style={{ color: "#DC2626" }}>{error}</p>
              )}

              <button
                onClick={handleSend}
                disabled={loading || !recipientEmail.trim()}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: C.darkGreen, color: "#fff", border: "none",
                  cursor: loading || !recipientEmail.trim() ? "default" : "pointer",
                  opacity: loading || !recipientEmail.trim() ? 0.6 : 1,
                }}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Generating & Sending…</> : <><Send size={15} /> Send Access Code by Email</>}
              </button>
            </>
          ) : (
            /* Success state */
            <div className="space-y-4 text-center">
              <div className="rounded-2xl p-5" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
                <CheckCircle2 size={36} color={C.midGreen} className="mx-auto mb-2" />
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Code sent successfully!</p>
                <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>
                  An email with the access code has been sent to <strong>{recipientEmail}</strong>
                </p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
                <p className="text-[10px] mb-1" style={{ color: C.lightGreen }}>THEIR ACCESS CODE</p>
                <p className="font-mono font-extrabold text-2xl tracking-widest" style={{ color: C.cream }}>{sent.code}</p>
                <p className="text-[10px] mt-1" style={{ color: C.lightGreen }}>
                  Expires {new Date(sent.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: copied ? C.midGreen : C.cream, color: copied ? "#fff" : C.darkGreen, border: "none", cursor: "pointer" }}
              >
                {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
              >
                Done
              </button>
            </div>
          )}

          <div className="pb-2" />
        </div>
      </div>
    </div>
  );
}