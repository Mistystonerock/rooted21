import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const SECTIONS = [
  {
    emoji: "📋",
    title: "What Happens When a Child Ages Out",
    body: `"Aging out" refers to youth who leave the foster care system when they reach adulthood — typically age 18 in most states. Without permanency (adoption or guardianship), these young people often find themselves without family support, housing, income, or a safety net.

The statistics are sobering:
• Within 2 years of aging out, 25-50% experience homelessness
• Only about 50% are employed at age 24
• Less than 3% earn a college degree
• Many struggle with poverty, mental health challenges, and legal system involvement

Extended Foster Care (EFC): All states now have the option to continue foster care support up to age 21 under the Fostering Connections Act. SOME states provide it automatically — others require the youth to opt in. Know your state's rules and advocate for your young person to stay connected to support.

Aging out is not inevitable failure — but it requires early planning, strong relationships, and active connection to resources.`
  },
  {
    emoji: "💰",
    title: "Financial Benefits Available",
    body: `Youth aging out of foster care have access to significant financial benefits — many of which are underused because families don't know about them.

CHAFEE ACT / INDEPENDENT LIVING FUNDS:
• Every state receives federal funding to support youth transitioning out of care
• These funds can pay for housing, education, employment, and life skills
• Contact your state's Independent Living (IL) program — usually through the child welfare agency

EDUCATION:
• Education and Training Voucher (ETV): Up to $5,000/year for college, vocational training, or certification programs
• Many states have tuition waivers for foster youth at state colleges — FREE tuition
• Federal FAFSA: Foster youth are considered "independent" — they qualify for maximum financial aid regardless of caregiver income
• Apply as early as possible — funds are limited

MEDICAID:
• Foster youth can receive Medicaid coverage up to age 26 (expanded under ACA)
• This applies even if they were only briefly in care — verify with your state
• This is one of the most important benefits to secure — do it before they turn 18

HOUSING:
• HUD has housing vouchers specifically for youth aging out of foster care
• Ask the caseworker or IL coordinator about "priority preference" for Section 8
• Some states have transitional living programs — group homes with support services`
  },
  {
    emoji: "🏫",
    title: "Education Planning",
    body: `Education is the single strongest predictor of long-term success for foster youth — and one of the most under-accessed pathways.

Start planning in early high school (age 14-16):
• Request transcripts and school records NOW — many youth age out without their own records
• Identify career interests and explore vocational vs. college pathways
• Connect with the school's college counselor — specifically mention foster youth status

Helpful programs:
• Guardian Scholars Programs — campus-based support specifically for foster youth at many universities
• National Foster Youth Institute: nfyi.org — advocacy and scholarship resources
• Foster Care to Success: fc2success.org — scholarships, textbook assistance, emergency funds
• College Possible: collegepossible.org — college access coaching

Make sure your young person knows:
• Their FAFSA will list "Yes" to being a current/former ward of the court — this unlocks maximum aid
• Many campuses now have year-round housing and food assistance for foster youth
• They don't have to do this alone — there are people who want to help`
  },
  {
    emoji: "🏠",
    title: "Life Skills to Build Before 18",
    body: `Most youth aging out report they were not prepared for adult life. You can change that by starting early and making it practical.

Skills to build together:
• Cooking — basic meals, grocery shopping, understanding nutrition
• Budgeting — income vs. expenses, saving, avoiding debt
• Banking — open a bank account, understand debit vs. credit
• Renting — reading a lease, deposits, tenant rights, utilities
• Transportation — bus systems, getting a license and insurance
• Medical — making appointments, understanding insurance, managing their own health
• Employment — resume writing, interviews, showing up reliably
• Legal — what to do if stopped by police, understanding their rights
• Digital literacy — email, professional communication, online safety

The Ansell-Casey Life Skills Assessment (ACLSA) is a free tool that helps identify gaps. Google it and walk through it with your teen.

Most importantly: let them practice. Let them fail at low stakes things. Let them figure out a problem with you next to them instead of solving it for them. Independence is built, not given.`
  },
  {
    emoji: "❤️",
    title: "What Youth Need Most — Relationships",
    body: `Research is clear: the single most protective factor for youth aging out of foster care is at least one committed adult who will not give up on them.

You don't have to adopt. You don't have to be perfect. You just have to stay.

What staying looks like:
• A phone call on their birthday — every year, without exception
• A place to come for holidays, even if they didn't "earn" it
• A safe person to call when things fall apart
• An adult who knows their history and loves them anyway
• Someone who will go with them to appointments, sign a lease reference, show up when they call at 2am

The legal relationship ends. The human relationship doesn't have to.

"Permanent connections" — meaningful, lifelong relationships — are the goal, not just permanency placements. You can be a permanent connection even if you aren't the legal guardian.

Kinship, foster, and adoptive families who maintain contact after 18 literally save lives.`
  },
];

export default function AgingOutGuide() {
  const [open, setOpen] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Aging Out Guide" subtitle="Preparing youth for life after foster care" backTo="/education-hub" />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🚀</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Aging Out & Transition Planning
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Everything you need to know about benefits, planning, and how to stay connected to your young person after 18.
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <p className="font-bold text-xs mb-1" style={{ color: "#B84C2A" }}>⏰ Start Planning Early</p>
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
            Benefits, housing, and education planning require months of lead time. If your young person is 14 or older, start now — not at 17.
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

        {/* Key links */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Key Resources</p>
          <div className="space-y-2">
            {[
              { label: "Foster Care to Success", url: "https://fc2success.org" },
              { label: "National Foster Youth Institute", url: "https://nfyi.org" },
              { label: "Transitional Living Programs (RHYA)", url: "https://www.acf.hhs.gov/fysb/programs/runaway-homeless-youth/programs/tlp" },
              { label: "College Financial Aid for Foster Youth (FAFSA)", url: "https://studentaid.gov/understand-aid/types/foster-care" },
            ].map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: C.offWhite, textDecoration: "none" }}>
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{link.label}</p>
                <ExternalLink size={12} color={C.midGreen} />
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>The relationship doesn't have to end at 18.</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Stay. Answer the phone. Show up. That is the most powerful thing you can do.
          </p>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}