import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { TrendingUp, TrendingDown, Minus, Star, Lightbulb, Heart, Smile, Sun, AlertTriangle, Target, BookOpen } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend
} from "recharts";

// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
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

function scoreLabel(v) {
  if (!v) return "—";
  if (v >= 4.5) return "Excellent";
  if (v >= 3.5) return "Good";
  if (v >= 2.5) return "Okay";
  if (v >= 1.5) return "Tough";
  return "Hard";
}

function scoreColor(v) {
  if (!v) return C.mutedText;
  if (v >= 4) return C.midGreen;
  if (v >= 3) return C.gold;
  return "#B84C2A";
}

const RANGES = [
  { label: "1 Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "1 Month", days: 30 },
  { label: "All Time", days: null },
];

// ── custom tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-lg text-xs" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
      <p className="font-bold mb-1" style={{ color: C.darkGreen }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}/5 — {scoreLabel(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── score summary card ─────────────────────────────────────────────────────────
function ScoreCard({ emoji, title, avg, trend, description, color }) {
  const label = scoreLabel(avg);
  const trendText = trend === "up" ? "improving 📈" : trend === "down" ? "needs attention 📉" : "holding steady →";
  const trendColor = trend === "up" ? C.midGreen : trend === "down" ? "#B84C2A" : C.mutedText;

  return (
    <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{title}</p>
      </div>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-4xl font-extrabold leading-none" style={{ color: color || scoreColor(avg) }}>
          {avg ? avg.toFixed(1) : "—"}
        </span>
        <span className="text-sm font-bold mb-0.5" style={{ color: scoreColor(avg) }}>{label}</span>
      </div>
      <div className="text-xs mb-2" style={{ color: trendColor }}>
        Recently: {trendText}
      </div>
      <p className="text-[11px] leading-relaxed p-3 rounded-xl" style={{ color: "#3a3028", background: C.offWhite }}>
        {description}
      </p>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [checkins, setCheckins] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    Promise.all([
      base44.entities.CheckIn.list("-created_date", 200),
      base44.entities.LessonProgress.filter({ completed: true }),
      base44.entities.Goal.list(),
    ]).then(([c, l, g]) => {
      setCheckins(c);
      setLessons(l);
      setGoals(g);
      setLoading(false);
    });
  }, []);

  const filteredCheckins = useMemo(() => {
    const sorted = [...checkins].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (!range) return sorted;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return sorted.filter(c => new Date(c.created_date) >= cutoff);
  }, [checkins, range]);

  const chartData = useMemo(() =>
    filteredCheckins.map(c => ({
      date: fmt(c.created_date),
      "Your Child's Mood": c.child_regulation,
      "Your Calm Level": c.parent_calm,
    })), [filteredCheckins]);

  const avgReg = filteredCheckins.length
    ? filteredCheckins.reduce((s, c) => s + (c.child_regulation || 0), 0) / filteredCheckins.length
    : 0;
  const avgCalm = filteredCheckins.length
    ? filteredCheckins.reduce((s, c) => s + (c.parent_calm || 0), 0) / filteredCheckins.length
    : 0;

  const trendReg = trendDir(chartData, "Your Child's Mood");
  const trendCalm = trendDir(chartData, "Your Calm Level");

  // Day-of-week breakdown — friendly labels
  const dayOfWeekData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = days.map(d => ({ day: d, child: 0, parent: 0, count: 0 }));
    filteredCheckins.forEach(c => {
      const dow = new Date(c.created_date).getDay();
      buckets[dow].child += c.child_regulation || 0;
      buckets[dow].parent += c.parent_calm || 0;
      buckets[dow].count++;
    });
    return buckets.map(b => ({
      day: b.day,
      "Child's Mood": b.count ? parseFloat((b.child / b.count).toFixed(1)) : null,
      "Your Calm": b.count ? parseFloat((b.parent / b.count).toFixed(1)) : null,
    }));
  }, [filteredCheckins]);

  // Goal stats
  const goalStats = useMemo(() => ({
    total: goals.length,
    done: goals.filter(g => g.progress === "completed").length,
    active: goals.filter(g => g.progress === "in_progress").length,
  }), [goals]);

  // Plain-language insights
  const insights = useMemo(() => {
    const list = [];
    if (filteredCheckins.length < 3) return list;

    const hardDays = filteredCheckins.filter(c => c.child_regulation && c.child_regulation <= 2);
    if (hardDays.length >= 2) {
      list.push({
        icon: AlertTriangle, color: "#B84C2A",
        text: `You logged ${hardDays.length} really hard days for your child. That's a lot to carry. It may be worth noting what happened those days — are there patterns like certain times, places, or events?`,
      });
    }

    const greatDays = filteredCheckins.filter(c => c.child_regulation >= 4 && c.parent_calm >= 4);
    if (greatDays.length >= 2) {
      list.push({
        icon: Star, color: C.midGreen,
        text: `You had ${greatDays.length} days where both you AND your child were doing well. Think back — what made those days feel different? Try to repeat what worked!`,
      });
    }

    const parentStruggleDays = filteredCheckins.filter(c => c.parent_calm < c.child_regulation);
    if (parentStruggleDays.length >= 3) {
      list.push({
        icon: Heart, color: "#E05C8A",
        text: `On ${parentStruggleDays.length} days, your child was actually doing better than you were. That's completely normal — but it might be a signal that you need a little more support or rest too.`,
      });
    }

    if (trendReg === "up") {
      list.push({ icon: TrendingUp, color: C.midGreen, text: "Your child's mood and behavior has been getting better over time. Whatever you're doing — keep going!" });
    } else if (trendReg === "down") {
      list.push({ icon: TrendingDown, color: "#B84C2A", text: "Your child has had a harder stretch lately. This doesn't mean you're failing — it means now is a good time to reach out to your support team." });
    }

    if (trendCalm === "up") {
      list.push({ icon: Smile, color: C.midGreen, text: "Your own calm level has been improving! Taking care of yourself really does help your child too." });
    }

    return list;
  }, [filteredCheckins, trendReg, trendCalm]);

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
        title="My Progress Report"
        subtitle="Plain-language overview of how things are going"
        backTo="/dashboard"
      />

      <div className="max-w-[560px] mx-auto px-4 py-5 space-y-5">

        {/* ── WHAT IS THIS PAGE? ── */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm mb-1" style={{ color: C.cream }}>📊 What is this page?</p>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            Every time you do a Daily Check-In, you score two things from 1–5. This page turns all those scores into easy-to-read charts so you can see how things are going over time — for your child <strong style={{ color: C.cream }}>and</strong> for you.
          </p>
        </div>

        {/* ── TIME RANGE SELECTOR ── */}
        <div>
          <p className="text-[11px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>SHOW DATA FROM:</p>
          <div className="flex gap-2 flex-wrap">
            {RANGES.map(r => (
              <button key={r.label} onClick={() => setRange(r.days)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: range === r.days ? C.darkGreen : C.cream,
                  color: range === r.days ? "#fff" : C.darkGreen,
                  border: "none", cursor: "pointer",
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── QUICK SUMMARY ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
            <p className="text-2xl font-extrabold" style={{ color: C.midGreen }}>{filteredCheckins.length}</p>
            <p className="text-[11px] font-bold mt-0.5" style={{ color: C.darkGreen }}>Check-ins</p>
            <p className="text-[10px]" style={{ color: C.mutedText }}>days logged</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
            <p className="text-2xl font-extrabold" style={{ color: C.brown }}>{lessons.length}</p>
            <p className="text-[11px] font-bold mt-0.5" style={{ color: C.darkGreen }}>Lessons</p>
            <p className="text-[10px]" style={{ color: C.mutedText }}>out of 21 done</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
            <p className="text-2xl font-extrabold" style={{ color: C.gold }}>{goalStats.done}</p>
            <p className="text-[11px] font-bold mt-0.5" style={{ color: C.darkGreen }}>Goals Met</p>
            <p className="text-[10px]" style={{ color: C.mutedText }}>{goalStats.active} still going</p>
          </div>
        </div>

        {/* ── SCORE EXPLAINER ── */}
        <div className="rounded-2xl p-4" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}40` }}>
          <p className="font-bold text-xs mb-2" style={{ color: C.darkGreen }}>🔢 What do the 1–5 scores mean?</p>
          <div className="space-y-1">
            {[
              { score: "5 — Excellent", desc: "Really great day, things went smoothly" },
              { score: "4 — Good", desc: "More good moments than hard ones" },
              { score: "3 — Okay", desc: "Mixed bag — some struggles, some wins" },
              { score: "2 — Tough", desc: "Hard day with noticeable challenges" },
              { score: "1 — Really Hard", desc: "Very difficult, may need extra support" },
            ].map(({ score, desc }) => (
              <div key={score} className="flex gap-2">
                <p className="text-[11px] font-bold w-28 flex-shrink-0" style={{ color: C.darkGreen }}>{score}</p>
                <p className="text-[11px]" style={{ color: C.mutedText }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SCORE CARDS ── */}
        <ScoreCard
          emoji="🧒"
          title="Your Child's Emotional State"
          avg={avgReg}
          trend={trendReg}
          color={scoreColor(avgReg)}
          description={`This score tracks how calm, cooperative, and emotionally regulated your child has been. A higher score means they were managing their feelings well. A lower score doesn't mean they're bad — it means they were struggling and needed more support.`}
        />

        <ScoreCard
          emoji="🌿"
          title="Your Calm Level"
          avg={avgCalm}
          trend={trendCalm}
          color={scoreColor(avgCalm)}
          description={`This is YOUR score — how calm and grounded you felt as the parent. Research shows that when parents stay calm, kids actually do better too. It's okay if this score is low sometimes. Noticing it is the first step.`}
        />

        {/* ── TREND CHART ── */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>📈 How Things Have Changed Over Time</p>
          <p className="text-[11px] mb-4 leading-relaxed" style={{ color: C.mutedText }}>
            Each dot on this chart is one of your daily check-ins. Look for the general direction — are the lines going <strong>up</strong> (improving) or staying <strong>flat</strong> or going <strong>down</strong> (needs attention)?
          </p>

          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.mutedText }} />
                <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 9, fill: C.mutedText }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, marginTop: 8 }} />
                <Line type="monotone" dataKey="Your Child's Mood" stroke={C.midGreen} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Your Calm Level" stroke={C.gold} strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-8 text-center rounded-xl" style={{ background: C.offWhite }}>
              <p className="text-2xl mb-1">🌱</p>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Not enough check-ins yet</p>
              <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>
                Do a few Daily Check-Ins and you'll start seeing your progress here.
              </p>
              <Link to="/daily-checkin" className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-bold"
                style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
                Do a Check-In Now →
              </Link>
            </div>
          )}
        </div>

        {/* ── BEST AND HARDEST DAYS ── */}
        {hasCheckins && (
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
            <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>📅 Which Days of the Week Are Hardest?</p>
            <p className="text-[11px] mb-4 leading-relaxed" style={{ color: C.mutedText }}>
              This shows your average scores by day of the week. Lower bars = harder days. Spotting patterns (like "Mondays are always rough") can help you prepare ahead of time.
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dayOfWeekData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.mutedText }} />
                <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: C.mutedText }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Child's Mood" fill={C.midGreen} radius={[4,4,0,0]} />
                <Bar dataKey="Your Calm" fill={C.gold} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── GOAL & LESSON PROGRESS ── */}
        {(goalStats.total > 0 || lessons.length > 0) && (
          <div className="rounded-2xl p-4 space-y-4" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>🎯 Your Learning & Goals</p>

            {lessons.length > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>📖 Lessons Completed</p>
                  <p className="text-xs font-bold" style={{ color: C.midGreen }}>{lessons.length} of 21</p>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: C.cream }}>
                  <div className="h-full rounded-full" style={{ width: `${(lessons.length / 21) * 100}%`, background: C.midGreen }} />
                </div>
                <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>
                  Every lesson you finish adds new tools to your parenting toolbox.
                </p>
              </div>
            )}

            {goalStats.total > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>✅ Goals Completed</p>
                  <p className="text-xs font-bold" style={{ color: C.gold }}>{goalStats.done} of {goalStats.total}</p>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: C.cream }}>
                  <div className="h-full rounded-full" style={{ width: `${(goalStats.done / goalStats.total) * 100}%`, background: C.gold }} />
                </div>
                <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>
                  {goalStats.active > 0 ? `You have ${goalStats.active} goal${goalStats.active > 1 ? "s" : ""} in progress right now — keep going!` : "Set a new goal to keep building momentum."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── PLAIN-LANGUAGE INSIGHTS ── */}
        {insights.length > 0 && (
          <div>
            <p className="text-[11px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
              💡 WHAT YOUR DATA IS TELLING YOU
            </p>
            <div className="space-y-3">
              {insights.map((ins, i) => {
                const Icon = ins.icon;
                return (
                  <div key={i} className="rounded-2xl p-4 flex items-start gap-3"
                    style={{ background: `${ins.color}10`, border: `1.5px solid ${ins.color}30` }}>
                    <Icon size={18} color={ins.color} className="flex-shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{ins.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!hasCheckins && lessons.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", border: `1.5px dashed ${C.cream}` }}>
            <p className="text-3xl mb-3">🌱</p>
            <p className="font-serif font-bold text-base mb-2" style={{ color: C.darkGreen }}>Nothing to show yet</p>
            <p className="text-xs mb-4" style={{ color: C.mutedText }}>
              Start your first Daily Check-In and this page will begin tracking your family's progress!
            </p>
            <Link to="/daily-checkin" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
              Start a Check-In →
            </Link>
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}