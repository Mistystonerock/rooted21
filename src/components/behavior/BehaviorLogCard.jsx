import { C } from "@/lib/rooted-constants";
import { Clock, Zap, MessageCircle, CheckCircle2 } from "lucide-react";

const moodEmojis = { calm: '😊', sad: '😢', anxious: '😰', angry: '😠', dysregulated: '🌪️' };
const moodColors = { calm: C.midGreen, sad: '#4A90E2', anxious: '#F39C12', angry: '#E74C3C', dysregulated: '#8B4513' };

export default function BehaviorLogCard({ log }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {log.time && (
            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: C.mutedText }}>
              <Clock size={12} />
              {log.time}
            </div>
          )}
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${moodColors[log.child_mood]}20`, color: moodColors[log.child_mood] }}>
            {moodEmojis[log.child_mood]} {log.child_mood}
          </span>
        </div>
        <p className="text-[10px]" style={{ color: C.mutedText }}>
          {new Date(log.entry_date).toLocaleDateString()}
        </p>
      </div>

      {/* Behavior description */}
      <p className="font-bold text-sm mb-2.5" style={{ color: C.darkGreen }}>
        {log.behavior_description}
      </p>

      {/* Details grid */}
      <div className="space-y-2">
        {log.trigger && (
          <div className="flex gap-2 text-xs">
            <Zap size={13} color={C.brown} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold" style={{ color: C.darkGreen }}>Trigger:</p>
              <p style={{ color: C.mutedText }}>{log.trigger}</p>
            </div>
          </div>
        )}

        {log.parent_response && (
          <div className="flex gap-2 text-xs">
            <MessageCircle size={13} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold" style={{ color: C.darkGreen }}>Your Response:</p>
              <p style={{ color: C.mutedText }}>{log.parent_response}</p>
            </div>
          </div>
        )}

        {log.outcome && (
          <div className="flex gap-2 text-xs">
            <CheckCircle2 size={13} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold" style={{ color: C.darkGreen }}>Outcome:</p>
              <p style={{ color: C.mutedText }}>{log.outcome}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}