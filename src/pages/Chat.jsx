import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { SYSTEM_PROMPT } from "@/lib/rooted-constants";
import { ChevronLeft, Send, AlertTriangle, RefreshCw } from "lucide-react";
import TreeLogo from "@/components/rooted/TreeLogo";
import ChatMessage from "@/components/rooted/ChatMessage";
import { FOLLOW_UP_DEFAULTS } from "@/lib/rooted-constants";

function parseFollowUps(text) {
  try {
    const match = text.match(/FOLLOWUPS:(\[.*?\])/s);
    if (match) return JSON.parse(match[1]);
  } catch {}
  return null;
}

function stripFollowUps(text) {
  return text.replace(/\nFOLLOWUPS:\[.*?\]/s, "").trim();
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const crisis = params.get("crisis");
    const prefill = params.get("prompt");

    setMessages([
      {
        role: "assistant",
        content: "Hi — I'm here with you right now. 🌿\n\nTell me what's happening with your child. I'll give you trauma-informed guidance you can use immediately.\n\n*If there is immediate danger, please call 911. For mental health crisis, call or text 988.*",
      },
    ]);

    if (crisis || prefill) {
      const prompt = prefill
        ? decodeURIComponent(prefill)
        : "I need help right now. My child is having a crisis moment and I don't know what to do.";
      // slight delay so welcome message renders first
      setTimeout(() => autoSend(prompt), 300);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function autoSend(txt) {
    setInput("");
    setLoading(true);
    const userMsg = { role: "user", content: txt };
    const welcomeMsg = {
      role: "assistant",
      content: "Hi — I'm here with you right now. 🌿\n\nTell me what's happening with your child. I'll give you trauma-informed guidance you can use immediately.\n\n*If there is immediate danger, please call 911. For mental health crisis, call or text 988.*",
    };
    const nextMessages = [welcomeMsg, userMsg];
    setMessages(nextMessages);

    const convoHistory = nextMessages
      .filter(m => m.role !== "system")
      .map(m => `${m.role === "user" ? "Parent" : "Rooted 21 Support"}: ${m.content}`)
      .join("\n\n");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nConversation:\n${convoHistory}`,
      model: "claude_sonnet_4_6",
    });

    const raw = typeof reply === "string" ? reply : reply?.text || "I'm having trouble connecting. Please try again.";
    const replyText = stripFollowUps(raw);
    const suggestions = parseFollowUps(raw) || FOLLOW_UP_DEFAULTS;
    setMessages([...nextMessages, { role: "assistant", content: replyText }]);
    setFollowUps(suggestions);
    setLoading(false);

    const label = txt.length > 60 ? txt.slice(0, 57) + "…" : txt;
    const session = await base44.entities.CrisisSession.create({ prompt: txt, response: replyText, label });
    setSessionId(session?.id || null);
  }

  async function handleSend() {
    const txt = input.trim();
    if (!txt || loading) return;

    setInput("");
    setLoading(true);

    const userMsg = { role: "user", content: txt };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    // Build conversation context (skip the welcome message)
    const convoHistory = nextMessages
      .filter(m => m.role !== "system")
      .map(m => `${m.role === "user" ? "Parent" : "Rooted 21 Support"}: ${m.content}`)
      .join("\n\n");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nConversation:\n${convoHistory}`,
      model: "claude_sonnet_4_6",
    });

    const raw = typeof reply === "string" ? reply : reply?.text || "I'm having trouble connecting. Please try again.";
    const replyText = stripFollowUps(raw);
    const suggestions = parseFollowUps(raw) || FOLLOW_UP_DEFAULTS;

    const assistantMsg = { role: "assistant", content: replyText };
    const finalMessages = [...nextMessages, assistantMsg];
    setMessages(finalMessages);
    setFollowUps(suggestions);
    setLoading(false);

    // Save/update session on first real exchange
    const firstPrompt = nextMessages.find(m => m.role === "user")?.content || txt;
    if (!sessionId) {
      const label = firstPrompt.length > 60 ? firstPrompt.slice(0, 57) + "…" : firstPrompt;
      const session = await base44.entities.CrisisSession.create({
        prompt: firstPrompt,
        response: replyText,
        label,
      });
      setSessionId(session?.id || null);
    }
  }

  function handleReset() {
    setMessages([
      {
        role: "assistant",
        content: "Starting a new conversation. 🌿\n\nWhat's happening right now?",
      },
    ]);
    setSessionId(null);
    setInput("");
    setFollowUps([]);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10 flex-shrink-0"
        style={{ background: C.darkGreen }}
      >
        <Link to="/">
          <button className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
            <ChevronLeft size={18} color={C.cream} />
          </button>
        </Link>
        <TreeLogo size={28} />
        <div>
          <p className="font-serif font-bold text-sm leading-none" style={{ color: C.cream }}>
            Rooted 21 Parenting Support
          </p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>
            Trauma-informed · TBRI® based
          </p>
        </div>
        <button
          onClick={handleReset}
          className="ml-auto rounded-lg p-2 transition-opacity hover:opacity-70"
          style={{ background: "#ffffff18", border: "none" }}
          title="New conversation"
        >
          <RefreshCw size={14} color={C.lightGreen} />
        </button>
      </div>

      {/* Crisis banner */}
      <div
        className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ background: "#FEF3EE", borderBottom: "1px solid #F4C9B8" }}
      >
        <AlertTriangle size={12} color="#B84C2A" />
        <p className="text-[10px]" style={{ color: "#B84C2A" }}>
          Danger? Call <strong>911</strong>. Mental health crisis? Call/text <strong>988</strong>.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex items-start gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: C.midGreen }}
            >
              <span className="text-xs">🌿</span>
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ background: C.white, border: `1px solid ${C.cream}` }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: C.midGreen,
                      animation: `blink 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Follow-up suggestions */}
      {followUps.length > 0 && !loading && (
        <div className="flex-shrink-0 px-4 pt-2 pb-1 flex gap-2 overflow-x-auto" style={{ borderTop: `1px solid ${C.cream}`, background: C.offWhite }}>
          {followUps.map((q, i) => (
            <button
              key={i}
              onClick={() => { setInput(q); inputRef.current?.focus(); }}
              className="flex-shrink-0 text-[11px] font-bold px-3 py-2 rounded-full transition-all hover:opacity-80 whitespace-nowrap"
              style={{ background: C.cream, color: C.darkGreen, border: `1px solid ${C.midGreen}` }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="flex-shrink-0 px-4 py-3 flex gap-2 items-end"
        style={{
          background: C.white,
          borderTop: `1px solid ${C.cream}`,
          boxShadow: "0 -2px 12px rgba(47,75,58,.06)",
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Describe what's happening right now…"
          rows={2}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
          style={{
            border: `1.5px solid ${C.cream}`,
            background: C.offWhite,
            maxHeight: 120,
            color: "#000000",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
          style={{
            background: input.trim() ? C.darkGreen : C.cream,
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          <Send size={16} color={input.trim() ? C.white : C.mutedText} />
        </button>
      </div>
    </div>
  );
}