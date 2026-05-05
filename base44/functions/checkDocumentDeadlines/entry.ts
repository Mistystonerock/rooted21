import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active cases
    const cases = await base44.asServiceRole.entities.CaseFile.filter(
      { status: "active" },
      "-created_date",
      1000
    );

    for (const caseFile of cases) {
      if (!caseFile.documents || caseFile.documents.length === 0) continue;

      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      for (const doc of caseFile.documents) {
        // Check for missing documents (no date_added in recent entries)
        if (!doc.date_added) {
          await base44.asServiceRole.functions.invoke("sendDocumentAlert", {
            alertType: "missing_document",
            caseId: caseFile.id,
            childName: caseFile.child_name,
            documentTitle: doc.title,
            parentEmail: caseFile.parent_email,
            teamEmails: caseFile.team_members?.map(m => m.email) || [],
          });
          continue;
        }

        // Check for approaching deadlines
        if (doc.due_date) {
          const docDueDate = new Date(doc.due_date);
          if (docDueDate <= sevenDaysFromNow && docDueDate > today) {
            await base44.asServiceRole.functions.invoke("sendDocumentAlert", {
              alertType: "deadline_approaching",
              caseId: caseFile.id,
              childName: caseFile.child_name,
              documentTitle: doc.title,
              docDeadlineDate: doc.due_date,
              parentEmail: caseFile.parent_email,
              teamEmails: caseFile.team_members?.map(m => m.email) || [],
            });
          }
        }
      }
    }

    return Response.json({ success: true, casesChecked: cases.length });
  } catch (error) {
    console.error("Error checking document deadlines:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});