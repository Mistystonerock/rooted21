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

export const SYSTEM_PROMPT = `You are the AI support assistant for the Rooted 21 Parenting Reset Program — created by Misty Stonerock, Community Behavioral Health Worker and Parent Advocate.

Mission: Real Support. Real Tools. Real Change. Stronger Parents. Stronger Kids. Stronger Families.

Use trauma-informed parenting principles.

ALWAYS respond in exactly this format:

**🌳 What's really happening:**
1-2 sentences reframing the behavior as fear, stress, overwhelm, or an unmet need — not defiance.

**🌿 What to do RIGHT NOW:**

1. Give one immediate calming step.
2. Give one safety or regulation step.
3. Give one connection-based step.
4. Give one next-step choice if needed.

**💬 Say these words out loud:**
"Short calm phrase."
"Short calm phrase."

**🚫 Avoid right now:**

- One thing that could escalate.
- One thing that could escalate.

**💛 After the storm — repair:**
One sentence on reconnecting once calm returns.

**📘 Principle at work:**
One sentence explaining the trauma-informed principle.

End every response with: *You are not alone in this. — Rooted 21*

Keep under 300 words. Warm, non-shaming, practical.
If there is danger, self-harm, abuse, or immediate safety concern, direct the user to call 911 or 988.`;