import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

export default function DailyCheckIn() {
  const [user, setUser] = useState(null);
  const [childRegulation, setChildRegulation] = useState(3);
  const [parentCalm, setParentCalm] = useState(3);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState([]);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const checkins = await base44.entities.CheckIn.list("-created_date", 10);
      setRecentCheckins(checkins);
    });
  }, []);

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    try {
      await base44.entities.CheckIn.create({
        child_regulation: childRegulation,
        parent_calm: parentCalm,
        note: note || null,
      });

      setSaved(true);
      setNote("");

      // Refresh checkins
      const updated = await base44.entities.CheckIn.list("-created_date", 10);
      setRecentCheckins(updated);

      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving check-in:", error);
    } finally {
      setSaving(false);
    }
  }

  const emoticons = {
    1: "😟",
    2: "😕",
    3: "😐",
    4: "🙂",
    5: "😄",
  };

  const labels = {
    1: "Very Dysregulated",
    2: "Somewhat Dysregulated",
    3: "Neutral",
    4: "Calm",
    5: "Very Calm",
  };

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Daily Check-In</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>How's your child doing today?</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-5">
        {/* Success message */}
        {saved && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `${C.midGreen}20`, border: `1px solid ${C.midGreen}` }}>
            <CheckCircle2 size={20} color={C.midGreen} />
            <div>
              <p className="text-xs font-bold" style={{ color: C.midGreen }}>Check-in saved!</p>
              <p className="text-[10px]" style={{ color: C.midGreen }}>Your data is now in Analytics</p>
            </div>
          </div>
        )}

        {/* Child Regulation */}
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Child's Regulation</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>How regulated is your child right now?</p>
            </div>
            <div className="text-3xl">{emoticons[childRegulation]}</div>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            value={childRegulation}
            onChange={(e) => setChildRegulation(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none"
            style={{
              background: `linear-gradient(to right, #F4C9B8 0%, #F4C9B8 ${((childRegulation - 1) / 4) * 100}%, ${C.cream} ${((childRegulation - 1) / 4) * 100}%, ${C.cream} 100%)`,
              accentColor: C.brown,
            }}
          />

          <div className="flex justify-between mt-3">
            <div className="text-center">
              <p className="text-[10px] font-bold" style={{ color: childRegulation === 1 ? C.brown : C.mutedText }}>1</p>
              <p className="text-[8px]" style={{ color: C.mutedText }}>Very</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold" style={{ color: childRegulation === 3 ? C.darkGreen : C.mutedText }}>3</p>
              <p className="text-[8px]" style={{ color: C.mutedText }}>Neutral</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold" style={{ color: childRegulation === 5 ? C.midGreen : C.mutedText }}>5</p>
              <p className="text-[8px]" style={{ color: C.mutedText }}>Very</p>
            </div>
          </div>

          <p className="text-xs font-bold text-center mt-3" style={{ color: C.darkGreen }}>
            {labels[childRegulation]}
          </p>
        </div>

        {/* Parent Calm */}
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Your Calm Level</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>How calm are you feeling right now?</p>
            </div>
            <div className="text-3xl">{emoticons[parentCalm]}</div>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            value={parentCalm}
            onChange={(e) => setParentCalm(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none"
            style={{
              background: `linear-gradient(to right, ${C.midGreen} 0%, ${C.midGreen} ${((parentCalm - 1) / 4) * 100}%, ${C.cream} ${((parentCalm - 1) / 4) * 100}%, ${C.cream} 100%)`,
              accentColor: C.midGreen,
            }}
          />

          <div className="flex justify-between mt-3">
            <div className="text-center">
              <p className="text-[10px] font-bold" style={{ color: parentCalm === 1 ? C.brown : C.mutedText }}>1</p>
              <p className="text-[8px]" style={{ color: C.mutedText }}>Very</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold" style={{ color: parentCalm === 3 ? C.darkGreen : C.mutedText }}>3</p>
              <p className="text-[8px]" style={{ color: C.mutedText }}>Neutral</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold" style={{ color: parentCalm === 5 ? C.midGreen : C.mutedText }}>5</p>
              <p className="text-[8px]" style={{ color: C.mutedText }}>Very</p>
            </div>
          </div>

          <p className="text-xs font-bold text-center mt-3" style={{ color: C.darkGreen }}>
            {labels[parentCalm]}
          </p>
        </div>

        {/* Optional Note */}
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <label className="text-xs font-bold block mb-2" style={{ color: C.darkGreen }}>
            OPTIONAL NOTE
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What happened? Any observations?"
            rows="2"
            className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
          style={{
            background: C.darkGreen,
            color: C.cream,
            border: "none",
            cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving..." : "Save Check-In"}
        </button>

        {/* Recent checkins */}
        {recentCheckins.length > 0 && (
          <div>
            <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Recent Check-Ins</p>
            <div className="space-y-2">
              {recentCheckins.slice(0, 5).map((checkin) => {
                const date = new Date(checkin.created_date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                return (
                  <div key={checkin.id} className="rounded-lg p-3 flex items-center justify-between" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{emoticons[checkin.child_regulation]}</span>
                        <div>
                          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
                            Child: {checkin.child_regulation}/5 • You: {checkin.parent_calm}/5
                          </p>
                          <p className="text-[10px]" style={{ color: C.mutedText }}>{dateStr}</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-lg">{emoticons[checkin.parent_calm]}</span>
                  </div>
                );
              })}
            </div>
            <Link
              to="/progress"
              className="block text-center text-xs font-bold mt-3 py-2 rounded-lg"
              style={{ color: C.midGreen, textDecoration: "none" }}
            >
              View full analytics →
            </Link>
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}