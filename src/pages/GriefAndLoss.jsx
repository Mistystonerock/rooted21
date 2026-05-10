import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

const SECTIONS = [
  {
    emoji: "💔",
    title: "Grief in Foster & Adoptive Care",
    body: `Every child who enters foster, adoptive, or kinship care has experienced loss — often multiple losses at once.

They've lost:
• Their birth parents (even if those parents were unsafe)
• Their siblings (often separated during placement)
• Their home, neighborhood, school, friends
• Their culture, language, food, familiar smells
• Their sense of "normal" and belonging
• Their identity and their story

These are real losses. They deserve to be grieved. And here's what's important: children grieve these losses even when the situation they came from was dangerous, neglectful, or abusive. That doesn't mean they wanted to stay — it means they are human, and they loved the people who raised them.

Never expect a child to "be grateful" that they were removed. Their grief is not ingratitude. It is love — and love for complicated people in complicated situations.`
  },
  {
    emoji: "🌫️",
    title: "Ambiguous Loss — The Grief That Has No Funeral",
    body: `Ambiguous loss is grief for someone who is still alive but not present — or present but not really there.

Children in care often grieve:
• A parent who is alive but can't parent them
• A sibling they were separated from
• A birth family they may see occasionally but cannot live with
• A version of their parent "before" addiction, illness, or incarceration took over

This type of grief is uniquely painful because there's no closure. The loss can't be resolved. There's no funeral. There's no end point. And the child may oscillate between longing and rage, idealization and anger, missing and relief.

This grief can surface as:
• Unexplained emotional outbursts around holidays or visits
• Telling stories about birth family that seem exaggerated or idealized
• Testing your love before visits or after (unconsciously asking: will you still be here?)
• Regression around anniversaries, birthdays, or significant dates
• Anger at YOU for not being "them"

Your job is not to fix the grief. It is to hold the space for it without judgment.`
  },
  {
    emoji: "🌊",
    title: "How Grief Shows Up in Behavior",
    body: `Children — especially children from hard places — rarely grieve in linear, predictable ways. Their grief shows up in behavior because they often don't have words for it.

Watch for grief behavior disguised as:
• Defiance and anger (especially around triggers — visits, holidays, beginnings/endings)
• Regression — acting younger than their age
• Withdrawal and shutting down
• Hypervigilance and anxiety
• Clinging or desperate need for reassurance
• Idealization of birth family ("My real mom would let me")
• Sabotaging things when they start going well (unconscious: "good things get taken away")
• Academic decline around anniversaries or transitions

Dates that can trigger grief:
• Birthdays (theirs and birth parents')
• Mother's Day / Father's Day
• Holidays
• Anniversary of removal or placement
• Start of school
• Court dates and hearings`
  },
  {
    emoji: "🌿",
    title: "How to Hold Space for Grief",
    body: `You don't have to have the right words. You have to be present.

What helps:
• Name it: "I wonder if you're missing your mom today." You don't need to be right — just opening the door matters.
• Don't rush to fix it: "I know this is hard. I'm right here." is enough.
• Create rituals: A memory box for photos and objects from their past. A "thinking of you" moment on their birthday. Something that honors what came before.
• Let them love both families: "You can love your birth mom AND love us. Those two things aren't in competition."
• Don't take it personally when they push you away during grief spikes — they're testing whether you'll stay.
• Support sibling contact where safe — sibling bonds are often the strongest and longest in their lives.

What NOT to say:
• "But they weren't good to you." (dismisses their love and grief)
• "You should be grateful." (shuts down healthy grieving)
• "They chose not to take care of you." (weaponizes their pain)
• "We're your family now." (before they've chosen that themselves)`
  },
  {
    emoji: "💛",
    title: "Supporting Your Child's Grief — Practical Tools",
    body: `Grief in children needs an outlet. Here are tools that work:

• Memory book or box: Help them collect photos, drawings, objects, and stories from their past. This is their story and they deserve to keep it.
• Life story work: Narrative therapy that helps children understand their history in age-appropriate, honest language. Ask their therapist about this.
• Feeling vocabulary: Build their emotional vocabulary beyond "fine" and "mad." Name feelings together daily.
• Art and play: For children under 10, grief is processed through play, art, and movement — not talk.
• Therapy: A therapist trained in grief and trauma is essential. Not optional. Look for someone who does play therapy for younger children.
• Books: "The Invisible String," "When You Are Brave," "The Whole-Brain Child" for caregivers.

Grief doesn't end. But it can be carried more gently, with the right support.`
  },
];

export default function GriefAndLoss() {
  const [open, setOpen] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Grief & Loss" subtitle="Supporting children through ambiguous loss" backTo="/education-hub" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">💔</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Grief, Loss & Ambiguous Loss</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Every child in care is carrying grief. Understanding it changes how you respond to their hardest moments.
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-bold text-sm mb-1" style={{ color: C.darkGreen }}>The most important thing to know</p>
          <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
            Children can grieve a parent who was unsafe. They can miss a home that was neglectful. They can love someone who hurt them. This is not confusion — it is the complexity of human love. Honor it.
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
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>You don't have to have the right words.</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            "I'm right here, and I'm not going anywhere" is enough. Presence over perfection, every time.
          </p>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}