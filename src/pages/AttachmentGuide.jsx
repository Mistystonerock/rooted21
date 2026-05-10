import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

const SECTIONS = [
  {
    emoji: "❤️",
    title: "What Is Attachment?",
    body: `Attachment is the deep emotional bond formed between a child and their primary caregiver — usually in the first years of life. When that bond forms safely, children develop a "secure base" from which they explore the world, trust relationships, and regulate their emotions.

When early caregiving is inconsistent, frightening, absent, or abusive — the attachment system is disrupted. The child's brain learns: "Adults are not safe. I cannot rely on anyone to meet my needs. I must survive alone."

This is not a choice. This is neurobiology. The brain wires itself based on early experiences, and those wires run deep.

Children in foster, adoptive, and kinship care — by definition — have experienced disrupted attachment. Understanding this changes how you see their behavior.`
  },
  {
    emoji: "🔴",
    title: "Reactive Attachment Disorder (RAD)",
    body: `RAD is a rare but real diagnosis given to children who have been severely deprived of early nurturing — often from institutional care, profound neglect, or multiple early placement disruptions.

Children with RAD may:
• Resist or reject comfort and affection from caregivers
• Seem emotionally withdrawn or absent
• Show little positive response when comforted
• Be persistently sad, fearful, or irritable without clear reason
• Have very limited social or emotional engagement

RAD does NOT mean your child is "broken" or will never attach. It means their nervous system learned that attachment is dangerous — and your job is to very slowly, very patiently show them otherwise.

What helps with RAD:
• Therapeutic parenting — not traditional discipline
• THERAPLAY, Dyadic Developmental Psychotherapy (DDP), or EMDR with a trauma-specialized therapist
• Consistency, predictability, and low demands for reciprocity early on
• Long time horizons — attachment healing takes years, not months
• Your own support and self-care — this work is exhausting`
  },
  {
    emoji: "🟡",
    title: "Disinhibited Social Engagement Disorder (DSED)",
    body: `DSED is often less recognized but equally important. Where RAD children withdraw, DSED children go the opposite direction — they engage with strangers indiscriminately and without appropriate caution.

Signs of DSED:
• Approaches and talks to strangers with no hesitation
• Will go off with an unfamiliar adult without checking with caregiver
• Overly familiar, touchy, or affectionate with people they don't know
• Doesn't differentiate between safe people and unsafe people
• May be charming and socially engaging with everyone EXCEPT the primary caregiver

This can be dangerous — and is often misunderstood as "friendliness" or good social skills. It's actually the opposite: an inability to selectively trust.

DSED looks different but comes from the same root: early deprivation of consistent, responsive caregiving. The child's brain never learned that one person is special and safe compared to everyone else.`
  },
  {
    emoji: "💚",
    title: "Building Attachment — What Actually Works",
    body: `Traditional parenting advice — including some trauma-informed advice — does not always work for children with attachment disruption. Here's what the research and real families say works:

• Predictability above all else — do what you say, every time, without exception. Trust is built by doing ordinary things reliably, not by grand gestures.
• PACE: Playfulness, Acceptance, Curiosity, Empathy (developed by Dr. Dan Hughes — look up DDP therapy)
• Felt safety first — before any therapeutic intervention, the child must feel safe in their body in your home
• Nurture the age behind the face — if your 10-year-old needs to be rocked or needs you to make their meals, do it. They're catching up developmentally.
• Stay regulated when they push you away — their behavior is a test. Passing the test means not leaving.
• "I will never leave you for anything you do" — not just words, demonstrated through action over months and years
• NEVER use isolation or "time out" as a consequence — for a child with attachment disruption, isolation is the worst punishment
• Therapeutic support is not optional — find a therapist trained in attachment trauma (not CBT or standard talk therapy)`
  },
  {
    emoji: "🧠",
    title: "The Science Behind It (Plain Language)",
    body: `Your child's challenging behavior makes complete sense when you understand what happened to their brain.

In the first years of life, the brain is building its stress-response system. When a baby cries and is consistently comforted, the brain learns: "The world is safe. I can be soothed. I am worth being cared for."

When a baby cries and is ignored, frightened, or harmed — the brain learns the opposite. The stress-response system is chronically activated. The child's nervous system stays on high alert — because that's what kept them alive.

This is called "survival adaptation." It was brilliant — it kept them alive. But now it's working against them, because the threat (unpredictable caregiving) is no longer there — but their brain doesn't know that yet.

Your job is not to teach them new rules. Your job is to be the experience that slowly, gradually teaches their nervous system that safety is real.`
  },
  {
    emoji: "📋",
    title: "Getting the Right Help",
    body: `Not all therapists are equipped to work with attachment disorders. Choosing the wrong type of therapy can actually slow progress. Here's what to look for:

Effective approaches for attachment trauma:
• Dyadic Developmental Psychotherapy (DDP) — developed by Dr. Dan Hughes, PACE-based
• THERAPLAY — structured, playful attachment therapy
• EMDR — particularly helpful for trauma processing once child is stabilized
• Child-Parent Psychotherapy (CPP) — for younger children
• Trauma-Focused CBT (TF-CBT) — helpful for some children after stabilization

AVOID: Holding therapy, rebirthing therapy, coercive restraint-based "attachment" techniques — these are harmful and have caused deaths.

Finding help:
• Psychology Today's therapist finder (filter by "attachment" and "trauma")
• Your state's Foster Parent Association often has vetted referrals
• TBRI Practitioners: child.tcu.edu/tbri-practitioners
• DDP practitioners: ddpnetwork.org`
  },
];

export default function AttachmentGuide() {
  const [open, setOpen] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Attachment Guide" subtitle="RAD, DSED & building connection" backTo="/education-hub" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Hero */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">❤️</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Attachment Disorders: RAD & DSED
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Understanding the "why" behind your child's most confusing behaviors — and what actually helps.
          </p>
        </div>

        {/* Key insight */}
        <div className="rounded-xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-bold text-sm mb-1" style={{ color: C.darkGreen }}>The core truth</p>
          <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
            Children with attachment disorders are not "bad kids." They are children whose brains learned — in order to survive — that adults cannot be trusted. Your consistent, loving presence is the most powerful intervention that exists. It just takes longer than you'd expect.
          </p>
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

        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm mb-2" style={{ color: C.cream }}>You are the intervention.</p>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            No medication, no therapy, no program does what a safe, consistent, regulated caregiver does for a child's developing brain. What you do every day — showing up, staying calm, staying — matters more than you know.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}