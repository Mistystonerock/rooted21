import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Eye, Download, Share2, Trash2, Lock, Users, Calendar, KeyRound } from "lucide-react";
import SendAccessCodeModal from "./SendAccessCodeModal";

const CATEGORY_META = {
  court_order: { emoji: "⚖️", label: "Court Order", color: "#B84C2A" },
  iep: { emoji: "🏫", label: "IEP", color: C.midGreen },
  medical: { emoji: "🏥", label: "Medical", color: "#4A90D9" },
  legal: { emoji: "📜", label: "Legal", color: C.brown },
  school: { emoji: "📚", label: "School", color: C.midGreen },
  therapy: { emoji: "💙", label: "Therapy", color: "#6B8FBF" },
  financial: { emoji: "💰", label: "Financial", color: C.gold },
  other: { emoji: "📄", label: "Other", color: C.mutedText },
};

export default function DocumentCard({ doc, currentUserEmail, onDeleted, onShareUpdated }) {
  const [showShareEdit, setShowShareEdit] = useState(false);
  const [showSendCode, setShowSendCode] = useState(false);
  const [shareInput, setShareInput] = useState(doc.shared_with?.join(", ") || "");
  const [saving, setSaving] = useState(false);

  const meta = CATEGORY_META[doc.category] || CATEGORY_META.other;
  const isOwner = doc.owner_email === currentUserEmail;
  const isExpiringSoon = doc.expiry_date && Math.ceil((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) <= 30;
  const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();

  const handleView = () => window.open(doc.file_url, "_blank");
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = doc.file_url;
    a.download = doc.file_name || doc.title;
    a.click();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    await base44.entities.SecureDocument.delete(doc.id);
    onDeleted(doc.id);
  };

  const handleSaveShare = async () => {
    setSaving(true);
    const emails = shareInput.split(",").map(e => e.trim()).filter(Boolean);
    await base44.entities.SecureDocument.update(doc.id, {
      shared_with: emails,
      is_private: emails.length === 0,
    });
    setSaving(false);
    setShowShareEdit(false);
    onShareUpdated(doc.id, emails);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}`, background: "#fff" }}>
      {/* Top bar */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: isExpired ? "#FEF2F2" : isExpiringSoon ? "#FFFBEB" : C.darkGreen }}>
        <span style={{ fontSize: 20 }}>{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs truncate" style={{ color: isExpired || isExpiringSoon ? C.darkGreen : C.cream }}>
            {doc.title}
          </p>
          <p className="text-[10px]" style={{ color: isExpired || isExpiringSoon ? C.mutedText : C.lightGreen }}>
            {meta.label}{doc.child_name ? ` · ${doc.child_name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {doc.is_private ? (
            <Lock size={12} color={isExpired || isExpiringSoon ? C.mutedText : C.lightGreen} />
          ) : (
            <Users size={12} color={isExpired || isExpiringSoon ? C.midGreen : C.lightGreen} />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        {doc.description && (
          <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{doc.description}</p>
        )}

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {doc.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.offWhite, color: C.darkGreen }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Expiry */}
        {doc.expiry_date && (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: isExpired ? "#DC2626" : isExpiringSoon ? "#D97706" : C.mutedText }}>
            <Calendar size={11} />
            {isExpired ? `⚠️ Expired ${doc.expiry_date}` : `Review by ${doc.expiry_date}`}
          </div>
        )}

        {/* Shared with */}
        {!doc.is_private && doc.shared_with?.length > 0 && !showShareEdit && (
          <div className="text-[10px]" style={{ color: C.mutedText }}>
            Shared with: {doc.shared_with.slice(0, 2).join(", ")}{doc.shared_with.length > 2 ? ` +${doc.shared_with.length - 2} more` : ""}
          </div>
        )}

        {/* Share edit form */}
        {showShareEdit && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Share with (emails, comma-separated)</p>
            <input
              type="text"
              value={shareInput}
              onChange={e => setShareInput(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="w-full px-3 py-2 rounded-lg border outline-none text-xs"
              style={{ borderColor: C.cream, background: C.offWhite }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveShare}
                disabled={saving}
                className="flex-1 py-2 rounded-lg font-bold text-xs"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setShowShareEdit(false)}
                className="py-2 px-4 rounded-lg font-bold text-xs"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={handleView} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            <Eye size={12} /> View
          </button>
          <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: C.midGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            <Download size={12} /> Download
          </button>
          {isOwner && (
            <>
              <button onClick={() => setShowSendCode(true)} className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
                style={{ background: C.gold, color: "#fff", border: "none", cursor: "pointer" }} title="Send Access Code">
                <KeyRound size={12} />
              </button>
              <button onClick={() => setShowShareEdit(!showShareEdit)} className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
                <Share2 size={12} />
              </button>
              <button onClick={handleDelete} className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
                style={{ background: "#FEE2E2", color: "#DC2626", border: "none", cursor: "pointer" }}>
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {showSendCode && (
        <SendAccessCodeModal
          doc={doc}
          onClose={() => setShowSendCode(false)}
        />
      )}
    </div>
  );
}