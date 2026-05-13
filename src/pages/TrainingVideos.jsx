import MobileHeader from "@/components/mobile/MobileHeader";
import TrainingVideoSeries from "@/components/training/TrainingVideoSeries";
import { C } from "@/lib/rooted-constants";

export default function TrainingVideos() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Training Videos" subtitle="Start here after login" backTo="/dashboard" />
      <div className="max-w-[540px] mx-auto px-4 py-5">
        <TrainingVideoSeries />
        <div className="rounded-2xl p-4 mt-4" style={{ background: "#FFFBEE", border: "1px solid #F4DFA0" }}>
          <p className="text-xs font-bold" style={{ color: "#7A5200" }}>Video links can be added here when recordings are ready.</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#7A5200" }}>For now, this gives every user a clear training roadmap immediately after login.</p>
        </div>
      </div>
    </div>
  );
}