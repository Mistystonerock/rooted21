export const DEFAULT_TUTORIALS = [
  {
    section_id: "dashboard",
    audience: "both",
    title: "Rooted 21 Guided Start",
    description: "A short, reassuring voice-guided tour of the most important tools.",
    emoji: "🌿",
    path: "/dashboard",
    steps: [
      { title: "Your calm home base", narration: "Welcome. This quick tour will gently show you the places families use most: SOS support, check-ins, behavior tools, education guides, resources, and support hubs. You can skip or replay this anytime.", prompt: "Start here when you want a calm overview.", button_label: "Open Dashboard", path: "/dashboard" },
      { title: "SOS support", narration: "The SOS button is for moments when you need help right now. If anyone is in immediate danger, call 911. If there is a mental health crisis, call or text 988.", prompt: "This button opens immediate support tools.", targetElementId: "sos-button", button_label: "Open SOS", path: "/sos" },
      { title: "Daily Check-In", narration: "Check-ins help you notice how your child is doing and how you are doing. There is no judgment here. Small notes can reveal patterns over time.", prompt: "Use this when you want to track today’s regulation and calm.", targetElementId: "checkin-button", button_label: "Open Check-In", path: "/daily-checkin" },
      { title: "Behavior tools", narration: "Behavior tools help you record triggers, responses, and what helped your child return to safety. The goal is understanding, not blame.", prompt: "Use this area to track patterns and supports.", targetElementId: "behavior-log-button", button_label: "Open Behavior Hub", path: "/behavior-hub" },
      { title: "Education guides", narration: "The Education Hub gives you trauma-informed lessons, guides, worksheets, and classes at your own pace. You can learn in small steps whenever you are ready.", prompt: "Explore guides that support you and your child.", targetElementId: "education-hub-button", button_label: "Open Education Hub", path: "/education-hub" },
      { title: "Resources", narration: "Resources brings practical help together: housing, medical care, legal support, jobs, benefits, substance support, and local services.", prompt: "Use this when you need real-world help nearby.", targetElementId: "resources-button", button_label: "Open Resources", path: "/resources" },
      { title: "Support Hub", narration: "The Support Hub is where you can find crisis tools, supportive conversations, and team contacts. You are not expected to carry everything alone.", prompt: "Use this when you want connection, guidance, or next steps.", targetElementId: "support-hub-button", button_label: "Open Support Hub", path: "/support-hub" },
      { title: "Replay anytime", narration: "You can return to these walkthroughs anytime. Support is here when you need a reminder, not only on the first day.", prompt: "Tap replay whenever you want to practice again.", button_label: "Finish", path: "/training-videos" }
    ]
  },
  {
    section_id: "sos",
    audience: "parent",
    title: "SOS Help Me Right Now",
    description: "Practice finding immediate support during hard moments.",
    emoji: "🆘",
    path: "/chat?crisis=1",
    steps: [
      { title: "When things are escalating", narration: "The SOS button is for moments when you need support fast. It helps you slow down, regulate, and choose one safe next step.", prompt: "Find the Help Me Right Now button.", button_label: "Open SOS", path: "/chat?crisis=1" },
      { title: "Safety first", narration: "If anyone is in immediate danger, call 911. If there is a mental health crisis, call or text 988. The app supports you, but emergency help comes first.", prompt: "Read the crisis reminder before continuing.", button_label: "I understand", path: "/chat?crisis=1" }
    ]
  },
  {
    section_id: "daily-checkin",
    audience: "parent",
    title: "Daily Check-In",
    description: "Track regulation and patterns in under a minute.",
    emoji: "✅",
    path: "/daily-checkin",
    steps: [
      { title: "A tiny daily rhythm", narration: "The daily check-in helps you capture how your child is doing and how you are doing. Small entries become patterns over time.", prompt: "Tap Daily Check-In from your dashboard.", button_label: "Open Check-In", path: "/daily-checkin" },
      { title: "No judgment", narration: "There is no perfect score here. The goal is noticing, not blaming. Honest tracking helps you and your support team understand what is changing.", prompt: "Choose the answer that fits today.", button_label: "Practice step", path: "/daily-checkin" }
    ]
  },
  {
    section_id: "behavior-logs",
    audience: "both",
    title: "Behavior Logs",
    description: "Record triggers, responses, and what helped.",
    emoji: "🧠",
    path: "/behavior-logs",
    steps: [
      { title: "Behavior is communication", narration: "Behavior logs help you capture what happened before, during, and after a hard moment. This helps reveal patterns without shame.", prompt: "Look for Add Behavior Log.", button_label: "Open Logs", path: "/behavior-logs" },
      { title: "What helped?", narration: "The most useful part is noting what helped your child return to safety. Over time, the app can show which supports work best.", prompt: "Add a response or calming strategy.", button_label: "Next", path: "/behavior-logs" }
    ]
  },
  {
    section_id: "safety-plans",
    audience: "both",
    title: "Safety Plans",
    description: "Create a clear plan before a crisis happens.",
    emoji: "🛡️",
    path: "/safety-plan",
    steps: [
      { title: "Plan before the storm", narration: "Safety plans give everyone a calmer roadmap before a hard moment happens. You can add warning signs, calming tools, and emergency contacts.", prompt: "Tap Safety Plan.", button_label: "Open Safety Plan", path: "/safety-plan" },
      { title: "Keep it simple", narration: "A good plan is short, clear, and easy to use under stress. Start with one warning sign and one support person.", prompt: "Add one simple support step.", button_label: "Continue", path: "/safety-plan" }
    ]
  },
  {
    section_id: "resources",
    audience: "both",
    title: "Resources",
    description: "Find local help, legal support, and practical services.",
    emoji: "🗂️",
    path: "/resources",
    steps: [
      { title: "Support near you", narration: "Resources brings together practical help: local services, legal aid, jobs, benefits, and crisis supports.", prompt: "Open the Resources section.", button_label: "Open Resources", path: "/resources" },
      { title: "Save what matters", narration: "When you find something helpful, save it or write down the next step. You do not have to solve everything today.", prompt: "Pick one resource category.", button_label: "Next", path: "/resources" }
    ]
  },
  {
    section_id: "education-guides",
    audience: "parent",
    title: "Education Guides",
    description: "Explore trauma-informed guides, lessons, worksheets, and classes.",
    emoji: "📚",
    path: "/education-hub",
    steps: [
      { title: "Learn gently", narration: "You’ve entered the Education Hub. Explore essential guides on trauma, attachment, grief and ambiguous loss, caregiver burnout, and more. Each lesson is designed to empower you and your child.", prompt: "Open the Education Hub when you want to learn in small, calm steps.", button_label: "Open Education Hub", path: "/education-hub" },
      { title: "Progress counts", narration: "Each completed lesson is progress. This is not about perfection. It is about building tools, confidence, and connection over time.", prompt: "Start with the guide that feels most helpful today.", button_label: "Continue", path: "/education-hub" }
    ]
  },
  {
    section_id: "support-hub",
    audience: "both",
    title: "Support Hub",
    description: "Find crisis tools, support conversations, and team connection options.",
    emoji: "🤝",
    path: "/support-hub",
    steps: [
      { title: "You are not alone", narration: "The Support Hub is here when you need a steady next step. You can find crisis tools, support conversations, team contacts, and guidance without searching through the whole app.", prompt: "Open Support Hub when you need connection or support.", button_label: "Open Support Hub", path: "/support-hub" },
      { title: "Bring helpers closer", narration: "When your support team is connected, Rooted 21 can help everyone understand patterns, progress, and needs with more context.", prompt: "Review the support options that fit your family.", button_label: "Next", path: "/support-hub" }
    ]
  },
  {
    section_id: "founder-dashboard",
    audience: "professional",
    title: "Founder Dashboard",
    description: "Review platform growth, users, beta codes, and admin tools.",
    emoji: "📊",
    path: "/founder-dashboard",
    steps: [
      { title: "Founder overview", narration: "The Founder Dashboard gives Misty a calm command center for signups, users, surveys, beta access, and admin tools.", prompt: "Open the Founder Dashboard.", button_label: "Open Founder Dashboard", path: "/founder-dashboard" },
      { title: "Beta access", narration: "Use beta tester codes for trusted testers only. Each code can be used once, and you can revoke access before it is used.", prompt: "Look for the Beta tab.", button_label: "Next", path: "/founder-dashboard" }
    ]
  },
  {
    section_id: "legal-forms",
    audience: "both",
    title: "Legal Forms",
    description: "Find educational legal resources and form helpers.",
    emoji: "⚖️",
    path: "/court-rights-education",
    steps: [
      { title: "Educational support", narration: "Legal Forms and rights education help you get organized and understand common system language. This is educational support, not legal advice.", prompt: "Open Legal Forms.", button_label: "Open Legal Forms", path: "/court-rights-education" },
      { title: "Bring questions forward", narration: "Use these tools to prepare questions for your attorney, caseworker, or court team. Clear notes help you advocate calmly.", prompt: "Choose your state or form area.", button_label: "Finish", path: "/court-rights-education" }
    ]
  }
];

export function mergeTutorialOverrides(overrides = []) {
  return DEFAULT_TUTORIALS.map(item => {
    const override = overrides.find(o => o.section_id === item.section_id);
    return override ? { ...item, ...override, emoji: item.emoji, path: item.path } : item;
  });
}