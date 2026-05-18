import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const SECTIONS = [
  {
    emoji: "🧬",
    title: "What Are ACEs?",
    color: C.darkGreen,
    content: (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          ACEs stands for <strong>Adverse Childhood Experiences</strong> — a term from a landmark 1998 CDC–Kaiser Permanente study that examined how early traumatic experiences affect long-term health and wellbeing.
        </p>
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          The original study identified <strong>10 categories</strong> of adverse experiences that, when they happen before age 18, can have lasting effects on a child's brain, body, and behavior.
        </p>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>The 10 ACE Categories:</p>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              ["😢", "Emotional abuse", "Being repeatedly humiliated, threatened, or put down"],
              ["👊", "Physical abuse", "Being hit, kicked, or physically harmed by an adult"],
              ["🔒", "Sexual abuse", "Any sexual contact or behavior toward a child"],
              ["💔", "Emotional neglect", "Not feeling loved, important, or supported"],
              ["🍽️", "Physical neglect", "Going without basic needs like food, clothing, or medical care"],
              ["🍾", "Substance abuse in household", "Living with someone who used drugs or alcohol problematically"],
              ["🏥", "Mental illness in household", "Living with someone with depression, a mental illness, or suicidality"],
              ["⚖️", "Parental separation / divorce", "Parents separating or divorcing"],
              ["🚔", "Incarcerated household member", "A parent or household member going to prison"],
              ["👋", "Domestic violence", "Witnessing a mother or stepmother being abused"],
            ].map(([emoji, title, desc], i) => (
              <div key={i} className="flex gap-3 p-2.5 rounded-xl" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <span className="text-base flex-shrink-0">{emoji}</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{title}</p>
                  <p className="text-[11px]" style={{ color: C.mutedText }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: C.darkGreen }}>
          <p className="text-xs font-bold mb-1" style={{ color: C.cream }}>📊 The Research in Numbers</p>
          <div className="space-y-1">
            {[
              "67% of adults have at least 1 ACE",
              "1 in 8 adults have 4 or more ACEs",
              "Children in foster care have ACE rates 2–4x higher than the general population",
              "ACEs are among the most significant risk factors for chronic disease, mental illness, and substance use in adulthood",
            ].map((s, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: C.gold, flexShrink: 0 }}>•</span>
                <p className="text-[11px]" style={{ color: C.lightGreen }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    emoji: "🧠",
    title: "How Trauma Changes the Brain",
    color: "#4A90D9",
    content: (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          ACEs don't just cause emotional pain — they physically change the developing brain. Understanding this helps caregivers respond with compassion instead of frustration.
        </p>

        {[
          {
            title: "The Stress Response System Gets Stuck 'On'",
            body: "When a child is repeatedly exposed to threat, their brain's alarm system (amygdala) becomes hypersensitive. Small things feel like emergencies. This is why traumatized children often react to minor frustrations as if they're life-or-death — because their brain literally wired itself that way for survival.",
            color: "#C0392B",
          },
          {
            title: "The Thinking Brain Shuts Down Under Stress",
            body: "The prefrontal cortex — responsible for logic, impulse control, and decision-making — goes offline when the stress response fires. This means a dysregulated child cannot reason, negotiate, or learn consequences in the moment. They literally can't access that part of their brain until they're calm.",
            color: "#4A90D9",
          },
          {
            title: "Toxic Stress Disrupts Brain Architecture",
            body: "Chronic, unrelenting stress (without a supportive adult buffer) disrupts how the brain physically builds itself. This affects memory, attention, language processing, and emotional regulation for years — but the brain is highly plastic and can rewire with consistent safe relationships.",
            color: C.brown,
          },
          {
            title: "The Body Keeps the Score",
            body: "Trauma is stored physically, not just emotionally. Children with high ACEs often have higher rates of headaches, stomachaches, and illness — because the stress hormones that flood the body during trauma take a physical toll over time.",
            color: C.midGreen,
          },
        ].map((item, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.title}</p>
            <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{item.body}</p>
          </div>
        ))}

        <div className="rounded-xl p-3" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}33` }}>
          <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>✅ The Good News: Resilience Is Real</p>
          <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
            The single most powerful buffer against the effects of ACEs is <strong>one stable, caring, consistent adult</strong>. You don't have to fix everything — you just have to show up, again and again. That rewires the brain over time.
          </p>
        </div>
      </div>
    ),
  },
  {
    emoji: "🔍",
    title: "How ACEs Show Up in Behavior",
    color: C.brown,
    content: (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          Many behaviors that look like defiance, manipulation, or laziness are actually survival responses. Here's what trauma can look like in a child's day-to-day life:
        </p>

        {[
          { behavior: "Explosive anger or meltdowns over 'small' things", why: "Their stress threshold is much lower due to a hyperactivated alarm system" },
          { behavior: "Lying — even about obvious things", why: "Lying was a survival skill when the truth was dangerous" },
          { behavior: "Hoarding or stealing food", why: "Their body learned to prepare for scarcity, even when food is now available" },
          { behavior: "Clinginess or extreme separation anxiety", why: "Attachment disruptions create fear of abandonment" },
          { behavior: "Self-harm or self-soothing behaviors", why: "Their nervous system is trying to regulate overwhelming feelings" },
          { behavior: "Difficulty with transitions", why: "Unpredictability was historically dangerous — change triggers survival responses" },
          { behavior: "Sexualized behavior (in young children)", why: "May indicate exposure to sexual abuse or adult sexual content" },
          { behavior: "Emotional numbness or flat affect", why: "Shutting down emotions was a protective strategy" },
          { behavior: "Hypervigilance — always scanning for danger", why: "Their nervous system is constantly monitoring for threat" },
          { behavior: "Poor school performance despite obvious intelligence", why: "Trauma impairs working memory, focus, and the ability to learn in stressed states" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-xs font-bold mb-0.5" style={{ color: C.darkGreen }}>{item.behavior}</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>
              <span style={{ color: C.midGreen, fontWeight: "bold" }}>Why: </span>{item.why}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    emoji: "🩺",
    title: "Talking to Your Pediatrician About ACEs",
    color: "#E07A5F",
    content: (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          Many pediatricians now screen for ACEs as part of well-child visits — especially in states that have adopted the CDC's recommendations. Here's how to bring it up yourself:
        </p>

        <div className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
          <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>📋 What to Say at the Appointment:</p>
          <div className="space-y-2">
            {[
              "\"I wanted to share some history about [child's name] that I think is relevant to their care. They've experienced some significant early adversity — including [general description, e.g., abuse, neglect, multiple placements] — and I want to make sure that's in their medical record and factoring into how we care for them.\"",
              "\"I've heard about ACE screenings — is that something your practice does? I'd like this child's history to be considered in their health care.\"",
              "\"Can you refer us to a trauma-informed therapist who works with children from hard places? We need someone who understands foster care / adoption / kinship trauma.\"",
              "\"[Child] is showing signs of [behavior]. Could this be related to their early trauma history? What do you recommend?\"",
            ].map((script, i) => (
              <div key={i} className="rounded-lg p-2.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-xs italic" style={{ color: C.darkGreen }}>{script}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>What to Bring:</p>
          <div className="space-y-1.5">
            {[
              "Any known history of abuse, neglect, or household instability",
              "Previous diagnoses (PTSD, RAD, FASD, ADHD, etc.)",
              "Current medications and prescribers",
              "A list of behaviors or symptoms you're concerned about",
              "Your child's school IEP or 504 if they have one",
            ].map((item, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: "#E07A5F", flexShrink: 0 }}>→</span>
                <p className="text-xs" style={{ color: C.darkGreen }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#B84C2A" }}>⚠️ If Your Pediatrician Doesn't Know About ACEs</p>
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
            Not all providers are trained in trauma-informed care. If your pediatrician dismisses your concerns or isn't familiar with ACEs, you have every right to ask for a referral to a specialist — or find a new provider who understands trauma.
          </p>
        </div>
      </div>
    ),
  },
  {
    emoji: "🛋️",
    title: "Talking to a Therapist About ACEs",
    color: "#7B5EA7",
    content: (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          Finding the right therapist matters enormously. Not all therapists are trained in childhood trauma — here's how to find and effectively work with one who is.
        </p>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>Questions to Ask a Potential Therapist:</p>
          <div className="space-y-2">
            {[
              "\"Are you trained in trauma-informed care for children? Which modalities do you use — TF-CBT, EMDR, CPP, or others?\"",
              "\"Do you have experience with foster care, adoption, or kinship children specifically?\"",
              "\"How do you involve the caregiver in treatment? I want to be an active part of this process.\"",
              "\"Are your approaches connection-based, attachment-informed, and focused on felt safety and regulation support?\"",
              "\"How do you handle disclosures of abuse during sessions?\"",
            ].map((q, i) => (
              <div key={i} className="rounded-lg p-2.5" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <p className="text-xs italic" style={{ color: C.darkGreen }}>{q}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: "#7B5EA7" }}>Evidence-Based Therapy Types for Trauma:</p>
          <div className="space-y-2">
            {[
              { name: "TF-CBT (Trauma-Focused CBT)", desc: "Gold standard for childhood trauma. Helps children process traumatic memories and teaches coping skills." },
              { name: "EMDR (Eye Movement Desensitization)", desc: "Processes traumatic memories stored in the brain through guided bilateral stimulation." },
              { name: "CPP (Child-Parent Psychotherapy)", desc: "For ages 0–5. Focuses on the caregiver-child relationship as the vehicle for healing." },
              { name: "Play Therapy", desc: "Children process trauma through play — especially effective for young children who can't verbalize their experiences." },
              { name: "Connection-Based Parenting Support", desc: "Attachment-informed and trauma-aware support focused on felt safety, regulation, and caregiver-child connection." },
            ].map((t, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-xs font-bold mb-0.5" style={{ color: "#7B5EA7" }}>{t.name}</p>
                <p className="text-[11px]" style={{ color: C.mutedText }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}33` }}>
          <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>💡 Your Role in Therapy</p>
          <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
            You are not just the transportation. Research consistently shows that caregiver involvement — learning the same skills, applying them at home — dramatically improves outcomes. Ask to be included in sessions and ask for "homework" you can practice together.
          </p>
        </div>
      </div>
    ),
  },
  {
    emoji: "🛡️",
    title: "Building Resilience: What You Can Do",
    color: C.midGreen,
    content: (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
          The research on resilience is one of the most hopeful findings in child development science. ACEs do not determine destiny — protective factors can dramatically change outcomes.
        </p>

        {[
          {
            emoji: "🌳",
            title: "Be the One Consistent Adult",
            body: "You don't have to be perfect. You have to be predictable, warm, and present. Show up the same way, every day. That consistency physically rewires a traumatized brain.",
          },
          {
            emoji: "🔁",
            title: "Regulate, Relate, Reason (in that order)",
            body: "Never try to reason with a dysregulated child. First help them calm their body, then reconnect emotionally, then — only then — address the behavior.",
          },
          {
            emoji: "🗣️",
            title: "Name What Happened (at the right time)",
            body: "Children need a narrative for their own life. Age-appropriate, honest conversations about their history — done with a therapist's guidance — help them make sense of their story instead of filling in the gaps with shame.",
          },
          {
            emoji: "🎯",
            title: "Build Predictability Into Every Day",
            body: "A consistent routine is one of the most powerful therapeutic tools available to a caregiver. Meals at the same time, bedtime the same way, transitions announced in advance — these rebuild a sense of safety.",
          },
          {
            emoji: "💬",
            title: "Help Them Build a Feelings Vocabulary",
            body: "Children who can name what they feel are significantly better at regulating it. Practice identifying and naming emotions during calm moments — not during meltdowns.",
          },
          {
            emoji: "🏅",
            title: "Celebrate Their Strengths",
            body: "ACEs are not the whole story. Help your child build a narrative of strength — what they've survived, how far they've come, what they're capable of. Strengths-based language changes how children see themselves.",
          },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <span className="text-xl flex-shrink-0">{item.emoji}</span>
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ color: C.darkGreen }}>{item.title}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    emoji: "🌐",
    title: "Trusted Resources to Learn More",
    color: C.gold,
    content: (
      <div className="space-y-3">
        {[
          {
            name: "CDC ACEs Resource Center",
            desc: "The official CDC hub for ACE research, data, and prevention resources.",
            url: "https://www.cdc.gov/violenceprevention/aces/index.html",
          },
          {
            name: "Center on the Developing Child — Harvard",
            desc: "Plain-language science on how early adversity affects brain development. Excellent videos.",
            url: "https://developingchild.harvard.edu",
          },
          {
            name: "National Child Traumatic Stress Network",
            desc: "Family and professional resources for trauma-informed care, felt safety, and regulation support.",
            url: "https://www.nctsn.org",
          },
          {
            name: "The Body Keeps the Score (Book)",
            desc: "By Dr. Bessel van der Kolk. The most important book on trauma and the body — available at most libraries.",
            url: "https://www.besselvanderkolk.com/resources/the-body-keeps-the-score",
          },
          {
            name: "ACEs Too High (News Site)",
            desc: "Ongoing journalism and research coverage on ACEs and trauma-informed approaches.",
            url: "https://acestoohigh.com",
          },
          {
            name: "National Child Traumatic Stress Network",
            desc: "Comprehensive resources on childhood trauma for families and professionals.",
            url: "https://www.nctsn.org",
          },
        ].map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: C.white, border: `1px solid ${C.cream}`, textDecoration: "none" }}>
            <ExternalLink size={14} color={C.gold} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{r.name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>{r.desc}</p>
            </div>
          </a>
        ))}
      </div>
    ),
  },
];

export default function ACEsGuide() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="ACEs Awareness Guide"
        subtitle="Understanding the science of early trauma"
        backTo="/education-hub"
      />

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>🧬 ACEs: Adverse Childhood Experiences</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Understanding ACEs helps caregivers see behavior through a trauma lens — and respond with empathy instead of frustration. This guide explains the science and gives you the words to advocate for your child with their care team.
          </p>
        </div>

        {/* Important disclaimer */}
        <div className="rounded-xl p-3 flex gap-2" style={{ background: "#FFFBEE", border: "1px solid #F4DFA0" }}>
          <span className="text-sm flex-shrink-0">💡</span>
          <p className="text-[11px] leading-relaxed" style={{ color: "#7A5200" }}>
            <strong>This is educational content only</strong> — not a clinical screening tool. ACE assessments should always be done by a licensed healthcare provider. Use this guide to understand the science and advocate for your child.
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

        {/* Footer */}
        <div className="rounded-xl p-3" style={{ background: C.cream }}>
          <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
            <strong>Remember:</strong> ACEs are not destiny. Every safe, consistent, loving interaction you have with your child is building new neural pathways. You are the most powerful intervention available.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}