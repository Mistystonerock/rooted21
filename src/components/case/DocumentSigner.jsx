import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { CheckCircle2, Loader2, FileText } from "lucide-react";

export default function DocumentSigner({ docId, docTitle, signatories, user, onComplete }) {
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState(null);

  const userSignature = signatories?.find(s => s.email === user.email);
  const canSign = userSignature && !userSignature.signed;

  const handleSign = async () => {
    setSigning(true);
    setError(null);
    
    try {
      // Get the document
      const docs = await base44.entities.DocumentVersion.filter({ document_id: docId }, "-version_number", 1);
      if (docs.length === 0) throw new Error("Document not found");

      const doc = docs[0];
      const updatedSignatories = (doc.signatories || []).map(sig =>
        sig.email === user.email
          ? { ...sig, signed: true, signed_date: new Date().toISOString() }
          : sig
      );

      const allSigned = updatedSignatories.every(sig => sig.signed);

      await base44.entities.DocumentVersion.update(doc.id, {
        signatories: updatedSignatories,
        signature_status: allSigned ? "signed" : "pending",
      });

      // Log the action
      await base44.entities.DocumentAuditLog.create({
        case_id: doc.case_id,
        document_id: docId,
        document_title: docTitle,
        action: "signed",
        performed_by_email: user.email,
        performed_by_name: user.full_name,
        performed_by_role: user.role || "user",
        timestamp: new Date().toISOString(),
      });

      onComplete?.();
    } catch (err) {
      console.error("Signing failed:", err);
      setError("Failed to sign document. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  if (!userSignature) {
    return null;
  }

  if (userSignature.signed) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "#EAF4EA" }}>
        <CheckCircle2 size={16} color={C.midGreen} />
        <span className="text-xs font-bold" style={{ color: C.midGreen }}>
          Signed {new Date(userSignature.signed_date).toLocaleDateString()}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSign}
        disabled={signing}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
        style={{
          background: C.darkGreen,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          opacity: signing ? 0.7 : 1,
        }}
      >
        {signing ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Signing...
          </>
        ) : (
          <>
            <FileText size={14} />
            Sign Document
          </>
        )}
      </button>
      {error && (
        <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
      )}
    </div>
  );
}