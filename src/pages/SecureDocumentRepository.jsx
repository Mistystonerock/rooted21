import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentUploadModal from "@/components/documents/DocumentUploadModal";
import { Plus, Search } from "lucide-react";
import RedeemCodePanel from "@/components/documents/RedeemCodePanel";

const CATEGORY_FILTERS = [
  { value: "all", label: "All", emoji: "📁" },
  { value: "court_order", label: "Court", emoji: "⚖️" },
  { value: "iep", label: "IEP", emoji: "🏫" },
  { value: "medical", label: "Medical", emoji: "🏥" },
  { value: "legal", label: "Legal", emoji: "📜" },
  { value: "school", label: "School", emoji: "📚" },
  { value: "therapy", label: "Therapy", emoji: "💙" },
  { value: "other", label: "Other", emoji: "📄" },
];

export default function SecureDocumentRepository() {
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      if (!u) { setLoading(false); return; }

      const [myDocs, sharedDocs, caseFiles] = await Promise.all([
        base44.entities.SecureDocument.filter({ owner_email: u.email }, "-created_date", 100),
        base44.entities.SecureDocument.list("-created_date", 200),
        base44.entities.CaseFile.filter({ parent_email: u.email }, "-created_date"),
      ]);

      // Merge: owned + shared with me (dedup by id)
      const sharedWithMe = sharedDocs.filter(d =>
        d.owner_email !== u.email && d.shared_with?.includes(u.email)
      );
      const merged = [...myDocs, ...sharedWithMe];
      const unique = Array.from(new Map(merged.map(d => [d.id, d])).values());

      setDocs(unique);
      setCases(caseFiles);
      setLoading(false);
    });
  }, []);

  const handleUploaded = async () => {
    const fresh = await base44.entities.SecureDocument.filter({ owner_email: user.email }, "-created_date", 100);
    setDocs(prev => {
      const sharedWithMe = prev.filter(d => d.owner_email !== user.email);
      const unique = Array.from(new Map([...fresh, ...sharedWithMe].map(d => [d.id, d])).values());
      return unique;
    });
  };

  const handleDeleted = (docId) => setDocs(prev => prev.filter(d => d.id !== docId));

  const handleShareUpdated = (docId, emails) => {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, shared_with: emails, is_private: emails.length === 0 } : d));
  };

  const filtered = docs.filter(d => {
    const matchesCategory = categoryFilter === "all" || d.category === categoryFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      d.title?.toLowerCase().includes(q) ||
      d.child_name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.tags?.some(t => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const expiringCount = docs.filter(d => {
    if (!d.expiry_date) return false;
    const days = Math.ceil((new Date(d.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  const myDocsCount = docs.filter(d => d.owner_email === user?.email).length;
  const sharedCount = docs.filter(d => d.owner_email !== user?.email).length;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Secure Documents"
        subtitle="Your private file vault"
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>🔒 Document Repository</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Securely store court orders, IEPs, medical records, and more. Share specific files with your care team.
          </p>
          <div className="flex gap-3 mt-3">
            <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-xl font-extrabold" style={{ color: C.cream }}>{myDocsCount}</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>My Docs</p>
            </div>
            <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-xl font-extrabold" style={{ color: C.cream }}>{sharedCount}</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>Shared With Me</p>
            </div>
            {expiringCount > 0 && (
              <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "#D97706" }}>
                <p className="text-xl font-extrabold" style={{ color: "#fff" }}>{expiringCount}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.9)" }}>Expiring Soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Redeem code panel */}
        <RedeemCodePanel onRedeemed={handleUploaded} />

        {/* Upload button */}
        <button
          onClick={() => setShowUpload(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> Upload Document
        </button>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <Search size={14} color={C.mutedText} />
          <input
            type="text"
            placeholder="Search by title, child name, tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#000" }}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold transition-all"
              style={{
                background: categoryFilter === cat.value ? C.darkGreen : "#fff",
                color: categoryFilter === cat.value ? C.cream : C.darkGreen,
                border: `1.5px solid ${categoryFilter === cat.value ? C.darkGreen : C.cream}`,
                cursor: "pointer",
              }}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Document list */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: C.cream, border: `1.5px dashed ${C.midGreen}` }}>
            <p className="text-3xl mb-2">📁</p>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
              {docs.length === 0 ? "No documents yet" : "No results"}
            </p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>
              {docs.length === 0 ? "Upload your first document to get started." : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                currentUserEmail={user?.email}
                onDeleted={handleDeleted}
                onShareUpdated={handleShareUpdated}
              />
            ))}
          </div>
        )}

        <div className="pb-10" />
      </div>

      {showUpload && (
        <DocumentUploadModal
          user={user}
          cases={cases}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}