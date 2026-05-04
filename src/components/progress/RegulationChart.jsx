import { useState, useMemo } from "react";
import { C } from "@/lib/rooted-constants";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart, ComposedChart, Bar
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Star, Info } from "lucide-react";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "All", days: null },
];

function fmt(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function fmtFull(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function trendArrow(data, key) {
  if (data.length < 3) return null;
  const recent = data.slice(-3).map(d => d[key]).filter(Boolean);
  const older = data.slice(-6, -3).map(d => d[key]).filter(Boolean);
  if (!recent.length || !older.length) return null;
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  const diff = recentAvg - olderAvg;
  if (diff > 0.3) return "up";
  if (diff < -0.3) return "down";
  return "flat";
}

function scoreColor(val) {
  if (!val) return C.mutedText;
  if (val >= 4) return C.midGreen;
  if (val >= 3) return C.gold;
  return "#B84C2A";
}

function scoreLabel(val) {
  if (!val) return "—";
  if (val >= 4.5) return "Thriving";
  if (val >= 3.5) return "Stable";
  if (val >= 2.5) return "Struggling";
  return "Crisis";
}

// Detect patterns: days/streaks with low scores
function detectPatterns(data) {
  const patterns = [];

  // Low child reg days
  const lowReg = data.filter(d => d["Child Reg."] && d["Child Reg."] <= 2);
  if (lowReg.length >= 2) {
    patterns.push({
      type: "warning",
      icon: AlertTriangle,
      color: "#B84C2A",
      text: `${lowReg.length} sessions with low child regulation (≤2/5) detected.`,
    });
  }

  // Parent calm lower than child reg pattern
  const calmBelowReg = data.filter(d =>
    d["Parent Calm"] && d["Child Reg."] && d["Parent Calm"] < d["Child Reg."]
  );
  if (calmBelowReg.length >= 2) {
    patterns.push({
      type: "info",
      icon: Info,
      color: C.gold,
      text: `In ${calmBelowReg.length} sessions your calm was lower than your child's regulation — consider self-care on those days.`,
    });
  }

  // Strong days
  const strongDays = data.filter(d =>
    d["Child Reg."] && d["Parent Calm"] && d["Child Reg."] >= 4 && d["Parent Calm"] >= 4
  );
  if (strongDays.length >= 2) {
    patterns.push({
      type: "success",
      icon: Star,
      color: C.midGreen,
      text: `${strongDays.length} sessions where both scores were 4+ — look for what you did those days!`,
    });
  }

  return patterns;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const childReg = payload.find(p => p.dataKey === "Child Reg.")?.value;
  const parentCalm = payload.find(p => p.dataKey === "Parent Calm")?.value;
  const note = payload[0]?.payload?.note;

  return (
    <div className="rounded-2xl shadow-lg p-3 text-xs min-w-[140px]"
      style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <p className="font-bold mb-1.5" style={{ color: C.darkGreen }}>{payload[0]?.payload?.fullDate || label}</p>
      {childReg !== undefined && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span style={{ color: C.midGreen }}>🧒 Child Reg.</span>
          <span className="font-extrabold" style={{ color: scoreColor(childReg) }}>{childReg}/5</span>
        </div>
      )}
      {parentCalm !== undefined && (
        <div className="flex items-center justify-between gap-4">
          <span style={{ color: C.gold }}>🌿 Parent Calm</span>
          <span className="font-extrabold" style={{ color: scoreColor(parentCalm) }}>{parentCalm}/5</span>
        </div>
      )}
      {note && (
        <p className="mt-2 italic text-[10px] leading-snug border-t pt-1.5"
          style={{ color: C.mutedText, borderColor: C.cream }}>
          "{note}"
        </p>
      )}
    </div>
  );
};

export default function RegulationChart({ checkins }) {
  const [range, setRange] = useState(14);
  const [view, setView] = useState("line"); // "line" | "area" | "bar"

  const filtered = useMemo(() => {
    const sorted = [...checkins].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (!range) return sorted;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return sorted.filter(c => new Date(c.created_date) >= cutoff);
  }, [checkins, range]);

  const chartData = useMemo(() =>
    filtered.map(c => ({
      date: fmt(c.created_date),
      fullDate: fmtFull(c.created_date),
      "Child Reg.": c.child_regulation,
      "Parent Calm": c.parent_calm,
      note: c.note || null,
      gap: c.child_regulation && c.parent_calm
        ? Math.abs(c.child_regulation - c.parent_calm)
        : null,
    })),
    [filtered]
  );

  const avgReg = filtered.length
    ? (filtered.reduce((a, c) => a + (c.child_regulation || 0), 0) / filtered.length).toFixed(1)
    : null;
  const avgCalm = filtered.length
    ? (filtered.reduce((a, c) => a + (c.parent_calm || 0), 0) / filtered.length).toFixed(1)
    : null;

  const trendReg = trendArrow(chartData, "Child Reg.");
  const trendCalm = trendArrow(chartData, "Parent Calm");
  const patterns = detectPatterns(chartData);

  function TrendIcon({ trend, positiveColor }) {
    if (!trend) return null;
    if (trend === "up") return <TrendingUp size={13} color={positiveColor || C.midGreen} />;
    if (trend === "down") return <TrendingDown size={13} color="#B84C2A" />;
    return <Minus size={13} color={C.mutedText} />;
  }

  const sharedChartProps = {
    data: chartData,
    margin: { top: 6, right: 8, left: -20, bottom: 0 },
  };

  const commonAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={`${C.cream}`} />
      <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.mutedText }} />
      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: C.mutedText }} />
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      <ReferenceLine y={3} stroke={`${C.midGreen}50`} strokeDasharray="4 4" />
    </>
  );

  return (
    <div className="space-y-3">

      {/* Header + controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
          Regulation Trends
        </p>
        <div className="flex items-center gap-1.5">
          {/* View toggle */}
          {["line", "area", "bar"].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="text-[10px] font-bold px-2 py-1 rounded-lg capitalize"
              style={{
                background: view === v ? C.darkGreen : C.cream,
                color: view === v ? C.white : C.mutedText,
                border: "none", cursor: "pointer",
              }}
            >{v}</button>
          ))}
          {/* Range */}
          <div className="flex items-center gap-1 ml-1">
            {RANGES.map(r => (
              <button
                key={r.label}
                onClick={() => setRange(r.days)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{
                  background: range === r.days ? C.midGreen : C.cream,
                  color: range === r.days ? C.white : C.mutedText,
                  border: "none", cursor: "pointer",
                }}
              >{r.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Avg score cards */}
      {(avgReg || avgCalm) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <p className="text-2xl font-extrabold leading-none" style={{ color: scoreColor(parseFloat(avgReg)) }}>
                {avgReg}
              </p>
              <TrendIcon trend={trendReg} positiveColor={C.midGreen} />
            </div>
            <p className="text-[10px] font-bold" style={{ color: C.midGreen }}>🧒 Child Regulation</p>
            <p className="text-[9px]" style={{ color: C.mutedText }}>{scoreLabel(parseFloat(avgReg))} avg</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <p className="text-2xl font-extrabold leading-none" style={{ color: scoreColor(parseFloat(avgCalm)) }}>
                {avgCalm}
              </p>
              <TrendIcon trend={trendCalm} positiveColor={C.gold} />
            </div>
            <p className="text-[10px] font-bold" style={{ color: C.gold }}>🌿 Parent Calm</p>
            <p className="text-[9px]" style={{ color: C.mutedText }}>{scoreLabel(parseFloat(avgCalm))} avg</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 ? (
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <ResponsiveContainer width="100%" height={220}>
            {view === "bar" ? (
              <ComposedChart {...sharedChartProps}>
                {commonAxes}
                <Bar dataKey="Child Reg." fill={`${C.midGreen}bb`} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Parent Calm" fill={`${C.gold}bb`} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            ) : view === "area" ? (
              <AreaChart {...sharedChartProps}>
                {commonAxes}
                <Area type="monotone" dataKey="Child Reg." stroke={C.midGreen} fill={`${C.midGreen}20`} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="Parent Calm" stroke={C.gold} fill={`${C.gold}20`} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            ) : (
              <LineChart {...sharedChartProps}>
                {commonAxes}
                <Line type="monotone" dataKey="Child Reg." stroke={C.midGreen} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Parent Calm" stroke={C.gold} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 3" />
              </LineChart>
            )}
          </ResponsiveContainer>
          <p className="text-[9px] text-center mt-1" style={{ color: C.mutedText }}>
            Dashed line = Parent Calm · Solid = Child Regulation · Dotted line = healthy threshold (3)
          </p>
        </div>
      ) : chartData.length === 1 ? (
        <div className="rounded-xl p-4 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-xs" style={{ color: C.mutedText }}>Add one more check-in to see the trend chart.</p>
        </div>
      ) : (
        <div className="rounded-xl p-4 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
          <p className="text-xl mb-1">🌱</p>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No check-ins in this range</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Try "All" to see your full history.</p>
        </div>
      )}

      {/* Pattern insights */}
      {patterns.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>PATTERN INSIGHTS</p>
          {patterns.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="rounded-xl px-3.5 py-2.5 flex items-start gap-2.5"
                style={{ background: `${p.color}10`, border: `1px solid ${p.color}30` }}>
                <Icon size={13} color={p.color} className="mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>{p.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Session log */}
      {chartData.length > 0 && (
        <div>
          <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>SESSION LOG</p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {[...chartData].reverse().map((d, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2"
                style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <span className="text-[10px] font-bold w-16 flex-shrink-0" style={{ color: C.mutedText }}>
                  {d.fullDate || d.date}
                </span>
                <div className="flex gap-3 flex-1">
                  <span className="text-xs font-extrabold" style={{ color: scoreColor(d["Child Reg."]) }}>
                    🧒 {d["Child Reg."] ?? "—"}/5
                  </span>
                  <span className="text-xs font-extrabold" style={{ color: scoreColor(d["Parent Calm"]) }}>
                    🌿 {d["Parent Calm"] ?? "—"}/5
                  </span>
                </div>
                {d.note && (
                  <span className="text-[10px] italic truncate flex-1 max-w-[100px]" style={{ color: C.mutedText }}>
                    "{d.note}"
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}