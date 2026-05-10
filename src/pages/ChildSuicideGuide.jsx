import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp, Phone, ExternalLink } from "lucide-react";

const CRISIS_LINES = [
  { name: "988 Suicide & Crisis Lifeline", detail: "Call or text 988 — 24/7, free, confidential", phone: "988", color: "#C0392B" },
  { name: "Crisis Text Line", detail: "Text HOME to 741741", phone: null, text: "741741", color: "#4A90D9" },
  { name: "Trevor Project (LGBTQ+ youth)", detail: "Call 1-866-488-7386 or text START to 678-678", phone: "18664887386", color: "#7B5EA7" },
  { name: "SAMHSA Helpline", detail: "1-800-662-4357 — treatment referrals & info", phone: "18006624357", color: C.midGreen },
  { name: "Emergency", detail: "If your child is in immediate danger — call 911", phone: "911", color: "#C0392B" },
];

const SECTIONS = [
  {
    emoji: "⚠️",
    title: "Warning Signs to Watch For",
    color: "#C0392B",
    content: (
      <div className="space-y-4">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          Children from hard places — foster care, adoption, kinship — face significantly higher rates of suicidal ideation due to trauma, loss, and instability. Knowing the signs can save a life.
        </p>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: "#C0392B" }}>🚨 Immediate Warning Signs (Act Now)</p>
          <div className="space-y-1.5">
            {[
              "Talking about wanting to die or kill themselves",
              "Looking for ways to hurt themselves (searching online, collecting medications)",
              "Saying things like 'Everyone would be better off without me'",
              "Saying goodbye to people as if they won't see them again",
              "Giving away prized possessions",
              "Sudden calmness after a period of depression (can mean they've made a decision)",
              "Direct statements: 'I want to die,' 'I wish I was never born'",
            ].map((s, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: "#C0392B", flexShrink: 0 }}>•</span>
                <p className="text-xs" style={{ color: C.darkGreen }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: "#B84C2A" }}>⚠️ Behavioral Warning Signs</p>
          <div className="space-y-1.5">
            {[
              "Withdrawing from friends, family, and activities they used to enjoy",
              "Dramatic mood swings or changes in personality",
              "Increased aggression, irritability, or recklessness",
              "Sleeping too much or not being able to sleep",
              "Eating changes — not eating or overeating",
              "Declining school performance or refusing to go",
              "Increased use of alcohol or drugs",
              "Self-harm (cutting, burning) — often a precursor",
              "Writing or drawing about death in journals or art",
            ].map((s, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: "#B84C2A", flexShrink: 0 }}>•</span>
                <p className="text-xs" style={{ color: C.darkGreen }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: C.brown }}>📋 Risk Factors for Foster/Adoptive Children</p>
          <div className="space-y-1.5">
            {[
              "History of abuse, neglect, or multiple placements",
              "Unresolved grief over biological family separation",
              "LGBTQ+ identity without family acceptance",
              "Previous suicide attempts (strongest predictor)",
              "Mental health diagnoses (depression, PTSD, bipolar)",
              "Bullying or social isolation at school",
              "Anniversary dates of traumatic events",
              "Court dates or placement change news",
            ].map((s, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: C.brown, flexShrink: 0 }}>•</span>
                <p className="text-xs" style={{ color: C.darkGreen }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    emoji: "💬",
    title: "How to Talk to Your Child About It",
    color: C.midGreen,
    content: (
      <div className="space-y-4">
        <div className="rounded-xl p-3" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}33` }}>
          <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>✅ The Research Is Clear</p>
          <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
            Asking a child directly about suicide does <strong>NOT</strong> plant the idea or make it worse. It actually reduces risk by opening a safe conversation. Don't be afraid to ask.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>Say This (Word for Word):</p>
          <div className="space-y-2">
            {[
              "\"I've noticed you seem really down lately. Are you having any thoughts of hurting yourself or not wanting to be alive?\"",
              "\"You can tell me anything. I'm not going to freak out — I just want to understand what you're feeling.\"",
              "\"I love you and I'm worried about you. Whatever you're going through, we'll face it together.\"",
              "\"Have you ever thought about suicide or wished you were dead? It's okay to tell me the truth.\"",
            ].map((s, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <p className="text-xs italic" style={{ color: C.darkGreen }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: "#C0392B" }}>🚫 Avoid Saying:</p>
          <div className="space-y-1.5">
            {[
              "\"You have so much to live for\" — minimizes their pain",
              "\"That's selfish\" or \"Think about what that would do to us\" — causes shame",
              "\"You're just doing this for attention\" — dismisses real risk",
              "\"Promise me you won't\" — puts inappropriate responsibility on the child",
              "\"I can't believe you'd think that\" — shuts down communication",
            ].map((s, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: "#C0392B", flexShrink: 0 }}>✗</span>
                <p className="text-xs" style={{ color: C.darkGreen }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    emoji: "🏥",
    title: "What to Do Right Now",
    color: "#4A90D9",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: "#4A90D9" }}>If Your Child Has a Plan or Is in Immediate Danger:</p>
          <div className="space-y-2">
            {[
              { step: "1", text: "Call 911 or take them to your nearest emergency room immediately." },
              { step: "2", text: "Remove access to means — lock up medications, firearms, sharp objects, and cords right now." },
              { step: "3", text: "Stay with them — do not leave them alone under any circumstances." },
              { step: "4", text: "Call 988 while you wait for help — they can guide you through the next steps." },
              { step: "5", text: "Notify your caseworker if the child is in foster care — you are required to document this." },
            ].map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "#EEF4FF", border: "1px solid #C0D6F5" }}>
                <span className="font-bold text-sm flex-shrink-0" style={{ color: "#4A90D9" }}>{s.step}.</span>
                <p className="text-xs" style={{ color: C.darkGreen }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>If You're Concerned But Not in Crisis:</p>
          <div className="space-y-1.5">
            {[
              "Call their therapist or prescriber today — same day",
              "Schedule an emergency psychiatric evaluation through their pediatrician",
              "Contact your county's Mobile Crisis Team (most counties have 24/7 teams)",
              "Create a home safety plan together with their therapist",
              "Reduce access to means in the home as a precaution",
            ].map((s, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: C.midGreen, flexShrink: 0 }}>→</span>
                <p className="text-xs" style={{ color: C.darkGreen }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#B84C2A" }}>📋 Foster Parents: Documentation</p>
          <p className="text-xs leading-relaxed" style={{ color: "#B84C2A" }}>
            Document everything: date, time, what was said, what you did, and who you contacted. Notify your caseworker and licensing worker within 24 hours. Use the Incident Report tool in this app to create a formal record.
          </p>
          <Link to="/incident-reports" className="inline-block mt-2 text-[11px] font-bold px-3 py-1.5 rounded-lg"
            style={{ background: "#B84C2A", color: "#fff", textDecoration: "none" }}>
            Open Incident Reports →
          </Link>
        </div>
      </div>
    ),
  },
  {
    emoji: "🛡️",
    title: "Wraparound Services & Support",
    color: C.darkGreen,
    content: (
      <div className="space-y-4">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          Wraparound services coordinate multiple support systems around your child and family. Ask your caseworker, pediatrician, or school counselor to connect you with any of these:
        </p>

        <div className="space-y-3">
          {[
            {
              title: "Intensive In-Home Services",
              desc: "Therapists come to your home multiple times a week. Ideal for children who can't safely attend outpatient therapy. Ask your caseworker to request a referral.",
              tag: "Most effective for foster/adoptive kids",
              tagColor: C.midGreen,
            },
            {
              title: "Partial Hospitalization Program (PHP)",
              desc: "A step between inpatient and outpatient — child attends a therapeutic program for 4–6 hours a day, then comes home. Provides intensive mental health support without hospitalization.",
              tag: "Day treatment",
              tagColor: "#4A90D9",
            },
            {
              title: "Intensive Outpatient Program (IOP)",
              desc: "3–5 days per week, 3 hours per session of group and individual therapy. Less intensive than PHP but more structured than weekly therapy.",
              tag: "Step-down support",
              tagColor: "#7B5EA7",
            },
            {
              title: "Mobile Crisis Team",
              desc: "Most counties have a 24/7 mobile crisis unit — mental health professionals who come to your home during a crisis instead of sending police. Call 988 and ask to be connected to your local mobile crisis team.",
              tag: "24/7 available",
              tagColor: "#C0392B",
            },
            {
              title: "Family Preservation Services",
              desc: "Intensive short-term services (6–12 weeks) to stabilize your home and prevent placement disruption. Ask your caseworker if your child qualifies.",
              tag: "Placement prevention",
              tagColor: C.brown,
            },
            {
              title: "Therapeutic Foster Care",
              desc: "If your child needs a more therapeutic environment, this specialized placement includes built-in clinical support. Talk to your agency about whether this level of care is needed.",
              tag: "Higher level of care",
              tagColor: C.mutedText,
            },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{s.title}</p>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: s.tagColor + "18", color: s.tagColor }}>
                  {s.tag}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    emoji: "🌐",
    title: "Online Resources & Organizations",
    color: C.brown,
    content: (
      <div className="space-y-3">
        {[
          {
            name: "American Foundation for Suicide Prevention (AFSP)",
            desc: "Research-backed resources for families, including guides for talking to children about suicide.",
            url: "https://afsp.org",
          },
          {
            name: "Zero Suicide Institute",
            desc: "Evidence-based toolkit and training for caregivers and professionals.",
            url: "https://zerosuicide.edc.org",
          },
          {
            name: "National Alliance on Mental Illness (NAMI)",
            desc: "Family education programs, peer support groups, and crisis navigation guides.",
            url: "https://nami.org",
          },
          {
            name: "Child Mind Institute",
            desc: "Plain-language guides on suicide risk in children and how to help.",
            url: "https://childmind.org",
          },
          {
            name: "Trevor Project (LGBTQ+ youth)",
            desc: "Specialized support for LGBTQ+ youth — a particularly high-risk group in foster care.",
            url: "https://thetrevorproject.org",
          },
          {
            name: "Suicide Prevention Resource Center",
            desc: "Guides specifically for caregivers of high-risk youth populations.",
            url: "https://sprc.org",
          },
        ].map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: C.white, border: `1px solid ${C.cream}`, textDecoration: "none" }}>
            <ExternalLink size={14} color={C.brown} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{r.name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>{r.desc}</p>
            </div>
          </a>
        ))}
      </div>
    ),
  },
  {
    emoji: "💛",
    title: "Taking Care of Yourself Too",
    color: C.gold,
    content: (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          Supporting a child who is suicidal is one of the hardest things a caregiver can do. Your wellbeing matters — you cannot pour from an empty cup.
        </p>
        {[
          "You did not cause this. Suicidal ideation is a symptom of pain, not a parenting failure.",
          "It's okay to feel scared, helpless, or overwhelmed. Those are normal responses to a terrifying situation.",
          "Reach out to your own therapist, support group, or trusted friend. Don't carry this alone.",
          "Caregiver support groups (NAMI Family Support Group, Foster Parent Support Networks) are specifically designed for this.",
          "If you're in crisis yourself, call 988. You matter too.",
        ].map((s, i) => (
          <div key={i} className="flex gap-2 p-3 rounded-xl" style={{ background: "#FFFBEE", border: "1px solid #F4DFA0" }}>
            <span style={{ color: C.gold, flexShrink: 0 }}>💛</span>
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>{s}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export default function ChildSuicideGuide() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Suicide Prevention Guide"
        subtitle="Signs, support & wraparound services"
        backTo="/education-hub"
      />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">

        {/* Crisis banner — always visible */}
        <div className="rounded-2xl p-4" style={{ background: "#C0392B" }}>
          <p className="font-bold text-sm text-white mb-3">🚨 Is Your Child in Crisis Right Now?</p>
          <div className="space-y-2">
            {CRISIS_LINES.map((line, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold text-white">{line.name}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.75)" }}>{line.detail}</p>
                </div>
                {line.phone && (
                  <a href={`tel:${line.phone}`}
                    className="flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none" }}>
                    <Phone size={10} className="inline mr-1" />
                    Call
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Intro */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>You Are Not Alone in This Fear</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Children and teens in foster care, kinship, and adoptive placements are 2–4x more likely to experience suicidal ideation than the general population — due to trauma, loss, and instability. Knowing the signs and having a plan is an act of love.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, idx) => (
          <div key={idx} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ background: C.white, border: "none", cursor: "pointer" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.emoji}</span>
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{section.title}</p>
              </div>
              {open === idx
                ? <ChevronUp size={16} color={C.mutedText} />
                : <ChevronDown size={16} color={C.mutedText} />}
            </button>
            {open === idx && (
              <div className="px-4 pb-4 pt-2" style={{ background: C.white, borderTop: `1px solid ${C.cream}` }}>
                {section.content}
              </div>
            )}
          </div>
        ))}

        {/* Footer reminder */}
        <div className="rounded-xl p-3 flex gap-2" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
            This guide is educational. It does not replace a licensed mental health professional. If you believe your child is in danger, call <strong>911</strong> or <strong>988</strong> immediately.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}