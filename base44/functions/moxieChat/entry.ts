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

const TRAFFICKING_TERMS = [
  'trafficking', 'trafficked', 'being sold', 'forced to work', 'forced to have sex',
  'someone is controlling me', 'they took my id', 'took my passport', 'cannot leave',
  "can't leave", 'owe them money', 'forced me', 'pimp', 'being exploited', 'held against',
  'they threaten', 'making me do things'
];

function hasTraffickingLanguage(text = '') {
  const lower = text.toLowerCase();
  return TRAFFICKING_TERMS.some(term => lower.includes(term));
}

const TRAFFICKING_SYSTEM_INSTRUCTIONS = `Moxie AI is Rooted 21's trauma-informed assistant, now in the Human Trafficking Survivor Support crisis protocol. The person may be a survivor or worried about someone they care about. Be exceptionally gentle, calm, warm, patient, and nonjudgmental. Safety comes first, education second, and documentation only if the user asks and it is safe.

LANGUAGE RULES (strict):
- NEVER ask "Are you being trafficked?" or ask them to label or prove what is happening.
- Use gentle framing like: "Are you worried someone is controlling, threatening, pressuring, or exploiting you or someone you care about?"
- Never pressure the person to disclose details, name anyone, or explain what happened. Let them share only what they choose.
- Lead with safety and choices, not questions that force disclosure.
- Reassure them it is not their fault and they are not in trouble.

ALWAYS PRIORITIZE SAFETY:
- If there is any sign of immediate danger, say: "If you or someone else is in immediate danger, call 911 now."
- Offer the National Human Trafficking Hotline: call 1-888-373-7888, text 233733, or chat at humantraffickinghotline.org/en/chat (free, confidential, 24/7).
- Remind them the hotline does not require them to share their name or explain everything.
- Mention they can use Quick Exit or Safe Screen to leave the page instantly, and the secure SOS to alert only the contacts they have chosen.

BOUNDARIES: Never diagnose, give legal advice, promise outcomes, encourage unsafe contact with someone who is hurting them, or expose private information. Do not push documentation; only mention keeping notes if the user brings it up and only if it feels safe to them.

Response structure: gentle validation, one small next step focused on safety and choice, hotline/crisis options when relevant, and a reminder that they are in control of what they share.`;

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

function shortText(value = '', limit = 700) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function formatLifeStory(entries = []) {
  return entries.slice(0, 12).map(entry => ({
    child_name: entry.child_name,
    event_type: entry.entry_type,
    title: entry.title,
    date: entry.date,
    age_at_event: entry.age_at_event,
    linked_milestone: entry.linked_milestone || '',
    emotional_tone: entry.emotional_tone,
    story_summary: shortText(entry.description, 450),
    journal_summary: shortText(entry.journal_entry, 450),
    sensitive: !!entry.is_sensitive
  }));
}

function formatCaseHistory(cases = [], notes = []) {
  return cases.slice(0, 8).map(caseFile => ({
    child_name: caseFile.child_name,
    case_type: caseFile.case_type,
    status: caseFile.status,
    case_number: caseFile.case_number || '',
    next_milestone: caseFile.next_milestone || '',
    next_milestone_date: caseFile.next_milestone_date || '',
    key_issues: Array.isArray(caseFile.key_issues) ? caseFile.key_issues.slice(0, 6) : [],
    description: shortText(caseFile.description, 500),
    recent_notes: notes
      .filter(note => note.case_id === caseFile.id)
      .slice(0, 4)
      .map(note => ({ type: note.note_type, title: note.title || '', body: shortText(note.body, 350) }))
  }));
}

