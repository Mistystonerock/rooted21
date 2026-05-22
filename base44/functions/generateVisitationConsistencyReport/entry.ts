import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function calculateMinutes(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some(Number.isNaN)) return 0;
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  if (endMinutes < startMinutes) endMinutes += 24 * 60;
  return Math.max(0, endMinutes - startMinutes);
}

function monthLabel(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month, childName = '' } = await req.json();
    const reportMonth = String(month || new Date().toISOString().slice(0, 7));

    const allLogs = await base44.entities.VisitationLog.filter({ parent_email: user.email }, '-visit_date', 500);
    const logs = allLogs.filter((log) => {
      const inMonth = String(log.visit_date || '').startsWith(reportMonth);
      const matchesChild = !childName || String(log.child_name || '').toLowerCase() === String(childName).toLowerCase();
      return inMonth && matchesChild;
    });

    const attended = logs.filter((log) => log.attended !== false);
    const missed = logs.filter((log) => log.attended === false || log.compliance_status === 'no_show');
    const scheduledMinutes = logs.reduce((total, log) => total + Number(log.scheduled_duration_minutes || log.duration_minutes || 0), 0);
    const actualMinutes = attended.reduce((total, log) => total + Number(log.actual_duration_minutes || calculateMinutes(log.actual_start_time, log.actual_end_time) || log.duration_minutes || 0), 0);
    const incidentLogs = logs.filter((log) => log.incident_type && log.incident_type !== 'none');
    const challengeLogs = logs.filter((log) => log.logistical_challenges || log.no_show_reason || log.concerns);

    const stats = {
      month: reportMonth,
      month_label: monthLabel(reportMonth),
      child_name: childName,
      scheduled_visits: logs.length,
      completed_visits: attended.length,
      missed_or_cancelled_visits: missed.length,
      consistency_rate: logs.length ? Math.round((attended.length / logs.length) * 100) : 0,
      scheduled_minutes: scheduledMinutes,
      actual_minutes: actualMinutes,
      incident_count: incidentLogs.length,
      logistical_challenge_count: challengeLogs.length,
    };

    if (logs.length === 0) {
      return Response.json({ success: true, stats, report: {
        summary: 'No visitation logs were found for this month.',
        compliance_notes: [],
        recurring_challenges: [],
        court_ready_statement: 'No parenting-time records were logged for this reporting period.',
        suggested_next_steps: ['Log scheduled and actual parenting time after each visit.']
      }});
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a neutral, trauma-informed documentation assistant. Create a monthly parenting-time consistency report from visitation logs. Do not give legal advice. Use factual, court-appropriate, non-accusatory language.

Month: ${stats.month_label}
Stats: ${JSON.stringify(stats)}
Logs: ${JSON.stringify(logs.map((log) => ({
        date: log.visit_date,
        child: log.child_name,
        visitor: log.visitor_name,
        scheduled_start_time: log.scheduled_start_time || log.visit_time,
        scheduled_duration_minutes: log.scheduled_duration_minutes || log.duration_minutes,
        actual_start_time: log.actual_start_time,
        actual_end_time: log.actual_end_time,
        actual_duration_minutes: log.actual_duration_minutes || log.duration_minutes,
        scheduled_location: log.location,
        actual_location: log.actual_location || log.location,
        attended: log.attended,
        compliance_status: log.compliance_status,
        no_show_reason: log.no_show_reason,
        incident_type: log.incident_type,
        incident_notes: log.incident_notes,
        logistical_challenges: log.logistical_challenges,
        notes: log.notes,
        concerns: log.concerns
      })).slice(0, 80))}

Return only valid JSON with:
- summary: 3-5 sentence factual monthly overview
- compliance_notes: array of factual observations about scheduled versus actual parenting time
- recurring_challenges: array of recurring logistical challenges or patterns
- incident_summary: concise incident overview
- court_ready_statement: one neutral paragraph suitable for records
- suggested_next_steps: array of practical documentation or coordination steps`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          compliance_notes: { type: 'array', items: { type: 'string' } },
          recurring_challenges: { type: 'array', items: { type: 'string' } },
          incident_summary: { type: 'string' },
          court_ready_statement: { type: 'string' },
          suggested_next_steps: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({ success: true, stats, report: result });
  } catch (error) {
    console.error('Visitation consistency report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});