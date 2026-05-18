import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CRISIS_TERMS = [
  'suicide', 'kill myself', 'kill my child', 'hurt myself', 'hurt my child',
  'self harm', 'self-harm', 'overdose', 'unsafe right now', 'in danger',
  'abuse happening', 'emergency', 'weapon'
];

const MODULE_GUIDANCE = {
  '/daily-checkin': 'Daily check-ins: mood, behavior notes, parent calm, child regulation, photos/documents when helpful.',
  '/behavior-logs': 'Behavior logging: meltdowns, successes, school issues, mood changes, triggers, response, and outcome.',
  '/case-plan-checklist': 'Case-plan progress: court tasks, parenting classes, therapy, drug tests, certificates, deadlines, and reminders.',
  '/visitation-tracker': 'Visitation logging: start/end visit, attendance, activities, how the visit went, notes, photos, time, and location.',
  '/court-preparation-checklist': 'Court prep: hearing countdowns, documentation, case-plan progress, and what to bring.',
  '/court-ready-export': 'Court-ready export: time-stamped logs, authentication codes, and printable packets for court or attorneys.',
  '/certified-legal-export': 'Certified legal export: authentication-coded communication and document packets.',
  '/documents': 'Document vault: IEPs, 504 plans, court orders, evaluations, discipline notices, medical and school records.',
  '/education-hub': 'Education support: IEP/504 meeting prep, special education questions, and document organization.',
  '/medication-manager': 'Medication tracking: appointments, doses, side effects, symptoms, and mood patterns.',
  '/family-safety-crisis-plan': 'Safety planning: warning signs, coping tools, safe contacts, local crisis support, and 988.',
  '/peer-support': 'Peer support: parent-partner encouragement, Ohio START peer mentors, OhioKAN navigators, and safe connection.',
  '/housing-resources': 'Housing, benefits, and financial help: Section 8 inspections, recertification reminders, SNAP, WIC, TANF, Medicaid, childcare subsidies, fair-housing scripts, shelters, rapid rehousing, and zip-code based local help.',
  '/rights-card': 'Legal and rights education: Ohio Resource Family Bill of Rights, missing child information tracking, mandated-reporter hotline 1-855-OH-CHILD, and Ohio Legal Help self-help forms and clinics.',
  '/court-rights-education': 'Legal aid and self-help: Ohio Legal Help, court forms, custody modification education, protection-order information, legal clinics, and rights documentation.'
};

function getModuleContext(path = '') {
  const match = Object.keys(MODULE_GUIDANCE).find(key => path.startsWith(key));
  return match ? MODULE_GUIDANCE[match] : 'General Rooted 21 support: help the user find the right tool, log information, prepare documents, and stay safe.';
}

function hasCrisisLanguage(text = '') {
  const lower = text.toLowerCase();
  return CRISIS_TERMS.some(term => lower.includes(term));
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
    const moduleLabel = String(payload.moduleLabel || 'this part of the app');
    const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];
    const userZip = user?.housing_resources_zip || user?.zip_code || '';

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    if (hasCrisisLanguage(message)) {
      return Response.json({
        reply: "I’m really glad you said something. If you are in immediate danger call 911 or emergency services. If you might hurt yourself or feel like you cannot stay safe, call or text 988 now. You can also contact your local mobile-crisis team.\n\nTake one small step: move away from weapons, medicine, or anything dangerous. If you can, go near another safe adult and say: “I need help staying safe right now.”\n\nAfter safety is handled, I can help you write down what happened or open your safety plan. You are not alone.",
        crisis: true,
        suggestions: ['Open my safety plan', 'Help me find crisis contacts', 'What should I write down after this?']
      });
    }

    const moduleContext = getModuleContext(modulePath);
    const prompt = `You are Moxie, the AI helper inside Rooted 21.\n\nCore safety boundaries:\n- NEVER diagnose a user, child, caregiver, co-parent, or family member.\n- NEVER provide legal advice or tell someone what legal action to take.\n- NEVER replace therapists, doctors, crisis workers, attorneys, caseworkers, or emergency services.\n- NEVER make custody recommendations, predict custody outcomes, or suggest who should have custody.\n- NEVER present yourself as a professional clinician, attorney, crisis worker, or court expert.\n\nWhat Moxie MAY do:\n- Educate in plain language.\n- Organize information, timelines, notes, and documents.\n- Encourage users with calm, supportive wording.\n- Explain systems and common process steps without giving legal advice.\n- Help users prepare questions, forms, logs, and document packets.\n- Provide coping tools and grounding steps.\n- Guide users toward appropriate support people and emergency resources.\n\nRequired safety sentence:\n- Always include this exact sentence in every reply: “If you are in immediate danger call 911 or emergency services.”\n\nTone rules:\n- Trauma-informed, warm, calm, emotionally safe, and nonjudgmental.\n- Write at about a 6th-grade reading level. Use short sentences.\n- Be culturally responsive and respectful of family voice, kinship care, foster care, recovery, and court stress.\n- Use phrases like “you may want to ask,” “a support person may help,” and “one next step could be.”\n- If legal, medical, therapy, crisis, or custody topics appear, gently redirect to the right professional while still helping organize information.\n- If danger, abuse, self-harm, overdose, violence, or immediate safety risk appears, tell the user to call 911 first and call/text 988 when mental-health crisis support is needed.\n- Give practical next steps inside Rooted 21.\n- Mention privacy gently when helpful: logs are time-stamped and can support documentation.\n- Keep replies under 180 words unless the user asks for more.\n\nCurrent module: ${moduleLabel}\nModule context: ${moduleContext}\nKnown user ZIP, if available: ${userZip || 'not saved — ask for ZIP when local resources are needed'}\n\nRecent chat:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser message: ${message}\n\nAnswer as Moxie. End with 2 short suggested next actions.`;

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
      suggestions: Array.isArray(reply.suggestions) ? reply.suggestions.slice(0, 3) : []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});