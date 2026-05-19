import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function compactArray(items, mapper, limit = 80) {
  return (items || []).slice(0, limit).map(mapper);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [documents, behaviorLogs, casePlans, caseTasks, courtAppointments, courtFilings] = await Promise.all([
      base44.entities.SecureDocument.list('-created_date', 200),
      base44.entities.BehaviorLog.list('-entry_date', 200),
      base44.entities.CasePlanChecklist.list('-created_date', 100),
      base44.entities.CaseTask.list('-due_date', 150),
      base44.entities.CourtAppointment.list('-date', 100),
      base44.entities.CourtFiling.list('-created_date', 100),
    ]);

    const scanPayload = {
      generated_at: new Date().toISOString(),
      documents: compactArray(documents, doc => ({
        title: doc.title,
        category: doc.category,
        child_name: doc.child_name,
        uploaded_at: doc.uploaded_at || doc.created_date,
        analysis_summary: doc.analysis_summary,
        extracted_dates: doc.extracted_dates || [],
        extracted_requirements: doc.extracted_requirements || [],
      })),
      behavior_logs: compactArray(behaviorLogs, log => ({
        child_name: log.child_name,
        entry_date: log.entry_date,
        mood: log.child_mood,
        behavior: log.behavior_description,
        trigger: log.trigger,
        parent_response: log.parent_response,
        outcome: log.outcome,
      })),
      case_plans: compactArray(casePlans, plan => ({
        title: plan.title,
        child_name: plan.child_name,
        status: plan.status,
        ai_summary: plan.ai_summary,
        items: (plan.items || []).map(item => ({
          text: item.text,
          category: item.category,
          due_date: item.due_date,
          completed: item.completed,
          notes: item.notes,
          has_proof: !!item.proof_url,
        })),
      })),
      case_tasks: compactArray(caseTasks, task => ({
        title: task.title,
        case_name: task.case_name,
        due_date: task.due_date,
        priority: task.priority,
        status: task.status,
        task_type: task.task_type,
      })),
      court_appointments: compactArray(courtAppointments, appointment => ({
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        location: appointment.location,
        description: appointment.description,
      })),
      court_filings: compactArray(courtFilings, filing => ({
        title: filing.title,
        child_name: filing.child_name,
        status: filing.status,
        filing_type: filing.filing_type,
        preparation_tasks: filing.preparation_tasks || [],
        source_summary: filing.source_summary,
      })),
    };

    const prompt = `You are Moxie Case Insights for Rooted 21. Review the user's uploaded document metadata, behavior logs, case-plan checklist items, tasks, court appointments, and filings. Provide proactive, trauma-informed, plain-language insights. Do not provide legal advice or predict court outcomes. Focus on upcoming deadlines, specific preparation actions, missing proof/documentation, behavior patterns that may affect case-plan readiness, and practical risk reduction steps. Current date: ${new Date().toISOString().slice(0, 10)}. Data: ${JSON.stringify(scanPayload)}`;

    const insights = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          overall_risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
          deadlines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                due_date: { type: 'string' },
                urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
                source: { type: 'string' },
                action: { type: 'string' }
              }
            }
          },
          preparation_actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                reason: { type: 'string' },
                steps: { type: 'array', items: { type: 'string' } },
                priority: { type: 'string', enum: ['low', 'medium', 'high'] }
              }
            }
          },
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                why_it_matters: { type: 'string' },
                reduce_risk: { type: 'string' }
              }
            }
          },
          documentation_gaps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                missing_item: { type: 'string' },
                suggested_proof: { type: 'string' }
              }
            }
          }
        },
        required: ['summary', 'overall_risk_level', 'deadlines', 'preparation_actions', 'risks', 'documentation_gaps']
      }
    });

    return Response.json({
      insights,
      scanned_counts: {
        documents: documents.length,
        behavior_logs: behaviorLogs.length,
        case_plans: casePlans.length,
        case_tasks: caseTasks.length,
        court_appointments: courtAppointments.length,
        court_filings: courtFilings.length,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});