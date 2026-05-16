import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { TrendingUp, TrendingDown, Minus, Star, Heart, Zap, Users, Brain, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, Legend
} from "recharts";
import ChildSelector from "@/components/children/ChildSelector";
import { filterRecordsForChild } from "@/lib/child-selection";

function fmt(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function avg(arr, key) {
  const vals = arr.map(d => d[key]).filter(v => v != null && v > 0);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
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

function TrendIcon({ dir, isGoodUp = true }) {
  const isGood = isGoodUp ? dir === "up" : dir === "down";
  const color = dir === "flat" ? C.mutedText : isGood ? C.midGreen : "#B84C2A";
  if (dir === "up") return <TrendingUp size={14} color={color} />;
  if (dir === "down") return <TrendingDown size={14} color={color} />;
  return <Minus size={14} color={color} />;
}

function TrendLabel({ dir, isGoodUp = true }) {
  const isGood = isGoodUp ? dir === "up" : dir === "down";
  const color = dir === "flat" ? C.mutedText : isGood ? C.midGreen : "#B84C2A";
  const label = dir === "up" ? "Improving" : dir === "down" ? "Declining" : "Stable";
  return <span className="text-[10px] font-bold" style={{ color }}>{label}</span>;
}

const RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "All", days: null },
];

const AREA_COLORS = {
  child_regulation: C.midGreen,
  parent_calm: C.gold,
  cooperation: "#5B8DB8",
  emotional_regulation: "#9B59B6",
  focus: "#E67E22",
  mood: "#E74C3C",
};

// Maps check-in fields to readable labels
const METRICS = [
  { key: "child_regulation", label: "Child Regulation", icon: Brain, color: C.midGreen, description: "How well your child managed big emotions (1–5)" },
  { key: "parent_calm", label: "Parent Calm", icon: Heart, color: C.gold, description: "Your own sense of calm and groundedness (1–5)" },
];

