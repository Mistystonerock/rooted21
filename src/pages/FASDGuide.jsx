import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

const SECTIONS = [
  {
    emoji: "🧠",
    title: "What Is FASD?",
    body: `Fetal Alcohol Spectrum Disorder (FASD) is a lifelong brain-based condition caused by prenatal alcohol exposure. It is the leading preventable cause of developmental disability in the United States — and one of the most frequently missed diagnoses in children in the foster care system.

FASD is NOT a moral failing. It's a neurological injury that happened before birth. The child cannot "try harder" to overcome it — their brain is wired differently.

Because many children enter care without full medical histories, FASD is often mistaken for ADHD, RAD, conduct disorder, or willful defiance. Getting the right diagnosis changes everything.`
  },
  {
    emoji: "⚡",
    title: "How FASD Shows Up in Behavior",
    body: `Children with FASD often have a GAP between what they seem capable of and what they can actually do consistently. This gap is real — not laziness.

Common signs:
• Can do a task one day, can't the next (inconsistency is the hallmark)
• Memory problems — forgets rules they've "learned" many times
• Difficulty understanding cause and effect
• Struggles to link actions to consequences
• Easily overwhelmed by sensory input or too many instructions
• Impulsivity — acts without thinking despite knowing the rule
• Social naivety — trusting the wrong people, missing social cues
• Difficulty with time, money, and abstract concepts
• Exhaustion after school or structured activities
• Emotional regulation challenges that look like "manipulation"

The brain of a child with FASD may look like an 8-year-old but function emotionally like a 4-year-old. Parenting to their functional age — not their chronological age — is key.`
  },
  {
    emoji: "✅",
    title: "What Actually Helps",
    body: `FASD requires a different approach than typical parenting or even standard trauma-informed parenting. Here's what works:

• Concrete, simple instructions — one step at a time, not multi-step directions
• Repetition without shame — they need to hear and practice the same thing hundreds of times, and that's okay
• Visual supports — picture schedules, visual reminders, written steps on the wall
• Predictable routines — their brain depends on external structure because internal structure is harder
• Lower the demand, not the love — reduce cognitive load during hard moments
• Avoid sarcasm, idioms, or abstract language — take things literally, speak literally
• Repair quickly and often — never assume they remember what happened yesterday
• Supervision longer than you'd expect — children with FASD need more oversight into teen years and beyond
• Celebrate every small win — their brain needs to associate effort with reward consistently`
  },
  {
    emoji: "🚫",
    title: "What Makes It Worse",
    body: `These common parenting responses backfire with FASD:

• Long explanations and lectures — their brain can't process them; they shut down
• Logical consequences that are delayed — they cannot connect a consequence to something that happened hours ago
• Shaming or comparing them to siblings / peers
• Expecting them to "remember" without external supports
• Assuming they're lying when their story keeps changing — this is often a memory issue, not dishonesty
• Punishment-based behavior systems without built-in support
• High-sensory environments without a quiet exit option

FASD behavior is not defiance. Treating it like defiance will make things significantly worse.`
  },
  {
    emoji: "📋",
    title: "Getting a Diagnosis",
    body: `Many children in care have never been screened for FASD. Here's how to advocate:

1. Ask your child's pediatrician for a referral to a developmental pediatrician or neuropsychologist familiar with FASD
2. Contact your state's FASD diagnostic clinic — most states have at least one
3. FASD United (fetal-alcohol.org) has a clinic finder and free parent support
4. National Organization on Fetal Alcohol Syndrome (NOFAS): nofas.org
5. Document behaviors you observe — the inconsistencies, the memory patterns, the good days and hard days — and bring it to the appointment

A diagnosis opens doors: IEP eligibility, disability services, medical accommodations, and a roadmap for your family.`
  },
  {
    emoji: "💛",
    title: "What You Need to Know as a Caregiver",
    body: `Parenting a child with FASD is a marathon, not a sprint. Your child is not broken — their brain is built differently, and your job is to be the external scaffolding their brain needs.

• Lower your expectations for independence and raise your expectations for support
• This is not about what you're doing wrong — FASD requires more, not different-er parenting
• Connect with other FASD families — the isolation is real, and peer support is powerful
• Give yourself grace on the hard days
• Many adults with FASD live full, meaningful lives — with the right support starting young

Resources:
• FASD United: fetal-alcohol.org
• NOFAS: nofas.org
• "The Brain That Won't Be Still" — free resource at fetal-alcohol.org
• FASD Hope: fasdhope.com`
  },
];

export default function FASDGuide() {
  const [open, setOpen] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="FASD Guide" subtitle="Fetal Alcohol Spectrum Disorder" backTo="/education-hub" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Hero */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🍃</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Understanding FASD
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            One of the most common — and most misunderstood — diagnoses in foster and adoptive care. This guide gives you what you need to know.
          </p>
        </div>

        {/* Key stat */}
        <div className="rounded-xl p-4 flex gap-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="text-3xl">📊</div>
          <div>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>More common than you think</p>
            <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: C.mutedText }}>
              FASD affects an estimated 1 in 20 people in the US — higher in the foster care population. Many go undiagnosed for years, misidentified as ADHD, conduct disorder, or RAD.
            </p>
          </div>
        </div>

        {/* Sections */}
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

        {/* Bottom reminder */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm mb-2" style={{ color: C.cream }}>Remember</p>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            FASD is a brain difference, not a character flaw. Your child is doing the best they can with the brain they have. So are you.
          </p>
          <p className="text-xs mt-2 font-bold" style={{ color: C.gold }}>
            — Rooted 21 is with you every step of the way.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}