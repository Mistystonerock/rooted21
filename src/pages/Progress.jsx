import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function fmt(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

export default function Progress() {
  const [checkins, setCheckins] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    base44.entities.CheckIn.list("created_date", 60).then(setCheckins);
    base44.entities.LessonProgress.filter({ completed: true }).then(setLessons);
    base44.entities.Goal.list().then(setGoals);
  }, []);

  const chartData = checkins.map(c => ({
    date: fmt(c.created_date),
    "Child Reg.": c.child_regulation,
    "Parent Calm": c.parent_calm,
  }));

  const avg = key => {
    if (!checkins.length) return "–";
    return (checkins.reduce((a, c) => a + (c[key] || 0), 0) / checkins.length).toFixed(1);
  };

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

        {/* Avg scores */}
        {checkins.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3.5 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-2xl font-extrabold" style={{ color: C.midGreen }}>{avg("child_regulation")}</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Avg Child Regulation</p>
            </div>
            <div className="rounded-xl p-3.5 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-2xl font-extrabold" style={{ color: C.gold }}>{avg("parent_calm")}</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Avg Parent Calm</p>
            </div>
          </div>
        )}

        {/* Line chart */}
        {checkins.length > 1 && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Regulation Trends</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.mutedText }} />
                <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: C.mutedText }} />
                <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.cream}`, borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Child Reg." stroke={C.midGreen} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Parent Calm" stroke={C.gold} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {checkins.length === 0 && (
          <div className="text-center py-10 rounded-2xl" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-3xl mb-2">🌱</p>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No check-ins yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Complete your first session to start tracking.</p>
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
      </div>
    </div>
  );
}