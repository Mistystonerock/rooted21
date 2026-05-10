import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const weeksBack = body.weeksBack || 0; // 0 = current week, 1 = last week, etc.

    // Calculate week range
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - dayOfWeek - (weeksBack * 7));
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    const weekStart = weekStartDate.toISOString().slice(0, 10);
    const weekEnd = weekEndDate.toISOString().slice(0, 10);

    // Fetch all data in parallel
    const [
      childProfiles,
      behaviorLogs,
      checkIns,
      journalEntries,
      goals,
    ] = await Promise.all([
      base44.entities.ChildProfile.list('-created_date', 5),
      base44.entities.BehaviorLog.list('-entry_date', 100),
      base44.entities.CheckIn.list('-created_date', 100),
      base44.entities.ParentJournal.list('-entry_date', 60),
      base44.entities.Goal.list('-created_date', 20),
    ]);

    // Filter to this week
    const weekBehaviorLogs = behaviorLogs.filter(b => b.entry_date >= weekStart && b.entry_date <= weekEnd);
    const weekCheckIns = checkIns.slice(0, 14); // ~2/day max
    const weekJournals = journalEntries.filter(j => j.entry_date >= weekStart && j.entry_date <= weekEnd);

    // Stats
    const avgChildReg = weekCheckIns.length > 0
      ? (weekCheckIns.reduce((s, c) => s + (c.child_regulation || 0), 0) / weekCheckIns.length).toFixed(1)
      : null;
    const avgParentCalm = weekCheckIns.length > 0
      ? (weekCheckIns.reduce((s, c) => s + (c.parent_calm || 0), 0) / weekCheckIns.length).toFixed(1)
      : null;

    // Trigger frequency
    const triggerCounts = {};
    weekBehaviorLogs.forEach(b => {
      if (b.trigger) {
        const t = b.trigger.toLowerCase().trim().slice(0, 50);
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      }
    });
    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);

    const moodCounts = {};
    weekJournals.forEach(j => { if (j.mood) moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1; });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'not recorded';

    const childMoodCounts = {};
    weekBehaviorLogs.forEach(b => { if (b.child_mood) childMoodCounts[b.child_mood] = (childMoodCounts[b.child_mood] || 0) + 1; });

    const inProgressGoals = goals.filter(g => g.progress === 'in_progress');
    const child = childProfiles[0];

    // Build prompt
    const prompt = `
You are a compassionate, trauma-informed TBRI® parenting coach for the Rooted 21 Parenting Network.
Analyze the following family data and generate a personalized weekly "Growth Insight" report.

WEEK: ${weekStart} to ${weekEnd}
CHILD PROFILE:
${child ? `- Name: ${child.first_name} | Age: ${child.age || 'unknown'} | Placement: ${child.placement_type || 'unknown'}
- Strengths: ${child.strengths || 'not recorded'}
- Current concerns: ${child.concerns || 'not recorded'}
- Known triggers: ${child.triggers || 'not recorded'}
- Coping tools that help: ${child.coping_tools || 'not recorded'}
- Care goals: ${child.care_goals?.join(', ') || 'not set'}` : 'No child profile recorded.'}

CHECK-IN DATA (${weekCheckIns.length} check-ins this week):
- Avg child regulation score: ${avgChildReg ? `${avgChildReg}/5` : 'no data'}
- Avg parent calm score: ${avgParentCalm ? `${avgParentCalm}/5` : 'no data'}
- Scores by day: ${weekCheckIns.map(c => `child:${c.child_regulation}, parent:${c.parent_calm}`).slice(0, 7).join(' | ')}

BEHAVIOR LOGS THIS WEEK (${weekBehaviorLogs.length} incidents):
${weekBehaviorLogs.length > 0
  ? weekBehaviorLogs.slice(0, 8).map(b =>
    `- [${b.entry_date} ${b.child_mood || ''}] ${b.behavior_description?.slice(0, 100)}
     Trigger: ${b.trigger || 'unknown'} | Parent response: ${b.parent_response?.slice(0, 80) || 'not recorded'} | Outcome: ${b.outcome?.slice(0, 80) || 'not recorded'}`
  ).join('\n')
  : 'No behavior incidents logged this week.'}

MOST COMMON TRIGGERS: ${topTriggers.length > 0 ? topTriggers.join(', ') : 'none identified'}
CHILD MOOD DISTRIBUTION: ${Object.entries(childMoodCounts).map(([m, c]) => `${m}: ${c}x`).join(', ') || 'not recorded'}

JOURNAL REFLECTIONS (${weekJournals.length} entries):
- Parent dominant mood: ${dominantMood}
${weekJournals.slice(0, 5).map(j =>
  `[${j.entry_date}] Mood: ${j.mood || 'n/a'} | Wins: ${j.wins_of_day?.slice(0, 80) || 'none'} | Regulation: ${j.regulation_reflection?.slice(0, 80) || 'none'} | Learned: ${j.what_i_learned?.slice(0, 80) || 'none'}`
).join('\n')}

ACTIVE GOALS (${inProgressGoals.length}):
${inProgressGoals.slice(0, 3).map(g => `- "${g.title}": ${g.description?.slice(0, 60) || ''}`).join('\n') || 'No active goals.'}

Generate a Growth Insight report with these EXACT sections:

## 🌱 This Week's Highlight
1-2 sentences celebrating something specific from the data. Be concrete — reference actual behaviors, regulation scores, or journal entries if present.

## 🧠 Behavioral Pattern Insight
Analyze the behavior log and check-in data. What patterns do you see? What triggers are recurring? How is the child's regulation trending? Be specific and trauma-informed. (If no data, gently encourage logging.)

## 💚 TBRI® Principle in Focus
Name 1 TBRI® principle most relevant to what this family is experiencing. Briefly explain why it matters for THIS child's specific needs based on their profile.

## 🎯 Growth Edge for Next Week
Identify 1 specific, actionable focus area. Give a concrete tip tied to the child's known triggers or coping tools. Make it achievable.

## 🌟 Parent Affirmation
2-3 warm sentences honoring the parent's effort this week based on their journal and check-in data. Acknowledge the weight of this work.

## ✅ Weekly Practice Commitment
One simple, specific action. Format: "This week, I will ___."

Keep tone warm, non-clinical, hopeful, and grounded in TBRI®. Total: 280-380 words.
`;

    const insight = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
    });

    const insightText = typeof insight === 'string' ? insight : insight?.text || '';

    // Extract recommendations (lines with "This week" or bullet points from Growth Edge section)
    const recommendations = [];
    const lines = insightText.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('This week, I will') || (trimmed.startsWith('-') && trimmed.length > 20)) {
        recommendations.push(trimmed.replace(/^[-•]\s*/, ''));
      }
    });

    // Save to GrowthInsight entity
    const saved = await base44.entities.GrowthInsight.create({
      user_email: user.email,
      week_start: weekStart,
      week_end: weekEnd,
      insight_text: insightText,
      child_name: child?.first_name || null,
      stats: {
        avg_child_regulation: avgChildReg ? parseFloat(avgChildReg) : null,
        avg_parent_calm: avgParentCalm ? parseFloat(avgParentCalm) : null,
        total_checkins: weekCheckIns.length,
        behavior_log_count: weekBehaviorLogs.length,
        top_triggers: topTriggers,
        mood_trend: dominantMood,
        journal_entries: weekJournals.length,
      },
      recommendations: recommendations.slice(0, 5),
    });

    return Response.json({ insight: insightText, stats: saved.stats, id: saved.id });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});