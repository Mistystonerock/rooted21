import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HABITS = [
  { id: "regulate_first", label: "Regulate myself first" },
  { id: "connection_moment", label: "Connection before correction" },
  { id: "pace_curiosity", label: "PACE: Got curious" },
  { id: "felt_safety", label: "Built felt safety" },
  { id: "life_value", label: "Used life value language" },
  { id: "sensory_check", label: "Checked HALT signals" },
  { id: "repair", label: "Repaired if needed" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 7 days of dates
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().slice(0, 10));
    }

    const weekStart = last7Days[0];
    const weekEnd = last7Days[6];

    // Fetch journal entries from the last 7 days
    const allJournalEntries = await base44.entities.ParentJournal.list('-created_date', 60);
    const weekEntries = allJournalEntries.filter(e =>
      e.entry_date >= weekStart && e.entry_date <= weekEnd
    );

    // Parse habit data (stored in what_i_learned as JSON array of habit ids)
    const habitSummary = {};
    HABITS.forEach(h => { habitSummary[h.id] = { label: h.label, count: 0 }; });

    let totalDaysWithHabits = 0;
    let totalHabitsChecked = 0;
    const dailyCounts = {};

    weekEntries.forEach(entry => {
      try {
        const ids = JSON.parse(entry.what_i_learned || '[]');
        if (Array.isArray(ids) && ids.length > 0) {
          totalDaysWithHabits++;
          totalHabitsChecked += ids.length;
          dailyCounts[entry.entry_date] = ids.length;
          ids.forEach(id => {
            if (habitSummary[id]) habitSummary[id].count++;
          });
        }
      } catch {}
    });

    // Identify strongest and weakest habits
    const habitStats = Object.entries(habitSummary)
      .map(([id, data]) => ({ id, label: data.label, count: data.count }))
      .sort((a, b) => b.count - a.count);

    const topHabits = habitStats.filter(h => h.count > 0).slice(0, 3);
    const missedHabits = habitStats.filter(h => h.count === 0);
    const avgHabitsPerDay = totalDaysWithHabits > 0
      ? (totalHabitsChecked / totalDaysWithHabits).toFixed(1)
      : 0;

    // Fetch journal reflections (regulation_reflection, wins_of_day, gratitude)
    const journalReflections = weekEntries
      .filter(e => e.regulation_reflection || e.wins_of_day || e.gratitude)
      .map(e => ({
        date: e.entry_date,
        mood: e.mood,
        regulation: e.regulation_reflection,
        wins: e.wins_of_day,
        gratitude: e.gratitude,
        learned: e.what_i_learned,
      }));

    // Build a rich prompt for the LLM
    const prompt = `
You are a compassionate, trauma-informed TBRI® parenting coach for the Rooted 21 Parenting Network.
Generate a warm, encouraging, personalized weekly "Growth Insight" summary for a parent.

WEEKLY HABIT DATA (last 7 days: ${weekStart} to ${weekEnd}):
- Days with at least 1 habit checked: ${totalDaysWithHabits} out of 7
- Total habit check-offs this week: ${totalHabitsChecked}
- Average habits per active day: ${avgHabitsPerDay}

TOP HABITS PRACTICED:
${topHabits.length > 0 ? topHabits.map(h => `- "${h.label}" (${h.count}/7 days)`).join('\n') : '- No habits logged this week'}

HABITS NOT PRACTICED THIS WEEK:
${missedHabits.length > 0 ? missedHabits.map(h => `- "${h.label}"`).join('\n') : '- All habits were practiced at least once!'}

DAILY HABIT COUNTS: ${JSON.stringify(dailyCounts)}

JOURNAL REFLECTIONS THIS WEEK:
${journalReflections.length > 0
  ? journalReflections.map(r =>
    `Date: ${r.date} | Mood: ${r.mood || 'not set'}
     Regulation Reflection: ${r.regulation || 'not filled'}
     Wins of the Day: ${r.wins || 'not filled'}
     Gratitude: ${r.gratitude || 'not filled'}`
  ).join('\n\n')
  : 'No journal reflections recorded this week.'}

Please generate a Growth Insight summary with these EXACT sections (use these exact headings):

1. **This Week's Highlight** — 1-2 sentences celebrating what they did well based on the data. Be specific about which TBRI® principle they practiced most. If no habits were logged, acknowledge a fresh start warmly.

2. **TBRI® Principle in Focus** — Briefly explain 1 TBRI® principle they practiced most (or if none, one to start with), and why it matters for their child's healing.

3. **Growth Edge** — Gently name 1 specific habit they can focus on next week (pick from missed habits if any, or the least practiced). Give one concrete, real-world tip for how to practice it.

4. **Encouragement** — 2-3 warm sentences acknowledging the difficulty of trauma-informed parenting. Include an affirmation rooted in their journal data if available.

5. **This Week's TBRI® Practice Goal** — One simple, specific action they can commit to for next week. Format as: "This week, I will ___."

Keep the tone warm, non-judgmental, and hopeful. Avoid clinical language. Write as if you're a trusted coach who knows and believes in this parent. Total length: 200-300 words.
`;

    const insight = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
    });

    return Response.json({
      insight: typeof insight === 'string' ? insight : insight?.text || '',
      stats: {
        daysActive: totalDaysWithHabits,
        totalChecked: totalHabitsChecked,
        avgPerDay: avgHabitsPerDay,
        topHabits,
        missedHabits: missedHabits.map(h => h.label),
        weekRange: { start: weekStart, end: weekEnd },
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});