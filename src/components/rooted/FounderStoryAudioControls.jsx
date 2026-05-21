import { useEffect, useMemo, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Square, Upload, Volume2 } from "lucide-react";

const AUDIO_URL = "https://media.base44.com/files/public/69f855fbccd3f90a3663fb94/c871cfd68_ElevenLabs_Welcome_to_Rooted_21_Im_so_glad_.mp3";
const CARD = "#ffffff";
const CREAM = "#f5ede2";
const GREEN = "#6b9d6e";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const BORDER = "rgba(120,85,60,0.2)";

function chooseCalmVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const preferred = voices
    .filter(voice => /^en[-_]?US/i.test(voice.lang || "") || /^en/i.test(voice.lang || ""))
    .map(voice => {
      const label = `${voice.name} ${voice.voiceURI}`.toLowerCase();
      let score = 0;
      if (/female|samantha|ava|jenny|aria|zira|victoria|allison|serena|karen|susan/.test(label)) score += 8;
      if (/natural|neural|enhanced|premium|online/.test(label)) score += 6;
      if (/google|microsoft|apple/.test(label)) score += 3;
      if (/en-us/.test(voice.lang || "")) score += 2;
      return { voice, score };
    })
    .sort((a, b) => b.score - a.score);
  return preferred[0]?.voice || voices[0];
}

export default function FounderStoryAudioControls({ user, welcomeText, storySections, missionText, notAloneText }) {
  const audioRef = useRef(null);
  const lastTextRef = useRef("");
  const [speed, setSpeed] = useState(1);
  const [status, setStatus] = useState("stopped");
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const isFounder = user?.role === "founder" || user?.email === "misty.stonerock88@gmail.com";

  const audioSections = useMemo(() => {
    const byTitle = Object.fromEntries((storySections || []).map(section => [section.title, section.text]));
    return [
      { label: "Listen to Welcome", text: welcomeText },
      { label: "Listen to Meet Misty", text: byTitle["Meet Misty"] },
      { label: "Listen to Why This Work Matters", text: byTitle["Why This Work Matters"] },
      { label: "Listen to Why Schools Matter", text: byTitle["Why Schools Matter"] },
      { label: "Listen to Why Rooted 21 Was Created", text: byTitle["Why I Created Rooted 21"] },
      { label: "Listen to The Mission", text: missionText },
      { label: "Listen to You Are Not Alone Here", text: notAloneText },
    ].filter(item => item.text);
  }, [welcomeText, storySections, missionText, notAloneText]);

  useEffect(() => {
    setTtsAvailable("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    audioRef.current = new Audio(AUDIO_URL);
    audioRef.current.onended = () => setStatus("stopped");
    return () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
    };
  }, []);

  function stopEverything() {
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStatus("stopped");
  }

  function playFullStory() {
    stopEverything();
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setStatus("playing-audio");
  }

  function speakText(text) {
    if (!ttsAvailable || !text) return;
    stopEverything();
    lastTextRef.current = text;
    const utterance = new SpeechSynthesisUtterance(text.replace(/\n+/g, " "));
    utterance.lang = "en-US";
    utterance.rate = speed;
    utterance.pitch = 1.02;
    utterance.volume = 0.95;
    const voice = chooseCalmVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => setStatus("stopped");
    window.speechSynthesis.speak(utterance);
    setStatus("playing-tts");
  }

  function pauseAudio() {
    if (status === "playing-audio") audioRef.current?.pause();
    if (status === "playing-tts") window.speechSynthesis?.pause();
    setStatus("paused");
  }

  function resumeAudio() {
    if (audioRef.current?.currentTime > 0 && audioRef.current.paused) {
      audioRef.current.playbackRate = speed;
      audioRef.current.play();
      setStatus("playing-audio");
      return;
    }
    window.speechSynthesis?.resume();
    setStatus("playing-tts");
  }

  function restartAudio() {
    if (audioRef.current?.currentTime > 0) {
      playFullStory();
      return;
    }
    if (lastTextRef.current) speakText(lastTextRef.current);
  }

  return (
    <section className="rounded-[2rem] border p-5 shadow-sm" style={{ background: CARD, borderColor: BORDER }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: CREAM }}>
          <Headphones size={22} color={GREEN} />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-black" style={{ color: DARK }}>Listen to Misty’s Story</h2>
          <p className="mt-1 text-sm leading-6" style={{ color: MUTED }}>You can listen to this story instead of reading it. Pause anytime.</p>
        </div>
      </div>

      {!ttsAvailable && (
        <p className="mt-4 rounded-2xl p-3 text-sm font-bold" style={{ background: CREAM, color: MUTED }}>
          Audio is not available on this device yet. You can still read the story below.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={playFullStory} aria-label="Listen to full founder story" className="rounded-xl px-4 py-2 text-sm font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ background: GREEN, color: "#fff", border: "none" }}>
          <Volume2 size={15} className="mr-2" /> Listen to Full Story
        </button>
        <button type="button" onClick={pauseAudio} aria-label="Pause founder story audio" className="rounded-xl px-3 py-2 text-sm font-bold" style={{ background: CREAM, color: DARK, border: "none" }}><Pause size={14} className="mr-1" /> Pause</button>
        <button type="button" onClick={resumeAudio} aria-label="Resume founder story audio" className="rounded-xl px-3 py-2 text-sm font-bold" style={{ background: CREAM, color: DARK, border: "none" }}><Play size={14} className="mr-1" /> Resume</button>
        <button type="button" onClick={stopEverything} aria-label="Stop founder story audio" className="rounded-xl px-3 py-2 text-sm font-bold" style={{ background: CREAM, color: DARK, border: "none" }}><Square size={14} className="mr-1" /> Stop</button>
        <button type="button" onClick={restartAudio} aria-label="Restart founder story audio" className="rounded-xl px-3 py-2 text-sm font-bold" style={{ background: CREAM, color: DARK, border: "none" }}><RotateCcw size={14} className="mr-1" /> Restart</button>
        <label className="ml-auto text-xs font-bold" style={{ color: MUTED }}>
          Speed
          <select value={speed} onChange={event => setSpeed(Number(event.target.value))} aria-label="Founder story audio speed" className="ml-2 rounded-xl px-2 py-2 text-sm" style={{ border: `1px solid ${BORDER}`, background: CARD, color: DARK }}>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {audioSections.map(section => (
          <button key={section.label} type="button" onClick={() => speakText(section.text)} disabled={!ttsAvailable} aria-label={section.label} className="rounded-xl px-3 py-2 text-left text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ background: CREAM, color: ttsAvailable ? DARK : MUTED, border: `1px solid ${BORDER}`, opacity: ttsAvailable ? 1 : 0.65 }}>
            {section.label}
          </button>
        ))}
      </div>

      {isFounder && (
        <div className="mt-4 rounded-2xl p-3 text-sm font-bold" style={{ background: CREAM, color: MUTED }}>
          <Upload size={15} className="mr-2 inline" /> Founder Audio Upload — Coming Soon
        </div>
      )}
    </section>
  );
}