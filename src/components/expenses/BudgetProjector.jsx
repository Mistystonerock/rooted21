import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function BudgetProjector({ expenses }) {
  const [monthsAhead, setMonthsAhead] = useState(6);

  // Calculate average monthly spending by category
  const monthlyBreakdown = {};
  const categoryMonthly = {};

  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + (exp.total_amount || 0);
    categoryMonthly[exp.category] = (categoryMonthly[exp.category] || 0) + (exp.total_amount || 0);
  });

  // Calculate averages
  const monthCount = Math.max(Object.keys(monthlyBreakdown).length, 1);
  const avgMonthlyTotal = Object.values(monthlyBreakdown).reduce((a, b) => a + b, 0) / monthCount;
  const categoryAverages = Object.entries(categoryMonthly).reduce((acc, [cat, total]) => {
    acc[cat] = total / monthCount;
    return acc;
  }, {});

  // Project next N months
  const projectionData = [];
  const now = new Date();
  for (let i = 0; i < monthsAhead; i++) {
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + i);
    const monthLabel = futureDate.toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
    projectionData.push({
      month: monthLabel,
      projected: Math.round(avgMonthlyTotal * 100) / 100,
    });
  }

  const courtOrderedTotal = expenses
    .filter(e => e.court_ordered)
    .reduce((sum, e) => sum + (e.total_amount || 0), 0);
  const avgCourtOrderedMonthly = courtOrderedTotal / monthCount;

  return (
    <div className="space-y-4">
      {/* Projection chart */}
      {projectionData.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} color={C.midGreen} />
            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>
              {monthsAhead}-MONTH FORECAST
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
              <Line
                type="monotone"
                dataKey="projected"
                stroke={C.midGreen}
                strokeWidth={2}
                dot={{ fill: C.darkGreen, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Projection controls */}
      <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
        <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>FORECAST PERIOD</p>
        <div className="flex gap-2 flex-wrap">
          {[3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setMonthsAhead(m)}
              className="px-4 py-2 rounded-lg font-bold text-xs transition-all"
              style={{
                background: monthsAhead === m ? C.darkGreen : C.cream,
                color: monthsAhead === m ? "#fff" : C.darkGreen,
                border: "none",
                cursor: "pointer"
              }}
            >
              {m}mo
            </button>
          ))}
        </div>
      </div>

      {/* Budget estimates */}
      <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
        <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>MONTHLY ESTIMATES</p>
        <div className="space-y-2.5">
          <div className="p-3 rounded-lg" style={{ background: C.offWhite }}>
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Average Monthly Budget</p>
            <p className="text-2xl font-bold mt-1" style={{ color: C.midGreen }}>
              ${avgMonthlyTotal.toFixed(2)}
            </p>
            <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>
              Based on last {monthCount} month{monthCount !== 1 ? "s" : ""}
            </p>
          </div>

          {avgCourtOrderedMonthly > 0 && (
            <div className="p-3 rounded-lg" style={{ background: "#FEF9EC", border: "1px solid #E8C96A" }}>
              <p className="text-xs font-bold" style={{ color: C.brown }}>⚖️ Court-ordered Obligations</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "#B87A0A" }}>
                ${avgCourtOrderedMonthly.toFixed(2)}/mo
              </p>
              <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>
                Required court-ordered support
              </p>
            </div>
          )}

          {/* Category breakdown */}
          <div>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>BY CATEGORY</p>
            <div className="space-y-1">
              {Object.entries(categoryAverages)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, avg]) => (
                  <div key={cat} className="flex items-center justify-between text-[10px]">
                    <p className="capitalize" style={{ color: C.darkGreen }}>{cat}</p>
                    <p style={{ color: C.mutedText }}>${avg.toFixed(2)}/mo</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-xl p-3 flex gap-2" style={{ background: "#EEF4FB", border: "1px solid #BDD0E8" }}>
        <span className="text-sm flex-shrink-0">ℹ️</span>
        <p className="text-[10px]" style={{ color: "#5B8DB8" }}>
          Projections are based on historical spending. Actual costs may vary. Use this to plan ahead and identify budget trends.
        </p>
      </div>
    </div>
  );
}