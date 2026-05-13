import MobileHeader from "@/components/mobile/MobileHeader";
import TrainingVideoSeries from "@/components/training/TrainingVideoSeries";
import { C } from "@/lib/rooted-constants";

export default function TrainingVideos() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #faf6f1 0%, #f5ede2 100%)" }}>
      <MobileHeader title="Interactive Walkthroughs" subtitle="Voice-guided help, step by step" backTo="/dashboard" />
      <div className="max-w-[620px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-[28px] p-5" style={{ background: "rgba(255,255,255,0.68)", border: "1px solid rgba(255,255,255,0.8)", backdropFilter: "blur(18px)", boxShadow: "0 18px 48px rgba(61,40,23,0.10)" }}>
          <p className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: C.midGreen }}>NO STATIC VIDEOS</p>
          <h1 className="font-serif font-bold text-2xl mt-1" style={{ color: C.darkGreen }}>Learn Rooted 21 by doing</h1>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: C.mutedText }}>These calming walkthroughs use voice narration, soft highlights, click prompts, and replayable steps for parents and professionals.</p>
        </div>
        <TrainingVideoSeries />
      </div>
    </div>
  );
}