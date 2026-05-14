import ReactMarkdown from "react-markdown";
import { Bot, ClipboardList } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function AIPrepPlan({ loading, plan }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${C.midGreen}18` }}>
          {loading ? <Bot size={18} color={C.midGreen} className="animate-pulse" /> : <ClipboardList size={18} color={C.midGreen} />}
        </div>
        <div>
          <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>AI Preparation Plan</p>
          <p className="text-xs" style={{ color: C.mutedText }}>Talking points and next steps from your case data</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-3 rounded-full animate-pulse" style={{ background: C.cream }} />
          <div className="h-3 rounded-full animate-pulse w-5/6" style={{ background: C.cream }} />
          <div className="h-3 rounded-full animate-pulse w-2/3" style={{ background: C.cream }} />
        </div>
      ) : plan ? (
        <ReactMarkdown className="prose prose-sm max-w-none text-sm leading-relaxed">
          {plan}
        </ReactMarkdown>
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: C.mutedText }}>
          Generate a plan to see suggested meeting talking points, documents to gather, and preparation tasks.
        </p>
      )}
    </div>
  );
}