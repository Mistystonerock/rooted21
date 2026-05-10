import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Mic, MicOff, Loader2, Sparkles, X } from "lucide-react";

export default function VoiceNoteRecorder({ onNoteReady, onCancel }) {
  const [phase, setPhase] = useState("idle"); // idle | recording | processing | done
  const [transcript, setTranscript] = useState("");
  const [structured, setStructured] = useState(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t + " ";
        else interim = t;
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (e) => {
      setError("Microphone error: " + e.error);
      setPhase("idle");
    };

    recognition.onend = () => {
      if (finalTranscript.trim()) {
        setTranscript(finalTranscript.trim());
        summarizeWithAI(finalTranscript.trim());
      } else {
        setPhase("idle");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setPhase("recording");
    setError("");
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setPhase("processing");
  }

  async function summarizeWithAI(raw) {
    setPhase("processing");
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `A parent or caregiver just dictated the following observation about their child or a recent event. 
      
Turn it into a structured case note with:
- A short title (5-8 words)
- A note_type: one of: update, concern, win, action_item, meeting_notes
- A clean, organized body (2-4 short paragraphs max) using plain language

Raw dictation:
"${raw}"

Respond ONLY with valid JSON in this exact format:
{
  "title": "...",
  "note_type": "...",
  "body": "..."
}`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          note_type: { type: "string" },
          body: { type: "string" }
        }
      }
    });

    setStructured(result);
    setPhase("done");
  }

  function handleUse() {
    onNoteReady(structured);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${phase === "recording" ? "#C0392B" : C.midGreen}` }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: phase === "recording" ? "#FDECEC" : C.darkGreen }}>
        <div className="flex items-center gap-2">
          <Mic size={15} color={phase === "recording" ? "#C0392B" : C.gold} />
          <p className="font-bold text-sm" style={{ color: phase === "recording" ? "#C0392B" : C.cream }}>
            {phase === "idle" && "Voice Note"}
            {phase === "recording" && "🔴 Recording…"}
            {phase === "processing" && "Summarizing with AI…"}
            {phase === "done" && "Note Ready"}
          </p>
        </div>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <X size={16} color={phase === "recording" ? "#C0392B" : C.lightGreen} />
        </button>
      </div>

      <div className="p-4 space-y-3" style={{ background: "#fff" }}>
        {/* Error */}
        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FDECEC", color: "#C0392B" }}>{error}</p>
        )}

        {/* Idle state */}
        {phase === "idle" && (
          <>
            <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
              Tap the mic and speak freely — describe a meeting, incident, or observation. AI will turn it into a structured note.
            </p>
            <button
              onClick={startRecording}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              <Mic size={16} /> Start Dictating
            </button>
          </>
        )}

        {/* Recording state */}
        {phase === "recording" && (
          <>
            <div className="rounded-xl p-3 min-h-[80px]" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>
                {transcript || <span style={{ color: C.mutedText }}>Listening… speak now</span>}
              </p>
            </div>
            <button
              onClick={stopRecording}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "#C0392B", color: "#fff", border: "none", cursor: "pointer" }}
            >
              <MicOff size={16} /> Stop & Summarize
            </button>
          </>
        )}

        {/* Processing state */}
        {phase === "processing" && (
          <div className="py-6 flex flex-col items-center gap-3">
            <Loader2 size={28} color={C.midGreen} className="animate-spin" />
            <p className="text-xs font-bold" style={{ color: C.mutedText }}>AI is organizing your note…</p>
          </div>
        )}

        {/* Done state */}
        {phase === "done" && structured && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  style={{ background: C.cream, color: C.darkGreen }}>
                  {structured.note_type?.replace("_", " ")}
                </span>
                <Sparkles size={12} color={C.gold} />
                <span className="text-[10px]" style={{ color: C.mutedText }}>AI Summary</span>
              </div>
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{structured.title}</p>
              <div className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "#3a3028" }}>{structured.body}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => { setPhase("idle"); setTranscript(""); setStructured(null); }}
                className="py-2.5 rounded-xl font-bold text-xs"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
              >
                Re-record
              </button>
              <button
                onClick={handleUse}
                className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Sparkles size={12} /> Use This Note
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}