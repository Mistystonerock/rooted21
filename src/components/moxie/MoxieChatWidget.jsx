import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Bot, LifeBuoy, Loader2, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

function openingPrompt(label) {
  if (label === "Daily Check-in") return "Need help logging how today went?";
  if (label === "Case-plan Checklist") return "Want help sorting your next case-plan step?";
  if (label === "Visitation Tracker") return "I can help you record this visit step by step.";
  if (label === "Medication Manager") return "I can help you note doses, side effects, or mood changes.";
  if (label === "Safety Plan") return "I can help you make a calm safety plan.";
  if (label === "Housing & Benefits") return "I can help screen benefits, track recertification dates, or find local housing help.";
  if (label === "Legal Rights") return "I can help explain rights, find legal aid, or organize mandated-report notes.";
  return "Hi, I’m Moxie. I can help you find your next step.";
}

export default function MoxieChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const modulePath = window.location.pathname;
  const moduleLabel = useMemo(() => currentModuleLabel(modulePath), [modulePath]);
  const [messages, setMessages] = useState([
    { role: "assistant", content: openingPrompt(moduleLabel), suggestions: ["What should I do next?", "Help me document this", "Show crisis resources"] }
  ]);

  async function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean || sending) return;

    const nextMessages = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    const response = await base44.functions.invoke("moxieChat", {
      message: clean,
      modulePath,
      moduleLabel,
      history: nextMessages.map(({ role, content }) => ({ role, content }))
    });

    setMessages(prev => [...prev, {
      role: "assistant",
      content: response.data.reply,
      suggestions: response.data.suggestions || [],
      crisis: response.data.crisis
    }]);
    setSending(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 rounded-full px-4 py-3 shadow-xl"
        style={{ background: C.darkGreen, color: "#fff", border: `2px solid ${C.cream}` }}
        aria-label="Open Moxie chat"
      >
        <Bot size={18} className="mr-2" /> Ask Moxie
      </button>
    );
  }

  return (
    <section className="fixed bottom-20 right-3 z-50 w-[calc(100vw-24px)] max-w-[380px] overflow-hidden rounded-3xl shadow-2xl" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-3 p-3" style={{ background: C.darkGreen }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.16)" }}>
          <Bot size={20} color="#fff" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black" style={{ color: C.cream }}>Moxie</p>
          <p className="truncate text-[11px]" style={{ color: C.cream }}>Calm support, not legal or clinical advice</p>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-xl" style={{ color: C.cream, background: "transparent", border: "none" }} aria-label="Close Moxie chat">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto p-3" style={{ background: C.offWhite }}>
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

        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <Loader2 size={14} className="animate-spin" color={C.midGreen} />
              <span className="text-xs" style={{ color: C.mutedText }}>Moxie is thinking…</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 p-3" style={{ background: C.white }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask Moxie..."
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