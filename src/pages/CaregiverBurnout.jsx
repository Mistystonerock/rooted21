import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

const WARNING_SIGNS = [
  "Dreading interactions with your child",
  "Feeling numb or emotionally flat most of the time",
  "Fantasizing about giving up or disrupting the placement",
  "Having nightmares or intrusive thoughts about your child's trauma",
  "Physical exhaustion that sleep doesn't fix",
  "Increased irritability, snapping at your partner or other children",
  "Feeling like your own needs don't matter",
  "Difficulty feeling joy or connection even outside of parenting",
  "Avoiding your child's trauma history because it's too painful",
  "Feeling like a failure despite doing everything 'right'",
];

const SECTIONS = [
  {
    emoji: "🔥",
    title: "What Is Secondary Traumatic Stress?",
    body: `Secondary Traumatic Stress (STS) — also called vicarious trauma or compassion fatigue — is what happens to caregivers who absorb the trauma of the children they care for.

When you hear your child's history, witness their meltdowns, hold them through their nightmares, and advocate endlessly for their needs — you are not untouched. Trauma exposure affects the nervous system of the witness, not just the person who experienced it.

Secondary traumatic stress is recognized as an occupational hazard for therapists, social workers, and first responders. Foster and adoptive parents experience it at the same rates — but rarely get the same recognition or support.

This is not weakness. This is biology. Your nervous system is doing exactly what it was designed to do: respond to suffering in the people you love.`
  },
  {
    emoji: "⚠️",
    title: "Signs You May Be Burning Out",
    body: `Burnout builds slowly. By the time most caregivers recognize it, they've been running on empty for months.

Common signs:
• Chronic exhaustion that rest doesn't fix
• Emotional numbness or detachment from your child
• Dreading the next meltdown — or dreading coming home
• Snapping at your partner, other children, or coworkers
• Nightmares, intrusive thoughts, or hypervigilance in your own body
• Difficulty feeling positive emotions — joy, connection, hope
• Fantasizing about the placement ending or "going back to before"
• Cynicism — "nothing I do matters"
• Physical symptoms: headaches, immune problems, digestive issues

Experiencing any of these does not make you a bad parent. It makes you a human being who has been through something hard — and who needs care too.`
  },
  {
    emoji: "🌿",
    title: "What Actually Helps (Not Just 'Self Care')",
    body: `"Take a bubble bath" isn't going to cut it. Real recovery from caregiver burnout requires:

1. NAME IT — say out loud: "I am burned out. I am experiencing secondary trauma." Naming it reduces shame and makes it possible to address.

2. SEEK YOUR OWN THERAPY — not couples therapy, not parenting coaching — therapy for YOU. A therapist familiar with vicarious trauma or foster/adoptive parenting is ideal. You cannot pour from an empty cup and therapy helps fill it.

3. RESPITE CARE — use it without guilt. Taking a break does not mean you love your child less. It means you understand that you are part of the system of care, and systems need maintenance.

4. PEER SUPPORT — connect with other foster/adoptive/kinship parents who get it. Isolation amplifies burnout. Community protects against it.

5. SET HONEST EXPECTATIONS — you cannot heal your child's trauma alone. You can be a consistent, loving presence while a team of professionals helps. That's enough.

6. BIOLOGICAL REGULATION — this is physical: sleep, movement, food, sunlight. Your nervous system heals the same way your child's does — through co-regulation and physical restoration.

7. LET SOMEONE ELSE CARRY IT SOMETIMES — talk to your partner, your support worker, your therapist. Don't carry it all in your own head.`
  },
  {
    emoji: "💬",
    title: "When to Ask for More Help",
    body: `Some signs indicate you need more than self-care:

Get support immediately if:
• You are having thoughts of harming yourself or your child
• You feel you cannot keep your child safe
• You are using alcohol or substances to cope
• You are becoming physically aggressive with your child or partner
• You feel you cannot go on

Resources:
• Call your licensing agency or caseworker — they have supports in place for this
• Call 988 (Suicide and Crisis Lifeline) for yourself
• Call 911 if there is immediate safety risk
• Ask your child's therapist to connect you with a caregiver support group

Disrupting a placement is not failure. Sometimes it is the most loving decision for both the child and the family. If you are there, talk to someone — don't go through it alone.`
  },
  {
    emoji: "💛",
    title: "You Are Doing Something Extraordinary",
    body: `What you are doing — parenting a child from a hard place — is one of the most demanding forms of human caregiving that exists. The level of emotional intelligence, patience, and resilience required is extraordinary.

The world does not fully see what this costs you. But we do.

You deserve:
• Recognition that this is hard
• Support that goes beyond training hours
• Time to rest without guilt
• A community that understands
• Care for yourself — not just for what you can give your child

Your wellbeing is not separate from your child's wellbeing. It is inseparable from it.

When you are okay, they have a better chance of being okay. Rest is not selfishness. It is part of the work.`
  },
];

export default function CaregiverBurnout() {
  const [open, setOpen] = useState(0);
  const [showChecklist, setShowChecklist] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Caregiver Burnout" subtitle="Secondary traumatic stress & recovery" backTo="/education-hub" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🕯️</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Caregiver Burnout & Secondary Trauma
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            You cannot pour from an empty cup. Your wellbeing is not optional — it's essential to everything you do.
          </p>
        </div>

        {/* Crisis line */}
        <div className="rounded-xl p-3 flex gap-3" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <AlertTriangle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px]" style={{ color: "#B84C2A" }}>
            In crisis yourself? Call/text <strong>988</strong>. Caregivers deserve support too.
          </p>
        </div>

        {/* Warning sign checklist */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.cream}` }}>
          <button onClick={() => setShowChecklist(!showChecklist)}
            className="w-full flex items-center justify-between px-4 py-3"
            style={{ background: showChecklist ? C.darkGreen : C.white, border: "none", cursor: "pointer" }}>
            <p className="font-bold text-sm" style={{ color: showChecklist ? C.cream : C.darkGreen }}>⚠️ Warning Sign Checklist</p>
            {showChecklist ? <ChevronUp size={16} color={C.lightGreen} /> : <ChevronDown size={16} color={C.mutedText} />}
          </button>
          {showChecklist && (
            <div className="px-4 py-3 space-y-2" style={{ background: C.offWhite }}>
              <p className="text-[11px] mb-2" style={{ color: C.mutedText }}>Check any that apply to you right now:</p>
              {WARNING_SIGNS.map((sign, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs" style={{ color: C.darkGreen }}>{sign}</p>
                </label>
              ))}
              <p className="text-[10px] mt-3 italic" style={{ color: C.mutedText }}>
                If you checked 3 or more — please talk to someone this week. You deserve support.
              </p>
            </div>
          )}
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
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>You matter too.</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            The children in your care need you well — not just present. Rest, support, and care for yourself is part of the work, not a break from it.
          </p>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}