import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Timer, RefreshCw, CheckCircle2 } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";

const AROUSAL_STATES = [
  {
    id: "hyper",
    label: "Hyper / Revved Up",
    emoji: "⚡",
    color: "#B84C2A",
    bg: "#FEF3EE",
    border: "#F4C9B8",
    description: "Running, bouncing, can't stop moving, loud, spinning",
    goal: "Bring the nervous system DOWN — slow, heavy, rhythmic input",
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed / Shutdown",
    emoji: "🌊",
    color: "#5B8DB8",
    bg: "#EEF4FB",
    border: "#BDD0E8",
    description: "Meltdown, crying, covering ears, hiding, frozen",
    goal: "Create safety and reduce sensory load — gentle, predictable input",
  },
  {
    id: "lethargic",
    label: "Lethargic / Checked Out",
    emoji: "🌑",
    color: C.brown,
    bg: "#F5EFE6",
    border: "#DDC9B0",
    description: "Limp, zoned out, won't engage, slow to respond",
    goal: "Bring the nervous system UP — alerting, stimulating input",
  },
  {
    id: "anxious",
    label: "Anxious / Worried",
    emoji: "😰",
    color: "#7B5EA7",
    bg: "#F3EEF9",
    border: "#CDB8E8",
    description: "Clingy, asking 'what if', stomach aches, rigid",
    goal: "Regulate through breath and proprioception — grounding input",
  },
  {
    id: "dysregulated",
    label: "Dysregulated / Aggressive",
    emoji: "🔥",
    color: "#C0392B",
    bg: "#FDECEC",
    border: "#F5BEBE",
    description: "Hitting, throwing, screaming, defiant, unsafe",
    goal: "Safety first — co-regulate before any activities",
  },
];

