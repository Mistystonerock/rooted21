import { useState } from "react";
import { Download, FileText, Volume2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

function lessonTranscript(lesson) {
  return [
    `Lesson ${lesson.id}: ${lesson.title}`,
    `Week ${lesson.week} · ${lesson.pillar}`,
    "",
    lesson.content?.replace(/\*\*/g, "") || "",
    "",
    `Today's tip: ${lesson.tip || ""}`,
    "",
    `Reflection worksheet: ${lesson.worksheet || ""}`,
  ].join("\n");
}

export default function LessonAudioTranscriptPanel({ lesson }) {
  const [speaking, setSpeaking] = useState(false);
  const transcript = lessonTranscript(lesson);

  function playAudio() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.lang = document.documentElement.lang || "en";
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function downloadTranscript() {
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rooted21-Lesson-${lesson.id}-Transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }} aria-label="Lesson accessibility tools">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${C.midGreen}18` }}>
          <FileText size={18} color={C.midGreen} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-black" style={{ color: C.darkGreen }}>Audio + Transcript</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Listen to this lesson or save a clean transcript for offline reading.</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={playAudio} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>
          <Volume2 size={13} className="mr-1" /> {speaking ? "Stop Audio" : "Play Audio"}
        </button>
        <button onClick={downloadTranscript} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.gold, color: C.darkGreen, border: "none" }}>
          <Download size={13} className="mr-1" /> Transcript
        </button>
      </div>
    </section>
  );
}