export default function BehavioralTrends() {
  const [allCheckins, setAllCheckins] = useState([]);
  const [allBehaviorLogs, setAllBehaviorLogs] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const checkins = useMemo(() => filterRecordsForChild(allCheckins, selectedChild), [allCheckins, selectedChild]);
  const behaviorLogs = useMemo(() => filterRecordsForChild(allBehaviorLogs, selectedChild), [allBehaviorLogs, selectedChild]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);
  const [activeMetric, setActiveMetric] = useState("both");

  useEffect(() => {
    Promise.all([
      base44.entities.CheckIn.list("-created_date", 300),
      base44.entities.BehaviorLog.list("-created_date", 300),
    ]).then(([c, b]) => {
      setAllCheckins(c);
      setAllBehaviorLogs(b);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...checkins].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (!range) return sorted;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return sorted.filter(c => new Date(c.created_date) >= cutoff);
  }, [checkins, range]);

  const filteredLogs = useMemo(() => {
    if (!range) return behaviorLogs;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return behaviorLogs.filter(b => new Date(b.created_date) >= cutoff);
  }, [behaviorLogs, range]);

  const chartData = useMemo(() =>
    filtered.map(c => ({
      date: fmt(c.created_date),
      reg: c.child_regulation || null,
      calm: c.parent_calm || null,
    })), [filtered]);

  // Weekly rollup
  const weeklyData = useMemo(() => {
    const weeks = {};
    filtered.forEach(c => {
      const d = new Date(c.created_date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = fmt(weekStart);
      if (!weeks[key]) weeks[key] = { week: key, regVals: [], calmVals: [] };
      if (c.child_regulation) weeks[key].regVals.push(c.child_regulation);
      if (c.parent_calm) weeks[key].calmVals.push(c.parent_calm);
    });
    return Object.values(weeks).map(w => ({
      week: w.week,
      reg: w.regVals.length ? parseFloat((w.regVals.reduce((a,b) => a+b,0)/w.regVals.length).toFixed(2)) : null,
      calm: w.calmVals.length ? parseFloat((w.calmVals.reduce((a,b) => a+b,0)/w.calmVals.length).toFixed(2)) : null,
      checkins: w.regVals.length,
    }));
  }, [filtered]);

  // Behavior log frequency by type
  const behaviorBreakdown = useMemo(() => {
    const counts = {};
    filteredLogs.forEach(log => {
      const type = log.behavior_type || log.category || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [filteredLogs]);

  // Improvement streaks
  const streak = useMemo(() => {
    if (filtered.length < 2) return 0;
    const recent = [...filtered].reverse();
    let s = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      if ((recent[i].child_regulation || 0) >= (recent[i+1].child_regulation || 0)) s++;
      else break;
    }
    return s;
  }, [filtered]);

  // Best and worst days
  const bestDay = useMemo(() =>
    filtered.reduce((best, c) =>
      (c.child_regulation || 0) > (best?.child_regulation || 0) ? c : best
    , null), [filtered]);

  const avgReg = avg(filtered, "child_regulation");
  const avgCalm = avg(filtered, "parent_calm");
  const trendReg = trendDir(chartData, "reg");
  const trendCalm = trendDir(chartData, "calm");

  // Monthly comparison
  const thisMonth = useMemo(() => {
    const now = new Date();
    const cur = checkins.filter(c => {
      const d = new Date(c.created_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const last = checkins.filter(c => {
      const d = new Date(c.created_date);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    });
    return {
      curAvg: avg(cur, "child_regulation"),
      lastAvg: avg(last, "child_regulation"),
      curCount: cur.length,
      lastCount: last.length,
    };
  }, [checkins]);

  const monthImprovement = thisMonth.curAvg && thisMonth.lastAvg
    ? (thisMonth.curAvg - thisMonth.lastAvg).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  const hasData = filtered.length > 0;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Behavioral Trends"
        subtitle="Progress over time"
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

      <div className="max-w-[560px] mx-auto px-4 py-5 space-y-5">
        <ChildSelector selectedChild={selectedChild} onChange={setSelectedChild} />

        {/* Hero summary */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-base mb-3" style={{ color: C.cream }}>
            📈 Progress Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Child Regulation */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Brain size={13} color={C.lightGreen} />
                <p className="text-[10px] font-bold" style={{ color: C.lightGreen }}>Child Regulation</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-extrabold" style={{ color: C.cream }}>
                  {avgReg ? avgReg.toFixed(1) : "—"}
                </p>
                <div className="flex flex-col">
                  <TrendIcon dir={trendReg} />
                  <TrendLabel dir={trendReg} />
                </div>
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>avg / 5</p>
            </div>
            {/* Parent Calm */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Heart size={13} color={C.gold} />
                <p className="text-[10px] font-bold" style={{ color: C.gold }}>Parent Calm</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-extrabold" style={{ color: C.cream }}>
                  {avgCalm ? avgCalm.toFixed(1) : "—"}
                </p>
                <div className="flex flex-col">
                  <TrendIcon dir={trendCalm} />
                  <TrendLabel dir={trendCalm} />
                </div>
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>avg / 5</p>
            </div>
          </div>

          {/* Monthly compare */}
          {monthImprovement !== null && (
            <div className="mt-3 rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.08)" }}>
              {parseFloat(monthImprovement) >= 0
                ? <TrendingUp size={16} color={C.lightGreen} />
                : <TrendingDown size={16} color="#E09090" />}
              <p className="text-xs" style={{ color: C.lightGreen }}>
                Child regulation is{" "}
                <strong style={{ color: parseFloat(monthImprovement) >= 0 ? "#A8E6A3" : "#E09090" }}>
                  {parseFloat(monthImprovement) >= 0 ? "+" : ""}{monthImprovement} pts
                </strong>{" "}
                vs last month ({thisMonth.lastCount} → {thisMonth.curCount} check-ins)
              </p>
            </div>
          )}

          {/* Streak */}
          {streak >= 3 && (
            <div className="mt-2 rounded-xl p-2.5 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <p className="text-xs font-bold" style={{ color: C.gold }}>{streak}-session improvement streak!</p>
            </div>
          )}
        </div>

        {!hasData ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <p className="text-3xl mb-3">🌱</p>
            <p className="font-serif font-bold text-base mb-2" style={{ color: C.darkGreen }}>No check-ins yet</p>
            <p className="text-xs" style={{ color: C.mutedText }}>
              Complete your daily check-ins to start seeing behavioral trends here.
            </p>
          </div>
        ) : (
          <>
            {/* Area chart — daily trend */}
            <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Daily Regulation Trend</p>
                <div className="flex gap-1.5">
                  {["both", "reg", "calm"].map(m => (
                    <button key={m} onClick={() => setActiveMetric(m)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg"
                      style={{
                        background: activeMetric === m ? C.darkGreen : C.offWhite,
                        color: activeMetric === m ? C.cream : C.mutedText,
                        border: "none", cursor: "pointer",
                      }}>
                      {m === "both" ? "Both" : m === "reg" ? "Child" : "Parent"}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.midGreen} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.midGreen} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="calmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.gold} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.gold} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.mutedText }} />
                  <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 9, fill: C.mutedText }} />
                  <Tooltip
                    contentStyle={{ background: C.white, border: `1px solid ${C.cream}`, borderRadius: 10, fontSize: 11 }}
                    formatter={(val, name) => [val ? val + "/5" : "—", name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {(activeMetric === "both" || activeMetric === "reg") && (
                    <Area type="monotone" dataKey="reg" name="Child Regulation"
                      stroke={C.midGreen} strokeWidth={2.5} fill="url(#regGrad)" dot={{ r: 3 }} connectNulls />
                  )}
                  {(activeMetric === "both" || activeMetric === "calm") && (
                    <Area type="monotone" dataKey="calm" name="Parent Calm"
                      stroke={C.gold} strokeWidth={2.5} fill="url(#calmGrad)" dot={{ r: 3 }} connectNulls />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly averages bar chart */}
            {weeklyData.length >= 2 && (
              <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>Weekly Averages</p>
                <p className="text-[11px] mb-3" style={{ color: C.mutedText }}>
                  See week-over-week progress at a glance
                </p>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                    <XAxis dataKey="week" tick={{ fontSize: 9, fill: C.mutedText }} />
                    <YAxis domain={[0, 5]} ticks={[0,1,2,3,4,5]} tick={{ fontSize: 9, fill: C.mutedText }} />
                    <Tooltip
                      contentStyle={{ background: C.white, border: `1px solid ${C.cream}`, borderRadius: 10, fontSize: 11 }}
                      formatter={(val, name) => [val ? val + "/5" : "—", name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="reg" name="Child Regulation" fill={C.midGreen} radius={[4,4,0,0]} />
                    <Bar dataKey="calm" name="Parent Calm" fill={C.gold} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Score distribution */}
            <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Score Distribution</p>
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map(score => {
                  const count = filtered.filter(c => c.child_regulation === score).length;
                  const pct = filtered.length ? (count / filtered.length) * 100 : 0;
                  const color = score >= 4 ? C.midGreen : score === 3 ? C.gold : "#B84C2A";
                  return (
                    <div key={score} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold w-4 text-right" style={{ color }}>{score}</span>
                      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: C.offWhite }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-[10px] w-8 text-right" style={{ color: C.mutedText }}>{count}x</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] mt-2 text-center" style={{ color: C.mutedText }}>
                Child regulation score distribution ({filtered.length} check-ins)
              </p>
            </div>

            {/* Behavior log breakdown */}
            {behaviorBreakdown.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>Behavior Log Patterns</p>
                <p className="text-[11px] mb-3" style={{ color: C.mutedText }}>
                  Most logged behavior types in this period
                </p>
                <div className="space-y-2">
                  {behaviorBreakdown.map((b, i) => {
                    const max = behaviorBreakdown[0].count;
                    const pct = (b.count / max) * 100;
                    const colors = [C.midGreen, C.gold, "#5B8DB8", "#9B59B6", "#E67E22", C.brown];
                    return (
                      <div key={b.name} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold flex-1 truncate" style={{ color: C.darkGreen, minWidth: 80 }}>
                          {b.name}
                        </span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: C.offWhite }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                        </div>
                        <span className="text-[10px] w-6 text-right font-bold" style={{ color: C.mutedText }}>
                          {b.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Best day highlight */}
            {bestDay && (
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
                <Star size={20} color={C.midGreen} className="flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Best Day 🌟</p>
                  <p className="text-xs mt-0.5" style={{ color: C.mutedText }}>
                    {new Date(bestDay.created_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} —{" "}
                    Child regulation: <strong style={{ color: C.midGreen }}>{bestDay.child_regulation}/5</strong>
                    {bestDay.parent_calm ? `, Parent calm: ${bestDay.parent_calm}/5` : ""}
                  </p>
                  {bestDay.note && (
                    <p className="text-[11px] mt-1 italic" style={{ color: "#3a3028" }}>"{bestDay.note}"</p>
                  )}
                </div>
              </div>
            )}

            {/* Positive milestone badges */}
            <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Milestones</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { condition: filtered.length >= 7, icon: "✅", label: `${filtered.length} Check-ins`, sub: "in this period" },
                  { condition: avgReg >= 4, icon: "🌟", label: "Strong Regulation", sub: "avg 4+ this period" },
                  { condition: streak >= 3, icon: "🔥", label: `${streak}-day Streak`, sub: "consecutive improvement" },
                  { condition: avgCalm >= 4, icon: "🧘", label: "Regulated Parent", sub: "avg calm 4+ this period" },
                ].map((m, i) => (
                  <div key={i} className="rounded-xl p-3 text-center"
                    style={{
                      background: m.condition ? "#EAF4EA" : C.offWhite,
                      border: `1px solid ${m.condition ? C.midGreen : C.cream}`,
                      opacity: m.condition ? 1 : 0.5,
                    }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <p className="text-[11px] font-bold mt-1" style={{ color: C.darkGreen }}>{m.label}</p>
                    <p className="text-[10px]" style={{ color: C.mutedText }}>{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}