const ACTIVITIES = {
  hyper: [
    {
      id: "h1", title: "Wall Push-Ups", emoji: "🧱", duration: "3 min",
      steps: [
        "Stand arm's length from a wall",
        "Place palms flat on the wall at shoulder height",
        "Push slowly and firmly — hold 5 seconds, release",
        "Repeat 10 times, breathing slowly each time",
      ],
      why: "Heavy work (proprioception) sends calming signals to the nervous system.",
      materials: "Just a wall",
    },
    {
      id: "h2", title: "Bear Hug Squeeze", emoji: "🐻", duration: "2 min",
      steps: [
        "Have child cross arms over their own chest",
        "Squeeze tightly like a self-hug — hold 10 seconds",
        "Release and take a slow breath in and out",
        "Repeat 5–8 times",
      ],
      why: "Deep pressure activates the parasympathetic 'rest and digest' system.",
      materials: "None needed",
    },
    {
      id: "h3", title: "Slow Breathing Train", emoji: "🚂", duration: "3 min",
      steps: [
        "Breathe IN for 4 counts (train leaving the station)",
        "Hold for 2 counts (at the station)",
        "Breathe OUT for 6 counts (train arriving slowly)",
        "Repeat 6–8 times together",
      ],
      why: "Extended exhales activate the vagus nerve and slow heart rate.",
      materials: "None needed",
    },
    {
      id: "h4", title: "Heavy Blanket Roll", emoji: "🌯", duration: "3 min",
      steps: [
        "Lay a blanket on the floor",
        "Have child lie at one edge and roll themselves up like a burrito",
        "Apply gentle firm pressure with your hands along their body",
        "Hold 60 seconds, then unroll slowly",
      ],
      why: "Full-body deep pressure calms a hyper-aroused nervous system quickly.",
      materials: "A blanket or beach towel",
    },
    {
      id: "h5", title: "Floor Marching", emoji: "🪖", duration: "3 min",
      steps: [
        "Have child sit cross-legged on the floor",
        "March hands on thighs — slow and heavy — left, right, left, right",
        "Count together to 30, then pause and breathe",
        "Repeat 3 times",
      ],
      why: "Slow, bilateral rhythmic movement organizes the brain and reduces cortisol.",
      materials: "Floor space",
    },
  ],
  overwhelmed: [
    {
      id: "o1", title: "Cozy Corner Retreat", emoji: "🏠", duration: "3 min",
      steps: [
        "Guide child to a quiet, dim corner or small space",
        "Bring one soft item (stuffed animal, blanket)",
        "Sit nearby — don't talk, just be present",
        "After 2 minutes, softly say 'I'm right here with you'",
      ],
      why: "Reducing sensory input gives an overwhelmed nervous system space to reset.",
      materials: "Quiet corner, soft item",
    },
    {
      id: "o2", title: "5-4-3-2-1 Grounding", emoji: "🖐️", duration: "3 min",
      steps: [
        "Say: 'Let's find 5 things you can see' — name them together",
        "Then 4 things you can touch — touch each one",
        "Then 3 sounds you can hear",
        "Then 2 things you can smell, 1 you can taste",
      ],
      why: "Grounding redirects the brain from threat response to present awareness.",
      materials: "None needed",
    },
    {
      id: "o3", title: "Ice Cube in Hands", emoji: "🧊", duration: "2 min",
      steps: [
        "Place an ice cube (or cold pack) in child's hands",
        "Ask: 'Can you feel how cold it is? Is it getting warmer?'",
        "Focus attention on the sensation together",
        "After 60 seconds, warm hands by rubbing together",
      ],
      why: "Cold sensation activates the dive reflex, rapidly slowing heart rate.",
      materials: "Ice cube or cold pack",
    },
    {
      id: "o4", title: "Humming Together", emoji: "🎵", duration: "3 min",
      steps: [
        "Start humming a slow, low sound yourself",
        "Gently invite child to hum with you — don't force it",
        "Hum a simple tune or just a steady note",
        "Feel the vibration in your chest together",
      ],
      why: "Humming stimulates the vagus nerve through vocal vibration — powerful co-regulation.",
      materials: "None needed",
    },
    {
      id: "o5", title: "Slow Rocking", emoji: "🪑", duration: "3 min",
      steps: [
        "Sit with child in a rocking chair, glider, or on the floor",
        "Rock slowly forward and back — steady rhythm",
        "Keep your voice quiet and low",
        "Count rocks silently in your head — aim for 50",
      ],
      why: "Rhythmic vestibular input (rocking) is the most ancient self-regulation tool humans have.",
      materials: "Rocking chair or floor",
    },
  ],
  lethargic: [
    {
      id: "l1", title: "Animal Walks", emoji: "🦁", duration: "3 min",
      steps: [
        "Pick an animal: crab walk, bear walk, frog jumps, or snake slither",
        "Set a path across the room and back",
        "Race each other — make it silly and fun",
        "Do 3 different animals back to back",
      ],
      why: "Cross-body movement and vestibular input are alerting to a sluggish nervous system.",
      materials: "Open floor space",
    },
    {
      id: "l2", title: "Cold Water Face Splash", emoji: "💧", duration: "1 min",
      steps: [
        "Go to the bathroom sink together",
        "Splash cool water on face 3–5 times",
        "Pat dry with a towel — don't rub",
        "Look in the mirror and smile (even a fake smile helps!)",
      ],
      why: "Cold water on the face activates the trigeminal nerve, boosting alertness quickly.",
      materials: "Sink, towel",
    },
    {
      id: "l3", title: "Jump & Count", emoji: "🏀", duration: "3 min",
      steps: [
        "Find a safe spot (trampoline, bed, or just floor jumping)",
        "Count jumps out loud together — aim for 50",
        "Try variations: jump with arms up, spin jump, silent jump",
        "End with 5 slow deep breaths",
      ],
      why: "Jumping is the fastest vestibular input — it wakes up both brain hemispheres.",
      materials: "Open space",
    },
    {
      id: "l4", title: "Peppermint Sniff", emoji: "🌿", duration: "1 min",
      steps: [
        "Open a peppermint oil roller, lotion, or candy",
        "Have child take 3 slow deep sniffs",
        "Ask 'What does it make you think of?'",
        "Rub a tiny bit on wrists if possible",
      ],
      why: "Peppermint scent is clinically proven to increase alertness and cognitive focus.",
      materials: "Peppermint anything",
    },
    {
      id: "l5", title: "Chewy Snack Break", emoji: "🍎", duration: "3 min",
      steps: [
        "Offer something crunchy or chewy: apple, carrot, pretzels, gum",
        "Encourage slow, deliberate chewing — exaggerate together",
        "Count chews: 'Let's chew this 20 times!'",
        "Notice how the body feels after",
      ],
      why: "Oral-motor input (chewing) is highly alerting and organizing to the nervous system.",
      materials: "Crunchy or chewy snack",
    },
  ],
  anxious: [
    {
      id: "a1", title: "Box Breathing", emoji: "📦", duration: "3 min",
      steps: [
        "Breathe IN for 4 counts — draw the top of the box in the air",
        "HOLD for 4 counts — draw the right side",
        "Breathe OUT for 4 counts — draw the bottom",
        "HOLD for 4 counts — draw the left side. Repeat 4×",
      ],
      why: "Box breathing is used by Navy SEALs to regulate fear response — it works for kids too.",
      materials: "None needed",
    },
    {
      id: "a2", title: "Worry Rock Squeeze", emoji: "🪨", duration: "3 min",
      steps: [
        "Find a smooth rock, stress ball, or firm small object",
        "Hold it in both hands and squeeze tight for 10 seconds",
        "Release completely and feel the difference",
        "Repeat while breathing: squeeze on inhale, release on exhale",
      ],
      why: "Proprioceptive input through hands channels anxious energy constructively.",
      materials: "Rock, stress ball, or firm object",
    },
    {
      id: "a3", title: "Safe Place Visualization", emoji: "🌄", duration: "3 min",
      steps: [
        "Ask: 'Where is the safest, most peaceful place you can imagine?'",
        "Close eyes together — describe it: colors, smells, sounds",
        "Spend 2 minutes 'visiting' that place in your mind",
        "Take one deep breath and open eyes slowly",
      ],
      why: "Guided visualization activates the prefrontal cortex, reducing amygdala reactivity.",
      materials: "Quiet space",
    },
    {
      id: "a4", title: "Progressive Muscle Release", emoji: "🧘", duration: "3 min",
      steps: [
        "Start at feet: scrunch toes tight for 5 seconds, release",
        "Move up: tighten calves, thighs, belly, fists, shoulders, face",
        "Each muscle: tighten 5 seconds, then fully release",
        "Notice the warm relaxed feeling after each release",
      ],
      why: "Intentional tension-release teaches the body to recognize and choose calm.",
      materials: "Comfortable spot to sit or lie down",
    },
    {
      id: "a5", title: "Weighted Lap Pad", emoji: "🧸", duration: "3 min",
      steps: [
        "Place a heavy pillow, folded blanket, or stuffed animals in child's lap",
        "Sit quietly together for 2–3 minutes",
        "Encourage slow breathing — no need to talk",
        "Ask after: 'Does your body feel a little calmer?'",
      ],
      why: "Deep pressure to the lap activates the parasympathetic nervous system within minutes.",
      materials: "Heavy pillow, blanket, or weighted object",
    },
  ],
  dysregulated: [
    {
      id: "d1", title: "Safety First — Space & Presence", emoji: "🛡️", duration: "3 min",
      steps: [
        "Move away from objects that could cause harm — stay calm yourself",
        "Get low (crouch or sit on the floor) to reduce threat perception",
        "Use the fewest words possible: 'I'm here. You're safe.'",
        "Wait. Don't reason, lecture, or consequence yet.",
      ],
      why: "A dysregulated brain cannot learn. The only job right now is safety and co-regulation.",
      materials: "Your regulated presence",
    },
    {
      id: "d2", title: "Regulate Yourself First", emoji: "🌬️", duration: "2 min",
      steps: [
        "Notice your own body: am I tense, breathing fast, clenching?",
        "Take 3 slow breaths before saying anything",
        "Soften your face, drop your shoulders, slow your movements",
        "Your regulated nervous system is contagious — it works",
      ],
      why: "Children can't regulate above the adult's nervous system state. You go first.",
      materials: "None — just you",
    },
    {
      id: "d3", title: "Offering a Regulating Object", emoji: "🧩", duration: "3 min",
      steps: [
        "Silently slide a calming object within reach: stress ball, ice pack, fidget",
        "Don't require them to use it — just make it available",
        "Step slightly back to give space but stay visible",
        "When the storm begins to pass, move gently closer",
      ],
      why: "Offering (not requiring) gives control back to the child — control reduces threat.",
      materials: "Stress ball, ice pack, or fidget toy",
    },
    {
      id: "d4", title: "Sensory Reset After Storm", emoji: "🌤️", duration: "3 min",
      steps: [
        "Once calm begins, offer water to drink slowly",
        "Guide to a quieter, lower-light space if possible",
        "Offer a blanket or soft item without words",
        "Sit nearby in silence — let them lead when they're ready to connect",
      ],
      why: "After a meltdown, the brain needs 20–30 minutes to fully recover. Honor that recovery time.",
      materials: "Water, blanket, quiet space",
    },
  ],
};

