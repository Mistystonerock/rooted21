import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ArrowLeft, Bot, Home, LifeBuoy, Loader2, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import MoxieModeSelector from "@/components/moxie/MoxieModeSelector";
import { MOXIE_MODES, inferMoxieMode } from "@/lib/moxie-ai-config";

const MODULE_LABELS = {
  "/daily-checkin": "Daily Check-in",
  "/behavior-logs": "Behavior Logs",
  "/case-plan-checklist": "Case-plan Checklist",
  "/visitation-tracker": "Visitation Tracker",
  "/court-ready-export": "Court-ready Export",
  "/certified-legal-export": "Certified Legal Export",
  "/documents": "Document Vault",
  "/education-hub": "Education Support",
  "/medication-manager": "Medication Manager",
  "/family-safety-crisis-plan": "Safety Plan",
  "/peer-support": "Peer Support",
  "/housing-resources": "Housing & Benefits",
  "/court-rights-education": "Legal Rights",
  "/legal-knowledge-base": "Legal Rights",
  "/legal": "Legal Rights"
};

function currentModuleLabel(pathname) {
  const key = Object.keys(MODULE_LABELS).find(path => pathname.startsWith(path));
  return key ? MODULE_LABELS[key] : "Rooted 21";
}

function openingPrompt(mode) {
  if (mode === "crisis_sos") return "I’m here with you. If there is immediate danger, call 911 now. Want a grounding step or crisis resource?";
  if (mode === "court_form_guidance") return "I can help organize court questions, forms, and documents. I give legal information, not legal advice.";
  if (mode === "resource_finder") return "I can help look for trusted resources and remind you when something may need verification.";
  if (mode === "school_iep_support") return "I can help prepare school questions, IEP/504 notes, or a calm teacher message.";
  if (mode === "founder_admin") return "Founder/Admin Moxie is ready for operations, resource review, and admin support.";
  return "Hi, I’m Moxie AI. I can help you find the next calm step.";
}

