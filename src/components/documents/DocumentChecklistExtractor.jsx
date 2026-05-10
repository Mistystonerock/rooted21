import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Sparkles, Loader2, CheckCircle2, X, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

const CATEGORY_ICONS = {
  service: "🏥",
  appointment: "📅",
  document: "📄",
  court_order: "⚖️",
  behavioral: "🧠",
  housing: "🏠",
  employment: "💼",
  other: "📋",
};

export default function DocumentChecklistExtractor({ doc, children, onDone, onCancel }) {
  const [phase, setPhase] = useState("selecting"); // selecting | extracting | review | saving | done
  const [selectedChildName, setSelectedChildName] = useState(children[0]?.first_name || "");
  const [customChildName, setCustomChildName] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(null);

  const effectiveChildName = selectedChildName === "__custom__" ? customChildName : selectedChildName;

  async function runExtraction() {
    if (!effectiveChildName.trim()) {
      setError("Please enter the child's name.");
      return;
    }
    setError("");
    setPhase("extracting");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a child welfare case plan analyst. Analyze this court-ordered document and extract ALL actionable requirements, deadlines, appointments, and tasks a parent/caregiver must complete.

Document title: "${doc.title}"
Document category: "${doc.category}"
Document description: "${doc.description || "N/A"}"
Child's name: "${effectiveChildName}"

Extract every requirement you can find. For each one, determine:
- text: clear plain-language description of the task
- category: one of: service, appointment, document, court_order, behavioral, housing, employment, other  
- due_date: ISO date string if mentioned (YYYY-MM-DD), or null
- priority: "high" if court-ordered or has a deadline, "medium" otherwise

Also provide:
- title: a short checklist name (e.g. "Court Order Requirements – June 2026")
- ai_summary: a 2-3 sentence plain-language summary of what this document requires

Respond ONLY with valid JSON:
{
  "title": "...",
  "ai_summary": "...",
  "items": [
    { "text": "...", "category": "...", "due_date": "...", "priority": "..." },
    ...
  ]
}`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          ai_summary: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                category: { type: "string" },
                due_date: { type: "string" },
                priority: { type: "string" },
              }
            }
          }
        }
      },
      file_urls: [doc.file_url],
    });

    const items = (result.items || []).map((item, i) => ({
      id: `item_${Date.now()}_${i}`,
      text: item.text,
      category: item.category || "other",
      due_date: item.due_date || null,
      completed: false,
      notes: "",
    }));

    setExtracted({ title: result.title, ai_summary: result.ai_summary });
    setEditedItems(items);
    setPhase("review");
  }

  function toggleItem(id) {
    setEditedItems(prev => prev.filter(it => it.id !== id));
  }

  function updateItem(id, field, value) {
    setEditedItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  }

  function toggleExpand(id) {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSave() {
    setPhase("saving");
    const user = await base44.auth.me();

    const checklist = await base44.entities.CasePlanChecklist.create({
      parent_email: user.email,
      child_name: effectiveChildName,
      title: extracted.title,
      source: doc.category === "court_order" ? "court" : doc.category === "iep" ? "professional" : "cps",
      source_document_url: doc.file_url,
      source_document_name: doc.file_name || doc.title,
      items: editedItems,
      status: "active",
      ai_summary: extracted.ai_summary,
    });

    setSavedId(checklist.id);
    setPhase("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="w-full max-w-[520px] rounded-t-3xl overflow-hidden flex flex-col" style={{ background: C.offWhite, maxHeight: "92vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} color={C.gold} />
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
              {phase === "done" ? "Checklist Created!" : "AI Checklist Extractor"}
            </p>
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.lightGreen} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">

          {/* Doc info banner */}
          <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <span style={{ fontSize: 20 }}>
              {doc.category === "court_order" ? "⚖️" : doc.category === "iep" ? "🏫" : "📄"}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-xs truncate" style={{ color: C.darkGreen }}>{doc.title}</p>
              <p className="text-[10px]" style={{ color: C.mutedText }}>{doc.file_name || doc.category}</p>
            </div>
          </div>

          {/* SELECTING PHASE */}
          {phase === "selecting" && (
            <div className="space-y-4">
              <div className="rounded-xl px-4 py-3" style={{ background: "#FEF9EC", border: "1px solid #E8C96A" }}>
                <p className="text-xs leading-relaxed" style={{ color: "#7A5200" }}>
                  <strong>✨ AI will scan this document</strong> and automatically extract all court-ordered tasks, deadlines, appointments, and requirements into a new Case Plan Checklist you can track.
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>WHICH CHILD IS THIS FOR?</p>
                {children.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {children.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChildName(c.first_name)}
                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: selectedChildName === c.first_name ? C.darkGreen : "#fff",
                          color: selectedChildName === c.first_name ? "#fff" : C.darkGreen,
                          border: `1.5px solid ${selectedChildName === c.first_name ? C.darkGreen : C.cream}`,
                          cursor: "pointer",
                        }}
                      >
                        🧒 {c.first_name}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedChildName("__custom__")}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: selectedChildName === "__custom__" ? C.darkGreen : "#fff",
                        color: selectedChildName === "__custom__" ? "#fff" : C.darkGreen,
                        border: `1.5px solid ${selectedChildName === "__custom__" ? C.darkGreen : C.cream}`,
                        cursor: "pointer",
                      }}
                    >
                      + Other
                    </button>
                  </div>
                )}
                {(selectedChildName === "__custom__" || children.length === 0) && (
                  <input
                    type="text"
                    placeholder="Child's first name"
                    value={customChildName}
                    onChange={e => setCustomChildName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                    style={{ borderColor: C.cream, background: "#fff" }}
                  />
                )}
              </div>

              {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FDECEC", color: "#C0392B" }}>{error}</p>}

              <button
                onClick={runExtraction}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Sparkles size={16} /> Extract Requirements with AI
              </button>
            </div>
          )}

          {/* EXTRACTING PHASE */}
          {phase === "extracting" && (
            <div className="py-10 flex flex-col items-center gap-4">
              <Loader2 size={36} color={C.midGreen} className="animate-spin" />
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Scanning document…</p>
              <p className="text-xs text-center" style={{ color: C.mutedText }}>AI is reading every requirement, deadline, and task. This takes about 15 seconds.</p>
            </div>
          )}

          {/* REVIEW PHASE */}
          {phase === "review" && extracted && (
            <div className="space-y-4">
              {/* AI Summary */}
              <div className="rounded-xl px-4 py-3" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={12} color={C.midGreen} />
                  <p className="text-[10px] font-bold" style={{ color: C.darkGreen }}>AI SUMMARY</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{extracted.ai_summary}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>
                  {editedItems.length} REQUIREMENT{editedItems.length !== 1 ? "S" : ""} FOUND — TAP TO REMOVE UNWANTED
                </p>
              </div>

              <div className="space-y-2">
                {editedItems.map(item => (
                  <div key={item.id} className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}`, background: "#fff" }}>
                    <div className="flex items-start gap-3 px-3 py-2.5">
                      <span className="text-base flex-shrink-0 mt-0.5">{CATEGORY_ICONS[item.category] || "📋"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-snug" style={{ color: C.darkGreen }}>{item.text}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.cream, color: C.darkGreen }}>
                            {item.category}
                          </span>
                          {item.due_date && (
                            <span className="text-[9px]" style={{ color: C.brown }}>📅 {item.due_date}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="p-1.5 rounded-lg"
                          style={{ background: C.offWhite, border: "none", cursor: "pointer" }}
                        >
                          {expandedItems[item.id] ? <ChevronUp size={11} color={C.mutedText} /> : <ChevronDown size={11} color={C.mutedText} />}
                        </button>
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="p-1.5 rounded-lg"
                          style={{ background: "#FEE2E2", border: "none", cursor: "pointer" }}
                          title="Remove this item"
                        >
                          <X size={11} color="#DC2626" />
                        </button>
                      </div>
                    </div>

                    {expandedItems[item.id] && (
                      <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: C.cream }}>
                        <div className="pt-2">
                          <p className="text-[9px] font-bold mb-1" style={{ color: C.mutedText }}>DUE DATE</p>
                          <input
                            type="date"
                            value={item.due_date || ""}
                            onChange={e => updateItem(item.id, "due_date", e.target.value || null)}
                            className="w-full px-2.5 py-2 rounded-lg border outline-none text-xs"
                            style={{ borderColor: C.cream, background: C.offWhite }}
                          />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold mb-1" style={{ color: C.mutedText }}>NOTES</p>
                          <input
                            type="text"
                            placeholder="Add a note..."
                            value={item.notes}
                            onChange={e => updateItem(item.id, "notes", e.target.value)}
                            className="w-full px-2.5 py-2 rounded-lg border outline-none text-xs"
                            style={{ borderColor: C.cream, background: C.offWhite }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {editedItems.length === 0 && (
                <div className="rounded-xl p-4 flex gap-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
                  <AlertTriangle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: "#B84C2A" }}>All items removed. Add at least one item before saving.</p>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={editedItems.length === 0}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: C.darkGreen, color: "#fff", border: "none",
                  cursor: editedItems.length === 0 ? "default" : "pointer",
                  opacity: editedItems.length === 0 ? 0.5 : 1,
                }}
              >
                <CheckCircle2 size={16} /> Save {editedItems.length} Items to Checklist
              </button>
            </div>
          )}

          {/* SAVING PHASE */}
          {phase === "saving" && (
            <div className="py-10 flex flex-col items-center gap-3">
              <Loader2 size={28} color={C.midGreen} className="animate-spin" />
              <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Saving checklist…</p>
            </div>
          )}

          {/* DONE PHASE */}
          {phase === "done" && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#EAF4EA" }}>
                <CheckCircle2 size={32} color={C.midGreen} />
              </div>
              <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>Checklist Created!</p>
              <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
                {editedItems.length} requirements from <strong>{doc.title}</strong> have been added to your Case Plan Checklist for <strong>{effectiveChildName}</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={onDone}
                  className="py-3 rounded-xl font-bold text-sm"
                  style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
                >
                  Done
                </button>
                <a
                  href="/case-plan-checklist"
                  className="py-3 rounded-xl font-bold text-sm flex items-center justify-center"
                  style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}
                >
                  View Checklist →
                </a>
              </div>
            </div>
          )}

          <div className="pb-4" />
        </div>
      </div>
    </div>
  );
}