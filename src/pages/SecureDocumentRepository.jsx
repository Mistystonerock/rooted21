import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { FileText, Upload, Search, ScanLine } from "lucide-react";
import DocumentUploadModal from "@/components/documents/DocumentUploadModal";
import DocumentSearchFilter from "@/components/documents/DocumentSearchFilter";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentShareModal from "@/components/documents/DocumentShareModal";
import DocumentWorkflowToolkit from "@/components/documents/DocumentWorkflowToolkit";
import RedeemCodePanel from "@/components/documents/RedeemCodePanel";

export default function SecureDocumentRepository() {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [shareModalDoc, setShareModalDoc] = useState(null);
  const [allTags, setAllTags] = useState([]);

  const CATEGORIES = [
    { value: "all", label: "All Documents" },
    { value: "court_order", label: "Court Orders" },
    { value: "iep", label: "IEPs" },
    { value: "medical", label: "Medical Records" },
    { value: "legal", label: "Legal Documents" },
    { value: "school", label: "School Documents" },
    { value: "therapy", label: "Therapy Records" },
    { value: "financial", label: "Financial" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    const docs = await base44.entities.SecureDocument.list("-created_date", 500);
    setDocuments(docs);
    
    // Extract all unique tags
    const tags = new Set();
    docs.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
    setLoading(false);
  }

  function handleDocumentUploaded(newDoc) {
    setDocuments(prev => [newDoc, ...prev]);
    
    // Update tags
    if (newDoc.tags) {
      newDoc.tags.forEach(tag => {
        if (!allTags.includes(tag)) {
          setAllTags(prev => [...prev, tag].sort());
        }
      });
    }
    setShowUploadModal(false);
  }

  async function handleView(doc) {
    if (doc.file_url) {
      window.open(doc.file_url, "_blank", "noopener,noreferrer");
      return;
    }

    if (doc.private_file_uri) {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: doc.private_file_uri,
        expires_in: 300,
      });
      window.open(signed_url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleDelete(docId) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    await base44.entities.SecureDocument.delete(docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
  }

  // Filter documents
  const filtered = documents.filter(doc => {
    const searchableText = [
      doc.title,
      doc.description,
      doc.file_name,
      doc.analysis_summary,
      ...(doc.tags || []),
      ...(doc.extracted_dates || []),
      ...(doc.extracted_requirements || []),
    ].filter(Boolean).join(" ").toLowerCase();

    const matchesSearch = !searchTerm || searchableText.includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
      (doc.tags && selectedTags.some(tag => doc.tags.includes(tag)));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="📁 Document Library" backTo="/dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="📁 Document Library" subtitle="Secure upload & management" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        
        {/* Upload actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
          >
            <Upload size={16} /> Upload
          </button>
          <Link
            to="/document-scanner"
            className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.white, color: C.darkGreen, border: `1.5px solid ${C.cream}`, textDecoration: "none" }}
          >
            <ScanLine size={16} /> Scan
          </Link>
        </div>

        <DocumentWorkflowToolkit />

        <RedeemCodePanel onRedeemed={fetchDocuments} />

        {/* Search */}
        <div className="relative">
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.mutedText }} />
          <input
            type="text"
            placeholder="Search titles, dates, tags, requirements..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />
        </div>

        {/* Filters */}
        <DocumentSearchFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          allTags={allTags}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />

        {/* Results */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>
            {filtered.length} DOCUMENT{filtered.length !== 1 ? "S" : ""}
          </p>
          {searchTerm || selectedCategory !== "all" || selectedTags.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedTags([]);
              }}
              className="text-[10px] font-bold underline"
              style={{ background: "none", border: "none", cursor: "pointer", color: C.midGreen }}
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={32} color={C.cream} className="mx-auto mb-3" />
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>
              {documents.length === 0 ? "No documents yet" : "No results"}
            </p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>
              {documents.length === 0 
                ? "Upload your first document to get started" 
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onView={() => handleView(doc)}
                onShare={() => setShareModalDoc(doc)}
                onDelete={() => handleDelete(doc.id)}
              />
            ))}
          </div>
        )}

        <div className="pb-8" />
      </div>

      {/* Upload modal */}
      {showUploadModal && (
        <DocumentUploadModal
          user={user}
          onDocumentUploaded={handleDocumentUploaded}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Share modal */}
      {shareModalDoc && (
        <DocumentShareModal
          document={shareModalDoc}
          onClose={() => setShareModalDoc(null)}
        />
      )}
    </div>
  );
}