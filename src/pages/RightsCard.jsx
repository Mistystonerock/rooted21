import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Share2, Copy, Check, Download } from "lucide-react";

const RIGHTS = [
  {
    situation: "IEP Meeting",
    emoji: "🏫",
    color: "#1A5FAD",
    rights: [
      "You have the right to request an IEP meeting at ANY time — you don't have to wait for the school to schedule it",
      "You have the right to bring an advocate or attorney to any IEP meeting",
      "You have the right to request evaluations at no cost to you",
      "You have the right to disagree with the IEP and request mediation or due process",
      "The school must provide the IEP in a language you understand",
      "You must give written consent before services begin or before a child is re-evaluated",
      "You can request a copy of all evaluations and records at any time",
      "You have the right to an independent educational evaluation (IEE) if you disagree with the school's evaluation",
    ],
    tip: "Say this: 'I'm requesting that [child's name]'s educational advocate be present at all future IEP meetings. Please provide written notice of all scheduled meetings at least 48 hours in advance.'"
  },
  {
    situation: "CPS Home Visit",
    emoji: "🏠",
    color: C.brown,
    rights: [
      "You have the right to know the reason for the visit",
      "You have the right to have an attorney present — you can request to reschedule to allow this",
      "You are NOT required to let CPS into your home without a court order (warrant) — however this may impact your case",
      "You have the right to remain silent — anything you say CAN be used in a case",
      "You have the right to know if you are under investigation vs. the other parent",
      "Children do NOT have to be interviewed by CPS alone — but a court order can override this",
      "You have the right to request written documentation of any findings",
      "Ask for the worker's full name, badge number, and supervisor contact",
    ],
    tip: "Say this: 'I want to cooperate fully. Before we begin, can I have your name, agency, and the specific concern prompting this visit? I'd also like to have my attorney on the phone.'"
  },
  {
    situation: "Court Hearing",
    emoji: "⚖️",
    color: C.darkGreen,
    rights: [
      "You have the right to be present at ALL hearings related to your child",
      "You have the right to be heard — ask to speak on the record if you feel your perspective is missing",
      "You have the right to an attorney — if you cannot afford one, ask the court to appoint one",
      "You have the right to review all reports submitted to the court BEFORE the hearing",
      "You have the right to call witnesses and present evidence",
      "You have the right to know what outcome the state or agency is recommending",
      "You have the right to appeal a decision you believe is wrong",
      "Document everything — courts respond to written documentation",
    ],
    tip: "Say this in court: 'Your Honor, I respectfully request the opportunity to be heard on this matter.' You have a right to speak. Use it."
  },
  {
    situation: "Foster Parent Rights",
    emoji: "🏡",
    color: C.midGreen,
    rights: [
      "You have the right to be informed about a child's history BEFORE placement (to the extent it is known)",
      "You have the right to attend court hearings and be heard",
      "You have the right to be notified of case plan changes that affect the child in your care",
      "You have the right to request a foster parent advocate or support through your licensing agency",
      "You have the right to request information about why a child is being moved",
      "You have the right to give input at case review meetings",
      "You have the right to report violations without retaliation",
      "Every state has a Foster Parent Bill of Rights — look up yours",
    ],
    tip: "Know your state's Foster Parent Bill of Rights. Google '[your state] foster parent bill of rights' and keep it saved."
  },
  {
    situation: "Medical Appointments",
    emoji: "🏥",
    color: "#7A2D78",
    rights: [
      "As a foster parent, you may have medical consent authority — verify this with your licensing worker",
      "You have the right to be present during your child's medical appointments",
      "You have the right to request copies of all medical records",
      "You have the right to a second opinion",
      "You have the right to refuse non-emergency treatment until you consult with an attorney if needed",
      "If a child has Medicaid, they have the right to preventive care and mental health services",
      "Document all medications, diagnoses, and treatment plans in writing",
      "Know who holds medical decision-making authority for your child",
    ],
    tip: "Always ask: 'Can I get a copy of today's visit notes and any prescriptions in writing?' This is your right."
  },
];

export default function RightsCard() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const card = RIGHTS[active];

  const shareText = `📋 Know Your Rights — ${card.situation}\n\n${card.rights.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\n💬 What to say: "${card.tip}"\n\n— Shared from Rooted 21 Parenting Network`;

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `Your Rights: ${card.situation} — Rooted 21`,
        text: shareText,
      });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Know Your Rights" subtitle="Pull this out in any meeting" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Hero */}
        <div className="rounded-2xl p-4 text-center" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Your Rights — At a Glance</p>
          <p className="text-xs mt-1" style={{ color: C.lightGreen }}>Tap a situation below. Pull this up in any meeting, hearing, or home visit.</p>
        </div>

        {/* Situation tabs */}
        <div className="grid grid-cols-2 gap-2">
          {RIGHTS.map((r, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="flex items-center gap-2 px-3 py-3 rounded-xl text-left font-bold text-xs"
              style={{
                background: active === i ? r.color : C.white,
                color: active === i ? "#fff" : C.darkGreen,
                border: `1.5px solid ${active === i ? r.color : C.cream}`,
                cursor: "pointer",
              }}>
              <span className="text-lg">{r.emoji}</span>
              <span>{r.situation}</span>
            </button>
          ))}
        </div>

        {/* Rights card */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
          <div className="px-4 py-3 flex items-center gap-3" style={{ background: card.color }}>
            <span className="text-2xl">{card.emoji}</span>
            <p className="font-serif font-bold text-sm" style={{ color: "#fff" }}>{card.situation}</p>
          </div>

          <div className="p-4 space-y-3" style={{ background: C.white }}>
            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>YOUR RIGHTS:</p>
            <div className="space-y-2">
              {card.rights.map((right, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
                    style={{ background: card.color + "18", color: card.color }}>
                    {i + 1}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>{right}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-3 mt-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-1" style={{ color: card.color }}>💬 SAY THIS:</p>
              <p className="text-xs italic leading-relaxed" style={{ color: C.darkGreen }}>{card.tip}</p>
            </div>

            {/* Share / Copy bar */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Share2 size={14} />
                Share This with a Parent
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs"
                style={{ background: copied ? "#4A9E6A" : C.cream, color: copied ? "#fff" : C.darkGreen, border: "none", cursor: "pointer", transition: "all 0.2s" }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* General reminder */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-bold text-xs mb-2" style={{ color: C.cream }}>Always remember:</p>
          <ul className="space-y-1 text-[11px]" style={{ color: C.lightGreen }}>
            <li>• Document everything in writing — dates, names, what was said</li>
            <li>• Ask for the name and contact of every professional you meet</li>
            <li>• You can always ask for a moment to think before answering</li>
            <li>• "I'd like to consult my attorney before answering" is always an option</li>
            <li>• You are your child's best advocate — trust your instincts</li>
          </ul>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}