export const C = {
  darkGreen: "#2F4B3A",
  midGreen: "#6E8F6E",
  lightGreen: "#A7B89A",
  brown: "#8B5E34",
  cream: "#E8DFCF",
  offWhite: "#FAF8F3",
  darkText: "#2A1F14",
  warmText: "#5C4A35",
  mutedText: "#7A6E60",
  white: "#FFFEFB",
  gold: "#C9A84C",
};

export const BEHAVIORS = [
  { e: "🌋", label: "Meltdown / tantrum", q: "My child is having a full meltdown right now — screaming, crying, out of control. What do I do?" },
  { e: "😤", label: "Defiance / refuses", q: "My child is refusing everything I ask and being defiant right now." },
  { e: "👊", label: "Hitting / aggression", q: "My child is hitting, kicking, or being physically aggressive right now." },
  { e: "😶", label: "Shut down / silent", q: "My child has shut down and won't respond to anything I say." },
  { e: "😰", label: "Anxiety / panic", q: "My child is in an anxiety or panic spiral right now and I don't know how to help." },
  { e: "🏫", label: "School refusal", q: "My child is refusing to go to school and we're in the middle of it right now." },
  { e: "😴", label: "Bedtime battles", q: "My child is refusing bedtime and it's turning into a huge escalating battle." },
  { e: "💥", label: "Sibling conflict", q: "My kids are fighting and escalating fast — I need help right now." },
  { e: "🤬", label: "Back talk / disrespect", q: "My child is being verbally disrespectful and using hurtful words right now." },
  { e: "🔄", label: "Triggered / trauma response", q: "My child seems triggered and is reacting like something reminded them of past trauma." },
  { e: "🛑", label: "Power struggle", q: "I'm stuck in a power struggle with my child and everything I try makes it worse." },
  { e: "😢", label: "Emotional outburst", q: "My child just had a sudden emotional outburst and I don't know how to respond." },
];

export const SYSTEM_PROMPT = `You are Rooted 21 — a trauma-informed parenting support assistant created by Misty Stonerock, a Community Behavioral Health Worker and Parent Advocate.

Your role: Help parents in real-time crisis moments with their children. You provide calm, empathetic, actionable guidance rooted in trauma-informed care, attachment theory, and evidence-based parenting strategies.

Guidelines:
- Always start by validating the parent's experience. They are doing hard work.
- Provide step-by-step, numbered guidance that is immediately actionable.
- Include exact phrases the parent can say to their child (in quotes).
- Use section headers with emojis: 🌳 for grounding, 🌿 for connection, 💬 for scripts, 🚫 for what to avoid, 💛 for self-care reminders, 📘 for understanding the behavior.
- Format headers as **🌳 Header Text** (bold with emoji).
- Keep language warm, non-judgmental, and accessible.
- Never blame the parent or the child.
- Remind parents: "Your calm is the first intervention."
- If the situation sounds dangerous, gently recommend calling 988 (Suicide & Crisis Lifeline) or 911.
- Keep responses focused and practical — parents are reading this in the middle of a crisis.`;