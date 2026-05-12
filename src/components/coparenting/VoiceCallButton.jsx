import { useState, useRef, useEffect } from "react";
import { Phone, PhoneOff, Mic, MicOff, Loader2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function VoiceCallButton({ partnership, user, onCallStart, onCallEnd, disabled }) {
  const [calling, setCalling] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [duration, setDuration] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const mediaStreamRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  async function startCall() {
    if (disabled || calling) return;
    
    setCalling(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      setInCall(true);
      setDuration(0);
      setMicOn(true);
      
      // Track call duration
      durationIntervalRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      if (onCallStart) {
        await onCallStart();
      }
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Unable to access microphone. Please check permissions.");
      setCalling(false);
    }
  }

  async function endCall() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setInCall(false);
    setCalling(false);
    
    if (onCallEnd) {
      await onCallEnd(duration);
    }
  }

  function toggleMic() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      setMicOn(!micOn);
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (inCall) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", zIndex: 999 }}>
        <div className="rounded-3xl p-8 text-center" style={{ background: C.darkGreen, width: "90%", maxWidth: 320 }}>
          <p className="text-2xl mb-4">📞</p>
          <p className="font-bold text-lg" style={{ color: C.cream }}>In Call</p>
          <p className="text-sm mt-2" style={{ color: C.lightGreen }}>{partnership?.parent_1_email === user?.email ? partnership?.parent_2_name : partnership?.parent_1_name}</p>
          <p className="text-3xl font-mono font-bold mt-4" style={{ color: C.gold }}>{formatDuration(duration)}</p>
          
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={toggleMic}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
              style={{ background: micOn ? C.lightGreen : "rgba(255,0,0,0.3)", border: "none", cursor: "pointer" }}
            >
              {micOn ? <Mic size={20} color={C.darkGreen} /> : <MicOff size={20} color="#FF4444" />}
            </button>
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
              style={{ background: "#FF4444", border: "none", cursor: "pointer" }}
            >
              <PhoneOff size={20} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={startCall}
      disabled={disabled || calling}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all"
      style={{
        background: disabled || calling ? `${C.midGreen}40` : C.midGreen,
        color: C.white,
        border: "none",
        cursor: disabled || calling ? "default" : "pointer",
        opacity: disabled || calling ? 0.6 : 1,
      }}
    >
      {calling ? <Loader2 size={12} className="animate-spin" /> : <Phone size={12} />}
      {calling ? "Connecting…" : "Call"}
    </button>
  );
}