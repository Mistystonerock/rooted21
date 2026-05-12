import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus, FileText } from "lucide-react";

const TIMES_ORDER = ["Morning", "Noon", "After School", "Evening", "Bedtime", "As Needed"];
const MOOD_EMOJIS = { 1: "😟", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

function TrendBadge({ before, after }) {
  if (!before || !after) return null;
  const diff = after - before;
  if (diff > 0) return <span className="text-xs font-bold flex items-center gap-1" style={{ color: C.midGreen }}><TrendingUp size={12} /> +{diff.toFixed(1)} improved</span>;
  if (diff < 0) return <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#B84C2A" }}><TrendingDown size={12} /> {diff.toFixed(1)} declined</span>;
  return <span className="text-xs font-bold flex items-center gap-1" style={{ color: C.mutedText }}><Minus size={12} /> No change</span>;
}

export default function MedBehaviorDashboard({ user, meds }) {
  const [doses, setDoses] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [selectedMed, setSelectedMed] = useState("all");
  const [selectedChild, setSelectedChild] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.MedicationDose.filter({ parent_email: user.email }, "-given_at", 200),
      base44.entities.BehaviorLog.filter({ parent_email: user.email }, "-created_date", 200),
    ]).then(([d, b]) => {
      setDoses(d);
      setBehaviorLogs(b);
      setLoading(false);
    });
  }, [user]);

  const children = [...new Set(doses.map(d => d.child_name))];
  const filteredDoses = doses
    .filter(d => d.given)
    .filter(d => selectedMed === "all" || d.medication_id === selectedMed)
    .filter(d => selectedChild === "all" || d.child_name === selectedChild);

  // --- Time-of-day correlation chart ---
  const byTime = TIMES_ORDER.map(time => {
    const timeDoses = filteredDoses.filter(d => d.time_of_day === time && d.behavior_before != null && d.behavior_after != null);
    const avgBefore = timeDoses.length ? timeDoses.reduce((s, d) => s + d.behavior_before, 0) / timeDoses.length : null;
    const avgAfter = timeDoses.length ? timeDoses.reduce((s, d) => s + d.behavior_after, 0) / timeDoses.length : null;
    return { time: time.replace("After School", "Aft.Sch"), count: timeDoses.length, avgBefore: avgBefore ? +avgBefore.toFixed(1) : null, avgAfter: avgAfter ? +avgAfter.toFixed(1) : null };
  }).filter(d => d.count > 0);

  // --- 14-day trend ---
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });

  const trendData = last14.map(date => {
    const dayDoses = filteredDoses.filter(d => d.given_at?.slice(0, 10) === date && d.behavior_after != null);
    const dayBehavior = behaviorLogs.filter(b => b.created_date?.slice(0, 10) === date && (selectedChild === "all" || b.child_name === selectedChild));
    const avgMedBehavior = dayDoses.length ? +(dayDoses.reduce((s, d) => s + d.behavior_after, 0) / dayDoses.length).toFixed(1) : null;
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      afterMed: avgMedBehavior,
      dosesGiven: dayDoses.length,
    };
  });

  // --- Summary stats ---
  const ratedDoses = filteredDoses.filter(d => d.behavior_before != null && d.behavior_after != null);
  const improvedDoses = ratedDoses.filter(d => d.behavior_after > d.behavior_before);
  const declinedDoses = ratedDoses.filter(d => d.behavior_after < d.behavior_before);
  const overallAvgChange = ratedDoses.length
    ? +(ratedDoses.reduce((s, d) => s + (d.behavior_after - d.behavior_before), 0) / ratedDoses.length).toFixed(1)
    : null;

  const missedDoses = doses.filter(d => !d.given && (selectedChild === "all" || d.child_name === selectedChild));

  if (loading) {
    return <div className="py-12 text-center text-sm" style={{ color: C.mutedText }}>Loading data…</div>;
  }

  if (filteredDoses.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="text-3xl mb-3">💊</p>
        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No dose data yet</p>
        <p className="text-xs mt-1" style={{ color: C.mutedText }}>Log doses with before/after behavior ratings to see correlations here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={selectedChild}
          onChange={e => setSelectedChild(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg text-xs border outline-none font-bold"
          style={{ borderColor: C.cream, background: C.white, color: C.darkGreen }}
        >
          <option value="all">All Children</option>
          {children.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={selectedMed}
          onChange={e => setSelectedMed(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg text-xs border outline-none font-bold"
          style={{ borderColor: C.cream, background: C.white, color: C.darkGreen }}
        >
          <option value="all">All Medications</option>
          {meds.filter(m => m.is_active).map(m => <option key={m.id} value={m.id}>{m.medication_name}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-2xl font-black" style={{ color: C.darkGreen }}>{filteredDoses.length}</p>
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>DOSES LOGGED</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: overallAvgChange > 0 ? "#EAF4EA" : overallAvgChange < 0 ? "#FEF3EE" : C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-2xl font-black" style={{ color: overallAvgChange > 0 ? C.midGreen : overallAvgChange < 0 ? "#B84C2A" : C.mutedText }}>
            {overallAvgChange !== null ? (overallAvgChange > 0 ? `+${overallAvgChange}` : overallAvgChange) : "—"}
          </p>
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>AVG BEHAVIOR CHANGE</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: missedDoses.length > 0 ? "#FEF3EE" : C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-2xl font-black" style={{ color: missedDoses.length > 0 ? "#B84C2A" : C.darkGreen }}>{missedDoses.length}</p>
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>MISSED DOSES</p>
        </div>
      </div>

      {/* Time-of-day correlation */}
      {byTime.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>Behavior by Time of Day</p>
          <p className="text-[10px] mb-3" style={{ color: C.mutedText }}>Average behavior rating before (🟤) and after (🟢) each dose window</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byTime} barCategoryGap="30%">
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#888" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 9, fill: "#888" }} width={16} />
              <Tooltip
                formatter={(val, name) => [val ? `${val}/5` : "N/A", name === "avgBefore" ? "Before" : "After"]}
                labelFormatter={l => `${l}`}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Bar dataKey="avgBefore" name="Before" fill={C.brown} radius={[4, 4, 0, 0]} opacity={0.7} />
              <Bar dataKey="avgAfter" name="After" fill={C.midGreen} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {byTime.map(t => (
            <div key={t.time} className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: C.cream }}>
              <span className="text-xs font-bold" style={{ color: C.darkGreen }}>{t.time}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: C.mutedText }}>{t.count} dose{t.count !== 1 ? "s" : ""}</span>
                <TrendBadge before={t.avgBefore} after={t.avgAfter} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 14-day behavior trend */}
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>14-Day Behavior Trend</p>
        <p className="text-[10px] mb-3" style={{ color: C.mutedText }}>Behavior rating after medication over time</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
            <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#888" }} interval={2} />
            <YAxis domain={[1, 5]} tick={{ fontSize: 9, fill: "#888" }} width={16} />
            <Tooltip
              formatter={(val) => val ? [`${val}/5`, "Behavior After"] : ["No data", ""]}
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="afterMed" stroke={C.midGreen} strokeWidth={2.5} dot={{ r: 3, fill: C.midGreen }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Improvement breakdown */}
      {ratedDoses.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Dose Outcomes</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-3 rounded-full" style={{ width: `${ratedDoses.length ? (improvedDoses.length / ratedDoses.length) * 100 : 0}%`, background: C.midGreen, minWidth: 4, transition: "width 0.4s" }} />
              <span className="text-xs font-bold" style={{ color: C.midGreen }}>↑ Improved ({improvedDoses.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 rounded-full" style={{ width: `${ratedDoses.length ? (declinedDoses.length / ratedDoses.length) * 100 : 0}%`, background: "#B84C2A", minWidth: 4, transition: "width 0.4s" }} />
              <span className="text-xs font-bold" style={{ color: "#B84C2A" }}>↓ Declined ({declinedDoses.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 rounded-full" style={{ width: `${ratedDoses.length ? ((ratedDoses.length - improvedDoses.length - declinedDoses.length) / ratedDoses.length) * 100 : 0}%`, background: C.cream, minWidth: 4 }} />
              <span className="text-xs font-bold" style={{ color: C.mutedText }}>= No Change ({ratedDoses.length - improvedDoses.length - declinedDoses.length})</span>
            </div>
          </div>
        </div>
      )}

      {/* Doctor-ready summary */}
      <div className="rounded-2xl p-4" style={{ background: C.darkGreen, border: `1px solid ${C.midGreen}` }}>
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} color={C.gold} />
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Share with Your Doctor</p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
          Based on {filteredDoses.length} logged dose{filteredDoses.length !== 1 ? "s" : ""}
          {overallAvgChange !== null && `, behavior scores ${overallAvgChange > 0 ? "improved by an average of +' + overallAvgChange + ' points after medication" : overallAvgChange < 0 ? "declined by " + Math.abs(overallAvgChange) + " points on average after medication" : "showed no consistent change after medication"}`}.
          {byTime.length > 0 && ` Best behavioral response seen at: ${byTime.sort((a, b) => ((b.avgAfter || 0) - (b.avgBefore || 0)) - ((a.avgAfter || 0) - (a.avgBefore || 0)))[0]?.time} doses.`}
          {missedDoses.length > 0 && ` ${missedDoses.length} missed dose(s) recorded.`}
        </p>
        <p className="text-[10px] mt-2 italic" style={{ color: C.mutedText }}>Use the Monthly Report or Growth Insights to generate a full printable summary for your child's medical team.</p>
      </div>

      <div className="pb-4" />
    </div>
  );
}