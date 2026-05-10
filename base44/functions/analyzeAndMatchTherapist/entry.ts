import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get date range — last 21 days
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 21);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = today.toISOString().slice(0, 10);

    // Fetch all relevant data in parallel
    const [checkins, behaviorLogs, journals, childProfiles, professionals] = await Promise.all([
      base44.entities.CheckIn.filter({ created_by: user.email }, '-created_date', 60),
      base44.entities.BehaviorLog.filter({ created_by: user.email }, '-created_date', 100),
      base44.entities.ParentJournal.list('-created_date', 60),
      base44.entities.ChildProfile.list('-created_date', 10),
      base44.asServiceRole.entities.ProfessionalListing.list('-rating', 50),
    ]);

    // Filter to last 21 days
    const recentCheckins = checkins.filter(c => c.created_date?.slice(0, 10) >= startStr);
    const recentLogs = behaviorLogs.filter(b => b.created_date?.slice(0, 10) >= startStr);
    const recentJournals = journals.filter(j => (j.entry_date || j.created_date?.slice(0, 10)) >= startStr);

    if (recentCheckins.length < 5) {
      return Response.json({
        ready: false,
        message: `You have ${recentCheckins.length} check-ins in the last 21 days. Please log at least 5 to get a therapist match. Keep going — you're building something important.`,
        days_logged: recentCheckins.length,
      });
    }

    // Compute summary stats
    const avgChildReg = recentCheckins.length
      ? (recentCheckins.reduce((s, c) => s + (c.child_regulation || 5), 0) / recentCheckins.length).toFixed(1)
      : null;
    const avgParentCalm = recentCheckins.length
      ? (recentCheckins.reduce((s, c) => s + (c.parent_calm || 5), 0) / recentCheckins.length).toFixed(1)
      : null;

    // Aggregate triggers
    const triggerCount = {};
    recentLogs.forEach(log => {
      (log.triggers || []).forEach(t => { triggerCount[t] = (triggerCount[t] || 0) + 1; });
    });
    const topTriggers = Object.entries(triggerCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

    // Aggregate behaviors
    const behaviorCount = {};
    recentLogs.forEach(log => {
      (log.behaviors || []).forEach(b => { behaviorCount[b] = (behaviorCount[b] || 0) + 1; });
    });
    const topBehaviors = Object.entries(behaviorCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([b]) => b);

    // Extract child profile context
    const childContext = childProfiles.slice(0, 3).map(c =>
      `${c.first_name}, age ${c.age || '?'}, placement: ${c.placement_type || 'unknown'}. Concerns: ${c.concerns || 'none noted'}. Triggers: ${c.triggers || 'none noted'}.`
    ).join('\n');

    // Build professional catalog for the AI to choose from
    const proList = professionals.filter(p => p.specialty === 'therapist' || p.specialty === 'counselor' || p.specialty === 'coach').slice(0, 20);
    const proCatalog = proList.map((p, i) =>
      `[${i}] ID:${p.id} | ${p.full_name} | ${p.title || p.specialty} | Tags: ${(p.tags || []).join(', ')} | Location: ${p.location || 'Unknown'} | Virtual: ${p.virtual_available ? 'Yes' : 'No'} | Insurance: ${p.accepts_insurance ? 'Yes' : 'No'} | Sliding Scale: ${p.offers_sliding_scale ? 'Yes' : 'No'} | Experience: ${p.years_experience || '?'} yrs | Rating: ${p.rating || 'N/A'}`
    ).join('\n');

    const journalMoods = recentJournals.map(j => j.mood).filter(Boolean);
    const moodSummary = journalMoods.length
      ? `Most frequent moods: ${[...new Set(journalMoods)].slice(0, 5).join(', ')}`
      : 'No mood data';

    const prompt = `
You are a trauma-informed clinical intake specialist at the Rooted 21 Parenting Network.
A parent has completed ${recentCheckins.length} daily check-ins over the last 21 days. Analyze their behavioral data and match them to the 2-3 BEST-FIT professionals from the directory below.

=== FAMILY BEHAVIORAL DATA (Last 21 Days) ===
Check-ins logged: ${recentCheckins.length}
Average child regulation score (1-10): ${avgChildReg}
Average parent calm score (1-10): ${avgParentCalm}
Behavior logs submitted: ${recentLogs.length}
Top child triggers: ${topTriggers.length ? topTriggers.join(', ') : 'not identified yet'}
Top behaviors observed: ${topBehaviors.length ? topBehaviors.join(', ') : 'not identified yet'}
Parent mood trend: ${moodSummary}
Journal entries: ${recentJournals.length}

=== CHILD PROFILES ===
${childContext || 'No child profiles created yet.'}

=== AVAILABLE PROFESSIONALS ===
${proCatalog || 'No professionals currently in directory.'}

=== YOUR TASK ===
1. Analyze the family's behavioral patterns, trigger profile, regulation scores, and child needs.
2. Select 2-3 professionals from the list above whose specialties, tags, and approach BEST match this family's specific needs.
3. For EACH match, write a personalized explanation (2-3 sentences) of WHY this professional is a good fit — reference specific data points from the family's report (e.g., "Given the recurring transition triggers and low regulation scores, ${'{name}'} specializes in...").
4. If fewer than 2 professionals exist in the directory, acknowledge this warmly and suggest what type of professional to look for.
5. Rate each match: "Strong Match", "Good Match", or "Possible Match".

Return ONLY valid JSON in this exact format:
{
  "summary": "2-3 sentence plain-language summary of the family's behavioral profile and primary support needs",
  "matches": [
    {
      "professional_id": "the ID from the catalog above",
      "match_strength": "Strong Match" | "Good Match" | "Possible Match",
      "why_this_match": "Personalized explanation referencing their data"
    }
  ],
  "focus_areas": ["area1", "area2", "area3"],
  "next_step": "One specific action the parent can take this week to get support"
}
`;

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                professional_id: { type: "string" },
                match_strength: { type: "string" },
                why_this_match: { type: "string" },
              }
            }
          },
          focus_areas: { type: "array", items: { type: "string" } },
          next_step: { type: "string" },
        }
      }
    });

    // Hydrate matches with full professional data
    const hydratedMatches = (aiResult.matches || []).map(match => {
      const pro = professionals.find(p => p.id === match.professional_id);
      return { ...match, professional: pro || null };
    }).filter(m => m.professional);

    return Response.json({
      ready: true,
      summary: aiResult.summary,
      matches: hydratedMatches,
      focus_areas: aiResult.focus_areas || [],
      next_step: aiResult.next_step || '',
      stats: {
        days_logged: recentCheckins.length,
        avg_child_regulation: avgChildReg,
        avg_parent_calm: avgParentCalm,
        behavior_logs: recentLogs.length,
        top_triggers: topTriggers,
        top_behaviors: topBehaviors,
        date_range: { start: startStr, end: endStr },
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});