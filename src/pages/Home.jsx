import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { SYSTEM_PROMPT } from "@/lib/rooted-constants";
import HomeScreen from "@/components/rooted/HomeScreen";
import LoadingScreen from "@/components/rooted/LoadingScreen";
import ResultScreen from "@/components/rooted/ResultScreen";

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [response, setResponse] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  async function handleHelp(prompt) {
    setError("");
    setScreen("loading");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nParent says: ${prompt}\n\nProvide your response as Rooted 21:`,
    });

    const replyText = typeof reply === "string" ? reply : reply?.text || "";

    if (!replyText) {
      setError("Couldn't connect — please try again.");
      setScreen("home");
      return;
    }

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

  if (screen === "loading") return <LoadingScreen />;
  if (screen === "result") {
    return (
      <ResultScreen
        response={response}
        onReset={handleReset}
        initialMessages={messages}
      />
    );
  }
  return <HomeScreen onHelp={handleHelp} error={error} />;
}