import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import SignaturePad from "./SignaturePad";
import { X, CheckCircle2, Loader2, FileText } from "lucide-react";

export default function DocumentSigningModal({ document, user, onClose, onSigned }) {
  const [signature, setSignature] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef(null);

  async function handleSign() {
    if (!signature || !agreed) return;
    setSaving(true);

    try {
      // Build a signed document record as a text/html file stored as a SecureDocument
      const signedDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const userName = user?.full_name || user?.email || "Unknown User";

      // Create HTML blob representing the signed document
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>SIGNED: ${document.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #222; }
    h1 { color: #2D4A35; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; }
    h2 { color: #2D4A35; margin-top: 24px; font-size: 14px; }
    p { font-size: 13px; line-height: 1.6; }
    .signed-banner { background: #EAF4EA; border: 2px solid #6E8F6E; border-radius: 8px; padding: 16px; margin: 24px 0; }
    .signed-banner h3 { color: #2D4A35; margin: 0 0 8px; }
    .sig-img { border: 1px solid #ccc; border-radius: 4px; max-width: 300px; }
    .section { border-bottom: 1px solid #E8DFCF; padding-bottom: 16px; margin-bottom: 16px; }
    .footer { margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>✅ ${document.title}</h1>
  <div class="signed-banner">
    <h3>Digitally Signed</h3>
    <p><strong>Signed by:</strong> ${userName}</p>
    <p><strong>Email:</strong> ${user?.email}</p>
    <p><strong>Date/Time:</strong> ${signedDate} (Eastern Time)</p>
    <p><strong>Document:</strong> ${document.title}</p>
    <p style="margin-top:12px;"><strong>Signature:</strong></p>
    <img class="sig-img" src="${signature}" alt="Digital Signature" />
  </div>
  ${document.sections.map(s => `
  <div class="section">
    <h2>${s.heading}</h2>
    <p>${s.content}</p>
  </div>`).join("")}
  <div class="footer">
    Rooted 21 Parenting Network | rooted21parenting.com<br/>
    This document was digitally signed through the Rooted 21 platform on ${signedDate}.
    Digital signatures through this platform serve as acknowledgment of the document content.
  </div>
</body>
</html>`;

      // Upload the HTML as a file
      const blob = new Blob([htmlContent], { type: "text/html" });
      const file = new File([blob], `${document.title.replace(/\s+/g, "-")}-SIGNED.html`, { type: "text/html" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Save as a SecureDocument
      await base44.entities.SecureDocument.create({
        owner_email: user.email,
        title: `✅ SIGNED: ${document.title}`,
        description: `Digitally signed by ${userName} on ${signedDate}`,
        category: "legal",
        file_url,
        file_name: `${document.title.replace(/\s+/g, "-")}-SIGNED.html`,
        tags: ["signed", "legal", "consent"],
        is_private: true,
      });

      setDone(true);
      setTimeout(() => {
        onSigned && onSigned();
        onClose();
      }, 2000);
    } catch (err) {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-full sm:max-w-[540px] rounded-t-3xl sm:rounded-2xl flex flex-col"
        style={{ background: C.offWhite, maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ background: C.darkGreen, borderRadius: "24px 24px 0 0" }}>
          <div className="flex items-center gap-2">
            <FileText size={18} color={C.gold} />
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>{document.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.lightGreen} />
          </button>
        </div>

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <CheckCircle2 size={48} color={C.midGreen} />
            <p className="font-bold text-base" style={{ color: C.darkGreen }}>Document Signed!</p>
            <p className="text-xs text-center" style={{ color: C.mutedText }}>
              Saved to your Secure Documents repository.
            </p>
          </div>
        ) : (
          <>
            {/* Scrollable document content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="rounded-xl p-3" style={{ background: "#FEF9EC", border: `1px solid ${C.gold}40` }}>
                <p className="text-[11px] font-bold" style={{ color: C.brown }}>
                  📋 Read the full document below, then sign at the bottom to save a signed copy to your file vault.
                </p>
              </div>

              {document.sections.map((section, i) => (
                <div key={i} className="pb-3" style={{ borderBottom: `1px solid ${C.cream}` }}>
                  <p className="font-bold text-xs mb-1.5" style={{ color: C.darkGreen }}>{section.heading}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>{section.content}</p>
                </div>
              ))}
            </div>

            {/* Signature section */}
            <div className="flex-shrink-0 px-5 py-4 space-y-4" style={{ background: "#fff", borderTop: `1px solid ${C.cream}` }}>
              <SignaturePad onSignatureChange={setSignature} />

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0"
                  style={{ accentColor: C.darkGreen }}
                />
                <span className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
                  I have read this document in full and agree to its terms. I understand this digital signature is legally binding and will be saved to my document repository.
                </span>
              </label>

              <button
                onClick={handleSign}
                disabled={!signature || !agreed || saving}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: signature && agreed ? C.darkGreen : C.cream,
                  color: signature && agreed ? "#fff" : C.mutedText,
                  border: "none",
                  cursor: signature && agreed ? "pointer" : "default",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving…</>
                ) : (
                  <><CheckCircle2 size={16} /> Sign & Save to Repository</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}