function ActivityCard({ activity, stateColor, stateBg }) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [stepsDone, setStepsDone] = useState([]);

  function toggleStep(i) {
    setStepsDone(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  }

  function handleStart() {
    setStarted(true);
    setDone(false);
    setStepsDone([]);
  }

  function handleDone() {
    setDone(true);
    setStarted(false);
  }

  const allChecked = stepsDone.length === activity.steps.length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${done ? C.midGreen + "66" : C.cream}`, background: done ? "#EAF4EA" : "#fff" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-2xl">{activity.emoji}</span>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{activity.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: stateBg, color: stateColor }}>
              <Timer size={9} /> {activity.duration}
            </span>
            <span className="text-[10px]" style={{ color: C.mutedText }}>{activity.materials}</span>
          </div>
        </div>
        {done && <CheckCircle2 size={22} color={C.midGreen} />}
      </div>

      {/* Expanded steps */}
      {started && (
        <div className="px-4 pb-4 space-y-3">
          <div className="space-y-2">
            {activity.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => toggleStep(i)}
                className="w-full flex items-start gap-3 text-left rounded-xl px-3 py-2.5 transition-all"
                style={{
                  background: stepsDone.includes(i) ? "#EAF4EA" : C.offWhite,
                  border: `1px solid ${stepsDone.includes(i) ? C.midGreen + "44" : C.cream}`,
                  cursor: "pointer",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: stepsDone.includes(i) ? C.midGreen : C.cream,
                    color: stepsDone.includes(i) ? "#fff" : C.mutedText,
                  }}
                >
                  {stepsDone.includes(i) ? "✓" : i + 1}
                </div>
                <p className="text-xs leading-relaxed" style={{
                  color: stepsDone.includes(i) ? C.midGreen : "#3a3028",
                  textDecoration: stepsDone.includes(i) ? "line-through" : "none",
                }}>
                  {step}
                </p>
              </button>
            ))}
          </div>

          {/* Why it works */}
          <div className="rounded-xl px-3 py-2.5" style={{ background: "#F5EFE6", border: `1px solid ${C.cream}` }}>
            <p className="text-[10px] font-extrabold mb-0.5" style={{ color: C.brown }}>💡 WHY THIS WORKS</p>
            <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>{activity.why}</p>
          </div>

          <button
            onClick={handleDone}
            className="w-full py-2.5 rounded-xl font-bold text-sm"
            style={{
              background: allChecked ? C.midGreen : C.darkGreen,
              color: "#fff", border: "none", cursor: "pointer",
            }}
          >
            {allChecked ? "✅ Mark Complete!" : "Done with this activity"}
          </button>
        </div>
      )}

      {/* Collapsed actions */}
      {!started && !done && (
        <div className="px-4 pb-4">
          <button
            onClick={handleStart}
            className="w-full py-2.5 rounded-xl font-bold text-sm"
            style={{ background: stateColor, color: "#fff", border: "none", cursor: "pointer" }}
          >
            Start Activity →
          </button>
        </div>
      )}

      {done && (
        <div className="px-4 pb-4 flex gap-2">
          <p className="flex-1 text-xs font-bold" style={{ color: C.midGreen }}>Great job! 🌿 Activity complete.</p>
          <button
            onClick={handleStart}
            className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg"
            style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}
          >
            <RefreshCw size={9} /> Redo
          </button>
        </div>
      )}
    </div>
  );
}

export default function SensoryToolbox() {
  const [selected, setSelected] = useState(null);

  const state = AROUSAL_STATES.find(s => s.id === selected);
  const activities = selected ? ACTIVITIES[selected] : [];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Sensory Toolbox"
        subtitle="3-minute regulation activities"
        backTo="/dashboard"
        onBack={selected ? () => setSelected(null) : undefined}
      />

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {!selected ? (
          <>
            {/* Intro */}
            <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
              <p className="font-serif font-bold text-sm mb-1" style={{ color: C.cream }}>
                🧠 What's your child's body doing right now?
              </p>
              <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
                Select the arousal state that best describes what you're seeing. You'll get 5 curated sensory activities matched to that state — each takes about 3 minutes.
              </p>
            </div>

            {/* State selector */}
            <div className="space-y-2.5">
              {AROUSAL_STATES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className="w-full flex items-start gap-4 rounded-2xl p-4 text-left transition-all hover:shadow-md"
                  style={{ background: s.bg, border: `1.5px solid ${s.border}`, cursor: "pointer" }}
                >
                  <span className="text-3xl flex-shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: s.color }}>{s.label}</p>
                    <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "#3a3028" }}>{s.description}</p>
                  </div>
                  <span className="text-lg flex-shrink-0 mt-1">→</span>
                </button>
              ))}
            </div>

            {/* TBRI note */}
            <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
              <p className="text-[10px] leading-relaxed text-center" style={{ color: C.mutedText }}>
                All activities are grounded in <strong>TBRI® sensory principles</strong> and the work of Dr. Lucy Jane Miller. Always follow your child's lead and stop any activity they resist.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* State header */}
            <div
              className="rounded-2xl p-4"
              style={{ background: state.bg, border: `1.5px solid ${state.border}` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{state.emoji}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: state.color }}>{state.label}</p>
                  <p className="text-[10px]" style={{ color: "#3a3028" }}>{state.description}</p>
                </div>
              </div>
              <div className="rounded-lg px-3 py-2" style={{ background: "#fff8" }}>
                <p className="text-[10px] font-bold" style={{ color: state.color }}>🎯 GOAL: {state.goal}</p>
              </div>
            </div>

            <p className="text-[10px] font-extrabold tracking-wider px-1" style={{ color: C.mutedText }}>
              5 ACTIVITIES — TAP TO START
            </p>

            {/* Activity cards */}
            <div className="space-y-3">
              {activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  stateColor={state.color}
                  stateBg={state.bg}
                />
              ))}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
            >
              <ChevronLeft size={16} /> Choose a Different State
            </button>

            <div className="pb-8" />
          </>
        )}
      </div>
    </div>
  );
}