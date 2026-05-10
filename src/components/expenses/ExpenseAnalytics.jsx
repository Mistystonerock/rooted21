import { C } from "@/lib/rooted-constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function ExpenseAnalytics({ expenses }) {
  // Category breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    const existing = acc.find(x => x.name === exp.category);
    if (existing) {
      existing.value += exp.total_amount || 0;
    } else {
      acc.push({ name: exp.category, value: exp.total_amount || 0 });
    }
    return acc;
  }, []);

  // Monthly breakdown (last 6 months)
  const monthlyTotals = {};
  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (exp.total_amount || 0);
  });

  const monthlyData = Object.entries(monthlyTotals)
    .sort()
    .slice(-6)
    .map(([month, total]) => ({ month, total }));

  const COLORS = [C.darkGreen, C.midGreen, C.gold, C.brown, "#5B8DB8", "#7B5EA7"];
  const totalSpent = expenses.reduce((sum, e) => sum + (e.total_amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Monthly trend */}
      {monthlyData.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>6-MONTH TREND</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
              <Bar dataKey="total" fill={C.midGreen} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category pie chart */}
      {categoryTotals.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>BY CATEGORY</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryTotals}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryTotals.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="space-y-1 mt-4">
            {categoryTotals.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    style={{ background: COLORS[i % COLORS.length], width: 10, height: 10, borderRadius: 2 }}
                  />
                  <p className="capitalize" style={{ color: C.darkGreen }}>
                    {cat.name}
                  </p>
                </div>
                <p style={{ color: C.mutedText }}>
                  ${cat.value.toFixed(2)} ({((cat.value / totalSpent) * 100).toFixed(0)}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment status summary */}
      <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
        <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>PAYMENT STATUS</p>
        <div className="space-y-2">
          {["pending", "paid"].map(status => {
            const statusExp = expenses.filter(e => e.payment_status === status);
            const statusTotal = statusExp.reduce((sum, e) => sum + (e.total_amount || 0), 0);
            return (
              <div key={status} className="p-3 rounded-lg" style={{ background: C.offWhite }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold capitalize" style={{ color: C.darkGreen }}>{status}</p>
                  <p className="text-sm font-bold" style={{ color: C.darkGreen }}>
                    ${statusTotal.toFixed(2)}
                  </p>
                </div>
                <p className="text-[10px]" style={{ color: C.mutedText }}>
                  {statusExp.length} transaction{statusExp.length !== 1 ? "s" : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}