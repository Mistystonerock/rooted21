import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import ChecklistUploader from "@/components/checklist/ChecklistUploader";
import ChecklistItem from "@/components/checklist/ChecklistItem";
import { Plus, ChevronDown, ChevronUp, Trash2, CheckCircle2 } from "lucide-react";

const SOURCE_LABELS = {
  cps: "CPS",
  court: "Court",
  professional: "Professional",
  manual: "Manual",
};

function ProgressRing({ pct }) {
  const r = 20, circ = 2 * Math.PI * r;
  return (
    <svg width="54" height="54" viewBox="0 0 54 54">
      <circle cx="27" cy="27" r={r} fill="none" stroke={C.cream} strokeWidth="5" />
      <circle cx="27" cy="27" r={r} fill="none" stroke={C.midGreen} strokeWidth="5"
        strokeDasharray={`${circ * pct / 100} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 27 27)" />
      <text x="27" y="31" textAnchor="middle" fontSize="11" fontWeight="bold" fill={C.darkGreen}>
        {pct}%
      </text>
    </svg>
  );
}

export default function CasePlanChecklist() {
  const [user, setUser] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [pendingParsed, setPendingParsed] = useState(null); // parsed doc waiting for child selection
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const [lists, kids] = await Promise.all([
        base44.entities.CasePlanChecklist.filter({ parent_email: u.email }, "-created_date", 50),
        base44.entities.ChildProfile.list("-created_date", 20),
      ]);
      setChecklists(lists);
      setChildren(kids);
      if (kids.length > 0) setSelectedChild(kids[0].first_name);
      // auto-expand the first active checklist
      const first = lists.find(l => l.status === "active");
      if (first) setExpanded({ [first.id]: true });
      setLoading(false);
    });
  }, []);

  // Called when AI finishes parsing the document
  function handleParsed(parsed) {
    setPendingParsed(parsed);
    setShowUploader(false);
  }

  async function handleSaveChecklist() {
    if (!pendingParsed) return;
    setSaving(true);

    const items = (pendingParsed.rawItems || []).map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      text: it.text,
      category: it.category || "other",
      due_date: it.due_date || null,
      completed: false,
      completed_date: null,
      proof_url: null,
      proof_filename: null,
      notes: null,
    }));

    const newList = await base44.entities.CasePlanChecklist.create({
      parent_email: user.email,
      child_name: selectedChild,
      title: pendingParsed.title,
      source: pendingParsed.source,
      source_document_url: pendingParsed.source_document_url,
      source_document_name: pendingParsed.source_document_name,
      items,
      ai_summary: pendingParsed.summary,
      status: "active",
    });

    setChecklists(prev => [newList, ...prev]);
    setExpanded({ [newList.id]: true });
    setPendingParsed(null);
    setSaving(false);
  }

  async function handleToggleItem(checklistId, itemId) {
    const cl = checklists.find(c => c.id === checklistId);
    const items = cl.items.map(it =>
      it.id === itemId
        ? { ...it, completed: !it.completed, completed_date: !it.completed ? new Date().toISOString() : null }
        : it
    );
    const allDone = items.every(i => i.completed);
    const updated = await base44.entities.CasePlanChecklist.update(checklistId, {
      items,
      status: allDone ? "completed" : "active",
    });
    setChecklists(prev => prev.map(c => c.id === checklistId ? updated : c));
  }

  async function handleUploadProof(checklistId, itemId, url, filename) {
    const cl = checklists.find(c => c.id === checklistId);
    const items = cl.items.map(it =>
      it.id === itemId ? { ...it, proof_url: url, proof_filename: filename } : it
    );
    const updated = await base44.entities.CasePlanChecklist.update(checklistId, { items });
    setChecklists(prev => prev.map(c => c.id === checklistId ? updated : c));
  }

  async function handleDelete(id) {
    await base44.entities.CasePlanChecklist.delete(id);
    setChecklists(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Case Plan Checklist"
        subtitle="Track every requirement from your case plan"
        backTo="/dashboard"
        rightSlot={
          !showUploader && !pendingParsed && (
            <button
              onClick={() => setShowUploader(true)}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "#ffffff22", border: "none", cursor: "pointer" }}
              title="Add case plan">
              <Plus size={20} color={C.cream} />
            </button>
          )
        }
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* ── UPLOADER ─────────────────────────────────────────── */}
        {showUploader && (
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
                Upload Case Plan Document
              </p>
              <button onClick={() => setShowUploader(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.mutedText }}>
                ×
              </button>
            </div>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: C.mutedText }}>
              Upload your case plan from CPS, court, or your caseworker. The AI will read it and build a personal checklist of everything you need to complete.
            </p>
            <ChecklistUploader onParsed={handleParsed} />
          </div>
        )}

        {/* ── PARSED PREVIEW (confirm before saving) ────────────── */}
        {pendingParsed && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${C.midGreen}` }}>
            <div className="px-4 py-3" style={{ background: C.darkGreen }}>
              <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
                ✅ AI Extracted {pendingParsed.rawItems.length} Items
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>
                {pendingParsed.title}
              </p>
            </div>
            <div className="p-4 space-y-3" style={{ background: "#fff" }}>
              {/* AI summary */}
              {pendingParsed.summary && (
                <div className="rounded-xl p-3" style={{ background: "#F0F7F2", border: `1px solid ${C.midGreen}30` }}>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.midGreen }}>AI SUMMARY</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>{pendingParsed.summary}</p>
                </div>
              )}

              {/* Which child */}
              {children.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>
                    WHICH CHILD IS THIS FOR?
                  </label>
                  <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-sm border outline-none"
                    style={{ borderColor: C.cream, background: C.offWhite }}>
                    {children.map(c => (
                      <option key={c.id} value={c.first_name}>{c.first_name}</option>
                    ))}
                    <option value="">General / Not child-specific</option>
                  </select>
                </div>
              )}

              {/* Item preview */}
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>CHECKLIST PREVIEW</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {pendingParsed.rawItems.map((it, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: C.darkGreen }}>
                    <span className="mt-0.5">☐</span>
                    <span>{it.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPendingParsed(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSaveChecklist} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1"
                  style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                  {saving ? "Saving…" : "Save Checklist"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ───────────────────────────────────────── */}
        {!showUploader && !pendingParsed && checklists.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", border: `1.5px dashed ${C.midGreen}` }}>
            <p className="text-4xl mb-3">📋</p>
            <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>
              No case plans yet
            </p>
            <p className="text-xs leading-relaxed mb-4" style={{ color: C.mutedText }}>
              Upload your case plan from CPS, a court order, or your caseworker. The AI will extract every task you need to complete into a personal checklist.
            </p>
            <button onClick={() => setShowUploader(true)}
              className="px-5 py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
              + Upload Case Plan
            </button>
          </div>
        )}

        {/* ── CHECKLISTS ─────────────────────────────────────────── */}
        {checklists.map(cl => {
          const total = cl.items?.length || 0;
          const done = cl.items?.filter(i => i.completed).length || 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isOpen = expanded[cl.id];

          return (
            <div key={cl.id} className="rounded-2xl overflow-hidden"
              style={{ border: `1.5px solid ${cl.status === "completed" ? C.midGreen + "80" : C.cream}` }}>
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                style={{ background: cl.status === "completed" ? "#EAF4EA" : C.darkGreen }}
                onClick={() => setExpanded(prev => ({ ...prev, [cl.id]: !prev[cl.id] }))}>
                <ProgressRing pct={pct} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight" style={{ color: cl.status === "completed" ? C.darkGreen : C.cream }}>
                    {cl.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.2)", color: cl.status === "completed" ? C.midGreen : C.lightGreen }}>
                      {SOURCE_LABELS[cl.source] || cl.source}
                    </span>
                    {cl.child_name && (
                      <span className="text-[10px]" style={{ color: cl.status === "completed" ? C.mutedText : C.lightGreen }}>
                        🧒 {cl.child_name}
                      </span>
                    )}
                    <span className="text-[10px]" style={{ color: cl.status === "completed" ? C.mutedText : C.lightGreen }}>
                      {done}/{total} done
                    </span>
                    {cl.status === "completed" && (
                      <span className="text-[10px] font-bold" style={{ color: C.midGreen }}>✅ Complete</span>
                    )}
                  </div>
                </div>
                {isOpen
                  ? <ChevronUp size={16} color={cl.status === "completed" ? C.mutedText : C.lightGreen} />
                  : <ChevronDown size={16} color={cl.status === "completed" ? C.mutedText : C.lightGreen} />}
              </div>

              {/* Expanded body */}
              {isOpen && (
                <div className="p-4 space-y-3" style={{ background: "#fff" }}>
                  {/* AI Summary */}
                  {cl.ai_summary && (
                    <div className="rounded-xl p-3" style={{ background: "#F0F7F2", border: `1px solid ${C.midGreen}30` }}>
                      <p className="text-[10px] font-bold mb-1" style={{ color: C.midGreen }}>WHAT THIS PLAN REQUIRES</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>{cl.ai_summary}</p>
                    </div>
                  )}

                  {/* Source doc link */}
                  {cl.source_document_url && (
                    <a href={cl.source_document_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] font-bold"
                      style={{ color: C.brown }}>
                      📄 View original document: {cl.source_document_name || "Case Plan"}
                    </a>
                  )}

                  {/* Items */}
                  {(cl.items || []).length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: C.mutedText }}>No items in this checklist.</p>
                  ) : (
                    <div className="space-y-2">
                      {cl.items.map(item => (
                        <ChecklistItem
                          key={item.id}
                          item={item}
                          onToggle={itemId => handleToggleItem(cl.id, itemId)}
                          onUploadProof={(itemId, url, fname) => handleUploadProof(cl.id, itemId, url, fname)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Delete */}
                  <button onClick={() => setDeleteConfirm(cl.id)}
                    className="flex items-center gap-1.5 text-[11px] font-bold mt-1"
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedText }}>
                    <Trash2 size={12} /> Remove this checklist
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add more button */}
        {!showUploader && !pendingParsed && checklists.length > 0 && (
          <button onClick={() => setShowUploader(true)}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: "#fff", border: `1.5px dashed ${C.midGreen}`, color: C.darkGreen, cursor: "pointer" }}>
            <Plus size={16} color={C.midGreen} /> Upload Another Case Plan
          </button>
        )}

        <div className="pb-8" />
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="w-full max-w-[340px] rounded-2xl p-5 space-y-4" style={{ background: "#fff" }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Remove this checklist?</p>
            <p className="text-xs" style={{ color: C.mutedText }}>This will permanently delete the checklist and all progress. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: "#B84C2A", color: "#fff", border: "none", cursor: "pointer" }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}