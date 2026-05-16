import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

function recent(dateValue) {
  if (!dateValue) return false;
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const date = new Date(dateValue);
  return date >= from && date <= new Date();
}

function childMatches(record, child) {
  if (!child) return true;
  const fullName = `${child.first_name || ""} ${child.last_name || ""}`.trim().toLowerCase();
  const firstName = String(child.first_name || "").toLowerCase();
  const recordName = String(record.child_name || "").toLowerCase();
  return record.child_id === child.id || record.child_id === child.child_uid || recordName === fullName || recordName === firstName;
}

function addText(doc, text, x, y, width, size = 9) {
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(String(text || ""), width);
  doc.text(lines, x, y);
  return y + lines.length * (size * 0.48) + 3;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();
    const childId = payload.childId;

    const [children, behaviorLogs, messageAudits, goals] = await Promise.all([
      base44.entities.ChildProfile.list("-created_date", 100),
      base44.entities.BehaviorLog.list("-created_date", 500),
      base44.entities.MessageAuditLog.list("-created_date", 500),
      base44.entities.Goal.list("-created_date", 300)
    ]);

    const child = children.find((item) => item.id === childId || item.child_uid === childId) || children[0];
    if (!child) return Response.json({ error: "No child profile found" }, { status: 400 });

    const childName = `${child.first_name || "Child"}${child.last_name ? " " + child.last_name : ""}`;
    const behaviors = behaviorLogs.filter((item) => recent(item.entry_date || item.created_date) && childMatches(item, child));
    const audits = messageAudits.filter((item) => recent(item.sent_at || item.created_date));
    const completedGoals = goals.filter((item) => item.progress === "completed" && recent(item.updated_date || item.created_date) && childMatches(item, child));

    const aiSummary = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a neutral court-ready summary for the last 30 days for ${childName}. Do not make legal conclusions. Summarize progress, current needs, and compliance milestones. Behavior logs: ${JSON.stringify(behaviors.slice(0, 30))}. Communication audits: ${JSON.stringify(audits.slice(0, 30))}. Completed goals: ${JSON.stringify(completedGoals.slice(0, 30))}.`,
      response_json_schema: {
        type: "object",
        properties: {
          progress_summary: { type: "string" },
          current_needs: { type: "string" },
          compliance_milestones: { type: "string" }
        },
        required: ["progress_summary", "current_needs", "compliance_milestones"]
      }
    });

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const margin = 16;
    const bodyWidth = width - margin * 2;
    let y = 18;

    function newPageIfNeeded(space) {
      if (y + space > 280) {
        doc.addPage();
        y = 18;
      }
    }

    function section(title) {
      newPageIfNeeded(16);
      doc.setFillColor(27, 68, 44);
      doc.roundedRect(margin, y, bodyWidth, 9, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(title, margin + 3, y + 6);
      y += 15;
      doc.setTextColor(35, 35, 35);
      doc.setFont("helvetica", "normal");
    }

    doc.setFillColor(27, 68, 44);
    doc.rect(0, 0, width, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("Court-Ready Child Progress Report", width / 2, 14, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Last 30 Days · ${childName}`, width / 2, 22, { align: "center" });
    doc.text(`Generated ${new Date().toLocaleDateString("en-US")}`, width / 2, 28, { align: "center" });
    y = 44;

    doc.setTextColor(35, 35, 35);
    doc.setFont("helvetica", "bold");
    y = addText(doc, `Prepared by: ${user.full_name || user.email} (${user.email})`, margin, y, bodyWidth, 9);
    y = addText(doc, `Records included: ${behaviors.length} behavior logs, ${audits.length} communication audits, ${completedGoals.length} completed goals`, margin, y, bodyWidth, 9);
    y += 4;

    section("AI-Formatted Summary");
    doc.setFont("helvetica", "bold");
    y = addText(doc, "Summary of Progress", margin, y, bodyWidth, 10);
    doc.setFont("helvetica", "normal");
    y = addText(doc, aiSummary.progress_summary, margin, y, bodyWidth, 9);
    doc.setFont("helvetica", "bold");
    y = addText(doc, "Current Needs", margin, y + 2, bodyWidth, 10);
    doc.setFont("helvetica", "normal");
    y = addText(doc, aiSummary.current_needs, margin, y, bodyWidth, 9);
    doc.setFont("helvetica", "bold");
    y = addText(doc, "Compliance Milestones", margin, y + 2, bodyWidth, 10);
    doc.setFont("helvetica", "normal");
    y = addText(doc, aiSummary.compliance_milestones, margin, y, bodyWidth, 9);

    section("Behavior Logs");
    if (!behaviors.length) y = addText(doc, "No behavior logs recorded for this child during the last 30 days.", margin, y, bodyWidth, 9);
    behaviors.forEach((item, index) => {
      newPageIfNeeded(26);
      doc.setFont("helvetica", "bold");
      y = addText(doc, `${index + 1}. ${new Date(item.entry_date || item.created_date).toLocaleDateString("en-US")}`, margin, y, bodyWidth, 9);
      doc.setFont("helvetica", "normal");
      y = addText(doc, `Behavior: ${item.behavior_description || "Not provided"}`, margin + 3, y, bodyWidth - 3, 8);
      if (item.trigger) y = addText(doc, `Trigger: ${item.trigger}`, margin + 3, y, bodyWidth - 3, 8);
      if (item.parent_response) y = addText(doc, `Caregiver response: ${item.parent_response}`, margin + 3, y, bodyWidth - 3, 8);
      y += 2;
    });

    section("Communication Audits");
    if (!audits.length) y = addText(doc, "No communication audit records found during the last 30 days.", margin, y, bodyWidth, 9);
    audits.forEach((item, index) => {
      newPageIfNeeded(20);
      doc.setFont("helvetica", "bold");
      y = addText(doc, `${index + 1}. ${new Date(item.sent_at || item.created_date).toLocaleDateString("en-US")}`, margin, y, bodyWidth, 9);
      doc.setFont("helvetica", "normal");
      y = addText(doc, `From: ${item.sender_email || "N/A"} · To: ${item.recipient_email || "N/A"}`, margin + 3, y, bodyWidth - 3, 8);
      if (item.body_preview) y = addText(doc, `Preview: ${item.body_preview}`, margin + 3, y, bodyWidth - 3, 8);
      y += 2;
    });

    section("Completed Goals");
    if (!completedGoals.length) y = addText(doc, "No goals were marked completed for this child during the last 30 days.", margin, y, bodyWidth, 9);
    completedGoals.forEach((item, index) => {
      newPageIfNeeded(20);
      doc.setFont("helvetica", "bold");
      y = addText(doc, `${index + 1}. ${item.title || "Completed Goal"}`, margin, y, bodyWidth, 9);
      doc.setFont("helvetica", "normal");
      if (item.description) y = addText(doc, item.description, margin + 3, y, bodyWidth - 3, 8);
      y += 2;
    });

    section("Certification Note");
    y = addText(doc, "This report was generated from records stored in the Rooted 21 platform. AI-generated summaries are based only on the records listed and should be reviewed before filing with court.", margin, y, bodyWidth, 9);

    const pdfBytes = doc.output("arraybuffer");
    let binary = "";
    const bytes = new Uint8Array(pdfBytes);
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);

    return Response.json({
      success: true,
      base64,
      fileName: `Court-Report-${childName.replace(/\s+/g, "-")}-Last-30-Days.pdf`,
      summary: {
        behaviorLogs: behaviors.length,
        communicationAudits: audits.length,
        completedGoals: completedGoals.length
      }
    });
  } catch (error) {
    console.error("generateChildCourtReport error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});