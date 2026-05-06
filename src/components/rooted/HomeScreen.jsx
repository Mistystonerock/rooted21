import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { Clock, TrendingUp, LayoutGrid, Shield, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import TreeLogo from "./TreeLogo";
import BehaviorGrid from "./BehaviorGrid";

export default function HomeScreen({ onHelp, error, onOpenHistory, onOpenTrends }) {
  const [txt, setTxt] = useState("");

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="relative text-center" style={{ background: C.darkGreen, padding: "28px 20px 22px" }}>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={onOpenTrends}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: "#ffffff18", border: "none", color: C.gold }}
          >
            <TrendingUp size={13} />
            Trends
          </button>
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: "#ffffff18", border: "none", color: C.lightGreen }}
          >
            <Clock size={13} />
            History
          </button>
        </div>
        <div className="flex justify-center mb-3.5">
          <TreeLogo size={64} />
        </div>
        <div className="font-serif text-4xl font-bold" style={{ color: C.cream }}>
          Rooted <span className="italic" style={{ color: C.gold }}>Parenting Network</span>
        </div>
        <div
          className="text-[11px] font-extrabold tracking-[3px] mt-1"
          style={{ color: C.lightGreen }}
        >
          PROFESSIONAL FEATURE MAP &amp; APP BLUEPRINT
        </div>
        <p className="text-xs mt-2 leading-relaxed max-w-[320px] mx-auto" style={{ color: C.cream }}>
          A trauma-informed parenting and child-support platform designed to help parents, courts, CPS, counselors, schools, and support teams stay informed, organized, and consistent around a child's needs.
        </p>
        {/* Badge row */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {["Trauma-Informed", "Parent + Provider Aligned", "Agency Ready", "Mobile-First"].map(badge => (
            <span
              key={badge}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", color: C.gold, border: `1px solid ${C.gold}40` }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Subheader */}
      <div className="text-center py-2.5 px-5" style={{ background: C.brown }}>
        <p className="m-0 text-xs font-bold" style={{ color: C.cream }}>
          You don't have to do this alone. We're in this together.
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-5 max-w-[480px] mx-auto">
        {/* Free text card */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{
            background: C.white,
            boxShadow: "0 4px 20px rgba(47,75,58,.12)",
            border: `1px solid ${C.cream}`,
          }}
        >
          <h2 className="m-0 mb-1 font-serif text-lg font-bold" style={{ color: C.darkGreen }}>
            What's happening right now?
          </h2>
          <p className="m-0 mb-3 text-[13px]" style={{ color: C.mutedText }}>
            Describe the situation and get TBRI®-based guidance immediately.
          </p>

          <textarea
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            placeholder='Example: "My 8-year-old is screaming and refusing to leave for school."'
            rows={4}
            className="w-full rounded-xl p-3 resize-none text-sm font-sans"
            style={{
              border: `1.5px solid ${C.cream}`,
              background: C.offWhite,
              color: "#000000",
            }}
          />

          {error && (
            <p className="text-[13px] font-bold mt-2" style={{ color: "#B84C2A" }}>
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => txt.trim() && onHelp(txt.trim())}
              disabled={!txt.trim()}
              className="flex-1 py-3.5 rounded-xl border-none font-extrabold text-[14px] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: txt.trim() ? C.darkGreen : C.cream,
                color: txt.trim() ? C.white : C.mutedText,
                cursor: txt.trim() ? "pointer" : "default",
              }}
            >
              Get Help →
            </button>
            <Link
              to={txt.trim() ? `/chat?prompt=${encodeURIComponent(txt.trim())}` : "/chat?crisis=1"}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl font-extrabold text-[14px] transition-all hover:opacity-90"
              style={{ background: C.midGreen, color: C.white, textDecoration: "none", flexShrink: 0 }}
            >
              💬 Chat
            </Link>
          </div>
        </div>

        {/* Divider */}
        <p
          className="text-center text-[10px] font-extrabold tracking-[1.5px] my-5"
          style={{ color: C.mutedText }}
        >
          OR SELECT A BEHAVIOR
        </p>

        {/* Help Me Right Now — crisis shortcut */}
        <Link
          to="/chat?crisis=1"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-extrabold text-[15px] transition-all hover:opacity-90 active:scale-[0.98] mb-5"
          style={{
            background: C.brown,
            color: C.white,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(139,94,52,.25)",
          }}
        >
          🆘 Help Me Right Now
        </Link>

        <BehaviorGrid onSelect={(q) => window.location.href = `/chat?prompt=${encodeURIComponent(q)}`} />

        {/* Platform links */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <Link to="/dashboard" className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all hover:shadow-md" style={{ background: C.white, border: `1.5px solid ${C.cream}`, textDecoration: "none" }}>
            <LayoutGrid size={18} color={C.darkGreen} />
            <span className="text-[10px] font-bold text-center" style={{ color: C.darkGreen }}>Dashboard</span>
          </Link>
          <Link to="/lessons" className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all hover:shadow-md" style={{ background: C.white, border: `1.5px solid ${C.cream}`, textDecoration: "none" }}>
            <BookOpen size={18} color={C.midGreen} />
            <span className="text-[10px] font-bold text-center" style={{ color: C.darkGreen }}>21 Lessons</span>
          </Link>
          <Link to="/professional" className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all hover:shadow-md" style={{ background: C.white, border: `1.5px solid ${C.cream}`, textDecoration: "none" }}>
            <Shield size={18} color={C.brown} />
            <span className="text-[10px] font-bold text-center" style={{ color: C.darkGreen }}>Professionals</span>
          </Link>
        </div>

        {/* Footer */}
        <p
          className="text-center text-[11px] mt-5 leading-loose"
          style={{ color: C.mutedText }}
        >
          Rooted Parenting Network
          <br />
          Crisis: call or text <strong>988</strong>
        </p>
      </div>
    </div>
  );
}