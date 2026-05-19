import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_MAP = {
  court: ['legal_aid', 'casa', 'fcfc', 'other'],
  cps: ['legal_aid', 'parenting', 'fcfc', 'casa', 'other'],
  housing: ['housing', 'shelter', 'utilities', 'transportation'],
  food: ['food', 'snap_wic', 'medicaid'],
  domestic_violence: ['domestic_violence', 'shelter', 'legal_aid'],
  behavior: ['mental_health', 'ohiorise', 'education', 'parenting'],
  school: ['education', 'mental_health', 'ohiorise'],
  medical: ['medicaid', 'mental_health', 'ohiorise'],
  recovery: ['recovery', 'mental_health', 'transportation'],
  transportation: ['transportation', 'fcfc', 'other'],
  other: ['other', 'fcfc', 'parenting']
};

function scoreResource(resource, intake) {
  let score = 0;
  const wanted = CATEGORY_MAP[intake.crisis_type] || CATEGORY_MAP.other;
  if (wanted.includes(resource.category)) score += 40;
  if (resource.county?.toLowerCase() === intake.county?.toLowerCase()) score += 25;
  if (resource.zip_code && resource.zip_code === intake.zip_code) score += 15;
  if (resource.service_area_zips?.includes?.(intake.zip_code)) score += 15;
  if (resource.crisis_priority) score += 12;
  if (resource.verification_status === 'verified') score += 8;
  if (resource.phone) score += 4;
  if (resource.website) score += 3;
  return score;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const intake = await req.json();

    if (!intake.county || !intake.crisis_type || !intake.situation_summary) {
      return Response.json({ error: 'Please include crisis type, county, and situation summary.' }, { status: 400 });
    }

    const categories = CATEGORY_MAP[intake.crisis_type] || CATEGORY_MAP.other;
    const resources = await base44.asServiceRole.entities.ResourceListing.list('-updated_date', 300);
    const rankedResources = resources
      .map(resource => ({ ...resource, match_score: scoreResource(resource, intake) }))
      .filter(resource => resource.match_score > 0 && (categories.includes(resource.category) || resource.county?.toLowerCase() === intake.county?.toLowerCase()))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 8)
      .map(resource => ({
        name: resource.name,
        category: resource.category,
        county: resource.county,
        city: resource.city,
        phone: resource.phone,
        website: resource.website,
        address: resource.address,
        description: resource.description_en,
        score: resource.match_score,
        crisis_priority: resource.crisis_priority === true
      }));

    const prompt = `Create a trauma-informed family crisis support plan. Do not give legal advice or medical advice. Use plain language, prioritize safety, and rank steps by urgency.

Current situation:
- Crisis type: ${intake.crisis_type}
- County: ${intake.county}
- City: ${intake.city || 'not provided'}
- ZIP: ${intake.zip_code || 'not provided'}
- Child age: ${intake.child_age || 'not provided'}
- Urgency: ${intake.urgency_level || 'this_week'}
- Safety concern: ${intake.safety_concern ? 'yes' : 'no'}
- Summary: ${intake.situation_summary}
- Already tried: ${intake.support_already_tried || 'not provided'}

Available local resources:
${rankedResources.map((r, i) => `${i + 1}. ${r.name} (${r.category}) - ${r.county || ''} ${r.city || ''} - ${r.phone || ''} - ${r.website || ''} - ${r.description || ''}`).join('\n')}

Return ranked next steps and explain why each selected resource fits.`;

    const plan = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          safety_note: { type: 'string' },
          ranked_steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'number' },
                title: { type: 'string' },
                why: { type: 'string' },
                action: { type: 'string' },
                timeframe: { type: 'string' }
              }
            }
          },
          resource_notes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                resource_name: { type: 'string' },
                why_it_matches: { type: 'string' },
                suggested_first_contact: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const saved = await base44.asServiceRole.entities.CrisisIntake.create({
      owner_email: user.email,
      crisis_type: intake.crisis_type,
      county: intake.county,
      city: intake.city || '',
      zip_code: intake.zip_code || '',
      child_age: intake.child_age || '',
      urgency_level: intake.urgency_level || 'this_week',
      safety_concern: intake.safety_concern === true,
      situation_summary: intake.situation_summary,
      support_already_tried: intake.support_already_tried || '',
      ranked_steps_json: JSON.stringify(plan.ranked_steps || []),
      ranked_resources_json: JSON.stringify(rankedResources)
    });

    return Response.json({ intake_id: saved.id, plan, resources: rankedResources });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});