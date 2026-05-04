import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function formatShort(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function TrendsScreen({ open, onClose }) {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      base44.entities.CheckIn.list("created_date", 60).then((data) => {
        setCheckins(data);
        setLoading(false);
      });
    }
  }, [open]);

  const chartData = checkins.map((c) => ({
    date: formatShort(c.created_date),
    "Child Regulation": c.child_regulation,
    "Parent Calm": c.parent_calm,
  }));

  const avg = (key) => {
    if (!checkins.length) return "–";
    const sum = checkins.reduce((acc, c) => acc + (c[key] || 0), 0);
    return (sum / checkins.length).toFixed(1);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
        />
      )}
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: "min(400px, 95vw)",
          background: C.offWhite,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: open ? "4px 0 32px rgba(47,75,58,.18)" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: C.darkGreen }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={18} color={C.lightGreen} />
            <span className="font-serif font-bold text-base" style={{ color: C.cream }}>
              Growth Trends
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-opacity hover:opacity-70"
            style={{ background: "#ffffff18", border: "none" }}
          >
            <X size={18} color={C.cream} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <p className="text-center py-10 text-sm" style={{ color: C.mutedText }}>
              Loading…
            </p>
          )}

          {!loading && checkins.length === 0 && (
            <div className="text-center py-16 px-4">
              <p className="text-3xl mb-3">🌱</p>
              <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>
                No check-ins yet
              </p>
              <p className="text-xs" style={{ color: C.mutedText }}>
                Complete an after-session check-in to start tracking your growth.
              </p>
            </div>
          )}

          {!loading && checkins.length > 0 && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Avg Child Regulation", value: avg("child_regulation"), emoji: "🧒" },
                  { label: "Avg Parent Calm", value: avg("parent_calm"), emoji: "🌿" },
                  { label: "Total Sessions", value: checkins.length, emoji: "📋" },
                  {
                    label: "Latest Child",
                    value: checkins[checkins.length - 1]?.child_regulation ?? "–",
                    emoji: "✨",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-3.5"
                    style={{ background: C.white, border: `1px solid ${C.cream}` }}
                  >
                    <p className="text-lg mb-1">{s.emoji}</p>
                    <p
                      className="text-2xl font-extrabold leading-none"
                      style={{ color: C.darkGreen }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[10px] mt-1 leading-snug" style={{ color: C.mutedText }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div
                className="rounded-2xl p-4"
                style={{ background: C.white, border: `1px solid ${C.cream}` }}
              >
                <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>
                  Regulation over time
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.mutedText }} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: C.mutedText }} ticks={[1,2,3,4,5]} />
                    <Tooltip
                      contentStyle={{
                        background: C.white,
                        border: `1px solid ${C.cream}`,
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="Child Regulation"
                      stroke={C.midGreen}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: C.midGreen }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Parent Calm"
                      stroke={C.gold}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: C.gold }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent reflections */}
              {checkins.filter((c) => c.note).length > 0 && (
                <div className="mt-4">
                  <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>
                    Recent reflections
                  </p>
                  {checkins
                    .filter((c) => c.note)
                    .slice(-5)
                    .reverse()
                    .map((c) => (
                      <div
                        key={c.id}
                        className="rounded-xl px-3.5 py-2.5 mb-2"
                        style={{
                          background: C.cream,
                          borderLeft: `3px solid ${C.brown}`,
                        }}
                      >
                        <p className="text-xs italic leading-relaxed" style={{ color: C.darkGreen }}>
                          "{c.note}"
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>
                          {formatShort(c.created_date)}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}