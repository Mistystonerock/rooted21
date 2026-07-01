import { BarChart, Bar, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { C } from "@/lib/rooted-constants";

const KEYWORDS = [
  { label: "Transitions", words: ["transition", "switch", "change", "leaving", "stop", "move"] },
  { label: "Hunger / tired", words: ["hungry", "hunger", "tired", "sleep", "nap", "bed", "exhaust"] },
  { label: "Sensory", words: ["noise", "loud", "sensory", "crowd", "bright", "scratch", "texture"] },
  { label: "Screen time", words: ["screen", "tablet", "phone", "game", "tv", "youtube"] },
  { label: "School", words: ["school", "homework", "teacher", "class", "bus"] },
  { label: "Visit / family", words: ["visit", "parent", "mom", "dad", "family", "sibling"] },
  { label: "Limit set", words: ["no", "limit", "boundary", "denied", "couldn't", "cannot"] },
];

const OUTCOME_KEYWORDS = [
  { label: "Calmed with support", words: ["calm", "regulated", "breath", "hug", "talk", "soothe"] },
  { label: "Needed space", words: ["space", "quiet", "alone", "room", "break"] },
  { label: "Escalated", words: ["worse", "escalat", "unsafe", "hit", "kick", "scream"] },
  { label: "Repaired", words: ["apolog", "repair", "reconnect", "helped", "resolved"] },
  { label: "Still unsettled", words: ["unresolved", "still", "continued", "ongoing"] },
];

function categorize(text, groups, fallback) {
  const value = (text || "").toLowerCase();
  if (!value.trim()) return fallback;
  const match = groups.find(group => group.words.some(word => value.includes(word)));
  if (match) return match.label;
  const cleaned = text.trim().replace(/\s+/g, " ");
  return cleaned.length > 24 ? `${cleaned.slice(0, 24)}…` : cleaned;
}

function countBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function topKeys(counts, limit) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key]) => key);
}

function weekStart(dateString) {
  const date = new Date(`${dateString || new Date().toISOString().split("T")[0]}T00:00:00`);
  date.setDate(date.getDate() - date.getDay());
  return date.toISOString().split("T")[0];
}

function buildWeeklyData(logs, triggers, outcomes) {
  const weeks = [...new Set(logs.map(log => weekStart(log.entry_date)))].sort();
  return weeks.slice(-8).map(week => {
    const weekLogs = logs.filter(log => weekStart(log.entry_date) === week);
    const row = { week: new Date(`${week}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) };
    triggers.forEach(trigger => {
      row[trigger] = weekLogs.filter(log => categorize(log.trigger, KEYWORDS, "Other trigger") === trigger).length;
    });
    outcomes.forEach(outcome => {
      row[outcome] = weekLogs.filter(log => categorize(log.outcome, OUTCOME_KEYWORDS, "Other outcome") === outcome).length;
    });
    return row;
  });
}

export default function BehaviorPatternChart({ logs = [] }) {
  const datedLogs = logs.filter(log => log.entry_date);
  if (datedLogs.length < 2) {
    return (
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
        <p className="font-serif text-sm font-bold" style={{ color: C.darkGreen }}>Trigger & outcome patterns</p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Add at least two behavior entries to see patterns over time.</p>
      </div>
    );
  }

  const triggerCounts = countBy(datedLogs, log => categorize(log.trigger, KEYWORDS, "Other trigger"));
  const outcomeCounts = countBy(datedLogs, log => categorize(log.outcome, OUTCOME_KEYWORDS, "Other outcome"));
  const topTriggers = topKeys(triggerCounts, 3);
  const topOutcomes = topKeys(outcomeCounts, 3);
  const weeklyData = buildWeeklyData(datedLogs, topTriggers.slice(0, 2), topOutcomes.slice(0, 2));
  const barData = [
    ...topTriggers.map(name => ({ name, count: triggerCounts[name], type: "Trigger" })),
    ...topOutcomes.map(name => ({ name, count: outcomeCounts[name], type: "Outcome" })),
  ];
  const colors = [C.midGreen, "#7A5195", C.gold, "#2F6F95"];

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div>
        <p className="font-serif text-sm font-bold" style={{ color: C.darkGreen }}>Trigger & outcome patterns</p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Common triggers and how situations resolved, grouped over time.</p>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={C.cream} strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: C.mutedText }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: C.mutedText }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {[...topTriggers.slice(0, 2), ...topOutcomes.slice(0, 2)].map((key, index) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[index]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={C.cream} strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.mutedText }} interval={0} angle={-20} textAnchor="end" height={54} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: C.mutedText }} />
            <Tooltip />
            <Bar dataKey="count" fill={C.midGreen} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}