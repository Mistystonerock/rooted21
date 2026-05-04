import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'court_staff') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { partnership_id, start_date, end_date } = await req.json();

    if (!partnership_id || !start_date || !end_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch partnership
    const partnerships = await base44.entities.CoParentingPartnership.filter({
      id: partnership_id,
    });
    const partnership = partnerships[0];

    if (!partnership) {
      return Response.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Parse dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Fetch all relevant data
    const [messages, behaviors, schedules, checkins] = await Promise.all([
      base44.entities.CoParentingMessage.filter({ partnership_id }, '-created_date', 500),
      base44.entities.BehaviorLog.list('-created_date', 500),
      base44.entities.DailySchedule.filter({ child_name: partnership.child_name }, '-created_date', 20),
      base44.entities.CheckIn.list('-created_date', 500),
    ]);

    // Filter to date range
    const dateRange = (record) => {
      const recordDate = new Date(record.created_date);
      return recordDate >= startDate && recordDate <= endDate;
    };

    const rangeMessages = messages.filter(dateRange);
    const rangeBehaviors = behaviors.filter(b => {
      const bDate = new Date(b.entry_date);
      return bDate >= startDate && bDate <= endDate;
    });
    const rangeCheckins = checkins.filter(dateRange);

    // Calculate statistics
    const messageCount = rangeMessages.length;
    const behaviorCount = rangeBehaviors.length;
    const checkinCount = rangeCheckins.length;
    
    const avgChildReg = rangeCheckins.length > 0
      ? (rangeCheckins.reduce((sum, c) => sum + c.child_regulation, 0) / rangeCheckins.length).toFixed(1)
      : 'N/A';

    const avgParentCalm = rangeCheckins.length > 0
      ? (rangeCheckins.reduce((sum, c) => sum + c.parent_calm, 0) / rangeCheckins.length).toFixed(1)
      : 'N/A';

    // Count behavior moods
    const moodCounts = {};
    rangeBehaviors.forEach(b => {
      moodCounts[b.child_mood] = (moodCounts[b.child_mood] || 0) + 1;
    });

    // Generate HTML report
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #2f4b3a; border-bottom: 3px solid #78a65e; padding-bottom: 10px; }
            h2 { color: #2f4b3a; margin-top: 20px; font-size: 14px; font-weight: bold; }
            .header { background: #2f4b3a; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-value { font-size: 24px; font-weight: bold; color: #78a65e; }
            .metric-label { font-size: 12px; color: #666; }
            .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #78a65e; }
            .entry { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #78a65e; }
            .entry-title { font-weight: bold; color: #2f4b3a; }
            .entry-detail { font-size: 11px; color: #666; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { background: #e8ede8; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ddd; font-size: 12px; }
            td { padding: 8px; border: 1px solid #ddd; font-size: 11px; }
            .mood-calm { background: #d4edda; }
            .mood-sad { background: #e2e3e5; }
            .mood-anxious { background: #fff3cd; }
            .mood-angry { background: #f8d7da; }
            .mood-dysregulated { background: #f5c6cb; }
            .footer { margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; color: white; border: none;">📋 Partnership Report</h1>
            <p style="margin: 5px 0 0 0;">Court-Supervised Co-Parenting Partnership</p>
          </div>

          <p><strong>Child:</strong> ${partnership.child_name}</p>
          <p><strong>Parent 1:</strong> ${partnership.parent_1_name} (${partnership.parent_1_email})</p>
          <p><strong>Parent 2:</strong> ${partnership.parent_2_name} (${partnership.parent_2_email})</p>
          <p><strong>Date Range:</strong> ${startDate.toLocaleDateString()} — ${endDate.toLocaleDateString()}</p>
          <p><strong>Case Number:</strong> ${partnership.court_case_number || 'N/A'}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

          <div class="section">
            <h2>📊 Summary Statistics</h2>
            <div class="metric">
              <div class="metric-value">${messageCount}</div>
              <div class="metric-label">Messages Exchanged</div>
            </div>
            <div class="metric">
              <div class="metric-value">${behaviorCount}</div>
              <div class="metric-label">Behavior Logs</div>
            </div>
            <div class="metric">
              <div class="metric-value">${checkinCount}</div>
              <div class="metric-label">Check-ins</div>
            </div>
            <div class="metric">
              <div class="metric-value">${avgChildReg}</div>
              <div class="metric-label">Avg Child Regulation</div>
            </div>
            <div class="metric">
              <div class="metric-value">${avgParentCalm}</div>
              <div class="metric-label">Avg Parent Calm</div>
            </div>
          </div>

          <div class="section">
            <h2>💬 Co-Parenting Messages (${messageCount} total)</h2>
            ${messageCount === 0 ? '<p style="color: #999;">No messages in this date range</p>' : `
              <table>
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>Topic</th>
                  <th>Message</th>
                </tr>
                ${rangeMessages.slice(0, 50).map(m => `
                  <tr>
                    <td>${new Date(m.created_date).toLocaleDateString()}</td>
                    <td>${m.sender_name}</td>
                    <td>${m.topic || '—'}</td>
                    <td>${m.body.substring(0, 100)}${m.body.length > 100 ? '...' : ''}</td>
                  </tr>
                `).join('')}
              </table>
              ${messageCount > 50 ? `<p style="color: #999;">Showing first 50 of ${messageCount} messages</p>` : ''}
            `}
          </div>

          <div class="section">
            <h2>🎯 Behavior Logs (${behaviorCount} total)</h2>
            ${behaviorCount === 0 ? '<p style="color: #999;">No behavior logs in this date range</p>' : `
              <p><strong>Mood Distribution:</strong></p>
              <table>
                <tr>
                  <th>Mood</th>
                  <th>Count</th>
                </tr>
                ${Object.entries(moodCounts).map(([mood, count]) => `
                  <tr class="mood-${mood}">
                    <td>${mood}</td>
                    <td>${count}</td>
                  </tr>
                `).join('')}
              </table>

              <p style="margin-top: 15px;"><strong>Recent Entries:</strong></p>
              ${rangeBehaviors.slice(0, 20).map(b => `
                <div class="entry">
                  <div class="entry-title">${b.behavior_description}</div>
                  <div class="entry-detail"><strong>Date:</strong> ${b.entry_date}</div>
                  <div class="entry-detail"><strong>Trigger:</strong> ${b.trigger || 'Not specified'}</div>
                  <div class="entry-detail"><strong>Mood:</strong> ${b.child_mood}</div>
                  <div class="entry-detail"><strong>Parent Response:</strong> ${b.parent_response || 'Not specified'}</div>
                  <div class="entry-detail"><strong>Outcome:</strong> ${b.outcome || 'Not specified'}</div>
                </div>
              `).join('')}
              ${behaviorCount > 20 ? `<p style="color: #999;">Showing first 20 of ${behaviorCount} entries</p>` : ''}
            `}
          </div>

          <div class="section">
            <h2>📅 Routine & Schedule Information</h2>
            ${schedules.length === 0 ? '<p style="color: #999;">No routines set up</p>' : `
              <p>${schedules.length} household routine(s) configured</p>
              ${schedules.map(s => `
                <div class="entry">
                  <div class="entry-title">${s.name} (${s.routine_type})</div>
                  <div class="entry-detail"><strong>Child:</strong> ${s.child_name}</div>
                  ${s.tasks && s.tasks.length > 0 ? `
                    <div class="entry-detail"><strong>Tasks:</strong> ${s.tasks.length} steps</div>
                  ` : ''}
                </div>
              `).join('')}
            `}
          </div>

          <div class="section">
            <h2>📈 Regulation Trends</h2>
            ${checkinCount === 0 ? '<p style="color: #999;">No check-ins in this date range</p>' : `
              <p><strong>Check-in Summary:</strong></p>
              <table>
                <tr>
                  <th>Date</th>
                  <th>Child Regulation</th>
                  <th>Parent Calm</th>
                  <th>Notes</th>
                </tr>
                ${rangeCheckins.slice(0, 30).map(c => `
                  <tr>
                    <td>${new Date(c.created_date).toLocaleDateString()}</td>
                    <td>${c.child_regulation}/5</td>
                    <td>${c.parent_calm}/5</td>
                    <td>${c.note ? c.note.substring(0, 50) : '—'}${c.note && c.note.length > 50 ? '...' : ''}</td>
                  </tr>
                `).join('')}
              </table>
              ${checkinCount > 30 ? `<p style="color: #999;">Showing first 30 of ${checkinCount} check-ins</p>` : ''}
            `}
          </div>

          <div class="footer">
            <p>This is a confidential court document for authorized personnel only.</p>
            <p>Generated by Rooted 21 Court Management System</p>
          </div>
        </body>
      </html>
    `;

    return Response.json({
      success: true,
      html,
      summary: {
        partnership_id,
        child_name: partnership.child_name,
        start_date,
        end_date,
        message_count: messageCount,
        behavior_count: behaviorCount,
        checkin_count: checkinCount,
        avg_child_regulation: avgChildReg,
        avg_parent_calm: avgParentCalm,
      },
    });
  } catch (error) {
    console.error('Error generating partnership report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});