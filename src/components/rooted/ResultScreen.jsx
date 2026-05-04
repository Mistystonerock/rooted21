import { useState, useEffect, useRef } from "react";
import { C, SYSTEM_PROMPT } from "@/lib/rooted-constants";
import { base44 } from "@/api/base44Client";
import { Clock } from "lucide-react";
import TreeLogo from "./TreeLogo";
import LoadingDots from "./LoadingDots";
import ResponseContent from "./ResponseContent";
import CheckInCard from "./CheckInCard";

export default function ResultScreen({ response, onReset, initialMessages, onOpenHistory, sessionId }) {
  const [followTxt, setFollowTxt] = useState("");
  const [followResp, setFollowResp] = useState("");
  const [history, setHistory] = useState(initialMessages || []);
  const [busy, setBusy] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [followResp, busy]);

  async function sendFollow() {
    if (!followTxt.trim() || busy) return;

    const txt = followTxt.trim();
    setFollowTxt("");
    setBusy(true);

    const next = [...history, { role: "user", content: txt }];

    const conversationText = next
      .map((m) => `${m.role === "user" ? "Parent" : "Rooted 21"}: ${m.content}`)
      .join("\n\n");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nConversation so far:\n${conversationText}`,
      model: "claude_sonnet_4_6",
    });

    const replyText = typeof reply === "string" ? reply : reply?.text || "Please try again in a moment.";
    setHistory([...next, { role: "assistant", content: replyText }]);
    setFollowResp(replyText);
    setBusy(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Sticky header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: C.darkGreen }}
      >
        <button
          onClick={onReset}
          className="border-none rounded-lg px-3 py-2 font-bold text-sm transition-all hover:opacity-80"
          style={{ background: "#ffffff22", color: C.white }}
        >
          ← Back
        </button>
        <TreeLogo size={32} />
        <div className="font-serif font-bold" style={{ color: C.white }}>
          Rooted <span style={{ color: C.gold }}>21</span>
        </div>
        <button
          onClick={onOpenHistory}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: "#ffffff18", border: "none", color: C.lightGreen }}
        >
          <Clock size={13} />
          History
        </button>
      </div>

      <div className="max-w-[520px] mx-auto p-4">
        {/* Calm reminder */}
        <div className="rounded-xl p-3.5 mb-4" style={{ background: C.darkGreen }}>
          <p className="m-0 font-serif font-bold" style={{ color: C.cream }}>
            Your calm is the first intervention.
          </p>
          <p className="m-0 mt-1 text-xs" style={{ color: C.lightGreen }}>
            Read this, breathe, then act.
          </p>
        </div>

        {/* Main response */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: C.white,
            boxShadow: "0 4px 24px rgba(47,75,58,.10)",
            border: `1px solid ${C.cream}`,
          }}
        >
          <ResponseContent text={response} />
        </div>

        {/* Follow-up input */}
        <div
          className="rounded-2xl p-4 mt-3.5"
          style={{ background: C.white, border: `1px solid ${C.cream}` }}
        >
          <p className="font-serif text-[15px] font-bold mb-2" style={{ color: C.darkGreen }}>
            Still need support?
          </p>
          <div className="flex gap-2">
            <input
              value={followTxt}
              onChange={(e) => setFollowTxt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendFollow()}
              placeholder="Example: It's getting worse..."
              className="flex-1 py-2.5 px-3 rounded-xl text-sm font-sans"
              style={{
                border: `1.5px solid ${C.cream}`,
                background: C.offWhite,
              }}
            />
            <button
              onClick={sendFollow}
              disabled={busy || !followTxt.trim()}
              className="px-4 py-2.5 rounded-xl border-none font-extrabold transition-all hover:opacity-90 active:scale-95"
              style={{
                background: followTxt.trim() ? C.darkGreen : C.cream,
                color: followTxt.trim() ? C.white : C.mutedText,
                cursor: followTxt.trim() ? "pointer" : "default",
              }}
            >
              →
            </button>
          </div>
        </div>

        {busy && <LoadingDots />}

        {followResp && (
          <div
            className="rounded-2xl p-5 mt-3.5"
            style={{
              background: C.white,
              border: `1px solid ${C.cream}`,
            }}
          >
            <ResponseContent text={followResp} />
          </div>
        )}

        {!checkedIn && (
          <CheckInCard sessionId={sessionId} onDone={() => setCheckedIn(true)} />
        )}

        <div ref={bottomRef} />

        <button
          onClick={onReset}
          className="w-full py-3.5 rounded-xl border-none font-extrabold text-[15px] mt-4 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}
        >
          Handle Another Situation →
        </button>
      </div>
    </div>
  );
}