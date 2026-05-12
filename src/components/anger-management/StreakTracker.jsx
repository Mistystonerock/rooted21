import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Flame, RotateCcw } from "lucide-react";

export default function StreakTracker() {
  const [streak, setStreak] = useState(0);
  const [lastEscalation, setLastEscalation] = useState(null);
  const [loading, setLoading] = useState(true);
  const STREAK_KEY = "rooted21_anger_streak_date";

  useEffect(() => {
    async function loadStreak() {
      try {
        const user = await base44.auth.me();
        if (!user) return;

        const stored = localStorage.getItem(STREAK_KEY);
        if (stored) {
          setLastEscalation(new Date(stored));
          const now = new Date();
          const diff = Math.floor((now - new Date(stored)) / (1000 * 60 * 60 * 24));
          setStreak(Math.max(0, diff));
        } else {
          setStreak(0);
          setLastEscalation(null);
        }
      } finally {
        setLoading(false);
      }
    }
    loadStreak();
  }, []);

  function resetStreak() {
    const today = new Date().toISOString();
    localStorage.setItem(STREAK_KEY, today);
    setLastEscalation(new Date(today));
    setStreak(0);
  }

  if (loading) {
    return (
      <div className="rounded-xl p-4 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="text-xs" style={{ color: C.mutedText }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Streak Card */}
      <div className="rounded-xl p-6 text-center" style={{ background: "#FFF8E6", border: `1.5px solid #F5E6BF` }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame size={24} color="#C9973A" />
          <p className="font-serif font-bold text-4xl" style={{ color: C.gold }}>
            {streak}
          </p>
        </div>
        <p className="text-sm font-bold" style={{ color: "#7A5200" }}>
          days without escalation
        </p>
        <p className="text-xs mt-1" style={{ color: "#6B3D2A" }}>
          You're building emotional strength every single day.
        </p>

        {lastEscalation && (
          <p className="text-[10px] mt-3" style={{ color: "#6B3D2A" }}>
            Last logged: {lastEscalation.toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={resetStreak}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-xs transition-all"
        style={{
          background: C.white,
          border: `1.5px solid ${C.cream}`,
          color: C.darkGreen,
          cursor: "pointer",
        }}
      >
        <RotateCcw size={14} />
        I had an escalation — reset streak
      </button>

      {/* Info */}
      <div className="rounded-xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>What counts as an escalation?</p>
        <ul className="text-[11px] space-y-1" style={{ color: C.mutedText }}>
          <li>❌ Yelling or raising your voice</li>
          <li>❌ Hitting, throwing, or breaking things</li>
          <li>❌ Saying hurtful things you didn't mean</li>
          <li>❌ Using threats or intimidation</li>
          <li>✅ You're doing AMAZING if you're tracking this</li>
        </ul>
      </div>
    </div>
  );
}