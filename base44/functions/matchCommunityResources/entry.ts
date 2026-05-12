import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { county, child_age, primary_need } = await req.json();

    if (!county || !child_age || !primary_need) {
      return Response.json(
        { error: 'Missing required fields: county, child_age, primary_need' },
        { status: 400 }
      );
    }

    // Fetch saved resources for this user
    const savedResources = await base44.entities.SavedResource.filter(
      { owner_email: user.email },
      '-created_date',
      100
    );

    // Fetch all community resources (for matching)
    const allResources = await base44.entities.SavedResource.list('-created_date', 500);

    // Build context for LLM matching
    const resourcesContext = allResources
      .slice(0, 50)
      .map(r => `${r.resource_name} (${r.resource_type}): ${r.description || ''} in ${r.location_label || 'unknown location'}`)
      .join('\n');

    // Use LLM to match resources based on user needs
    const matchingPrompt = `
You are a resource matching specialist for foster/adoptive families and children in crisis.

User Profile:
- County: ${county}
- Child's Age: ${child_age}
- Primary Need: ${primary_need}

Available Resources Database:
${resourcesContext}

Based on the user's primary need and location, recommend the TOP 5 most relevant resources from the database.
For each recommendation:
1. Resource name
2. Type (therapist, support group, food pantry, etc.)
3. Why it matches their need
4. Priority level (High/Medium/Low)
5. Contact method (phone, website, visit)

Format as a structured list. Only recommend resources that match the county or nearby areas.`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: matchingPrompt,
      add_context_from_internet: true,
    });

    // Fetch details for top matching resources to return with full contact info
    const relevantResources = allResources.filter(r => {
      const normalizedType = r.resource_type?.toLowerCase() || '';
      const normalizedNeed = primary_need.toLowerCase();
      
      return (
        (normalizedType.includes(normalizedNeed) || normalizedNeed.includes(normalizedType)) &&
        (!r.zip_code || r.zip_code === county.slice(-5))
      );
    }).slice(0, 10);

    return Response.json({
      ai_recommendations: llmResponse,
      matched_resources: relevantResources.map(r => ({
        id: r.id,
        name: r.resource_name,
        type: r.resource_type,
        phone: r.phone,
        website: r.website,
        address: r.address,
        location_label: r.location_label,
        description: r.description,
        is_saved: !!savedResources.find(sr => sr.id === r.id),
      })),
      search_params: { county, child_age, primary_need },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});