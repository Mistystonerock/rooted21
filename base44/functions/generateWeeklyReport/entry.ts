import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's child profile
    const children = await base44.entities.ChildProfile.list('-created_date', 1);
    const child = children[0];

    // Get data from past 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [behaviors, lessons, checkins, schedules] = await Promise.all([
      base44.entities.BehaviorLog.list('-created_date', 100),
      base44.entities.LessonProgress.filter({ completed: true }, '-created_date', 100),
      base44.entities.CheckIn.list('-created_date', 100),
      base44.entities.DailySchedule.filter({}, '-created_date', 10),
    ]);

    // Filter to past 7 days
    const weekBehaviors = behaviors.filter(b => 
      new Date(b.created_date) >= sevenDaysAgo
    );
    const weekLessons = lessons.filter(l => 
      new Date(l.created_date) >= sevenDaysAgo
    );
    const weekCheckins = checkins.filter(c => 
      new Date(c.created_date) >= sevenDaysAgo
    );

    // Calculate metrics
    const avgChildRegulation = weekCheckins.length > 0
      ? (weekCheckins.reduce((sum, c) => sum + c.child_regulation, 0) / weekCheckins.length).toFixed(1)
      : 'N/A';

    const avgParentCalm = weekCheckins.length > 0
      ? (weekCheckins.reduce((sum, c) => sum + c.parent_calm, 0) / weekCheckins.length).toFixed(1)
      : 'N/A';

    // Calculate routine consistency (check-ins where routine was followed)
    const routineConsistency = weekCheckins.length > 0
      ? `${weekCheckins.length} check-ins this week`
      : 'No check-ins this week';

    // Generate HTML for PDF
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #2f4b3a; border-bottom: 3px solid #78a65e; padding-bottom: 10px; }
            h2 { color: #2f4b3a; margin-top: 20px; font-size: 14px; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-value { font-size: 24px; font-weight: bold; color: #78a65e; }
            .metric-label { font-size: 12px; color: #666; }
            .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #78a65e; }
            .entry { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .entry-title { font-weight: bold; color: #2f4b3a; }
            .entry-detail { font-size: 12px; color: #666; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { background: #e8ede8; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
            .footer { margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>📊 Weekly Behavior Report</h1>
          <p><strong>Week of ${sevenDaysAgo.toLocaleDateString()} - ${now.toLocaleDateString()}</strong></p>
          ${child ? `<p><strong>Child:</strong> ${child.first_name}, Age ${child.age}</p>` : ''}
          <p><strong>Reported by:</strong> ${user.full_name}</p>

          <div class="section">
            <h2>📈 Regulation & Wellness Overview</h2>
            <div class="metric">
              <div class="metric-value">${avgChildRegulation}</div>
              <div class="metric-label">Avg Child Regulation (1-5)</div>
            </div>
            <div class="metric">
              <div class="metric-value">${avgParentCalm}</div>
              <div class="metric-label">Avg Parent Calm (1-5)</div>
            </div>
            <div class="metric">
              <div class="metric-value">${weekCheckins.length}</div>
              <div class="metric-label">Check-ins Completed</div>
            </div>
          </div>

          <div class="section">
            <h2>📚 Lesson Progress</h2>
            <p><strong>${weekLessons.length} lessons completed this week</strong></p>
            ${weekLessons.length > 0 ? `
              <table>
                <tr>
                  <th>Lesson ID</th>
                  <th>Completed Date</th>
                </tr>
                ${weekLessons.map(l => `
                  <tr>
                    <td>Lesson ${l.lesson_id}</td>
                    <td>${new Date(l.created_date).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </table>
            ` : '<p style="color: #999;">No lessons completed this week</p>'}
          </div>

          <div class="section">
            <h2>🏠 Routine Consistency</h2>
            <p>${routineConsistency}</p>
            ${schedules.length > 0 ? `
              <p><strong>Active Routines:</strong> ${schedules.map(s => s.name).join(', ')}</p>
            ` : '<p style="color: #999;">No routines set up yet</p>'}
          </div>

          <div class="section">
            <h2>🎯 Behavior Observations</h2>
            ${weekBehaviors.length > 0 ? `
              <p><strong>${weekBehaviors.length} behavior entries logged this week</strong></p>
              ${weekBehaviors.slice(0, 5).map(b => `
                <div class="entry">
                  <div class="entry-title">${b.behavior_description}</div>
                  <div class="entry-detail">Trigger: ${b.trigger || 'Not specified'}</div>
                  <div class="entry-detail">Child mood: ${b.child_mood || 'Not specified'}</div>
                  <div class="entry-detail">Response: ${b.parent_response || 'Not specified'}</div>
                </div>
              `).join('')}
              ${weekBehaviors.length > 5 ? `<p style="color: #999;">...and ${weekBehaviors.length - 5} more entries</p>` : ''}
            ` : '<p style="color: #999;">No behavior logs this week</p>'}
          </div>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>This report contains confidential information. For use by authorized personnel only.</p>
          </div>
        </body>
      </html>
    `;

    // Return the HTML and data for email delivery
    return Response.json({
      success: true,
      html,
      report_data: {
        week_start: sevenDaysAgo.toISOString().split('T')[0],
        week_end: now.toISOString().split('T')[0],
        child_name: child?.first_name || 'Child',
        avg_child_regulation: avgChildRegulation,
        avg_parent_calm: avgParentCalm,
        checkins_count: weekCheckins.length,
        behaviors_count: weekBehaviors.length,
        lessons_completed: weekLessons.length,
        routine_consistency: routineConsistency,
      },
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});