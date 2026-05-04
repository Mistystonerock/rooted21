import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { BookOpen, Target, TrendingUp, User, AlertTriangle, Zap, KeyRound, Users } from "lucide-react";
import TreeLogo from "@/components/rooted/TreeLogo";
import BottomNav from "@/components/rooted/BottomNav";
import AccessCodeEntry from "@/components/rooted/AccessCodeEntry";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [goals, setGoals] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [showCodeEntry, setShowCodeEntry] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
    base44.entities.ChildProfile.list("-created_date", 1).then(r => setChild(r[0] || null));
    base44.entities.Goal.filter({ progress: "in_progress" }, "-created_date", 3).then(setGoals);
    base44.entities.LessonProgress.filter({ completed: true }, "-created_date", 50).then(setLessonProgress);
    base44.entities.CheckIn.list("-created_date", 3).then(setRecentCheckins);
  }, []);

  const completedLessons = lessonProgress.length;
  const totalLessons = 21;
  const progressPct = Math.round((completedLessons / totalLessons) * 100);

  const latestCheckin = recentCheckins[0];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ background: C.darkGreen }}>
        <TreeLogo size={36} />
        <div>
          <div className="font-serif font-bold text-lg" style={{ color: C.cream }}>
            Rooted <span style={{ color: C.gold }}>21</span>
          </div>
          <div className="text-[10px] font-bold tracking-widest" style={{ color: C.lightGreen }}>
            PARENTING NETWORK
          </div>
        </div>
        <Link to="/profile" className="ml-auto">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: C.midGreen, color: C.white }}>
            {user?.full_name?.[0] || "?"}
          </div>
        </Link>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Welcome */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-lg" style={{ color: C.cream }}>
            Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 🌳
          </p>
          <p className="text-xs mt-0.5" style={{ color: C.lightGreen }}>
            You are not alone in this journey.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/" className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:shadow-md" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <Zap size={22} color={C.gold} />
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Crisis Help</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>Real-time support now</p>
          </Link>
          <Link to="/lessons" className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:shadow-md" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <BookOpen size={22} color={C.midGreen} />
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Lessons</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>{completedLessons}/{totalLessons} completed</p>
          </Link>
          <Link to="/goals" className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:shadow-md" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <Target size={22} color={C.brown} />
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Goals</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>{goals.length} active</p>
          </Link>
          <Link to="/progress" className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:shadow-md" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <TrendingUp size={22} color={C.midGreen} />
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Progress</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>View your growth</p>
          </Link>
          <Link to="/my-team" className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:shadow-md col-span-2" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <Users size={22} color={C.brown} />
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>My Support Team</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>Secure messages with your professionals</p>
          </Link>
        </div>

        {/* Lesson progress bar */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex justify-between items-center mb-2">
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Program Progress</p>
            <p className="text-xs font-bold" style={{ color: C.midGreen }}>{progressPct}%</p>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: C.cream }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: C.midGreen }}
            />
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: C.mutedText }}>
            {completedLessons} of {totalLessons} lessons complete
          </p>
        </div>

        {/* Child profile card */}
        {child ? (
          <Link to="/child-profile" className="block rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: C.cream }}>
                🧒
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{child.first_name}</p>
                <p className="text-[11px]" style={{ color: C.mutedText }}>Child profile · Tap to edit</p>
              </div>
            </div>
          </Link>
        ) : (
          <Link to="/child-profile" className="block rounded-2xl p-4 text-center" style={{ background: C.cream, border: `1.5px dashed ${C.midGreen}` }}>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>+ Add Child Profile</p>
            <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>Helps professionals support your family</p>
          </Link>
        )}

        {/* Latest check-in summary */}
        {latestCheckin && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>Last Check-In</p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: C.midGreen }}>{latestCheckin.child_regulation}</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Child reg.</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: C.gold }}>{latestCheckin.parent_calm}</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Your calm</p>
              </div>
              <div className="ml-auto text-right">
                <Link to="/progress" className="text-xs font-bold" style={{ color: C.midGreen }}>View trends →</Link>
              </div>
            </div>
          </div>
        )}

        {/* Access code entry */}
        {showCodeEntry ? (
          <AccessCodeEntry
            onLinked={() => setShowCodeEntry(false)}
            onDismiss={() => setShowCodeEntry(false)}
          />
        ) : (
          <button
            onClick={() => setShowCodeEntry(true)}
            className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:shadow-md"
            style={{ background: C.white, border: `1.5px dashed ${C.midGreen}` }}
          >
            <KeyRound size={20} color={C.midGreen} />
            <div>
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Enter Professional Access Code</p>
              <p className="text-[11px]" style={{ color: C.mutedText }}>Link your account to your assigned professional</p>
            </div>
          </button>
        )}

        <div className="pb-16" />
        {/* Crisis reminder */}
        <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <AlertTriangle size={16} color="#B84C2A" className="mt-0.5 flex-shrink-0" />
          <p className="text-[11px]" style={{ color: "#B84C2A" }}>
            In crisis? Call or text <strong>988</strong>. In danger, call <strong>911</strong>.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}