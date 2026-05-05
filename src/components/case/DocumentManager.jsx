import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Download, Eye, Pen, Lock, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function DocumentManager({ caseId, caseFile, user, onRefresh }) {
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [auditLogs, setAuditLogs] = useState({});
  const [loadingAudit, setLoadingAudit] = useState(null);
  const [signingDoc, setSigningDoc] = useState(null);

  const toggleAuditTrail = async (docId) => {
    if (auditLogs[docId]) {
      setExpandedDoc(expandedDoc === docId ? null : docId);
      return;
    }

    setLoadingAudit(docId);
    try {
      const logs = await base44.entities.DocumentAuditLog.filter({ document_id: docId }, "-timestamp");
      setAuditLogs(prev => ({ ...prev, [docId]: logs }));
      setExpandedDoc(docId);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoadingAudit(null);
    }
  };

  const recordAction = async (docId, action, docTitle) => {
    try {
      await base44.entities.DocumentAuditLog.create({
        case_id: caseId,
        document_id: docId,
        document_title: docTitle,
        action: action,
        performed_by_email: user.email,
        performed_by_name: user.full_name,
        performed_by_role: user.role || "user",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error recording audit log:", err);
    }
  };

  const handleViewDocument = (docId, docTitle, fileUrl) => {
    recordAction(docId, "viewed", docTitle);
    window.open(fileUrl, "_blank");
  };

  const handleDownloadDocument = (docId, docTitle, fileUrl) => {
    recordAction(docId, "downloaded", docTitle);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = docTitle;
    a.click();
  };

  const handleSignDocument = async (docId, docTitle) => {
    setSigningDoc(docId);
    try {
      // Record signature in audit log
      await recordAction(docId, "signed", docTitle);
      
      // Update document signature status
      const docs = await base44.entities.DocumentVersion.filter({ document_id: docId }, "-version_number", 1);
      if (docs.length > 0) {
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
        
        onRefresh();
      }
    } catch (err) {
      console.error("Error signing document:", err);
    } finally {
      setSigningDoc(null);
    }
  };

  if (!caseFile || !caseFile.documents || caseFile.documents.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: C.cream }}>
        <Lock size={28} color={C.brown} className="mx-auto mb-3" />
        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No documents yet</p>
        <p className="text-xs mt-1" style={{ color: C.mutedText }}>Documents will be listed here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {caseFile.documents.map(doc => (
        <div key={doc.id} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
          {/* Document header */}
          <div className="px-4 py-3 flex items-start gap-3" style={{ background: C.darkGreen }}>
            <span style={{ fontSize: "16px" }}>📄</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs" style={{ color: C.cream }}>{doc.title}</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>{doc.type}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleViewDocument(doc.id, doc.title, doc.file_url)}
                className="p-2 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: C.cream }}
                title="View document"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => handleDownloadDocument(doc.id, doc.title, doc.file_url)}
                className="p-2 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: C.cream }}
                title="Download document"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Document info */}
          <div className="p-4 space-y-3" style={{ background: "#fff" }}>
            <div className="flex items-center gap-2 text-xs">
              <Clock size={12} color={C.mutedText} />
              <span style={{ color: C.mutedText }}>
                Added {new Date(doc.date_added).toLocaleDateString()} by {doc.uploaded_by_name || "Unknown"}
              </span>
            </div>

            {doc.due_date && (
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle size={12} color={new Date(doc.due_date) < new Date() ? "#B84C2A" : C.midGreen} />
                <span style={{ color: new Date(doc.due_date) < new Date() ? "#B84C2A" : C.midGreen }}>
                  Due {new Date(doc.due_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Audit trail button */}
            <button
              onClick={() => toggleAuditTrail(doc.id)}
              className="text-xs font-bold flex items-center gap-1 transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", color: C.midGreen }}
            >
              {loadingAudit === doc.id ? "Loading audit trail..." : `View access history (${auditLogs[doc.id]?.length || 0} events)`}
            </button>

            {/* Audit logs */}
            {expandedDoc === doc.id && auditLogs[doc.id] && (
              <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: C.cream }}>
                <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>ACCESS AUDIT TRAIL</p>
                {auditLogs[doc.id].length === 0 ? (
                  <p className="text-[10px]" style={{ color: C.mutedText }}>No access recorded</p>
                ) : (
                  <div className="space-y-1.5">
                    {auditLogs[doc.id].map((log, idx) => (
                      <div key={idx} className="text-[10px] p-2 rounded-lg" style={{ background: C.offWhite }}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold capitalize" style={{ color: C.darkGreen }}>{log.action}</span>
                          <span style={{ color: C.mutedText }}>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p style={{ color: C.mutedText }}>
                          {log.performed_by_name} ({log.performed_by_role})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}