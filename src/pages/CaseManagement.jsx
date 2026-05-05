import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Plus, Calendar, Users, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";

function CaseCard({ caseFile, onSelect }) {
  const statusColors = {
    active: { bg: "#EAF4EA", text: C.midGreen, label: "Active" },
    pending: { bg: C.cream, text: C.brown, label: "Pending" },
    resolved: { bg: "#E8F5E9", text: C.midGreen, label: "Resolved" },
    closed: { bg: "#F5F5F5", text: C.mutedText, label: "Closed" },
  };
  const status = statusColors[caseFile.status] || statusColors.active;
  const daysUntil = caseFile.next_milestone_date
    ? Math.ceil((new Date(caseFile.next_milestone_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      onClick={() => onSelect(caseFile.id)}
      className="rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
      style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
            {caseFile.child_name}
          </p>
          <p className="text-[10px] mt-0.5 capitalize" style={{ color: C.mutedText }}>
            {caseFile.case_type} case
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: status.bg, color: status.text }}>
          {status.label}
        </span>
      </div>

      {caseFile.description && (
        <p className="text-xs leading-relaxed mb-3" style={{ color: "#3a3028" }}>
          {caseFile.description.substring(0, 80)}...
        </p>
      )}

      <div className="space-y-2">
        {caseFile.next_milestone && (
          <div className="flex items-center gap-2 text-[10px]">
            <Calendar size={12} color={C.gold} />
            <span style={{ color: C.mutedText }}>{caseFile.next_milestone}</span>
          </div>
        )}
        {daysUntil !== null && (
          <div className="flex items-center gap-2 text-[10px]">
            <Clock size={12} color={daysUntil <= 7 ? "#B84C2A" : C.midGreen} />
            <span style={{ color: daysUntil <= 7 ? "#B84C2A" : C.mutedText }}>
              {daysUntil} day{daysUntil !== 1 ? "s" : ""} away
            </span>
          </div>
        )}
        {caseFile.team_members && caseFile.team_members.length > 0 && (
          <div className="flex items-center gap-2 text-[10px]">
            <Users size={12} color={C.midGreen} />
            <span style={{ color: C.mutedText }}>{caseFile.team_members.length} team member{caseFile.team_members.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CaseManagement() {
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
    ]).then(([u]) => {
      setUser(u);
      if (u) {
        base44.entities.CaseFile.filter({ parent_email: u.email }, "-created_date").then(caseFiles => {
          setCases(caseFiles);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const activeCount = cases.filter(c => c.status === "active").length;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Case Management"
        subtitle="Track school, court & medical cases"
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">⚖️</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Case Management Hub
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Organize your family's school, court, and medical cases. Collaborate with your team.
          </p>
        </div>

        {/* Summary */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl p-3 text-center" style={{ background: C.midGreen }}>
            <p className="text-2xl font-extrabold" style={{ color: "#fff" }}>{cases.length}</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.8)" }}>Total Cases</p>
          </div>
          <div className="flex-1 rounded-xl p-3 text-center" style={{ background: C.gold }}>
            <p className="text-2xl font-extrabold" style={{ color: "#fff" }}>{activeCount}</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.8)" }}>Active</p>
          </div>
        </div>

        {/* New case button */}
        <Link
          to="/case-management-new"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
          style={{ background: C.darkGreen, color: "#fff", textDecoration: "none", border: "none", cursor: "pointer" }}
        >
          <Plus size={15} /> Create New Case
        </Link>

        {/* Cases list */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent` }} />
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: C.cream, border: `1.5px dashed ${C.midGreen}` }}>
            <p className="text-3xl mb-2">📋</p>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No cases yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Create a case to start organizing your family's legal matters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map(caseFile => (
              <Link
                key={caseFile.id}
                to={`/case-detail/${caseFile.id}`}
                className="block"
                style={{ textDecoration: "none" }}
              >
                <CaseCard caseFile={caseFile} onSelect={() => {}} />
              </Link>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Quick Resources</p>
          <Link
            to="/legal-knowledge-base"
            className="flex items-center gap-3 py-2 px-3 rounded-xl transition-colors"
            style={{ background: C.offWhite, textDecoration: "none", color: "inherit" }}
          >
            <FileText size={16} color={C.midGreen} />
            <span className="text-xs font-bold" style={{ color: C.darkGreen }}>Legal Rights Guide</span>
          </Link>
          <Link
            to="/system-guides"
            className="flex items-center gap-3 py-2 px-3 rounded-xl transition-colors"
            style={{ background: C.offWhite, textDecoration: "none", color: "inherit" }}
          >
            <AlertCircle size={16} color={C.brown} />
            <span className="text-xs font-bold" style={{ color: C.darkGreen }}>System Navigation Guides</span>
          </Link>
          <Link
            to="/meeting-prep-chatbot"
            className="flex items-center gap-3 py-2 px-3 rounded-xl transition-colors"
            style={{ background: C.offWhite, textDecoration: "none", color: "inherit" }}
          >
            <span style={{ fontSize: "16px" }}>💬</span>
            <span className="text-xs font-bold" style={{ color: C.darkGreen }}>Meeting Prep Assistant</span>
          </Link>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}