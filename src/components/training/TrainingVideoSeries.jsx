import { Link } from "react-router-dom";
import { PlayCircle, Clock, ArrowRight } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export const TRAINING_VIDEOS = [
  { title: "Welcome to Rooted 21", duration: "2 min", description: "What the app is, who it’s for, and how to get started." },
  { title: "Your Dashboard", duration: "90 sec", description: "Where everything lives and how to find the tools you need." },
  { title: "Daily Check-In & Behavior Logs", duration: "90 sec", description: "How to track regulation, patterns, and behavior moments." },
  { title: "The 21 Lessons", duration: "90 sec", description: "How the learning path supports connection-based parenting." },
  { title: "Safety Plan Setup", duration: "90 sec", description: "How to build a plan for hard moments and crisis support." },
  { title: "For Professionals", duration: "2 min", description: "How professionals connect with families and support progress." },
  { title: "Co-Parent Portal", duration: "2 min", description: "What it is and how structured messaging works." },
  { title: "For Court Staff", duration: "2 min", description: "How court-facing tools show progress, context, and documentation." },
];

export default function TrainingVideoSeries({ compact = false }) {
  const videos = compact ? TRAINING_VIDEOS.slice(0, 3) : TRAINING_VIDEOS;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}`, boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: C.midGreen }}>START HERE</p>
          <h2 className="font-serif font-bold text-lg mt-1" style={{ color: C.darkGreen }}>Rooted 21 Training Videos</h2>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.mutedText }}>Quick walkthroughs to help parents and professionals know exactly where to begin.</p>
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${C.midGreen}18` }}>
          <PlayCircle size={24} color={C.midGreen} />
        </div>
      </div>

      <div className="space-y-2">
        {videos.map((video, index) => (
          <div key={video.title} className="rounded-xl p-3 flex gap-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{ background: C.darkGreen, color: "#fff" }}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{video.title}</p>
              <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: C.mutedText }}>{video.description}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={11} color={C.brown} />
                <span className="text-[10px] font-bold" style={{ color: C.brown }}>{video.duration}</span>
                <span className="text-[10px]" style={{ color: C.mutedText }}>· Video placeholder</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {compact && (
        <Link to="/training-videos" className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2" style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
          View all training videos <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}