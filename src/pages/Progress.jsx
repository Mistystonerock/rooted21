import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft } from "lucide-react";
import RegulationChart from "@/components/progress/RegulationChart";

function fmt(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

export default function Progress() {
  const [checkins, setCheckins] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    base44.entities.CheckIn.list("created_date", 200).then(setCheckins);
    base44.entities.LessonProgress.filter({ completed: true }).then(setLessons);
    base44.entities.Goal.list().then(setGoals);
  }, []);

  const completedGoals = goals.filter(g => g.progress === "completed").length;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <p className="font-serif font-bold" style={{ color: C.cream }}>My Progress</p>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Lessons Done", value: lessons.length, sub: "of 21", emoji: "📚" },
            { label: "Goals Met", value: completedGoals, sub: `of ${goals.length}`, emoji: "🎯" },
            { label: "Check-ins", value: checkins.length, sub: "total", emoji: "✅" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-lg mb-0.5">{s.emoji}</p>
              <p className="text-xl font-extrabold leading-none" style={{ color: C.darkGreen }}>{s.value}</p>
              <p className="text-[9px] mt-0.5" style={{ color: C.mutedText }}>{s.sub}</p>
              <p className="text-[9px] font-bold" style={{ color: C.midGreen }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── REGULATION CHART MODULE ── */}
        {checkins.length === 0 ? (
          <div className="text-center py-10 rounded-2xl" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-3xl mb-2">🌱</p>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No check-ins yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Complete your first session to start tracking regulation patterns.</p>
          </div>
        ) : (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <RegulationChart checkins={checkins} />
          </div>
        )}

        {/* Reflections */}
        {checkins.filter(c => c.note).length > 0 && (
          <div>
            <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>Recent Reflections</p>
            {checkins.filter(c => c.note).slice(-5).reverse().map(c => (
              <div key={c.id} className="rounded-xl px-3.5 py-2.5 mb-2" style={{ background: C.cream, borderLeft: `3px solid ${C.brown}` }}>
                <p className="text-xs italic leading-relaxed" style={{ color: C.darkGreen }}>"{c.note}"</p>
                <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>{fmt(c.created_date)}</p>
              </div>
            ))}
          </div>
        )}
        <div className="pb-6" />
      </div>
    </div>
  );
}