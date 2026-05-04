import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { Clock, TrendingUp } from "lucide-react";
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
          Rooted <span className="italic" style={{ color: C.gold }}>21</span>
        </div>
        <div
          className="text-[11px] font-extrabold tracking-[3px]"
          style={{ color: C.lightGreen }}
        >
          PARENTING RESET PROGRAM
        </div>
        <p className="font-serif text-sm italic mt-1" style={{ color: C.cream }}>
          Stronger Parents. Stronger Kids. Stronger Families.
        </p>
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
            Describe the behavior and get trauma-informed help immediately.
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
            }}
          />

          {error && (
            <p className="text-[13px] font-bold mt-2" style={{ color: "#B84C2A" }}>
              ⚠️ {error}
            </p>
          )}

          <button
            onClick={() => txt.trim() && onHelp(txt.trim())}
            disabled={!txt.trim()}
            className="w-full mt-3 py-3.5 rounded-xl border-none font-extrabold text-[15px] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: txt.trim() ? C.darkGreen : C.cream,
              color: txt.trim() ? C.white : C.mutedText,
              cursor: txt.trim() ? "pointer" : "default",
            }}
          >
            Get Support Right Now →
          </button>
        </div>

        {/* Divider */}
        <p
          className="text-center text-[10px] font-extrabold tracking-[1.5px] my-5"
          style={{ color: C.mutedText }}
        >
          OR SELECT A BEHAVIOR
        </p>

        <BehaviorGrid onSelect={onHelp} />

        {/* Footer */}
        <p
          className="text-center text-[11px] mt-5 leading-loose"
          style={{ color: C.mutedText }}
        >
          Created by Misty Stonerock
          <br />
          Community Behavioral Health Worker & Parent Advocate
          <br />
          Crisis: call or text <strong>988</strong>
        </p>
      </div>
    </div>
  );
}