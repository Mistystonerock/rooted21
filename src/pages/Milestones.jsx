import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Award, Zap } from "lucide-react";
import BadgeCard from "@/components/rewards/BadgeCard";

const ALL_BADGES = [
  { id: "lesson_starter", name: "Lesson Starter", emoji: "📚", description: "Complete 3 lessons", requirement: "3 lessons", level: 1 },
  { id: "consistent_checkin", name: "Check-In Pro", emoji: "✅", description: "7-day check-in streak", requirement: "7 consecutive days", level: 1 },
  { id: "lesson_master", name: "Lesson Master", emoji: "🎓", description: "Complete 10 lessons", requirement: "10 lessons", level: 2 },
  { id: "checkin_streak", name: "Streak Champion", emoji: "🔥", description: "30-day check-in streak", requirement: "30 consecutive days", level: 2 },
  { id: "program_champion", name: "Program Champion", emoji: "🏆", description: "Complete all 21 lessons", requirement: "All lessons", level: 3 },
  { id: "mindful_parent", name: "Mindful Parent", emoji: "🌿", description: "90 days of consistent check-ins", requirement: "90 days", level: 3 },
];

export default function Milestones() {
  const [user, setUser] = useState(null);
  const [earned, setEarned] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);

      // Fetch data for badge calculation
      const [lessonData, checkinData, earnedData] = await Promise.all([
        base44.entities.LessonProgress.filter({ completed: true }, "-created_date", 100),
        base44.entities.CheckIn.list("-created_date", 100),
        base44.entities.ParentMilestone.filter({ parent_email: u.email }, "-created_date", 50),
      ]);

      setLessons(lessonData);
      setCheckins(checkinData);
      setEarned(earnedData.map(e => e.badge_type));
      setLoading(false);
    });
  }, []);

  // Calculate earned badges based on data
  const earnedBadges = new Set(earned);

  // Badge logic
  if (lessons.length >= 3 && !earnedBadges.has("lesson_starter")) earnedBadges.add("lesson_starter");
  if (lessons.length >= 10 && !earnedBadges.has("lesson_master")) earnedBadges.add("lesson_master");
  if (lessons.length >= 21 && !earnedBadges.has("program_champion")) earnedBadges.add("program_champion");

  // Calculate check-in streaks
  let maxStreak = 0;
  let currentStreak = 0;
  let totalCheckInDays = new Set();

  if (checkins.length > 0) {
    const sortedCheckins = [...checkins].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const dates = sortedCheckins.map(c => new Date(c.created_date).toDateString());
    const uniqueDates = new Set(dates);
    totalCheckInDays = uniqueDates;

    let lastDate = null;
    for (const dateStr of Array.from(uniqueDates).reverse()) {
      const date = new Date(dateStr);
      if (!lastDate || (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
        lastDate = date;
      } else {
        currentStreak = 1;
        lastDate = date;
      }
    }
  }

  if (maxStreak >= 7 && !earnedBadges.has("consistent_checkin")) earnedBadges.add("consistent_checkin");
  if (maxStreak >= 30 && !earnedBadges.has("checkin_streak")) earnedBadges.add("checkin_streak");
  if (totalCheckInDays.size >= 90 && !earnedBadges.has("mindful_parent")) earnedBadges.add("mindful_parent");

  const totalEarned = earnedBadges.size;
  const nextLevel = Math.floor(totalEarned / 2) + 1;
  const levelProgress = ((totalEarned % 2) / 2) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <Award size={16} color={C.gold} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Milestones & Badges</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Your parenting journey progress</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-5">
        {/* Summary card */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-serif font-bold text-lg" style={{ color: C.gold }}>{totalEarned}</p>
              <p className="text-xs" style={{ color: C.lightGreen }}>badges earned</p>
            </div>
            <span className="text-3xl">🏅</span>
          </div>

          {/* Level progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold" style={{ color: C.cream }}>Level {nextLevel}</p>
              <p className="text-xs" style={{ color: C.lightGreen }}>{Math.round(levelProgress)}%</p>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "#ffffff20" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%`, background: C.gold }}
              />
            </div>
            <p className="text-[10px] mt-2" style={{ color: C.lightGreen }}>
              Earn {2 - (totalEarned % 2)} more badges to reach Level {nextLevel + 1}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-xl font-bold" style={{ color: C.darkGreen }}>{lessons.length}</p>
            <p className="text-xs" style={{ color: C.mutedText }}>Lessons Done</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-xl font-bold" style={{ color: C.darkGreen }}>{maxStreak}</p>
            <p className="text-xs" style={{ color: C.mutedText }}>Check-in Streak</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-xl font-bold" style={{ color: C.darkGreen }}>{totalCheckInDays.size}</p>
            <p className="text-xs" style={{ color: C.mutedText }}>Active Days</p>
          </div>
        </div>

        {/* Earned badges */}
        {earnedBadges.size > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} color={C.gold} />
              <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Your Badges</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ALL_BADGES.filter(b => earnedBadges.has(b.id)).map(badge => (
                <BadgeCard key={badge.id} badge={badge} earned={true} />
              ))}
            </div>
          </div>
        )}

        {/* Available badges */}
        <div>
          <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Keep Going!</p>
          <div className="grid grid-cols-2 gap-3">
            {ALL_BADGES.filter(b => !earnedBadges.has(b.id)).map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={false} />
            ))}
          </div>
        </div>

        {/* Encouragement */}
        <div className="rounded-2xl p-4 text-center" style={{ background: C.cream, border: `1.5px solid ${C.midGreen}` }}>
          <p className="text-sm font-bold mb-1" style={{ color: C.darkGreen }}>You're doing amazing! 🌿</p>
          <p className="text-xs" style={{ color: C.mutedText }}>
            Every badge represents growth in your parenting journey. Keep going!
          </p>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}