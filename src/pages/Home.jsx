import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { SYSTEM_PROMPT } from "@/lib/rooted-constants";
import HomeScreen from "@/components/rooted/HomeScreen";
import LoadingScreen from "@/components/rooted/LoadingScreen";
import ResultScreen from "@/components/rooted/ResultScreen";
import HistorySidebar from "@/components/rooted/HistorySidebar";

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [response, setResponse] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  async function handleHelp(prompt) {
    setError("");
    setScreen("loading");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nParent says: ${prompt}`,
      model: "claude_sonnet_4_6",
    });

    const replyText = typeof reply === "string" ? reply : reply?.text || "";

    if (!replyText) {
      setError("Couldn't connect — please try again.");
      setScreen("home");
      return;
    }

    // Save session to DB (fire and forget)
    const label = prompt.length > 60 ? prompt.slice(0, 57) + "…" : prompt;
    base44.entities.CrisisSession.create({
      prompt,
      response: replyText,
      label,
    });

    const msgs = [
      { role: "user", content: prompt },
      { role: "assistant", content: replyText },
    ];
    setMessages(msgs);
    setResponse(replyText);
    setScreen("result");
  }

  function handleReset() {
    setScreen("home");
    setResponse("");
    setMessages([]);
    setError("");
  }

  function handleRestore(session) {
    const msgs = [
      { role: "user", content: session.prompt },
      { role: "assistant", content: session.response },
    ];
    setMessages(msgs);
    setResponse(session.response);
    setScreen("result");
  }

  return (
    <>
      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestore}
      />

      {screen === "loading" && <LoadingScreen />}
      {screen === "result" && (
        <ResultScreen
          response={response}
          onReset={handleReset}
          initialMessages={messages}
          onOpenHistory={() => setHistoryOpen(true)}
        />
      )}
      {screen === "home" && (
        <HomeScreen
          onHelp={handleHelp}
          error={error}
          onOpenHistory={() => setHistoryOpen(true)}
        />
      )}
    </>
  );
}