export const DEFAULT_TUTORIALS = [
  {
    section_id: "dashboard",
    audience: "both",
    title: "Dashboard",
    description: "Learn where your core tools live and how to start calmly.",
    emoji: "🌿",
    path: "/dashboard",
    steps: [
      { title: "Your calm home base", narration: "Welcome. The dashboard is your gentle starting point. Everything important is organized into small, clear choices so you do not have to hunt when life feels heavy.", prompt: "Notice the quick action area at the top.", button_label: "Open Dashboard", path: "/dashboard" },
      { title: "Quick actions", narration: "These buttons help you move quickly.", prompt: "This whole row is here for the moments you need a next step fast.", targetElementId: "quick-actions", button_label: "Show me", path: "/dashboard" },
      { title: "SOS support", narration: "Tap SOS when you need support right now.", prompt: "Click this button to practice opening immediate support.", targetElementId: "sos-button", requiresClick: true, button_label: "Tap SOS", path: "/chat?crisis=1" },
      { title: "Daily Check-In", narration: "Tap Check-In to track how you are feeling today.", prompt: "Click Check-In to continue.", targetElementId: "checkin-button", requiresClick: true, button_label: "Tap Check-In", path: "/daily-checkin" },
      { title: "Behavior tracking", narration: "Tap Log Behavior to track patterns and triggers.", prompt: "Click the Behavior card to continue.", targetElementId: "behavior-log-button", requiresClick: true, button_label: "Tap Behavior", path: "/behavior-hub" },
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
    section_id: "lessons",
    audience: "parent",
    title: "Lessons",
    description: "Follow the Rooted 21 learning path at your own pace.",
    emoji: "📚",
    path: "/lessons",
    steps: [
      { title: "Learn gently", narration: "Lessons are designed to support connection-based parenting one step at a time. You can pause, return, and continue whenever you are ready.", prompt: "Tap Lessons.", button_label: "Open Lessons", path: "/lessons" },
      { title: "Progress counts", narration: "Each completed lesson is progress. This is not about perfection. It is about building tools and confidence.", prompt: "Start with the next available lesson.", button_label: "Continue", path: "/lessons" }
    ]
  },
  {
    section_id: "support-team",
    audience: "both",
    title: "Support Team",
    description: "Know where team contacts and professional support live.",
    emoji: "🤝",
    path: "/my-team",
    steps: [
      { title: "You are not alone", narration: "The Support Team area helps keep professionals, caseworkers, therapists, and helpers organized in one place.", prompt: "Open My Team.", button_label: "Open Team", path: "/my-team" },
      { title: "For professionals", narration: "Professionals can use connected tools to understand progress, add notes, and support the family with more context.", prompt: "Review who is connected.", button_label: "Next", path: "/my-team" }
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