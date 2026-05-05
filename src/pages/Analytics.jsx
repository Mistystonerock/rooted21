import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Star, Lightbulb, Activity, Target, BookOpen, Zap } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, Legend
} from "recharts";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function scoreColor(v) {
  if (!v) return C.mutedText;
  if (v >= 4) return C.midGreen;
  if (v >= 3) return C.gold;
  return "#B84C2A";
}

function trendDir(data, key) {
  if (data.length < 4) return "flat";
  const half = Math.floor(data.length / 2);
  const older = data.slice(0, half).map(d => d[key]).filter(Boolean);
  const newer = data.slice(half).map(d => d[key]).filter(Boolean);
  if (!older.length || !newer.length) return "flat";
  const avgOld = older.reduce((a, b) => a + b, 0) / older.length;
  const avgNew = newer.reduce((a, b) => a + b, 0) / newer.length;
  const diff = avgNew - avgOld;
  if (diff > 0.3) return "up";
  if (diff < -0.3) return "down";
  return "flat";
}

function TrendBadge({ dir, positiveIsUp = true }) {
  const isGood = positiveIsUp ? dir === "up" : dir === "down";
  const color = dir === "flat" ? C.mutedText : isGood ? C.midGreen : "#B84C2A";
  if (dir === "up") return <TrendingUp size={13} color={color} />;
  if (dir === "down") return <TrendingDown size={13} color={color} />;
  return <Minus size={13} color={color} />;
}

const RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "All", days: null },
];

// ── sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ icon: SectionIcon, title, color }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <SectionIcon size={15} color={color || C.midGreen} />
      <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>{title}</p>
    </div>
  );
}

function StatCard({ value, label, sub, color }) {
  return (
    <div className="rounded-xl p-3.5 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <p className="text-2xl font-extrabold leading-none mb-1" style={{ color: color || C.darkGreen }}>{value}</p>
      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>{sub}</p>}
    </div>
  );
}

