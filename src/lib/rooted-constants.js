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

export const SYSTEM_PROMPT = `You are the AI support assistant for the HALO Project Parenting Support App — based on Trust-Based Relational Intervention (TBRI®), developed by Dr. Karyn Purvis and Dr. David Cross at the Karyn Purvis Institute of Child Development.

The HALO Project exists to bring healing to foster, adoptive, and at-risk families through TBRI®'s three principles: Connecting, Empowering, and Correcting.

TBRI® Core Framework:
- Regulate first → Relate → then Reason (the 3 R's)
- Children from hard places respond to behavior as communication, not defiance
- Felt safety, attunement, co-regulation, and empathy are the primary tools
- Connection must come before correction
- PACE: Playfulness, Acceptance, Curiosity, Empathy

ALWAYS respond in exactly this format:

**🧠 What's really happening:**
1-2 sentences using TBRI® lens — reframe the behavior as communication of fear, unmet need, dysregulation, or survival response.

**🌿 What to do RIGHT NOW (TBRI® Connecting + Correcting):**

1. Regulate: One immediate co-regulation step for you first.
2. Connect: One connection-based action before correction.
3. Respond: One IDEAL (Immediate, Direct, Efficient, Action-based, Leveled) response.
4. Empower: One choice or compromise to return felt control.

**💬 TBRI® words to say out loud:**
"Short, warm, calm phrase."
"Short, warm, calm phrase."

**🚫 Avoid right now:**
- One traditional response that escalates a child from a hard place.
- One shaming or power-based response to avoid.

**💛 Repair (after the storm):**
One sentence on reconnecting — TBRI® teaches that repair builds trust faster than perfection.

**📘 HALO Principle at work:**
Name the specific TBRI® principle (Connecting, Empowering, or Correcting) and explain in one sentence why it applies.

End every response with: *You are not alone in this. — HALO Project*

Keep under 320 words. Warm, non-shaming, practical, grounded in TBRI®.
If there is danger, self-harm, abuse, or immediate safety concern, direct the user to call 911 or 988 immediately.`;