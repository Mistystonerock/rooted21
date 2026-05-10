import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, DollarSign, CheckCircle, Clock, AlertTriangle, Trash2, X } from "lucide-react";

const CATEGORIES = [
  { value: "medical", label: "Medical", emoji: "🏥" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "childcare", label: "Childcare", emoji: "🧒" },
  { value: "clothing", label: "Clothing", emoji: "👕" },
  { value: "activities", label: "Activities", emoji: "⚽" },
  { value: "food", label: "Food", emoji: "🍽️" },
  { value: "transportation", label: "Transportation", emoji: "🚗" },
  { value: "other", label: "Other", emoji: "📦" },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#F4A500", bg: "#FFF8E6", icon: Clock },
  paid: { label: "Paid", color: C.midGreen, bg: "#EAF4EA", icon: CheckCircle },
  disputed: { label: "Disputed", color: "#B84C2A", bg: "#FEF3EE", icon: AlertTriangle },
};

const BLANK_FORM = {
  title: "",
  category: "medical",
  total_amount: "",
  date: new Date().toISOString().slice(0, 10),
  split_type: "50_50",
  payer_percent: 50,
  other_percent: 50,
  notes: "",
};

export default function ExpenseSplit() {
  const [searchParams] = useSearchParams();
  const partnershipId = searchParams.get("partnershipId");

  const [user, setUser] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function load() {
      const u = await base44.auth.me();
      setUser(u);
      if (partnershipId) {
        const [partnerships, exps] = await Promise.all([
          base44.entities.CoParentingPartnership.filter({ id: partnershipId }),
          base44.entities.SharedExpense.filter({ partnership_id: partnershipId }, "-created_date", 100),
        ]);
        if (partnerships.length > 0) setPartnership(partnerships[0]);
        setExpenses(exps);
      }
      setLoading(false);
    }
    load();
  }, [partnershipId]);

  function handleSplitChange(payerPct) {
    const pct = Math.min(100, Math.max(0, Number(payerPct)));
    setForm(f => ({ ...f, payer_percent: pct, other_percent: 100 - pct }));
  }

  async function handleSubmit() {
    if (!form.title || !form.total_amount) return;
    setSaving(true);

    const total = parseFloat(form.total_amount);
    const otherEmail = partnership?.parent_1_email === user.email
      ? partnership.parent_2_email
      : partnership?.parent_1_email;
    const otherName = partnership?.parent_1_email === user.email
      ? partnership.parent_2_name
      : partnership?.parent_1_name;

    const amountOwed = parseFloat(((form.other_percent / 100) * total).toFixed(2));

    const created = await base44.entities.SharedExpense.create({
      partnership_id: partnershipId,
      title: form.title,
      category: form.category,
      total_amount: total,
      paid_by_email: user.email,
      paid_by_name: user.full_name,
      split_type: form.split_type,
      payer_percent: form.payer_percent,
      other_percent: form.other_percent,
      other_parent_email: otherEmail || "",
      other_parent_name: otherName || "",
      amount_owed: amountOwed,
      payment_status: "pending",
      date: form.date,
      notes: form.notes,
    });

    setExpenses(prev => [created, ...prev]);
    setForm(BLANK_FORM);
    setShowForm(false);
    setSaving(false);
  }

  async function handleStatusChange(expenseId, newStatus) {
    await base44.entities.SharedExpense.update(expenseId, { payment_status: newStatus });
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, payment_status: newStatus } : e));
  }

  async function handleDelete(expenseId) {
    await base44.entities.SharedExpense.delete(expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  }

  const filtered = filterStatus === "all" ? expenses : expenses.filter(e => e.payment_status === filterStatus);

  const totalOwedToMe = expenses
    .filter(e => e.paid_by_email === user?.email && e.payment_status === "pending")
    .reduce((s, e) => s + (e.amount_owed || 0), 0);

  const totalIOwe = expenses
    .filter(e => e.paid_by_email !== user?.email && e.payment_status === "pending")
    .reduce((s, e) => s + (e.amount_owed || 0), 0);

  const coparentName = partnership
    ? (partnership.parent_1_email === user?.email ? partnership.parent_2_name : partnership.parent_1_name)
    : "Co-parent";

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Expense Split"
        subtitle={partnership ? `${partnership.child_name} · ${coparentName}` : "Co-parenting expenses"}
        backTo="/co-parent-portal"
      />

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 text-center" style={{ background: C.darkGreen }}>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.lightGreen }}>OWED TO YOU</p>
                <p className="text-2xl font-extrabold" style={{ color: C.gold }}>${totalOwedToMe.toFixed(2)}</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>pending</p>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>YOU OWE</p>
                <p className="text-2xl font-extrabold" style={{ color: "#B84C2A" }}>${totalIOwe.toFixed(2)}</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>pending</p>
              </div>
            </div>

            {/* Add expense button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Plus size={16} /> Add Expense
              </button>
            )}

            {/* Add expense form */}
            {showForm && (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm" style={{ color: C.darkGreen }}>New Expense</p>
                  <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <X size={16} color={C.mutedText} />
                  </button>
                </div>

                <input
                  placeholder="Description (e.g. Doctor visit)"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-xs border outline-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />

                {/* Category */}
                <div>
                  <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>CATEGORY</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all"
                        style={{
                          background: form.category === cat.value ? C.darkGreen : C.offWhite,
                          color: form.category === cat.value ? "#fff" : C.darkGreen,
                          border: `1px solid ${form.category === cat.value ? C.darkGreen : C.cream}`,
                          cursor: "pointer",
                        }}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>TOTAL AMOUNT ($)</p>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.total_amount}
                      onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-xs border outline-none"
                      style={{ borderColor: C.cream, background: C.offWhite }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>DATE</p>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-xs border outline-none"
                      style={{ borderColor: C.cream, background: C.offWhite }}
                    />
                  </div>
                </div>

                {/* Split type */}
                <div>
                  <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>SPLIT TYPE</p>
                  <div className="flex gap-2">
                    {[{ v: "50_50", l: "50/50" }, { v: "custom", l: "Custom" }].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            split_type: opt.v,
                            payer_percent: 50,
                            other_percent: 50,
                          }));
                        }}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: form.split_type === opt.v ? C.darkGreen : C.offWhite,
                          color: form.split_type === opt.v ? "#fff" : C.darkGreen,
                          border: `1px solid ${form.split_type === opt.v ? C.darkGreen : C.cream}`,
                          cursor: "pointer",
                        }}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom split slider */}
                {form.split_type === "custom" && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px]" style={{ color: C.mutedText }}>You pay: <strong>{form.payer_percent}%</strong></span>
                      <span className="text-[10px]" style={{ color: C.mutedText }}>{coparentName} pays: <strong>{form.other_percent}%</strong></span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form.payer_percent}
                      onChange={e => handleSplitChange(e.target.value)}
                      className="w-full"
                    />
                    {form.total_amount && (
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] font-bold" style={{ color: C.midGreen }}>
                          You: ${((form.payer_percent / 100) * parseFloat(form.total_amount || 0)).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: "#B84C2A" }}>
                          {coparentName}: ${((form.other_percent / 100) * parseFloat(form.total_amount || 0)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 50/50 preview */}
                {form.split_type === "50_50" && form.total_amount && (
                  <div className="flex justify-between px-2 py-1.5 rounded-lg" style={{ background: C.offWhite }}>
                    <span className="text-[10px] font-bold" style={{ color: C.midGreen }}>
                      You: ${(parseFloat(form.total_amount || 0) / 2).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: "#B84C2A" }}>
                      {coparentName}: ${(parseFloat(form.total_amount || 0) / 2).toFixed(2)}
                    </span>
                  </div>
                )}

                <textarea
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg text-xs border outline-none resize-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />

                <button
                  onClick={handleSubmit}
                  disabled={saving || !form.title || !form.total_amount}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{
                    background: form.title && form.total_amount ? C.darkGreen : C.cream,
                    color: form.title && form.total_amount ? "#fff" : C.mutedText,
                    border: "none",
                    cursor: form.title && form.total_amount ? "pointer" : "default",
                  }}
                >
                  {saving ? "Saving…" : "Add Expense"}
                </button>
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-1">
              {["all", "pending", "paid", "disputed"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all"
                  style={{
                    background: filterStatus === s ? C.darkGreen : C.white,
                    color: filterStatus === s ? "#fff" : C.mutedText,
                    border: `1px solid ${filterStatus === s ? C.darkGreen : C.cream}`,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Expense list */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
                <DollarSign size={28} color={C.cream} className="mx-auto mb-2" />
                <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No expenses yet</p>
                <p className="text-xs mt-1" style={{ color: C.mutedText }}>Add your first shared expense above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(expense => {
                  const cat = CATEGORIES.find(c => c.value === expense.category) || CATEGORIES[7];
                  const statusCfg = STATUS_CONFIG[expense.payment_status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  const iMine = expense.paid_by_email === user?.email;

                  return (
                    <div key={expense.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.cream}` }}>
                      <div className="px-4 py-3 flex items-start justify-between gap-2" style={{ background: C.white }}>
                        <div className="flex gap-2.5 items-start flex-1 min-w-0">
                          <span className="text-base flex-shrink-0">{cat.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs" style={{ color: C.darkGreen }}>{expense.title}</p>
                            <p className="text-[10px]" style={{ color: C.mutedText }}>
                              {cat.label} · {expense.date} · Paid by {iMine ? "you" : expense.paid_by_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-extrabold" style={{ color: C.darkGreen }}>${expense.total_amount?.toFixed(2)}</p>
                          <p className="text-[10px]" style={{ color: iMine ? C.midGreen : "#B84C2A" }}>
                            {iMine ? `+$${expense.amount_owed?.toFixed(2)} owed to you` : `-$${expense.amount_owed?.toFixed(2)} you owe`}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 py-2 flex items-center justify-between gap-2" style={{ background: C.offWhite, borderTop: `1px solid ${C.cream}` }}>
                        {/* Status badge */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                          style={{ background: statusCfg.bg }}>
                          <StatusIcon size={10} color={statusCfg.color} />
                          <span className="text-[9px] font-bold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                        </div>

                        {/* Status actions */}
                        <div className="flex items-center gap-1.5">
                          {expense.payment_status !== "paid" && (
                            <button
                              onClick={() => handleStatusChange(expense.id, "paid")}
                              className="text-[9px] font-bold px-2 py-1 rounded-full"
                              style={{ background: "#EAF4EA", color: C.midGreen, border: "none", cursor: "pointer" }}
                            >
                              Mark Paid
                            </button>
                          )}
                          {expense.payment_status !== "disputed" && (
                            <button
                              onClick={() => handleStatusChange(expense.id, "disputed")}
                              className="text-[9px] font-bold px-2 py-1 rounded-full"
                              style={{ background: "#FEF3EE", color: "#B84C2A", border: "none", cursor: "pointer" }}
                            >
                              Dispute
                            </button>
                          )}
                          {expense.payment_status !== "pending" && (
                            <button
                              onClick={() => handleStatusChange(expense.id, "pending")}
                              className="text-[9px] font-bold px-2 py-1 rounded-full"
                              style={{ background: "#FFF8E6", color: "#F4A500", border: "none", cursor: "pointer" }}
                            >
                              Reset
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1 rounded"
                            style={{ background: "transparent", border: "none", cursor: "pointer" }}
                          >
                            <Trash2 size={12} color={C.mutedText} />
                          </button>
                        </div>
                      </div>

                      {expense.notes && (
                        <div className="px-4 py-2" style={{ background: "#FFFDF5", borderTop: `1px solid ${C.cream}` }}>
                          <p className="text-[10px]" style={{ color: C.mutedText }}>📝 {expense.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pb-8" />
          </>
        )}
      </div>
    </div>
  );
}