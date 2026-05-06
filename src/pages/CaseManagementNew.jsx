import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, Trash2 } from "lucide-react";

export default function CaseManagementNew() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    child_name: "",
    case_type: "school",
    status: "active",
    description: "",
    case_number: "",
    next_milestone: "",
    next_milestone_date: "",
    key_issues: [""],
  });

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.child_name || !form.case_type) return;
    setLoading(true);

    const key_issues = form.key_issues.filter(i => i.trim() !== "");

    await base44.entities.CaseFile.create({
      parent_email: user.email,
      child_name: form.child_name,
      case_type: form.case_type,
      status: form.status,
      description: form.description,
      case_number: form.case_number,
      next_milestone: form.next_milestone,
      next_milestone_date: form.next_milestone_date || undefined,
      key_issues,
      team_members: [],
      documents: [],
    });

    navigate("/case-management");
  };

  const updateIssue = (idx, value) => {
    const updated = [...form.key_issues];
    updated[idx] = value;
    setForm({ ...form, key_issues: updated });
  };

  const addIssue = () => setForm({ ...form, key_issues: [...form.key_issues, ""] });
  const removeIssue = (idx) => setForm({ ...form, key_issues: form.key_issues.filter((_, i) => i !== idx) });

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="New Case" backTo="/case-management" />

      <div className="max-w-[520px] mx-auto px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Child name */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>CHILD'S NAME *</p>
            <input
              type="text"
              placeholder="First name (or initials)"
              value={form.child_name}
              onChange={e => setForm({ ...form, child_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
              required
            />
          </div>

          {/* Case type & status */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>CASE TYPE *</p>
              <select
                value={form.case_type}
                onChange={e => setForm({ ...form, case_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              >
                <option value="school">School (IEP / Special Ed)</option>
                <option value="court">Court / Legal</option>
                <option value="medical">Medical</option>
                <option value="multi">Multi-System</option>
              </select>
            </div>
            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>STATUS</p>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>CASE OVERVIEW</p>
            <textarea
              placeholder="Describe the case and key concerns..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ borderColor: C.cream, background: C.offWhite, minHeight: 80 }}
            />
          </div>

          {/* Case number & milestone */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>CASE / REFERENCE NUMBER</p>
              <input
                type="text"
                placeholder="e.g. IEP-2024-001"
                value={form.case_number}
                onChange={e => setForm({ ...form, case_number: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>NEXT MILESTONE</p>
              <input
                type="text"
                placeholder="e.g. IEP Review Meeting"
                value={form.next_milestone}
                onChange={e => setForm({ ...form, next_milestone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none mb-2"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
              <input
                type="date"
                value={form.next_milestone_date}
                onChange={e => setForm({ ...form, next_milestone_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
          </div>

          {/* Key issues */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>KEY ISSUES / CONCERNS</p>
            <div className="space-y-2">
              {form.key_issues.map((issue, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Issue ${idx + 1}`}
                    value={issue}
                    onChange={e => updateIssue(idx, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ borderColor: C.cream, background: C.offWhite }}
                  />
                  {form.key_issues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIssue(idx)}
                      className="p-2 rounded-lg"
                      style={{ background: C.cream, border: "none", cursor: "pointer" }}
                    >
                      <Trash2 size={14} color={C.mutedText} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIssue}
                className="flex items-center gap-1 text-xs font-bold"
                style={{ background: "none", border: "none", cursor: "pointer", color: C.midGreen }}
              >
                <Plus size={12} /> Add another issue
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.child_name}
            className="w-full py-4 rounded-2xl font-bold text-base transition-opacity"
            style={{
              background: C.darkGreen,
              color: "#fff",
              border: "none",
              cursor: loading || !form.child_name ? "default" : "pointer",
              opacity: loading || !form.child_name ? 0.6 : 1,
            }}
          >
            {loading ? "Creating Case…" : "Create Case"}
          </button>

          <div className="pb-8" />
        </form>
      </div>
    </div>
  );
}