import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { checklist_id } = await req.json();
    if (!checklist_id) return Response.json({ error: 'checklist_id required' }, { status: 400 });

    const cl = await base44.entities.CasePlanChecklist.filter({ id: checklist_id, parent_email: user.email }, "-created_date", 1);
    if (!cl || cl.length === 0) return Response.json({ error: 'Checklist not found' }, { status: 404 });

    const checklist = cl[0];
    const items = checklist.items || [];
    const total = items.length;
    const completed = items.filter(i => i.completed);
    const pending = items.filter(i => !i.completed);
    const overdue = pending.filter(i => i.due_date && new Date(i.due_date) < new Date());
    const pct = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `You are a court documentation assistant. Generate a professional case plan progress status report for legal review.

CASE PLAN: ${checklist.title}
CHILD: ${checklist.child_name || 'N/A'}
PARENT/CAREGIVER: ${user.full_name}
REPORT DATE: ${now}
SOURCE: ${checklist.source}
OVERALL PROGRESS: ${pct}% (${completed.length} of ${total} tasks completed)

COMPLETED TASKS (${completed.length}):
${completed.map(i => `- ${i.text}${i.completed_date ? ` (completed ${new Date(i.completed_date).toLocaleDateString()})` : ''}${i.proof_url ? ' [PROOF ATTACHED]' : ''}`).join('\n') || 'None'}

PENDING TASKS (${pending.length}):
${pending.map(i => `- ${i.text}${i.due_date ? ` (due ${new Date(i.due_date + 'T12:00:00').toLocaleDateString()})` : ''}${i.due_date && new Date(i.due_date) < new Date() ? ' ⚠️ OVERDUE' : ''}`).join('\n') || 'None'}

OVERDUE TASKS: ${overdue.length}

Write a formal, professional status report including:
1. Executive Summary (2-3 sentences about overall compliance and effort)
2. Completed Requirements section (list each with date)
3. Outstanding Requirements section (list each with due date and urgency)
4. Parent Compliance Statement (professional narrative about progress)
5. Recommended Next Steps

Format it clearly for presentation to a judge, caseworker, or attorney. Be factual and professional.`;

    const report = await base44.integrations.Core.InvokeLLM({ prompt });

    return Response.json({
      success: true,
      report,
      stats: {
        title: checklist.title,
        child_name: checklist.child_name,
        parent_name: user.full_name,
        report_date: now,
        total,
        completed: completed.length,
        pending: pending.length,
        overdue: overdue.length,
        pct,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});