function formatMentalHealthDocuments(documents = []) {
  return documents.slice(0, 8).map(doc => ({
    title: doc.title,
    category: doc.category,
    child_name: doc.child_name || '',
    permission_segment: doc.permission_segment || '',
    part2_segmented: !!doc.part2_segmented,
    summary: shortText(doc.analysis_summary || doc.description, 500),
    extracted_requirements: Array.isArray(doc.extracted_requirements) ? doc.extracted_requirements.slice(0, 5) : []
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
    const [familyBackgroundRecords, lifeStoryEntries, caseFiles, caseNotes, secureDocuments] = await Promise.all([
      base44.entities.FamilyBackground.filter({ owner_email: user.email }, '-updated_date', 1),
      base44.entities.LifeStoryEntry.filter({ owner_email: user.email }, '-date', 40),
      base44.entities.CaseFile.filter({ parent_email: user.email }, '-updated_date', 20),
      base44.entities.CaseNote.filter({ case_owner_email: user.email }, '-created_date', 60),
      base44.entities.SecureDocument.filter({ owner_email: user.email }, '-updated_date', 50)
    ]);
    const familyBackground = familyBackgroundRecords[0]?.consent_to_use_with_moxie === true ? familyBackgroundRecords[0] : null;
    const mentalHealthDocuments = secureDocuments.filter(doc => ['behavioral_health', 'medical', 'therapy', 'substance_use', 'safety_plan'].includes(doc.category) || ['behavioral_health', 'substance_use', 'safety', 'medical'].includes(doc.permission_segment));

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

    if (requestedMode === 'trafficking_crisis' || hasTraffickingLanguage(message)) {
      if (hasCrisisLanguage(message)) {
        return Response.json({
          reply: 'If you or someone else is in immediate danger, call 911 now.\n\nYou are not alone and this is not your fault. The National Human Trafficking Hotline is free, confidential, and available 24/7 — you do not have to share your name or explain everything:\n• Call 1-888-373-7888\n• Text 233733\n• Chat at humantraffickinghotline.org/en/chat\n\nYou can use Quick exit or Safe screen at the top to leave this page instantly.',
          crisis: true,
          mode: 'trafficking_crisis',
          suggestions: ['Open safety planning', 'Show me safe contact options', 'Ground me for 60 seconds']
        });
      }

      const traffickingPrompt = `${TRAFFICKING_SYSTEM_INSTRUCTIONS}\n\nCurrent module: ${moduleLabel}\n\nRecent chat:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser message: ${message}\n\nAnswer as Moxie AI in the Human Trafficking Survivor Support crisis protocol. Return JSON only.`;
      const traffickingReply = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: traffickingPrompt,
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
        reply: traffickingReply.reply,
        crisis: false,
        mode: 'trafficking_crisis',
        suggestions: Array.isArray(traffickingReply.suggestions) ? traffickingReply.suggestions.slice(0, 3) : ['Show hotline options', 'Open safety planning', 'Help me feel calmer']
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

    let privateFamilyContext = '';
    if (familyBackground) {
      privateFamilyContext = `\nPrivate family context provided by the caregiver and saved family records. Use this quietly to understand patterns, history, strengths, trauma, mental health context, and case background. Do not repeat sensitive details unless the user asks or it is needed for immediate safety. Never diagnose, label, or treat this history as proof; use it only to personalize support and ask better questions.\n${JSON.stringify({
        caregiver_background: {
          family_storyline: shortText(familyBackground.family_storyline, 900),
          family_strengths: shortText(familyBackground.family_strengths, 700),
          mental_health_history: shortText(familyBackground.mental_health_history, 900),
          trauma_history: shortText(familyBackground.trauma_history, 900),
          child_context: shortText(familyBackground.child_context, 900),
          triggers_patterns: shortText(familyBackground.triggers_patterns, 700),
          calming_supports: shortText(familyBackground.calming_supports, 700),
          important_people: shortText(familyBackground.important_people, 500),
          cultural_context: shortText(familyBackground.cultural_context, 500),
          moxie_notes: shortText(familyBackground.moxie_notes, 700)
        },
        life_story_timeline: formatLifeStory(lifeStoryEntries),
        case_history: formatCaseHistory(caseFiles, caseNotes),
        mental_health_and_trauma_related_documents: formatMentalHealthDocuments(mentalHealthDocuments)
      })}`;
    }

    let resourceContext = '';
    if (mode === 'resource_finder') {
      const resources = await base44.entities.ResourceListing.list('-verified_at', 80);
      const activeResources = resources.filter(resource => resource.verification_status !== 'archived');
      resourceContext = `\nAvailable Rooted 21 resource records. Do not invent resources. Use only these if giving specific local resources:\n${JSON.stringify(formatResources(activeResources))}`;
    }

    const prompt = `${config.system_instructions}\n\nCurrent mode: ${config.mode}\nCurrent module: ${moduleLabel}\nKnown user ZIP, if available: ${userZip || 'not saved — ask for ZIP/county when local resources are needed'}\nUser role: ${user.role || 'user'}\n${privateFamilyContext}\n${user.role === 'founder' ? 'Founder access: allowed for founder-only operational summaries if explicitly requested.' : 'Founder-only analytics/admin management: not allowed.'}\n${resourceContext}\n\nRecent chat:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser message: ${message}\n\nAnswer as Moxie AI. Return JSON only.`;

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