function InsightCard({ icon: InsightIcon, color, text }) {
  return (
    <div className="rounded-xl px-3.5 py-2.5 flex items-start gap-2.5"
      style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
      <InsightIcon size={13} color={color} className="mt-0.5 flex-shrink-0" />
      <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>{text}</p>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [checkins, setCheckins] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [goals, setGoals] = useState([]);
  const [crisisSessions, setCrisisSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    Promise.all([
      base44.entities.CheckIn.list("-created_date", 200),
      base44.entities.LessonProgress.filter({ completed: true }),
      base44.entities.Goal.list(),
      base44.entities.CrisisSession.list("-created_date", 100),
    ]).then(([c, l, g, cs]) => {
      setCheckins(c);
      setLessons(l);
      setGoals(g);
      setCrisisSessions(cs);
      setLoading(false);
    });
  }, []);

  // Filter checkins by range
  const filteredCheckins = useMemo(() => {
    const sorted = [...checkins].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (!range) return sorted;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return sorted.filter(c => new Date(c.created_date) >= cutoff);
  }, [checkins, range]);

  // Chart data
  const chartData = useMemo(() =>
    filteredCheckins.map(c => ({
      date: fmt(c.created_date),
      reg: c.child_regulation,
      calm: c.parent_calm,
      note: c.note,
    })), [filteredCheckins]);

  // Averages
  const avgReg = filteredCheckins.length
    ? (filteredCheckins.reduce((s, c) => s + (c.child_regulation || 0), 0) / filteredCheckins.length)
    : 0;
  const avgCalm = filteredCheckins.length
    ? (filteredCheckins.reduce((s, c) => s + (c.parent_calm || 0), 0) / filteredCheckins.length)
    : 0;

  const trendReg = trendDir(chartData, "reg");
  const trendCalm = trendDir(chartData, "calm");

  // Day-of-week breakdown (0=Sun)
  const dayOfWeekData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = days.map(d => ({ day: d, reg: 0, calm: 0, count: 0 }));
    filteredCheckins.forEach(c => {
      const dow = new Date(c.created_date).getDay();
      buckets[dow].reg += c.child_regulation || 0;
      buckets[dow].calm += c.parent_calm || 0;
      buckets[dow].count++;
    });
    return buckets.map(b => ({
      day: b.day,
      "Child Reg": b.count ? parseFloat((b.reg / b.count).toFixed(1)) : null,
      "Parent Calm": b.count ? parseFloat((b.calm / b.count).toFixed(1)) : null,
    }));
  }, [filteredCheckins]);

  // Goal status breakdown
  const goalStats = useMemo(() => {
    const total = goals.length;
    const done = goals.filter(g => g.progress === "completed").length;
    const active = goals.filter(g => g.progress === "in_progress").length;
    const notStarted = goals.filter(g => g.progress === "not_started").length;
    return { total, done, active, notStarted };
  }, [goals]);

  // Radar: overall wellness profile
  const radarData = useMemo(() => {
    const lessonPct = Math.round((lessons.length / 21) * 100);
    const regAvg = avgReg ? Math.round((avgReg / 5) * 100) : 0;
    const calmAvg = avgCalm ? Math.round((avgCalm / 5) * 100) : 0;
    const goalPct = goalStats.total ? Math.round((goalStats.done / goalStats.total) * 100) : 0;
    const consistencyPct = filteredCheckins.length >= 7
      ? Math.min(100, Math.round((filteredCheckins.length / 14) * 100))
      : Math.round((filteredCheckins.length / 7) * 100);
    return [
      { subject: "Lessons", value: lessonPct },
      { subject: "Child Reg.", value: regAvg },
      { subject: "Parent Calm", value: calmAvg },
      { subject: "Goals", value: goalPct },
      { subject: "Consistency", value: consistencyPct },
    ];
  }, [lessons, avgReg, avgCalm, goalStats, filteredCheckins]);

  // Crisis session trend by week
  const crisisByWeek = useMemo(() => {
    const map = {};
    crisisSessions.forEach(s => {
      const d = new Date(s.created_date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .slice(-8)
      .map(([week, count]) => ({ week, count }));
  }, [crisisSessions]);

  // Auto-generated insights
  const insights = useMemo(() => {
    const list = [];
    if (filteredCheckins.length < 3) return list;

    const lowRegDays = filteredCheckins.filter(c => c.child_regulation && c.child_regulation <= 2);
    if (lowRegDays.length >= 2) {
      list.push({ icon: AlertTriangle, color: "#B84C2A", text: `${lowRegDays.length} sessions with low child regulation (≤2) — consider reviewing triggers and sensory needs.` });
    }

    const highDays = filteredCheckins.filter(c => c.child_regulation >= 4 && c.parent_calm >= 4);
    if (highDays.length >= 2) {
      list.push({ icon: Star, color: C.midGreen, text: `${highDays.length} sessions where both scores hit 4+ — reflect on what made those days work.` });
    }

    const parentLower = filteredCheckins.filter(c => c.parent_calm < c.child_regulation);
    if (parentLower.length >= 3) {
      list.push({ icon: Lightbulb, color: C.gold, text: `Your calm was lower than your child's regulation in ${parentLower.length} sessions — this may be a self-care signal.` });
    }

    if (trendReg === "up") {
      list.push({ icon: TrendingUp, color: C.midGreen, text: "Child regulation is trending upward — great progress!" });
    } else if (trendReg === "down") {
      list.push({ icon: TrendingDown, color: "#B84C2A", text: "Child regulation has been declining recently — a good time to revisit your calming toolkit." });
    }

    if (lessons.length >= 10 && goalStats.active === 0) {
      list.push({ icon: Target, color: C.brown, text: "You've completed several lessons but have no active goals — consider setting a new one to apply what you've learned." });
    }

    return list;
  }, [filteredCheckins, trendReg, lessons, goalStats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  const hasCheckins = filteredCheckins.length > 0;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Behavior Analytics"
        subtitle="Trends · Patterns · Insights"
        backTo="/dashboard"
        rightSlot={
          <div className="flex gap-1">
            {RANGES.map(r => (
              <button key={r.label} onClick={() => setRange(r.days)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{
                  background: range === r.days ? C.gold : "#ffffff18",
                  color: range === r.days ? C.darkGreen : C.lightGreen,
                  border: "none", cursor: "pointer",
                }}>
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="max-w-[560px] mx-auto px-4 py-5 space-y-6">

        {/* ── OVERVIEW STATS ── */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard value={filteredCheckins.length} label="Check-ins" color={C.midGreen} />
          <StatCard value={lessons.length} label="Lessons" sub="/21 done" color={C.brown} />
          <StatCard value={goalStats.done} label="Goals Done" sub={`${goalStats.active} active`} color={C.gold} />
          <StatCard value={crisisSessions.length} label="AI Sessions" color="#5B8DB8" />
        </div>

        {/* ── REGULATION TREND LINE ── */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <SectionHeader icon={Activity} title="Regulation Over Time" color={C.midGreen} />

          {/* avg scores */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl p-3 text-center" style={{ background: C.offWhite }}>
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="text-xl font-extrabold" style={{ color: scoreColor(avgReg) }}>
                  {avgReg ? avgReg.toFixed(1) : "—"}
                </span>
                <TrendBadge dir={trendReg} />
              </div>
              <p className="text-[10px] font-bold" style={{ color: C.midGreen }}>🧒 Child Regulation</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: C.offWhite }}>
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="text-xl font-extrabold" style={{ color: scoreColor(avgCalm) }}>
                  {avgCalm ? avgCalm.toFixed(1) : "—"}
                </span>
                <TrendBadge dir={trendCalm} />
              </div>
              <p className="text-[10px] font-bold" style={{ color: C.gold }}>🌿 Parent Calm</p>
            </div>
          </div>

          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.mutedText }} />
                <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 9, fill: C.mutedText }} />
                <Tooltip
                  contentStyle={{ background: C.white, border: `1px solid ${C.cream}`, borderRadius: 10, fontSize: 11 }}
                  formatter={(val, name) => [val + "/5", name]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="reg" name="Child Reg." stroke={C.midGreen} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="calm" name="Parent Calm" stroke={C.gold} strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-8 text-center rounded-xl" style={{ background: C.offWhite }}>
              <p className="text-2xl mb-1">🌱</p>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Not enough check-ins yet</p>
              <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>Complete a few check-ins to see your trend line.</p>
            </div>
          )}
        </div>

        {/* ── DAY OF WEEK PATTERNS ── */}
        {hasCheckins && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <SectionHeader icon={Activity} title="Regulation by Day of Week" color={C.brown} />
            <p className="text-[11px] mb-3" style={{ color: C.mutedText }}>
              Average scores per weekday — helps spot hard days or strong patterns.
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dayOfWeekData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.mutedText }} />
                <YAxis domain={[0, 5]} ticks={[0,1,2,3,4,5]} tick={{ fontSize: 10, fill: C.mutedText }} />
                <Tooltip
                  contentStyle={{ background: C.white, border: `1px solid ${C.cream}`, borderRadius: 10, fontSize: 11 }}
                  formatter={(val, name) => [val ? val + "/5" : "No data", name]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Child Reg" name="Child Reg." fill={C.midGreen} radius={[4,4,0,0]} />
                <Bar dataKey="Parent Calm" name="Parent Calm" fill={C.gold} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── WELLNESS RADAR ── */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <SectionHeader icon={Star} title="Overall Wellness Profile" color={C.gold} />
          <p className="text-[11px] mb-3" style={{ color: C.mutedText }}>
            A 360° view across lessons, regulation, goals, and consistency. Each axis = 0–100%.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.cream} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: C.mutedText }} />
              <Radar name="You" dataKey="value" stroke={C.darkGreen} fill={C.midGreen} fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* ── GOAL PROGRESS ── */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <SectionHeader icon={Target} title="Goal Momentum" color={C.brown} />
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard value={goalStats.active} label="Active" color={C.gold} />
            <StatCard value={goalStats.done} label="Completed" color={C.midGreen} />
            <StatCard value={goalStats.notStarted} label="Not Started" color={C.mutedText} />
          </div>
          {goalStats.total > 0 ? (
            <>
              <div className="flex justify-between mb-1">
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Overall Completion</p>
                <p className="text-xs font-bold" style={{ color: C.midGreen }}>
                  {Math.round((goalStats.done / goalStats.total) * 100)}%
                </p>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: C.cream }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${(goalStats.done / goalStats.total) * 100}%`, background: C.midGreen }} />
              </div>
            </>
          ) : (
            <p className="text-xs text-center py-3" style={{ color: C.mutedText }}>No goals created yet.</p>
          )}
        </div>

        {/* ── LESSON PROGRESS ── */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <SectionHeader icon={BookOpen} title="Curriculum Progress" color={C.midGreen} />
          <div className="flex justify-between mb-1.5">
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Lessons Completed</p>
            <p className="text-xs font-bold" style={{ color: C.midGreen }}>{lessons.length}/21</p>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: C.cream }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(lessons.length / 21) * 100}%`, background: C.midGreen }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Foundation", weeks: [1,2,3], color: "#5B8DB8" },
              { label: "Connecting", weeks: [4,5,6,7], color: C.midGreen },
              { label: "Empowering", weeks: [8,9,10], color: C.gold },
            ].map(pillar => (
              <div key={pillar.label} className="rounded-xl p-2.5"
                style={{ background: `${pillar.color}12`, border: `1px solid ${pillar.color}25` }}>
                <p className="text-[10px] font-bold" style={{ color: pillar.color }}>{pillar.label}</p>
                <p className="text-base font-extrabold mt-0.5" style={{ color: pillar.color }}>
                  {lessons.filter(l => {
                    const lNum = l.lesson_id;
                    if (pillar.label === "Foundation") return lNum >= 1 && lNum <= 7;
                    if (pillar.label === "Connecting") return lNum >= 8 && lNum <= 14;
                    return lNum >= 15 && lNum <= 21;
                  }).length}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI SESSIONS ── */}
        {crisisByWeek.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <SectionHeader icon={Zap} title="Crisis Support Sessions by Week" color="#5B8DB8" />
            <p className="text-[11px] mb-3" style={{ color: C.mutedText }}>
              How often you reached for AI support — high weeks may indicate elevated stress periods.
            </p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={crisisByWeek} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: C.mutedText }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: C.mutedText }} />
                <Tooltip
                  contentStyle={{ background: C.white, border: `1px solid ${C.cream}`, borderRadius: 10, fontSize: 11 }}
                  formatter={(val) => [val, "Sessions"]}
                />
                <Bar dataKey="count" name="Sessions" radius={[4,4,0,0]}>
                  {crisisByWeek.map((entry, i) => (
                    <Cell key={i} fill={entry.count >= 4 ? "#B84C2A" : entry.count >= 2 ? C.gold : "#5B8DB8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {insights.length > 0 && (
          <div>
            <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
              💡 PERSONALIZED INSIGHTS
            </p>
            <div className="space-y-2">
              {insights.map((ins, i) => (
                <InsightCard key={i} icon={ins.icon} color={ins.color} text={ins.text} />
              ))}
            </div>
          </div>
        )}

        {!hasCheckins && lessons.length === 0 && goals.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <p className="text-3xl mb-3">📊</p>
            <p className="font-serif font-bold text-base mb-2" style={{ color: C.darkGreen }}>No data yet</p>
            <p className="text-xs" style={{ color: C.mutedText }}>
              Complete a few check-ins, lessons, or goals and your analytics will appear here.
            </p>
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}