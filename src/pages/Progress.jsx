import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft } from "lucide-react";
import RegulationChart from "@/components/progress/RegulationChart";
import ChildSelector from "@/components/children/ChildSelector";
import { filterRecordsForChild } from "@/lib/child-selection";

function fmt(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

export default function Progress() {
  const queryClient = useQueryClient();
  const [checkins, setCheckins] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);

  async function handleRefresh() {
    setIsRefreshing(true);
    await Promise.all([
      base44.entities.CheckIn.list("created_date", 200).then(setCheckins),
      base44.entities.LessonProgress.filter({ completed: true }).then(setLessons),
      base44.entities.Goal.list().then(setGoals),
    ]);
    queryClient.invalidateQueries();
    setIsRefreshing(false);
  }

  function handleTouchStart(e) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e) {
    const touchY = e.touches[0].clientY;
    const scrollTop = window.scrollY;
    if (scrollTop === 0 && touchY > touchStartY.current + 80 && !isRefreshing) {
      handleRefresh();
    }
  }

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isRefreshing]);

  useEffect(() => {
    handleRefresh();
  }, []);

  const filteredCheckins = filterRecordsForChild(checkins, selectedChild);
  const filteredLessons = filterRecordsForChild(lessons, selectedChild);
  const filteredGoals = filterRecordsForChild(goals, selectedChild);
  const completedGoals = filteredGoals.filter(g => g.progress === "completed").length;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <p className="font-serif font-bold" style={{ color: C.cream }}>My Progress</p>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">
        <ChildSelector selectedChild={selectedChild} onChange={setSelectedChild} />

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Lessons Done", value: filteredLessons.length, sub: "of 21", emoji: "📚" },
            { label: "Goals Met", value: completedGoals, sub: `of ${filteredGoals.length}`, emoji: "🎯" },
            { label: "Check-ins", value: filteredCheckins.length, sub: "total", emoji: "✅" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-lg mb-0.5">{s.emoji}</p>
              <p className="text-xl font-extrabold leading-none" style={{ color: C.darkGreen }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: C.mutedText }}>{s.sub}</p>
              <p className="text-xs font-bold" style={{ color: C.midGreen }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── REGULATION CHART MODULE ── */}
        {filteredCheckins.length === 0 ? (
          <div className="text-center py-10 rounded-2xl" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-3xl mb-2">🌱</p>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No check-ins yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Complete your first session to start tracking regulation patterns.</p>
          </div>
        ) : (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <RegulationChart checkins={filteredCheckins} />
          </div>
        )}

        {/* Reflections */}
        {filteredCheckins.filter(c => c.note).length > 0 && (
          <div>
            <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>Recent Reflections</p>
            {filteredCheckins.filter(c => c.note).slice(-5).reverse().map(c => (
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