import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import CommunicationAnalysisResult from "@/components/communications/CommunicationAnalysisResult";
import { FileUp, Loader2, Sparkles, X } from "lucide-react";

export default function CommunicationToneTool() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("co-parent communication");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileText = await file.text();
    setText(fileText);
    setResult(null);
    setError("");
  }

  async function analyze() {
    if (!text.trim()) {
      setError("Please paste or upload a communication thread first.");
      return;
    }

    setLoading(true);
    setError("");
    const response = await base44.functions.invoke("analyzeCommunicationText", { text, context });
    setResult(response.data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Communication Tone Check" subtitle="Court-appropriate rewrite support" backTo="/dashboard" />

      <div className="max-w-[680px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-xl" style={{ color: "#fff" }}>AI Communication Review</p>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: C.lightGreen }}>
            Paste texts or emails with a co-parent, school, CPS, or agency to get tone feedback, trigger warnings, and a calmer professional rewrite.
          </p>
        </div>

        <div className="rounded-xl p-3" style={{ background: "#FEF9EC", border: "1px solid #E8C96A" }}>
          <p className="text-[11px] leading-relaxed" style={{ color: "#6b4300" }}>
            This tool helps with communication clarity and does not provide legal advice. Avoid uploading highly sensitive information unless needed for the review.
          </p>
        </div>

        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1" style={{ color: C.mutedText }}>Communication type</label>
            <select value={context} onChange={e => setContext(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
              <option value="co-parent communication">Co-parent communication</option>
              <option value="agency or CPS communication">Agency / CPS communication</option>
              <option value="school communication">School communication</option>
              <option value="court-related communication">Court-related communication</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: C.mutedText }}>Paste thread or draft</label>
              {text && (
                <button onClick={() => { setText(""); setResult(null); }} className="text-[10px] font-bold flex items-center gap-1" style={{ background: "none", border: "none", color: C.mutedText, cursor: "pointer" }}>
                  <X size={11} /> Clear
                </button>
              )}
            </div>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setResult(null); }}
              placeholder="Paste text messages, emails, or a draft response here..."
              rows={10}
              className="w-full rounded-xl px-3 py-3 text-sm border outline-none resize-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex-1 rounded-xl py-3 px-4 text-xs font-bold flex items-center justify-center gap-2" style={{ background: C.cream, color: C.darkGreen, cursor: "pointer" }}>
              <FileUp size={15} /> Upload text/email file
              <input type="file" accept=".txt,.eml,.md,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <button onClick={analyze} disabled={loading} className="flex-1 rounded-xl py-3 px-4 text-xs font-bold flex items-center justify-center gap-2" style={{ background: loading ? `${C.midGreen}80` : C.darkGreen, color: "#fff", border: "none", cursor: loading ? "default" : "pointer" }}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Reviewing…</> : <><Sparkles size={15} /> Analyze tone</>}
            </button>
          </div>

          {error && <p className="text-xs font-bold" style={{ color: "#C0392B" }}>{error}</p>}
        </div>

        <CommunicationAnalysisResult result={result} />
        <div className="pb-8" />
      </div>
    </div>
  );
}