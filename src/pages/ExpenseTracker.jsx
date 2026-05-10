import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Upload, TrendingUp, DollarSign, AlertCircle, Plus, X, Loader2 } from "lucide-react";
import ExpenseAnalytics from "@/components/expenses/ExpenseAnalytics";
import BudgetProjector from "@/components/expenses/BudgetProjector";
import ReceiptUploader from "@/components/expenses/ReceiptUploader";

export default function ExpenseTracker() {
  const [user, setUser] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.CoParentingPartnership.list("-created_date", 1),
    ]).then(async ([u, partnerships]) => {
      setUser(u);
      if (partnerships.length > 0) {
        const p = partnerships[0];
        setPartnership(p);
        const exps = await base44.entities.SharedExpense.filter(
          { partnership_id: p.id },
          "-date",
          500
        );
        setExpenses(exps);
      }
      setLoading(false);
    });
  }, []);

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    setShowUploader(false);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm("Delete this expense?")) return;
    await base44.entities.SharedExpense.delete(expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="💰 Expense Tracker" backTo="/dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="💰 Expense Tracker" backTo="/dashboard" />
        <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No co-parenting partnership found</p>
          <p className="text-xs mt-2" style={{ color: C.mutedText }}>Set up a partnership to track shared expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="💰 Expense Tracker"
        subtitle={partnership.child_name}
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>Total Spent</p>
            <p className="text-xl font-bold" style={{ color: C.darkGreen }}>
              ${expenses.reduce((sum, e) => sum + (e.total_amount || 0), 0).toFixed(2)}
            </p>
            <p className="text-[9px] mt-1" style={{ color: C.midGreen }}>
              {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>Pending</p>
            <p className="text-xl font-bold" style={{ color: "#C0392B" }}>
              ${expenses.filter(e => e.payment_status === "pending").reduce((sum, e) => sum + (e.amount_owed || 0), 0).toFixed(2)}
            </p>
            <p className="text-[9px] mt-1" style={{ color: C.midGreen }}>
              Awaiting payment
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: C.cream }}>
          {["overview", "analytics", "budget"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-xs font-bold capitalize border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab ? C.darkGreen : "transparent",
                color: activeTab === tab ? C.darkGreen : C.mutedText,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              <Upload size={16} /> Upload Receipt
            </button>

            {showUploader && (
              <ReceiptUploader
                partnershipId={partnership.id}
                onExpenseAdded={handleExpenseAdded}
                onCancel={() => setShowUploader(false)}
              />
            )}

            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>RECENT EXPENSES</p>

            {expenses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm" style={{ color: C.mutedText }}>No expenses tracked yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map(exp => (
                  <div key={exp.id} className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1">
                        <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{exp.title}</p>
                        <p className="text-[10px]" style={{ color: C.mutedText }}>
                          {new Date(exp.date).toLocaleDateString()} • {exp.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 rounded hover:opacity-70"
                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <X size={14} color={C.mutedText} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
                          ${exp.total_amount?.toFixed(2)}
                        </p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: exp.payment_status === "paid" ? "#EAF4EA" : "#FEF3EE",
                            color: exp.payment_status === "paid" ? C.midGreen : "#B84C2A"
                          }}>
                          {exp.payment_status}
                        </span>
                      </div>
                      {exp.court_ordered && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: C.cream, color: C.brown }}>
                          ⚖️ Court-ordered
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <ExpenseAnalytics expenses={expenses} />
        )}

        {activeTab === "budget" && (
          <BudgetProjector expenses={expenses} />
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}