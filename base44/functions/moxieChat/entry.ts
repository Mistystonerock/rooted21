import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CRISIS_TERMS = [
  'suicide', 'kill myself', 'kill my child', 'hurt myself', 'hurt my child', 'hurt someone',
  'self harm', 'self-harm', 'overdose', 'unsafe right now', 'in danger', 'immediate danger',
  'abuse happening', 'emergency', 'weapon', 'domestic violence', 'child is not safe'
];

const MODE_PATHS = {
  crisis_sos: ['/sos', '/emergency-toolbox', '/family-safety-crisis-plan', '/safe-screen'],
  court_form_guidance: ['/legal', '/court', '/case-plan', '/documents', '/form-helper', '/protective-order', '/rights-card'],
  resource_finder: ['/resources', '/housing', '/local', '/community-resources', '/resource-matcher'],
  school_iep_support: ['/education', '/school', '/iep', '/child-profile'],
  founder_admin: ['/founder', '/resource-management', '/app-docs'],
};

function inferMode(path = '') {
  for (const [mode, paths] of Object.entries(MODE_PATHS)) {
    if (paths.some(item => path.startsWith(item))) return mode;
  }
  return 'parenting_support';
}

function hasCrisisLanguage(text = '') {
  const lower = text.toLowerCase();
  return CRISIS_TERMS.some(term => lower.includes(term));
}

function resourceIsOutdated(resource) {
  if (!resource.verified_at) return true;
  return Date.now() - new Date(resource.verified_at).getTime() > 60 * 24 * 60 * 60 * 1000;
}

function formatResources(resources = []) {
  return resources.slice(0, 8).map(resource => ({
    name: resource.name,
    category: resource.category,
    county_state: `${resource.county || 'Statewide'}, ${resource.state || 'OH'}`,
    phone: resource.phone || 'Call or visit website to confirm',
    website: resource.website || resource.source_url || '',
    last_verified_date: resource.verified_at || 'Needs verification',
    emergency_availability: resource.crisis_priority ? 'May support urgent needs' : 'Call first to confirm availability',
    verification_status: resource.verification_status,
    may_need_verification: resourceIsOutdated(resource),
    next_step: resource.phone ? 'Call before going.' : 'Visit the website or call a local hotline for the next step.',
  }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const message = String(payload.message || '').trim();
    const modulePath = String(payload.modulePath || '');
    const moduleLabel = String(payload.moduleLabel || 'Rooted 21');
    const requestedMode = String(payload.mode || inferMode(modulePath));
    const mode = requestedMode === 'founder_admin' && !['admin', 'founder'].includes(user.role) ? inferMode(modulePath) : requestedMode;
    const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];
    const userZip = user?.housing_resources_zip || user?.zip_code || '';
    const familyBackgroundRecords = await base44.entities.FamilyBackground.filter({ owner_email: user.email }, '-updated_date', 1);
    const familyBackground = familyBackgroundRecords[0]?.consent_to_use_with_moxie === true ? familyBackgroundRecords[0] : null;

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    if (requestedMode === 'founder_admin' && !['admin', 'founder'].includes(user.role)) {
      return Response.json({
        reply: 'I can help with general Rooted 21 support, but Founder/Admin Moxie is only available to authorized admin roles.',
        crisis: false,
        mode,
        suggestions: ['Help me find the right tool', 'Show safety resources']
      });
    }

    if (hasCrisisLanguage(message)) {
      return Response.json({
        reply: 'If you or someone else is in immediate danger, call 911 now.\n\nYou can also call or text 988 for the Suicide & Crisis Lifeline, call 1-800-222-1222 for Poison Control, or contact the National Domestic Violence Hotline at 1-800-799-7233 or text START to 88788.\n\nRight now, move away from weapons, medicine, or anything dangerous if you can. Go near a safe adult or public place and say: “I need help staying safe right now.”',
        crisis: true,
        mode: 'crisis_sos',
        suggestions: ['Open my safety plan', 'Help me find crisis contacts', 'Ground me for 60 seconds']
      });
    }

    const config = {
      mode,
      system_instructions: `Moxie AI is Rooted 21's trauma-informed assistant system. Specialized mode: ${mode}. Be warm, calm, human, supportive, clear, plain-language, nonjudgmental, and encouraging. Use short paragraphs and step-by-step guidance. Never diagnose, provide legal advice, replace an attorney, therapist, caseworker, crisis service, or doctor, make custody recommendations, predict court outcomes, guarantee outcomes, tell users to ignore court orders, encourage unsafe contact with an abuser, expose private information, invent resources, or shame addiction, CPS involvement, poverty, trauma, incarceration, or parenting struggles. If the user mentions immediate danger, abuse happening now, suicidal thoughts, wanting to harm someone, domestic violence danger, child safety emergency, overdose, or medical emergency, say: “If you or someone else is in immediate danger, call 911 now.” Also show 988, Poison Control 1-800-222-1222, and National Domestic Violence Hotline 1-800-799-7233 or text START to 88788. For court/form topics, always include: “Moxie provides legal information and court-form guidance, not legal advice. For legal advice about your case, contact an attorney or the court clerk.” For school/IEP topics, do not claim to replace an education attorney or advocate. For resources, use only provided verified Rooted 21 resources, official government sites, trusted nonprofits, legal aid, crisis hotlines, or approved partner agencies. Response structure: warm validation, plain-language explanation, next steps, resource/checklist if needed, and safety/legal/medical disclaimer if needed.`
    };

    let familyContext = '';
    if (familyBackground) {
      familyContext = `\nPrivate family background provided by the caregiver. Use this quietly to understand context and personalize support. Do not repeat sensitive details unless the user asks or it is needed for safety. Never diagnose from this history.\n${JSON.stringify({
        family_storyline: familyBackground.family_storyline || '',
        family_strengths: familyBackground.family_strengths || '',
        mental_health_history: familyBackground.mental_health_history || '',
        trauma_history: familyBackground.trauma_history || '',
        child_context: familyBackground.child_context || '',
        triggers_patterns: familyBackground.triggers_patterns || '',
        calming_supports: familyBackground.calming_supports || '',
        important_people: familyBackground.important_people || '',
        cultural_context: familyBackground.cultural_context || '',
        moxie_notes: familyBackground.moxie_notes || ''
      })}`;
    }

    let resourceContext = '';
    if (mode === 'resource_finder') {
      const resources = await base44.entities.ResourceListing.list('-verified_at', 80);
      const activeResources = resources.filter(resource => resource.verification_status !== 'archived');
      resourceContext = `\nAvailable Rooted 21 resource records. Do not invent resources. Use only these if giving specific local resources:\n${JSON.stringify(formatResources(activeResources))}`;
    }

    const prompt = `${config.system_instructions}\n\nCurrent mode: ${config.mode}\nCurrent module: ${moduleLabel}\nKnown user ZIP, if available: ${userZip || 'not saved — ask for ZIP/county when local resources are needed'}\nUser role: ${user.role || 'user'}\n${familyContext}\n${user.role === 'founder' ? 'Founder access: allowed for founder-only operational summaries if explicitly requested.' : 'Founder-only analytics/admin management: not allowed.'}\n${resourceContext}\n\nRecent chat:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser message: ${message}\n\nAnswer as Moxie AI. Return JSON only.`;

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          suggestions: { type: 'array', items: { type: 'string' } }
        },
        required: ['reply', 'suggestions']
      }
    });

    return Response.json({
      reply: reply.reply,
      crisis: false,
      mode: config.mode,
      suggestions: Array.isArray(reply.suggestions) ? reply.suggestions.slice(0, 3) : []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});