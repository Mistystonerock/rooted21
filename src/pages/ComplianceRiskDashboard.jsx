import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import ComplianceRiskScore from "@/components/compliance/ComplianceRiskScore";
import ComplianceRiskCard from "@/components/compliance/ComplianceRiskCard";
import CorrectiveActionList from "@/components/compliance/CorrectiveActionList";
import ComplianceSourceStats from "@/components/compliance/ComplianceSourceStats";
import CommunicationRephraseTips from "@/components/compliance/CommunicationRephraseTips";
import { AlertTriangle, Brain, ChevronRight, Loader2, RefreshCw } from "lucide-react";

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}

function flattenChecklistItems(plans) {
  return plans.flatMap(plan => (plan.items || []).map(item => ({
    checklist: plan.title,
    child_name: plan.child_name,
    text: item.text,
    category: item.category,
    due_date: item.due_date,
    days_until_due: daysUntil(item.due_date),
    completed: !!item.completed,
    completed_date: item.completed_date,
    proof_filename: item.proof_filename,
    notes: item.notes,
  })));
}

export default function ComplianceRiskDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [casePlans, setCasePlans] = useState([]);
  const [agencyEmails, setAgencyEmails] = useState([]);
  const [coParentMessages, setCoParentMessages] = useState([]);
  const [secureMessages, setSecureMessages] = useState([]);
  const [caseNotes, setCaseNotes] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    const [plans, agency, coParent, secure, notes, behaviors] = await Promise.all([
      base44.entities.CasePlanChecklist.filter({ parent_email: me.email }, "-created_date", 50),
      base44.entities.AgencyEmailCorrespondence.filter({ owner_email: me.email }, "-correspondence_date", 200),
      base44.entities.CoParentingMessage.list("-created_date", 200),
      base44.entities.SecureMessage.list("-created_date", 200),
      base44.entities.CaseNote.list("-created_date", 200),
      base44.entities.BehaviorLog.list("-created_date", 200),
    ]);
    setCasePlans(plans);
    setAgencyEmails(agency);
    setCoParentMessages(coParent.filter(m => m.sender_email === me.email || m.recipient_email === me.email));
    setSecureMessages(secure.filter(m => m.sender_email === me.email || m.recipient_email === me.email || m.family_email === me.email));
    setCaseNotes(notes.filter(n => ["meeting_notes", "update", "case_review"].includes(n.note_type)));
    setBehaviorLogs(behaviors);
    setLoading(false);
  }

  const checklistItems = useMemo(() => flattenChecklistItems(casePlans), [casePlans]);
  const openItems = checklistItems.filter(item => !item.completed);
  const timeSensitiveItems = openItems.filter(item => item.days_until_due !== null && item.days_until_due <= 14);
  const communicationAudit = useMemo(() => [
    ...agencyEmails.map(e => ({ type: "agency_email", date: e.correspondence_date, subject: e.subject, body: e.body, agency: e.agency_name, direction: e.direction })),
    ...coParentMessages.map(m => ({ type: "coparent_message", date: m.created_date, body: m.body, sender: m.sender_email, recipient: m.recipient_email })),
    ...secureMessages.map(m => ({ type: "secure_message", date: m.created_date, body: m.body, sender: m.sender_email, recipient: m.recipient_email })),
    ...caseNotes.map(n => ({ type: "meeting_note", date: n.created_date, title: n.title, body: n.body, author: n.author_name })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)), [agencyEmails, coParentMessages, secureMessages, caseNotes]);

  const recentBehaviorLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return behaviorLogs
      .filter(log => new Date(log.entry_date || log.created_date) >= cutoff)
      .map(log => ({
        date: log.entry_date || log.created_date,
        child_name: log.child_name,
        behavior: log.behavior_description,
        trigger: log.trigger,
        response: log.parent_response,
        outcome: log.outcome,
        mood: log.child_mood,
      }));
  }, [behaviorLogs]);

  const stats = {
    openItems: openItems.length,
    timeSensitiveItems: timeSensitiveItems.length,
    auditLogs: communicationAudit.length,
    behaviorLogs: recentBehaviorLogs.length,
    agencyEmails: agencyEmails.length,
  };

  async function runScan() {
    setScanning(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI compliance risk analyst for a parenting/court case management app. Analyze current case plan checklist items, recent communication threads, and behavior logs to predict high-risk patterns before they escalate.

Today's date: ${new Date().toISOString().slice(0, 10)}
User: ${user?.full_name || user?.email}

Case plan checklist items:
${JSON.stringify(checklistItems.slice(0, 120), null, 2)}

Recent communication threads and audit logs:
${JSON.stringify(communicationAudit.slice(0, 120), null, 2)}

Recent behavior logs from the last 30 days:
${JSON.stringify(recentBehaviorLogs.slice(0, 120), null, 2)}

Return practical, specific, non-legal-advice risk analytics. Focus on missed deadlines, lack of proof, incomplete services, unanswered agency requests, conflict patterns, emotionally charged language, behavior escalation patterns, missing documentation, upcoming hearing readiness, and corrective action steps. For communication issues, include re-phrasing tips that make messages calmer, factual, child-focused, and aligned with court expectations. Do not invent facts not supported by the data.`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_score: { type: "number" },
          summary: { type: "string" },
          risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high"] },
                timeline: { type: "string" },
                reason: { type: "string" },
                evidence: { type: "array", items: { type: "string" } }
              }
            }
          },
          behavior_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                risk_level: { type: "string", enum: ["low", "medium", "high"] },
                suggested_response: { type: "string" }
              }
            }
          },
          communication_rephrasing_tips: {
            type: "array",
            items: {
              type: "object",
              properties: {
                original_pattern: { type: "string" },
                why_it_matters: { type: "string" },
                court_aligned_rephrase: { type: "string" },
                tip: { type: "string" }
              }
            }
          },
          corrective_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                deadline: { type: "string" }
              }
            }
          }
        }
      }
    });
    setAnalysis(response);
    setScanning(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Compliance Risk Dashboard" subtitle="AI court-readiness risk scan" backTo="/dashboard" />
      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">
        <section className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase" style={{ color: C.cream }}>Predictive court readiness</p>
          <h1 className="font-serif font-bold text-2xl mt-2" style={{ color: "#fff" }}>Spot compliance risks before they become setbacks.</h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.cream }}>AI reviews case plan tasks and communication records to highlight likely issues and recommend corrective actions.</p>
        </section>

        <div className="rounded-xl p-3.5 flex gap-3" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <AlertTriangle size={15} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>This dashboard helps prepare for court and agency reviews, but it is not legal advice.</p>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="animate-spin mx-auto" color={C.midGreen} /></div>
        ) : (
          <>
            <ComplianceSourceStats stats={stats} />

            <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
              <div className="space-y-4">
                {analysis ? <ComplianceRiskScore score={analysis.risk_score || 0} /> : (
                  <div className="rounded-3xl p-6 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
                    <Brain size={34} color={C.gold} className="mx-auto mb-3" />
                    <p className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>Ready to scan current records</p>
                    <p className="text-xs mt-1 max-w-md mx-auto" style={{ color: C.mutedText }}>The AI will review open checklist items, deadlines, evidence gaps, agency emails, messages, and meeting notes.</p>
                  </div>
                )}

                {analysis?.summary && (
                  <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: C.mutedText }}>AI summary</p>
                    <p className="text-sm leading-relaxed" style={{ color: C.darkText }}>{analysis.summary}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {(analysis?.risks || []).map((risk, index) => <ComplianceRiskCard key={index} risk={risk} />)}
                </div>
              </div>

              <div className="space-y-4 lg:sticky lg:top-4">
                <button onClick={runScan} disabled={scanning} className="w-full rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2" style={{ background: C.darkGreen, color: "#fff", border: "none", opacity: scanning ? 0.75 : 1 }}>
                  {scanning ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} {scanning ? "Scanning records…" : analysis ? "Refresh AI risk scan" : "Run AI risk scan"}
                </button>

                <CorrectiveActionList actions={analysis?.corrective_actions || []} />

                <CommunicationRephraseTips tips={analysis?.communication_rephrasing_tips || []} />

                <Link to="/court-filings" className="flex items-center justify-between rounded-2xl p-4" style={{ background: C.cream, textDecoration: "none" }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Draft corrective filing</p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>Turn risk findings into a court-ready draft</p>
                  </div>
                  <ChevronRight size={16} color={C.mutedText} />
                </Link>
              </div>
            </div>
          </>
        )}
        <div className="pb-8" />
      </main>
    </div>
  );
}