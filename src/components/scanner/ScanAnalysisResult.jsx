import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Save, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "court_order", label: "Court Order" },
  { value: "iep", label: "IEP" },
  { value: "medical", label: "Medical" },
  { value: "legal", label: "Legal" },
  { value: "school", label: "School" },
  { value: "therapy", label: "Therapy" },
  { value: "financial", label: "Financial" },
  { value: "other", label: "Other" },
];

export default function ScanAnalysisResult({ analysis, previewUrl, onSave, onRescan, saving }) {
  const [title, setTitle] = useState(analysis.suggested_title || "");
  const [category, setCategory] = useState(analysis.suggested_category || "other");
  const [tags, setTags] = useState(analysis.suggested_tags || []);
  const [newTag, setNewTag] = useState("");
  const [summaryNote, setSummaryNote] = useState(analysis.summary_note || "");
  const [saveAsNote, setSaveAsNote] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [childName, setChildName] = useState("");
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [cases, setCases] = useState([]);
  const [children, setChildren] = useState([]);
  const [showRawText, setShowRawText] = useState(false);
  const [showKeyData, setShowKeyData] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      const [cs, ch] = await Promise.all([
        base44.entities.CaseFile.filter({ parent_email: user.email }, "-created_date", 20),
        base44.entities.ChildProfile.list("-created_date", 10),
      ]);
      setCases(cs);
      setChildren(ch);
      if (ch.length > 0) setChildName(ch[0].first_name);
    });
  }, []);

  function removeTag(t) { setTags(prev => prev.filter(x => x !== t)); }
  function addTag() {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); }
    setNewTag("");
  }

  const kd = analysis.key_data || {};
  const hasFlags = analysis.flags && analysis.flags.length > 0;

  return (
    <div className="space-y-4">
      {/* Thumbnail + confidence */}
      <div className="flex items-start gap-3">
        {previewUrl && (
          <img src={previewUrl} alt="Document" className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            style={{ border: `2px solid ${C.cream}` }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: analysis.confidence === "high" ? "#EAF4EA" : analysis.confidence === "medium" ? "#FFFBEE" : "#FEF3EE",
                color: analysis.confidence === "high" ? C.darkGreen : analysis.confidence === "medium" ? "#7A5200" : "#B84C2A",
              }}>
              {analysis.confidence?.toUpperCase()} CONFIDENCE
            </span>
          </div>
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{analysis.document_type}</p>
          <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
            AI-detected type — confirm below before saving
          </p>
        </div>
      </div>

      {/* Urgent flags */}
      {hasFlags && (
        <div className="rounded-xl p-3 space-y-1" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={13} color="#B84C2A" />
            <p className="text-[10px] font-bold" style={{ color: "#B84C2A" }}>URGENT ITEMS DETECTED</p>
          </div>
          {analysis.flags.map((f, i) => (
            <p key={i} className="text-[11px]" style={{ color: "#B84C2A" }}>• {f}</p>
          ))}
        </div>
      )}

      {/* Key data */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.cream}` }}>
        <button
          onClick={() => setShowKeyData(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3"
          style={{ background: C.white, border: "none", cursor: "pointer" }}
        >
          <p className="text-[10px] font-bold" style={{ color: C.darkGreen }}>🔍 EXTRACTED KEY DATA</p>
          {showKeyData ? <ChevronUp size={14} color={C.mutedText} /> : <ChevronDown size={14} color={C.mutedText} />}
        </button>
        {showKeyData && (
          <div className="px-4 pb-4 space-y-2" style={{ background: C.white }}>
            {[
              { key: "dates", label: "📅 Dates" },
              { key: "names", label: "👤 Names" },
              { key: "organizations", label: "🏢 Organizations" },
              { key: "action_items", label: "✅ Action Items / Deadlines" },
              { key: "medications", label: "💊 Medications" },
              { key: "amounts", label: "📊 Amounts / Scores" },
            ].map(({ key, label }) => kd[key] && kd[key].length > 0 && (
              <div key={key}>
                <p className="text-[9px] font-bold mb-1" style={{ color: C.mutedText }}>{label}</p>
                <div className="flex flex-wrap gap-1">
                  {kd[key].map((v, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editable summary note */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <label className="block text-[10px] font-bold" style={{ color: C.mutedText }}>AI SUMMARY NOTE (editable)</label>
        <textarea
          value={summaryNote}
          onChange={e => setSummaryNote(e.target.value)}
          rows={4}
          className="w-full rounded-xl px-3 py-2 text-xs resize-none border outline-none"
          style={{ borderColor: C.cream, background: C.offWhite, color: "#000" }}
        />
      </div>

      {/* Title + category */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <div>
          <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>DOCUMENT TITLE</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }} />
        </div>
        <div>
          <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>CATEGORY</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{
                  background: category === c.value ? C.darkGreen : C.offWhite,
                  color: category === c.value ? "#fff" : C.darkGreen,
                  border: `1px solid ${category === c.value ? C.darkGreen : C.cream}`,
                  cursor: "pointer",
                }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <label className="block text-[10px] font-bold" style={{ color: C.mutedText }}>CASE TAGS</label>
        <div className="flex flex-wrap gap-1.5 min-h-6">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: C.darkGreen + "18", color: C.darkGreen, border: `1px solid ${C.darkGreen}33` }}>
              #{t}
              <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedText, fontSize: 10 }}>✕</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newTag} onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTag()}
            placeholder="Add tag…"
            className="flex-1 rounded-xl px-3 py-2 text-xs border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }} />
          <button onClick={addTag}
            className="px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: C.midGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            Add
          </button>
        </div>
      </div>

      {/* Save options */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>SAVE OPTIONS</p>

        {children.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>CHILD</label>
            <select value={childName} onChange={e => setChildName(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}>
              <option value="">None</option>
              {children.map(c => <option key={c.id} value={c.first_name}>{c.first_name}</option>)}
            </select>
          </div>
        )}

        {cases.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>LINK TO CASE (optional)</label>
            <select value={caseId} onChange={e => setCaseId(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}>
              <option value="">No case</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.child_name} — {c.case_type}</option>)}
            </select>
          </div>
        )}

        {analysis.calendar_items?.length > 0 && (
          <label className="flex items-start gap-3 cursor-pointer rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <input type="checkbox" checked={addToCalendar} onChange={e => setAddToCalendar(e.target.checked)}
              style={{ accentColor: C.darkGreen, width: 15, height: 15, marginTop: 2 }} />
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
              Add <strong>{analysis.calendar_items.length}</strong> extracted date{analysis.calendar_items.length !== 1 ? "s" : ""} / deadline{analysis.calendar_items.length !== 1 ? "s" : ""} to the <strong>Care Calendar</strong> for reminders.
            </p>
          </label>
        )}

        {caseId && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={saveAsNote} onChange={e => setSaveAsNote(e.target.checked)}
              style={{ accentColor: C.darkGreen, width: 15, height: 15 }} />
            <p className="text-xs" style={{ color: C.darkGreen }}>
              Also save AI summary as a <strong>Case Note</strong> (visible to care team)
            </p>
          </label>
        )}
      </div>

      {/* Raw OCR text toggle */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.cream}` }}>
        <button
          onClick={() => setShowRawText(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3"
          style={{ background: C.white, border: "none", cursor: "pointer" }}
        >
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>📄 VIEW FULL EXTRACTED TEXT (OCR)</p>
          {showRawText ? <ChevronUp size={14} color={C.mutedText} /> : <ChevronDown size={14} color={C.mutedText} />}
        </button>
        {showRawText && (
          <div className="px-4 pb-4" style={{ background: C.white }}>
            <pre className="text-[10px] whitespace-pre-wrap leading-relaxed" style={{ color: C.darkGreen, fontFamily: "monospace" }}>
              {analysis.extracted_text || "No text could be extracted."}
            </pre>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={onRescan}
          className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
          <RefreshCw size={14} /> Scan Again
        </button>
        <button
          onClick={() => onSave({ title, category, tags, summaryNote, caseId, childName, saveAsNote, addToCalendar })}
          disabled={saving || !title}
          className="flex-[2] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: title ? C.darkGreen : C.mutedText,
            color: "#fff", border: "none",
            cursor: saving || !title ? "not-allowed" : "pointer",
            opacity: saving ? 0.75 : 1,
          }}>
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Document</>}
        </button>
      </div>
    </div>
  );
}