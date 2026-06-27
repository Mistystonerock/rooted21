import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Check, Eye, FileText, Lock, ShieldCheck, Users } from "lucide-react";

const ROLES = [
  ["therapist_counselor", "Therapist / Counselor", "Clinical support with approved behavior, progress, and shared documents."],
  ["cps_caseworker", "CPS Worker / Caseworker", "Assigned-family case coordination, case plans, visits, and safety documentation."],
  ["court_legal_viewer", "Court / Legal Support Viewer", "Read-only legal review for approved court packets, reports, and timelines."],
  ["school_education_professional", "School / Education Professional", "Education-only access for attendance, IEP/504, school behavior, and academic supports."],
  ["other_support_professional", "Other Support Professional", "Limited sharing for approved helpers connected to the family."],
];

const CATEGORIES = [
  ["journal_entries", "Journal entries", "Parent reflections and family journal notes"],
  ["behavior_logs", "Behavior logs", "Behavior descriptions, triggers, responses, and outcomes"],
  ["court_documents", "Court documents", "Court orders, legal documents, and court-ready records"],
  ["school_documents", "School documents", "IEP, 504, school, and education records"],
  ["safety_plans", "Safety plans", "Family safety and crisis planning records"],
  ["case_plan_progress", "Case plan progress", "Requirements, milestones, and completion progress"],
  ["visitation_logs", "Visitation logs", "Parenting-time, contact, and visit documentation"],
  ["communication_logs", "Communication logs", "Shared communication journal summaries"],
  ["evidence_timeline", "Evidence timeline", "Uploaded evidence and timeline entries"],
  ["care_calendar", "Care calendar", "Appointments, meetings, and support events"],
];

function sampleItems(records, titleFields) {
  return records.slice(0, 3).map(record => titleFields.map(field => record[field]).find(Boolean) || record.entry_date || record.created_date?.slice(0, 10) || "Untitled record");
}