export default function MoxieChatWidget({ compact = false }) {
  const panelRef = useRef(null);
  const openerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const modulePath = window.location.pathname;
  const moduleLabel = useMemo(() => currentModuleLabel(modulePath), [modulePath]);
  const [mode, setMode] = useState(() => inferMoxieMode(modulePath));
  const isFounderDashboard = modulePath === "/founder-dashboard";
  const [messages, setMessages] = useState([
    { role: "assistant", content: openingPrompt(inferMoxieMode(modulePath)), suggestions: ["What should I do next?", "Help me document this", "Show crisis resources"] }
  ]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMoxie();
    };
    window.addEventListener("keydown", closeOnEscape);
    setTimeout(() => panelRef.current?.querySelector("button, input, a")?.focus?.(), 0);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function closeMoxie() {
    setOpen(false);
    setSending(false);
    setError("");
    document.body.style.overflow = "";
    setTimeout(() => openerRef.current?.focus?.(), 0);
  }

  function exitMoxie() {
    closeMoxie();
    window.location.assign(user ? "/dashboard" : "/");
  }

  function backFromMoxie() {
    closeMoxie();
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setMessages(prev => [...prev, {
      role: "assistant",
      content: openingPrompt(nextMode),
      suggestions: ["What should I do next?", "Help me prepare", "Show safety resources"]
    }]);
  }

  async function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean || sending) return;

    const nextMessages = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setSending(true);

    try {
      const response = await base44.functions.invoke("moxieChat", {
        message: clean,
        modulePath,
        moduleLabel,
        mode,
        history: nextMessages.map(({ role, content }) => ({ role, content }))
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.data.reply,
        suggestions: response.data.suggestions || [],
        crisis: response.data.crisis
      }]);
    } catch {
      setError("Something went wrong loading Moxie. You can return to the dashboard.");
    }
    setSending(false);
  }

  if (!open) {
    return (
      <div
        className="fixed left-3 z-40 flex items-center gap-2"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 6.75rem)" }}
      >
        <button
          ref={openerRef}
          type="button"
          onClick={() => setOpen(true)}
          className={`shadow-xl ${compact ? "rounded-full p-3" : "rounded-full px-4 py-3"}`}
          style={{ background: C.darkGreen, color: "#fff", border: `2px solid ${C.cream}` }}
          aria-label="Open Moxie AI chat"
          title="Ask Moxie AI"
        >
          <Bot size={compact ? 20 : 18} className={compact ? "" : "mr-2"} /> {!compact && "Ask Moxie AI"}
        </button>
      </div>
    );
  }

  return (
    <section ref={panelRef} className="fixed left-3 z-40 w-[calc(100vw-24px)] max-w-[380px] overflow-hidden rounded-3xl shadow-2xl" style={{ bottom: "calc(env(safe-area-inset-bottom) + 6.75rem)", background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2 p-3" style={{ background: C.darkGreen }}>
        <button type="button" onClick={backFromMoxie} className="rounded-xl px-2 py-2 text-xs font-black" style={{ color: C.cream, background: "rgba(255,255,255,0.12)", border: "none" }} aria-label="Back from Moxie chat">
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-black" style={{ color: C.cream }}>{MOXIE_MODES[mode]?.label || "Moxie AI"}</p>
        </div>
        <button type="button" onClick={closeMoxie} className="rounded-xl px-3 py-2 text-xs font-black" style={{ color: C.cream, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)" }} aria-label="Close Moxie chat">
          <X size={16} className="mr-1" /> Close
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ background: C.white, borderBottom: `1px solid ${C.cream}` }}>
        <span className="flex items-center gap-2 text-[11px] font-bold" style={{ color: C.mutedText }}><Bot size={14} /> Moxie support panel</span>
        <button type="button" onClick={exitMoxie} className="rounded-xl px-3 py-1.5 text-[11px] font-black" style={{ background: C.cream, color: C.darkGreen, border: "none" }} aria-label="Exit Moxie">
          <Home size={12} className="mr-1" /> Exit Moxie
        </button>
      </div>

      <MoxieModeSelector mode={mode} onChange={changeMode} user={user} />

      <div className="max-h-[min(420px,55vh)] space-y-3 overflow-y-auto p-3" style={{ background: C.offWhite }}>
        <a href="tel:988" className="flex items-center gap-2 rounded-2xl p-3 text-xs font-bold no-underline" style={{ background: "#FEF3EE", color: "#9A3412", border: "1px solid #F4C9B8" }}>
          <LifeBuoy size={15} /> If you are in immediate danger call 911 or emergency services. For crisis support, call or text 988.
        </a>

        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className="max-w-[86%] rounded-2xl px-3 py-2 text-sm" style={{ background: message.role === "user" ? C.darkGreen : C.white, color: message.role === "user" ? C.cream : C.darkText, border: message.role === "assistant" ? `1px solid ${C.cream}` : "none" }}>
              <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                {message.content}
              </ReactMarkdown>
              {message.suggestions?.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {message.suggestions.map(suggestion => (
                    <button key={suggestion} onClick={() => sendMessage(suggestion)} className="rounded-xl px-2 py-1.5 text-left text-[11px] font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="rounded-2xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{error}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={exitMoxie} className="rounded-xl px-2 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>Return to Dashboard</button>
              <button type="button" onClick={closeMoxie} className="rounded-xl px-2 py-2 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>Close Moxie</button>
            </div>
          </div>
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <Loader2 size={14} className="animate-spin" color={C.midGreen} />
              <span className="text-xs" style={{ color: C.mutedText }}>Moxie AI is thinking…</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 p-3" style={{ background: C.white }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={`Ask ${MOXIE_MODES[mode]?.shortLabel || "Moxie"} Moxie...`}
          className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ borderColor: C.cream }}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || sending} className="rounded-xl px-3" style={{ background: input.trim() ? C.darkGreen : C.cream, color: input.trim() ? C.cream : C.mutedText, border: "none" }} aria-label="Send message">
          <Send size={16} />
        </button>
      </div>
    </section>
  );
}