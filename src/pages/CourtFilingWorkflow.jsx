import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import FilingSetupPanel from "@/components/court-filings/FilingSetupPanel";
import FilingSourceSummary from "@/components/court-filings/FilingSourceSummary";
import FilingDraftPreview from "@/components/court-filings/FilingDraftPreview";
import FilingReviewChecklist from "@/components/court-filings/FilingReviewChecklist";
import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

function collectChecklistItems(plans) {
  return plans.flatMap(plan => (plan.items || []).map(item => ({
    checklist: plan.title,
    child_name: plan.child_name,
    text: item.text,
    category: item.category,
    due_date: item.due_date,
    completed: !!item.completed,
    completed_date: item.completed_date,
    notes: item.notes,
    proof_filename: item.proof_filename,
  })));
}

function makeSignedHtml({ draft, signature, user }) {
  const signedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${draft.title}</title><style>body{font-family:Arial,sans-serif;max-width:850px;margin:40px auto;padding:24px;color:#1a1a1a;line-height:1.6}h1{color:#2D4A35;border-bottom:3px solid #a67c52;padding-bottom:12px}.banner{background:#EAF4EA;border:2px solid #6b9d6e;border-radius:10px;padding:16px;margin:20px 0}.content{white-space:pre-wrap}.sig{max-width:320px;border:1px solid #ccc;border-radius:6px}.footer{margin-top:40px;border-top:1px solid #ddd;padding-top:12px;font-size:12px;color:#666}</style></head><body><h1>${draft.title}</h1><div class="banner"><strong>Digitally signed by:</strong> ${user.full_name || user.email}<br/><strong>Email:</strong> ${user.email}<br/><strong>Signed:</strong> ${signedAt} ET<br/><br/><img class="sig" src="${signature}" /></div><div class="content">${draft.draft_markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div><div class="footer">Rooted 21 Parenting Network · Generated from Case Plan Checklist and Communication Audit data. Consult legal counsel before filing with any court.</div></body></html>`;
}

export default function CourtFilingWorkflow() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [signing, setSigning] = useState(false);
  const [casePlans, setCasePlans] = useState([]);
  const [cases, setCases] = useState([]);
  const [agencyEmails, setAgencyEmails] = useState([]);
  const [secureMessages, setSecureMessages] = useState([]);
  const [caseNotes, setCaseNotes] = useState([]);
  const [draft, setDraft] = useState(null);
  const [signature, setSignature] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [saved, setSaved] = useState(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [form, setForm] = useState({ filing_type: "service_request", case_plan_id: "", case_id: "", court_name: "", family_case_name: "", service_details: "", include_declaration: false });

  const placeholders = draft ? (draft.draft_markdown.match(/\[[^\]\n]{0,80}\]/g) || []) : [];
  const missingFields = draft?.missing_fields || [];
  const hasIssues = placeholders.length > 0 || missingFields.length > 0;
  const draftStatus = !draft ? "draft" : hasIssues ? "draft" : "ready_for_review";

  useEffect(() => {
    base44.auth.me().then(async me => {
      setUser(me);
      const [plans, caseList, emails, messages] = await Promise.all([
        base44.entities.CasePlanChecklist.filter({ parent_email: me.email }, "-created_date", 50),
        base44.entities.CaseFile.filter({ parent_email: me.email }, "-created_date", 100),
        base44.entities.AgencyEmailCorrespondence.filter({ owner_email: me.email }, "-correspondence_date", 200),
        base44.entities.SecureMessage.filter({ family_email: me.email }, "-created_date", 200),
      ]);
      const noteGroups = await Promise.all(caseList.map(c => base44.entities.CaseNote.filter({ case_id: c.id }, "-created_date", 200)));
      setCasePlans(plans);
      setCases(caseList);
      setAgencyEmails(emails);
      setSecureMessages(messages);
      setCaseNotes(noteGroups.flat().filter(note => note.note_type === "meeting_notes"));
      setLoading(false);
    });
  }, []);

  const selectedPlans = useMemo(() => form.case_plan_id ? casePlans.filter(plan => plan.id === form.case_plan_id) : casePlans, [casePlans, form.case_plan_id]);
  const checklistItems = useMemo(() => collectChecklistItems(selectedPlans), [selectedPlans]);
  const stats = {
    checklistItems: checklistItems.length,
    communications: secureMessages.length + agencyEmails.length + caseNotes.length,
    agencyEmails: agencyEmails.length,
    meetingNotes: caseNotes.length,
  };

  async function generateDraft() {
    setGenerating(true);
    setSaved(null);
    setReviewConfirmed(false);
    const linkedCase = cases.find(c => c.id === form.case_id) || null;
    const sourceContext = {
      filing_type: form.filing_type,
      court_or_agency_name: form.court_name,
      family_or_case_name: form.family_case_name,
      service_or_support_requested: form.service_details || null,
      linked_case: linkedCase,
      case_plan_items: checklistItems.slice(0, 80),
      agency_emails: agencyEmails.slice(0, 25).map(e => ({ agency: e.agency_name, subject: e.subject, direction: e.direction, date: e.correspondence_date, body: e.body })),
      professional_messages: secureMessages.slice(0, 25).map(m => ({ sender: m.sender_email, role: m.sender_role, date: m.created_date, body: m.body })),
      meeting_notes: caseNotes.slice(0, 25).map(n => ({ title: n.title, author: n.author_name, date: n.created_date, body: n.body })),
    };

    const documentInstructions = form.filing_type === "service_request"
      ? "Create a service request form with: caption (using the provided court/agency name and family/case name — never a placeholder), the requested service or referral (use the provided service_or_support_requested text), reason for request, urgency/impact, supporting facts from the data, proposed provider/support notes, and requested response timeline."
      : form.filing_type === "status_report"
        ? "Create a court-ready status report with: caption (using the provided court/agency name and family/case name), report period, child/case identifiers, case plan progress summary, completed items, pending items, barriers, communication/meeting summary, safety or stability updates, and requested next steps."
        : "Create a polished filing with: caption (using the provided court/agency name and family/case name), title, introduction, facts/background, case plan compliance summary, communication audit summary, and requested next steps.";

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Draft a court-ready legal document using the mapped data below. This is not legal advice; format it as a clear official draft the parent can review with counsel.

DOCUMENT TYPE: ${form.filing_type}

DATA SOURCES:
${JSON.stringify(sourceContext, null, 2)}

${documentInstructions}

CRITICAL RULES:
- Never use bracket placeholder text like "[Insert Caption Here]", "[Case Number]", or similar. Always use the real values provided above.
- Do NOT include an exhibit list or a signature/declaration block — those are added separately.
- If a specific piece of information needed for the document is not available in the data above, write a plain sentence noting it (e.g. "Case number not yet provided.") instead of a bracket, AND add that exact field name to the missing_fields list in your response.
- Use plain, respectful language and avoid making claims not supported by the source data.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          draft_markdown: { type: "string" },
          preparation_tasks: { type: "array", items: { type: "string" } },
          source_summary: { type: "string" },
          missing_fields: { type: "array", items: { type: "string" }, description: "Fields needed for this document that were not available in the source data" }
        }
      }
    });

    setDraft(response);
    setGenerating(false);
  }

  function handleEditDraft(value) {
    setDraft(prev => ({ ...prev, draft_markdown: value }));
  }

  async function signAndSave() {
    if (!draft || !signature || !agreed) return;
    setSigning(true);
    const html = makeSignedHtml({ draft, signature, user });
    const file = new File([new Blob([html], { type: "text/html" })], `${draft.title.replace(/\s+/g, "-")}-SIGNED.html`, { type: "text/html" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const filing = await base44.entities.CourtFiling.create({
      owner_email: user.email,
      case_id: form.case_id,
      case_plan_id: form.case_plan_id,
      filing_type: form.filing_type,
      title: draft.title,
      child_name: selectedPlans[0]?.child_name || cases.find(c => c.id === form.case_id)?.child_name || "",
      family_case_name: form.family_case_name,
      court_name: form.court_name,
      draft_markdown: draft.draft_markdown,
      preparation_tasks: draft.preparation_tasks || [],
      source_summary: draft.source_summary,
      include_declaration: form.include_declaration,
      status: "final_signed",
      signed_file_url: file_url,
      signed_at: new Date().toISOString(),
      signature_name: user.full_name || user.email,
    });

    await base44.entities.SecureDocument.create({
      owner_email: user.email,
      title: `SIGNED COURT FILING: ${draft.title}`,
      description: draft.source_summary || "Court-ready filing generated from case plan and communication audit data.",
      category: "legal",
      file_url,
      file_name: file.name,
      tags: ["court-filing", "signed", "legal"],
      is_private: true,
    });

    setSaved(filing);
    setSigning(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Court Filing Workflow" subtitle="Draft, preview, sign, and save" backTo="/communications" />
      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">
        <section className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase" style={{ color: C.cream }}>Automated court-ready filings</p>
          <h1 className="font-serif font-bold text-2xl mt-2" style={{ color: "#fff" }}>Map your case data into service requests and status reports.</h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.cream }}>Generate a formatted document, preview it, download a PDF, and sign a saved copy inside your secure portal.</p>
        </section>

        <div className="rounded-xl p-3.5 flex gap-3" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <AlertTriangle size={15} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>These drafts are preparation tools, not legal advice. Review with your attorney before submitting to court.</p>
        </div>

        {loading ? (
          <div className="text-center py-10"><div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} /></div>
        ) : (
          <>
            <FilingSourceSummary stats={stats} />
            {saved && (
              <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
                <CheckCircle2 size={20} color={C.midGreen} className="mt-0.5" />
                <div><p className="text-sm font-bold" style={{ color: C.darkGreen }}>Signed filing saved</p><p className="text-xs mt-1" style={{ color: C.mutedText }}>A signed copy was saved to Secure Documents and this filing workflow.</p></div>
              </div>
            )}
            <div className="grid lg:grid-cols-[360px_1fr] gap-4 items-start">
              <div className="space-y-4">
                <FilingSetupPanel form={form} setForm={setForm} casePlans={casePlans} cases={cases} onGenerate={generateDraft} generating={generating} />
                <Link to="/communications" className="flex items-center justify-between rounded-2xl p-4" style={{ background: C.cream, textDecoration: "none" }}>
                  <div><p className="text-sm font-bold" style={{ color: C.darkGreen }}>Review communication audit</p><p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>Check source records before drafting</p></div>
                  <ChevronRight size={16} color={C.mutedText} />
                </Link>
              </div>
              {draft && !reviewConfirmed ? (
                <FilingReviewChecklist
                  status={draftStatus}
                  placeholders={placeholders}
                  missingFields={missingFields}
                  draftMarkdown={draft.draft_markdown}
                  onEditDraft={handleEditDraft}
                  onContinue={() => setReviewConfirmed(true)}
                />
              ) : (
                <FilingDraftPreview draft={draft} includeDeclaration={form.include_declaration} signature={signature} setSignature={setSignature} agreed={agreed} setAgreed={setAgreed} onSign={signAndSave} signing={signing} onBackToReview={() => setReviewConfirmed(false)} />
              )}
            </div>
          </>
        )}
        <div className="pb-8" />
      </main>
    </div>
  );
}