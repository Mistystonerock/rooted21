import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

const SECTIONS = [
  {
    emoji: "🌍",
    title: "Why Race & Identity Matter in Foster & Adoptive Care",
    body: `More than 35% of children in foster care are placed transracially — with caregivers of a different race or ethnicity. Whether or not this is your situation, race and cultural identity are central to who your child is.

Race is not just skin color. It is:
• A child's sense of who they are and where they belong
• Their connection to history, family, and community
• A daily lived experience that affects how the world treats them
• A source of pride, resilience, and identity — or, if ignored, a source of confusion and shame

When caregivers minimize or avoid race — even with loving intentions — children receive the message that an important part of who they are is unseen, unacceptable, or inconvenient. That has lasting psychological impact.

Your child's racial identity development is your responsibility as their caregiver — even if it is uncomfortable for you.`
  },
  {
    emoji: "🪞",
    title: "Racial Identity Development in Children",
    body: `Children become aware of race earlier than most adults expect — as young as 2-3 years old. By 4-5, they often notice differences and begin forming early race-based thoughts.

Without support from caregivers:
• Children of color in white families often experience confusion about where they belong
• They may internalize negative messages about their racial group
• They may feel they need to "choose" between their racial identity and their family
• They may face racial incidents at school or in the community without the tools to understand or respond

With support from caregivers:
• Children develop racial pride — they feel good about who they are
• They have language and skills to navigate racial bias and discrimination
• They feel seen and whole — not fragmented between home and the rest of the world
• They carry their heritage forward as a source of strength`
  },
  {
    emoji: "✅",
    title: "Practical Steps for Every Caregiver",
    body: `Whether or not you are raising a child of a different race, here's what active cultural support looks like:

1. REFLECT YOUR CHILD BACK TO THEM
• Books, art, media, toys, and dolls that represent their racial and cultural background
• Hair care products and routines appropriate for their hair type
• Food from their culture — in your home, regularly
• Images on your walls that look like them

2. BUILD COMMUNITY CONNECTIONS
• Friends, mentors, and community connections who share their racial/ethnic background
• Cultural events, churches, community centers
• Connection to family members from their background where safely possible

3. TALK ABOUT RACE — OPENLY
• Don't wait for a "right moment" — create regular, low-stakes conversations
• Name what you see: "I notice people who look like you are often..." 
• Ask what they notice, how they feel, what they've experienced
• Do not tell a child who reports a racial incident that they misunderstood or overreacted

4. LEARN YOURSELF
• Educate yourself about your child's racial and cultural history — including the parts that are painful
• Understand the specific experiences of their community (e.g. anti-Blackness, anti-Indigenous history, immigration trauma)
• Get comfortable being uncomfortable — your discomfort is far less important than your child's wellbeing`
  },
  {
    emoji: "💬",
    title: "Talking About Race With Your Child",
    body: `Many caregivers avoid talking about race because they're afraid of saying the wrong thing. But silence is the wrong thing.

Conversation starters by age:

YOUNG CHILDREN (3-6):
"I notice that people have different skin colors. Isn't that interesting? Your skin is beautiful."
"Our family looks different in some ways and the same in other ways. What do you notice?"

ELEMENTARY (7-11):
"I want to make sure you know how proud I am of where you come from."
"Have you ever had anyone say something about your race or skin color? How did that feel?"
"If something like that ever happens, I want you to tell me. We'll figure it out together."

TEENS (12+):
"I know I can't fully understand what you experience as a [Black/Brown/Indigenous/etc.] person. I want to learn."
"Are there things about your identity or culture that you wish we did more of in our home?"
"How are you feeling about how you fit in at school — not just socially, but racially?"

What NOT to say:
• "I don't see color." (Erases their identity and lived experience)
• "Race doesn't matter, we're all the same." (Untrue and dismissive)
• "Your [birth parent/culture] isn't relevant now." (Deeply harmful)`
  },
  {
    emoji: "📚",
    title: "Resources & Further Learning",
    body: `Books for caregivers:
• "In Their Voices" — transracial adoptee perspectives
• "Raising White Kids" by Jennifer Harvey — for white parents of children of color
• "We Need to Talk About Race" by Ben Rosen (for conversations with kids)
• "The Skin You Live In" (picture book for young children)
• "Same, Same But Different" (picture book on difference and connection)

For teens:
• "The Hate U Give" by Angie Thomas
• "All American Boys" by Jason Reynolds & Brendan Kiely
• "Stamped" by Jason Reynolds & Ibram X. Kendi

Organizations:
• AdoptUSKids — transracial adoption resources: adoptuskids.org
• Creating a Family cultural competence resources: creatingafamily.org
• The Archon Institute for Cultural Education: thearcmoninstitute.org

Your child's school counselor and therapist are also important partners in their racial identity development — make sure they know this is a priority.`
  },
];

export default function RaceAndIdentity() {
  const [open, setOpen] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Race & Identity" subtitle="Supporting your child's cultural identity" backTo="/education-hub" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🌍</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Race, Culture & Identity
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Your child's racial and cultural identity is a core part of who they are. Supporting it is not optional — it is part of your caregiving role.
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-bold text-sm mb-1" style={{ color: C.darkGreen }}>The research is clear</p>
          <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
            Children of color raised by caregivers who actively support their racial identity have higher self-esteem, stronger mental health, and better outcomes as adults. The single biggest predictor is whether their caregivers talked openly about race and provided same-race mirrors and mentors.
          </p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.cream}` }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ background: open === i ? C.darkGreen : C.white, border: "none", cursor: "pointer" }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{s.emoji}</span>
                <p className="font-bold text-sm" style={{ color: open === i ? C.cream : C.darkGreen }}>{s.title}</p>
              </div>
              {open === i ? <ChevronUp size={16} color={C.lightGreen} /> : <ChevronDown size={16} color={C.mutedText} />}
            </button>
            {open === i && (
              <div className="px-4 py-4" style={{ background: C.offWhite }}>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: C.darkGreen }}>{s.body}</p>
              </div>
            )}
          </div>
        ))}

        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Your child is whole.</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Every part of them — their race, their culture, their history, their family of origin — is part of what makes them who they are. Honor all of it.
          </p>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}