export default function ConsentDashboard() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [sharedData, setSharedData] = useState({});
  const [savingKey, setSavingKey] = useState("");
  const [savedKey, setSavedKey] = useState("");

  useEffect(() => {
    base44.auth.me().then(async me => {
      setUser(me);
      const [existing, journals, communicationJournals, behaviorLogs, documents, safetyPlans, requirements, visits, evidence, events] = await Promise.all([
        base44.entities.ConsentPermission.filter({ owner_email: me.email }, "-updated_at", 500),
        base44.entities.ParentJournal.list("-created_date", 100),
        base44.entities.CommunicationJournalEntry.list("-created_date", 100),
        base44.entities.BehaviorLog.list("-entry_date", 100),
        base44.entities.SecureDocument.list("-created_date", 100),
        base44.entities.SafetyPlan.list("-created_date", 100),
        base44.entities.CasePlanRequirement.list("-created_date", 100),
        base44.entities.VisitationLog.list("-visit_date", 100),
        base44.entities.EvidenceTimelineItem.list("-event_date", 100),
        base44.entities.CareCalendarEvent.list("-date", 100),
      ]);
      setPermissions(existing);
      setSharedData({
        journal_entries: { records: journals, examples: sampleItems(journals, ["title", "entry_title"]) },
        behavior_logs: { records: behaviorLogs, examples: sampleItems(behaviorLogs, ["behavior_description", "trigger"]) },
        court_documents: { records: documents.filter(doc => ["court_order", "legal"].includes(doc.category)), examples: sampleItems(documents.filter(doc => ["court_order", "legal"].includes(doc.category)), ["title", "file_name"]) },
        school_documents: { records: documents.filter(doc => ["iep", "school"].includes(doc.category)), examples: sampleItems(documents.filter(doc => ["iep", "school"].includes(doc.category)), ["title", "file_name"]) },
        safety_plans: { records: safetyPlans, examples: sampleItems(safetyPlans, ["child_name", "important_notes"]) },
        case_plan_progress: { records: requirements, examples: sampleItems(requirements, ["title", "child_name"]) },
        visitation_logs: { records: visits, examples: sampleItems(visits, ["visitor_name", "child_name"]) },
        communication_logs: { records: communicationJournals, examples: sampleItems(communicationJournals, ["title", "neutral_summary"]) },
        evidence_timeline: { records: evidence, examples: sampleItems(evidence, ["title", "summary"]) },
        care_calendar: { records: events, examples: sampleItems(events, ["title", "child_name"]) },
      });
    });
  }, []);

  const permissionMap = useMemo(() => {
    const map = {};
    permissions.forEach(item => { map[`${item.professional_role}:${item.data_category}`] = item; });
    return map;
  }, [permissions]);

  async function togglePermission(role, category) {
    const key = `${role}:${category}`;
    const current = permissionMap[key];
    const allowed = !current?.allowed;
    setSavingKey(key);
    const payload = { owner_email: user.email, professional_role: role, data_category: category, allowed, updated_at: new Date().toISOString(), updated_by_email: user.email };
    const saved = current ? await base44.entities.ConsentPermission.update(current.id, payload) : await base44.entities.ConsentPermission.create(payload);
    await base44.entities.RootedAuditEvent.create({
      actor_email: user.email,
      actor_role: user.role || "user",
      event_type: "consent_change",
      entity_name: "ConsentPermission",
      entity_id: saved.id,
      severity: "info",
      summary: `${allowed ? "Allowed" : "Stopped"} sharing ${category.replaceAll("_", " ")} with ${role.replaceAll("_", " ")}`,
      metadata_json: JSON.stringify({ professional_role: role, data_category: category, allowed }),
      occurred_at: new Date().toISOString(),
    });
    setPermissions(prev => [saved, ...prev.filter(item => item.id !== saved.id)]);
    setSavingKey("");
    setSavedKey(key);
    setTimeout(() => setSavedKey(""), 1600);
  }

  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Consent Dashboard" subtitle="Control what each role can see" backTo="/privacy-center" />
      <div className="mx-auto max-w-[720px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
          <ShieldCheck size={26} color={C.gold} />
          <h1 className="mt-3 font-serif text-2xl font-bold" style={{ color: C.cream }}>You choose what gets shared.</h1>
          <p className="mt-2 text-sm leading-7" style={{ color: C.lightGreen }}>Toggle each professional role on or off by data type. Private journals and protected records stay private unless you turn sharing on.</p>
        </section>

        <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-center gap-2">
            <Eye size={16} color={C.midGreen} />
            <p className="text-sm font-black" style={{ color: C.darkGreen }}>Currently available to share</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map(([key, label]) => (
              <div key={key} className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{label}</p>
                <p className="text-[11px]" style={{ color: C.mutedText }}>{sharedData[key]?.records?.length || 0} record(s)</p>
                {!!sharedData[key]?.examples?.length && <p className="mt-1 text-[10px] leading-4" style={{ color: C.mutedText }}>Examples: {sharedData[key].examples.join("; ")}</p>}
              </div>
            ))}
          </div>
        </section>

        {ROLES.map(([roleKey, roleLabel, roleDescription]) => (
          <section key={roleKey} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-start gap-3">
              <Users size={18} color={C.midGreen} className="mt-1" />
              <div>
                <h2 className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>{roleLabel}</h2>
                <p className="text-xs leading-6" style={{ color: C.mutedText }}>{roleDescription}</p>
                <p className="mt-1 text-[11px] font-bold" style={{ color: C.midGreen }}>
                  Currently shared: {CATEGORIES.filter(([categoryKey]) => permissionMap[`${roleKey}:${categoryKey}`]?.allowed).map(([, label]) => label).join(", ") || "Nothing shared"}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map(([categoryKey, label, description]) => {
                const key = `${roleKey}:${categoryKey}`;
                const allowed = permissionMap[key]?.allowed === true;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePermission(roleKey, categoryKey)}
                    disabled={!user || savingKey === key}
                    className="flex items-center justify-between gap-3 rounded-xl p-3 text-left"
                    style={{ background: allowed ? `${C.midGreen}18` : C.offWhite, border: `1.5px solid ${allowed ? C.midGreen : C.cream}`, opacity: savingKey === key ? 0.65 : 1 }}
                  >
                    <span className="flex gap-2">
                      {allowed ? <FileText size={15} color={C.midGreen} className="mt-0.5" /> : <Lock size={15} color={C.mutedText} className="mt-0.5" />}
                      <span>
                        <span className="block text-xs font-black" style={{ color: C.darkGreen }}>{label}</span>
                        <span className="block text-[10px] leading-4" style={{ color: C.mutedText }}>{description}</span>
                      </span>
                    </span>
                    <span className="rounded-full px-2 py-1 text-[10px] font-black" style={{ background: allowed ? C.midGreen : C.cream, color: allowed ? C.white : C.mutedText }}>
                      {savingKey === key ? "Saving" : savedKey === key ? <Check size={12} /> : allowed ? "Shared" : "Private"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}