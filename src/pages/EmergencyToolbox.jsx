import { useState, useEffect, useRef } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Timer, RotateCcw, CheckCircle2, ChevronLeft, Wind, Zap } from "lucide-react";
import EmergencyAlertButton from "@/components/emergency/EmergencyAlertButton";

// ── EMERGENCY SITUATIONS ──────────────────────────────────────────────────────
const SITUATIONS = [
  {
    id: "meltdown",
    emoji: "🌪️",
    label: "Full Meltdown",
    sublabel: "Screaming, crying, can't calm down",
    color: "#C0392B",
    bg: "#FDECEC",
    border: "#F5BEBE",
    urgency: "🚨 Do this RIGHT NOW",
  },
  {
    id: "aggressive",
    emoji: "🔥",
    label: "Hitting / Throwing",
    sublabel: "Physical aggression, throwing objects",
    color: "#B84C2A",
    bg: "#FEF3EE",
    border: "#F4C9B8",
    urgency: "🚨 Safety first",
  },
  {
    id: "panic",
    emoji: "😰",
    label: "Panic / Extreme Anxiety",
    sublabel: "Hyperventilating, shaking, frozen with fear",
    color: "#7B5EA7",
    bg: "#F3EEF9",
    border: "#CDB8E8",
    urgency: "⚡ Act within 60 seconds",
  },
  {
    id: "shutdown",
    emoji: "🌑",
    label: "Shutdown / Dissociated",
    sublabel: "Completely checked out, not responding",
    color: "#5B8DB8",
    bg: "#EEF4FB",
    border: "#BDD0E8",
    urgency: "🤫 Go slow and quiet",
  },
  {
    id: "defiant",
    emoji: "🧱",
    label: "Defiant / Refusing",
    sublabel: "Screaming 'no', power struggle, won't move",
    color: "#8E6B3E",
    bg: "#F5EFE6",
    border: "#DDC9B0",
    urgency: "⏸️ Don't escalate",
  },
];

// ── TECHNIQUES per situation ──────────────────────────────────────────────────
const TECHNIQUES = {
  meltdown: [
    {
      id: "m1",
      emoji: "🌬️",
      title: "You Go First — Regulate Yourself",
      time: 30,
      urgent: true,
      steps: [
        "Stop. Don't say anything yet.",
        "Take 3 slow breaths — in for 4, out for 6.",
        "Drop your shoulders. Unclench your jaw.",
        "Your calm is the most powerful tool you have right now.",
      ],
      tip: "Children CANNOT regulate above the adult's nervous system. You must go first — always.",
    },
    {
      id: "m2",
      emoji: "🗣️",
      title: "Say Less — Say This",
      time: 60,
      steps: [
        "Get low — crouch or sit on the floor near them.",
        "Say ONE phrase, softly: \"I'm here. You're safe.\"",
        "Don't explain. Don't reason. Don't consequence. Not yet.",
        "Repeat the phrase every 30 seconds if needed.",
      ],
      tip: "A brain in meltdown cannot process logic. Keep words to 5 or fewer at a time.",
    },
    {
      id: "m3",
      emoji: "🧊",
      title: "Ice Cube Reset",
      time: 90,
      steps: [
        "Go get an ice cube or cold pack.",
        "Place it in their hand silently — don't explain.",
        "Ask: \"Can you feel how cold that is?\"",
        "Stay quiet. Let the cold do the work.",
      ],
      tip: "Cold temperature activates the dive reflex — heart rate slows within 30 seconds. It really works.",
    },
    {
      id: "m4",
      emoji: "🪑",
      title: "Slow Rocking Together",
      time: 180,
      steps: [
        "Sit on the floor next to them.",
        "Begin rocking yourself slowly, forward and back.",
        "Don't require them to join — just model it.",
        "Count 50 rocks silently. Stay with them.",
      ],
      tip: "Rhythmic vestibular input is the fastest nervous system regulator in humans — it's built into us from infancy.",
    },
  ],
  aggressive: [
    {
      id: "a1",
      emoji: "🛡️",
      title: "Create Physical Safety First",
      time: 30,
      urgent: true,
      steps: [
        "Move breakable or dangerous objects away — do it calmly.",
        "Get everyone else out of the space if possible.",
        "Create distance — don't try to grab or restrain yet.",
        "Lower yourself to their eye level from a safe distance.",
      ],
      tip: "Restraint escalates most children with trauma histories. Distance and calm presence works better.",
    },
    {
      id: "a2",
      emoji: "🌬️",
      title: "Regulate Yourself — Out Loud",
      time: 60,
      steps: [
        "Say out loud: \"I'm taking a deep breath right now.\"",
        "Do it visibly — let them see you breathe.",
        "Keep your body loose and slow — not stiff.",
        "Say: \"I'm not going anywhere. I'm staying right here.\"",
      ],
      tip: "Narrating your own regulation teaches co-regulation. Kids mirror what they see, not what they hear.",
    },
    {
      id: "a3",
      emoji: "🧩",
      title: "Silently Offer a Regulating Object",
      time: 60,
      steps: [
        "Slide a stress ball, pillow, or soft object toward them.",
        "Don't say 'use this' — just make it available.",
        "Step back slightly but stay visible.",
        "When the storm eases, move gently closer.",
      ],
      tip: "Offering choice gives back a sense of control. Loss of control is often what caused the aggression.",
    },
    {
      id: "a4",
      emoji: "💧",
      title: "Water Break",
      time: 90,
      steps: [
        "When slightly calmer, offer a glass of cold water.",
        "Don't make it a reward or consequence — just offer it.",
        "Encourage slow sips, not gulping.",
        "Sit nearby while they drink. Stay quiet.",
      ],
      tip: "Drinking cold water slowly activates the parasympathetic nervous system and reduces cortisol.",
    },
  ],
  panic: [
    {
      id: "p1",
      emoji: "🤲",
      title: "Grounded Hands — Right Now",
      time: 60,
      urgent: true,
      steps: [
        "Take their hands in yours — gently, not grabbing.",
        "Press your palms firmly together for 10 seconds.",
        "Say: \"Feel my hands. I'm right here with you.\"",
        "Breathe slowly and visibly while holding.",
      ],
      tip: "Touch and pressure short-circuits the panic response. Physical grounding is faster than words.",
    },
    {
      id: "p2",
      emoji: "📦",
      title: "Box Breathing — Together",
      time: 120,
      steps: [
        "Say: \"Breathe with me. Watch my hand.\"",
        "Trace a box in the air: IN for 4 counts (top).",
        "HOLD for 4 counts (right side).",
        "OUT for 4 counts (bottom). HOLD for 4 (left). Repeat 4×.",
      ],
      tip: "Box breathing is used by first responders in high-stress situations. It works in under 2 minutes.",
    },
    {
      id: "p3",
      emoji: "🖐️",
      title: "5-4-3-2-1 Grounding",
      time: 180,
      steps: [
        "\"Name 5 things you can SEE right now.\" (Do it together.)",
        "\"Touch 4 things near you.\" (Guide their hands.)",
        "\"What are 3 sounds you can hear?\"",
        "\"2 things you can smell. 1 thing you can taste.\"",
      ],
      tip: "This technique pulls the brain out of the future (anxiety) and back into the present moment.",
    },
    {
      id: "p4",
      emoji: "🎵",
      title: "Hum Together",
      time: 90,
      steps: [
        "Begin humming a low, slow note yourself.",
        "Don't ask them to — just start.",
        "Hum the same note for 30 seconds.",
        "Feel the vibration in your chest. Invite them gently.",
      ],
      tip: "Humming stimulates the vagus nerve through vibration — it's one of the fastest calm-down tools that exists.",
    },
  ],
  shutdown: [
    {
      id: "s1",
      emoji: "🤫",
      title: "Less Is More — Just Be Present",
      time: 120,
      urgent: true,
      steps: [
        "Don't talk. Don't touch yet. Just be nearby.",
        "Sit on the floor, facing slightly away — less threatening.",
        "After 2 minutes, softly say: \"I'm here when you're ready.\"",
        "Then wait. Don't rush. This is the strategy.",
      ],
      tip: "Shutdown is a protective response to overwhelm. Pushing causes deeper shutdown. Presence without demand is the medicine.",
    },
    {
      id: "s2",
      emoji: "🕯️",
      title: "Dim the Environment",
      time: 60,
      steps: [
        "Turn off or dim overhead lights if possible.",
        "Reduce background noise — turn off TV, music.",
        "Remove extra people from the space.",
        "Create a cave-like, cozy feeling.",
      ],
      tip: "Sensory overload is often the cause of shutdown. Reducing input is the first treatment.",
    },
    {
      id: "s3",
      emoji: "🌊",
      title: "Weighted Pressure",
      time: 180,
      steps: [
        "Slowly lay a heavy blanket or pillow over their lap.",
        "Don't ask — just do it gently without eye contact.",
        "Sit beside them quietly.",
        "After a few minutes, gently place a hand on their arm.",
      ],
      tip: "Deep pressure activates the parasympathetic nervous system and signals safety to a shut-down brain.",
    },
    {
      id: "s4",
      emoji: "🎵",
      title: "Put on Calm Music — Quietly",
      time: 180,
      steps: [
        "Find slow, instrumental music — no lyrics.",
        "Play it quietly in the background.",
        "Don't comment on it — just let it exist.",
        "After a few minutes, say: \"This is nice music.\" Nothing more.",
      ],
      tip: "Music with 60 BPM (beats per minute) synchronizes with resting heart rate, gently signaling calm.",
    },
  ],
  defiant: [
    {
      id: "def1",
      emoji: "⏸️",
      title: "Pause — Don't Escalate",
      time: 30,
      urgent: true,
      steps: [
        "Stop issuing commands or ultimatums immediately.",
        "Take one visible deep breath yourself.",
        "Say nothing for 30 seconds — let the air settle.",
        "Your calm is disarming. Use it.",
      ],
      tip: "Every command issued during defiance increases the power struggle. The person who stays calmest wins.",
    },
    {
      id: "def2",
      emoji: "🔀",
      title: "Offer a Choice — Any Choice",
      time: 60,
      steps: [
        "Give two acceptable options — both lead where you need to go.",
        "Example: \"Do you want to walk to your room or hop?\"",
        "Don't offer choices you can't live with.",
        "Whatever they pick — accept it and move forward calmly.",
      ],
      tip: "Defiance is almost always about control. Returning micro-control dissolves the power struggle.",
    },
    {
      id: "def3",
      emoji: "🔄",
      title: "Side-by-Side Redirect",
      time: 90,
      steps: [
        "Stop facing them directly — stand or sit beside them instead.",
        "Start doing the thing you're asking them to do yourself.",
        "Don't narrate or invite them — just do it.",
        "Most children will join within 60–90 seconds.",
      ],
      tip: "Direct confrontation triggers the oppositional response. Parallel action bypasses it completely.",
    },
    {
      id: "def4",
      emoji: "🧱",
      title: "Wall Push-Ups to Discharge Tension",
      time: 120,
      steps: [
        "Start doing wall push-ups yourself — don't explain why.",
        "Count them out loud: '1... 2... 3...'",
        "Leave space for them to join in.",
        "Physical discharge breaks the cortisol loop fueling defiance.",
      ],
      tip: "Defiance is often adrenaline looking for an exit. Heavy work gives it a safe one.",
    },
  ],
};

// ── TIMER COMPONENT ───────────────────────────────────────────────────────────
function CountdownTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && left > 0) {
      ref.current = setInterval(() => setLeft(l => l - 1), 1000);
    } else if (left === 0) {
      clearInterval(ref.current);
      setRunning(false);
      onDone && onDone();
    }
    return () => clearInterval(ref.current);
  }, [running, left]);

  const pct = ((seconds - left) / seconds) * 100;
  const mins = Math.floor(left / 60);
  const secs = left % 60;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={C.cream} strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={C.midGreen} strokeWidth="3"
            strokeDasharray={`${pct} 100`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold" style={{ color: C.darkGreen }}>
            {mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${left}s`}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { setRunning(r => !r); }}
          className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: running ? C.cream : C.darkGreen, color: running ? C.darkGreen : "#fff", border: "none", cursor: "pointer" }}
        >
          {running ? "⏸ Pause" : left < seconds ? "▶ Resume" : "▶ Start Timer"}
        </button>
        <button
          onClick={() => { setLeft(seconds); setRunning(false); }}
          className="p-1.5 rounded-lg"
          style={{ background: C.cream, border: "none", cursor: "pointer" }}
        >
          <RotateCcw size={12} color={C.mutedText} />
        </button>
      </div>
    </div>
  );
}

// ── TECHNIQUE CARD ────────────────────────────────────────────────────────────
function TechniqueCard({ tech, color, bg }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState([]);

  function toggleCheck(i) {
    setChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  const allDone = checked.length === tech.steps.length;

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: done ? "#EAF4EA" : "#fff", border: `2px solid ${done ? C.midGreen + "66" : open ? color + "55" : C.cream}` }}>

      {/* Header tap target */}
      <button
        onClick={() => { if (!done) setOpen(o => !o); }}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        style={{ background: "transparent", border: "none", cursor: done ? "default" : "pointer" }}
      >
        <span className="text-2xl flex-shrink-0">{tech.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: done ? C.midGreen : C.darkGreen }}>{tech.title}</p>
            {tech.urgent && !done && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: "#FDECEC", color: "#C0392B" }}>Do First</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Timer size={10} color={C.mutedText} />
            <span className="text-[10px]" style={{ color: C.mutedText }}>
              ~{tech.time >= 60 ? `${Math.round(tech.time / 60)} min` : `${tech.time} sec`}
            </span>
          </div>
        </div>
        {done
          ? <CheckCircle2 size={22} color={C.midGreen} />
          : <span className="text-lg" style={{ color: C.mutedText }}>{open ? "▲" : "▼"}</span>}
      </button>

      {/* Expanded body */}
      {open && !done && (
        <div className="px-4 pb-4 space-y-3">
          {/* Timer */}
          <CountdownTimer seconds={tech.time} />

          {/* Steps */}
          <div className="space-y-2">
            {tech.steps.map((step, i) => (
              <button key={i} onClick={() => toggleCheck(i)}
                className="w-full flex items-start gap-3 text-left rounded-xl px-3 py-2.5 transition-all"
                style={{
                  background: checked.includes(i) ? "#EAF4EA" : C.offWhite,
                  border: `1px solid ${checked.includes(i) ? C.midGreen + "55" : C.cream}`,
                  cursor: "pointer",
                }}>
                <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold"
                  style={{ background: checked.includes(i) ? C.midGreen : C.cream, color: checked.includes(i) ? "#fff" : C.mutedText }}>
                  {checked.includes(i) ? "✓" : i + 1}
                </div>
                <p className="text-xs leading-relaxed"
                  style={{ color: checked.includes(i) ? C.midGreen : "#3a3028", textDecoration: checked.includes(i) ? "line-through" : "none" }}>
                  {step}
                </p>
              </button>
            ))}
          </div>

          {/* Why it works */}
          <div className="rounded-xl px-3 py-2.5" style={{ background: "#FEF9EC", border: "1px solid #E8C96A" }}>
            <p className="text-[10px] font-extrabold mb-0.5" style={{ color: "#7A5200" }}>💡 WHY THIS WORKS</p>
            <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>{tech.tip}</p>
          </div>

          <button
            onClick={() => { setDone(true); setOpen(false); }}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{ background: allDone ? C.midGreen : C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
            {allDone ? "✅ Done!" : "Mark Complete"}
          </button>
        </div>
      )}

      {done && (
        <div className="px-4 pb-3 flex items-center justify-between">
          <p className="text-xs font-bold" style={{ color: C.midGreen }}>Complete 🌿</p>
          <button onClick={() => { setDone(false); setChecked([]); setOpen(false); }}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg"
            style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}>
            <RotateCcw size={9} /> Redo
          </button>
        </div>
      )}
    </div>
  );
}

// ── BREATHE BANNER ────────────────────────────────────────────────────────────
function BreatheBanner() {
  const [phase, setPhase] = useState("in");
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(4);

  useEffect(() => {
    if (!active) return;
    const durations = { in: 4, hold: 2, out: 6 };
    const next = { in: "hold", hold: "out", out: "in" };
    setCount(durations[phase]);
    const tick = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => next[p]);
          return durations[next[phase]];
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [active, phase]);

  const phaseLabel = { in: "Breathe IN", hold: "Hold", out: "Breathe OUT" };
  const phaseColor = { in: C.midGreen, hold: C.gold, out: "#5B8DB8" };

  return (
    <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wind size={16} color={C.gold} />
          <p className="font-bold text-sm" style={{ color: C.cream }}>Parent Breathing Guide</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "#ffffff18", color: C.lightGreen }}>
          Do this FIRST
        </span>
      </div>
      <p className="text-[11px] mb-3" style={{ color: C.lightGreen }}>
        You cannot help your child regulate until YOU are regulated. Tap Start and breathe with this guide.
      </p>

      {active ? (
        <div className="text-center py-2">
          <div className="text-4xl font-extrabold mb-1" style={{ color: phaseColor[phase] }}>{count}</div>
          <p className="text-sm font-bold" style={{ color: phaseColor[phase] }}>{phaseLabel[phase]}</p>
          <button onClick={() => { setActive(false); setPhase("in"); setCount(4); }}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: "#ffffff22", color: C.cream, border: "none", cursor: "pointer" }}>
            Stop
          </button>
        </div>
      ) : (
        <button
          onClick={() => setActive(true)}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: C.gold, color: C.darkGreen, border: "none", cursor: "pointer" }}>
          <Wind size={14} /> Start Breathing With Me
        </button>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function EmergencyToolbox() {
  const [selected, setSelected] = useState(null);
  const sit = SITUATIONS.find(s => s.id === selected);
  const techs = selected ? TECHNIQUES[selected] : [];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="🚨 Emergency Toolbox"
        subtitle="Real-time crisis strategies"
        backTo={selected ? undefined : "/dashboard"}
        onBack={selected ? () => setSelected(null) : undefined}
      />

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {!selected ? (
          <>
            {/* Breathe first */}
            <BreatheBanner />

            {/* Situation selector */}
            <div>
              <p className="text-[11px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
                WHAT'S HAPPENING RIGHT NOW?
              </p>
              <div className="space-y-2.5">
                {SITUATIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className="w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all active:scale-95"
                    style={{ background: s.bg, border: `2px solid ${s.border}`, cursor: "pointer" }}
                  >
                    <span className="text-3xl flex-shrink-0">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: s.color }}>{s.label}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#3a3028" }}>{s.sublabel}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-lg">→</span>
                      <span className="text-[9px] font-bold" style={{ color: s.color }}>{s.urgency}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reminder */}
            <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <span className="text-2xl flex-shrink-0">💛</span>
              <div>
                <p className="font-bold text-xs mb-1" style={{ color: "#B84C2A" }}>Remember This</p>
                <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>
                  You are not failing when your child dysregulates. Dysregulation is a nervous system response — not a parenting report card. Your job is to be the safe, regulated person in the room. That's everything.
                </p>
              </div>
            </div>

            {/* Emergency Alert */}
            <EmergencyAlertButton variant="full" />

            {/* Crisis line */}
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: C.cream }}>
              <Zap size={14} color={C.brown} className="flex-shrink-0" />
              <p className="text-[11px]" style={{ color: C.darkGreen }}>
                In immediate danger? Call <strong>911</strong>. Mental health crisis? Call or text <strong>988</strong>.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Situation banner */}
            <div className="rounded-2xl p-4" style={{ background: sit.bg, border: `2px solid ${sit.border}` }}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{sit.emoji}</span>
                <div>
                  <p className="font-bold text-base" style={{ color: sit.color }}>{sit.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#3a3028" }}>{sit.sublabel}</p>
                  <p className="text-[11px] font-bold mt-1" style={{ color: sit.color }}>{sit.urgency}</p>
                </div>
              </div>
            </div>

            {/* Breathe first reminder */}
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}55` }}>
              <Wind size={14} color={C.midGreen} className="flex-shrink-0" />
              <p className="text-[11px]" style={{ color: C.darkGreen }}>
                <strong>Before anything:</strong> Take 3 slow breaths yourself. Your calm is the strategy.
              </p>
            </div>

            <p className="text-[10px] font-extrabold tracking-wider px-1" style={{ color: C.mutedText }}>
              TAP A TECHNIQUE TO START — START AT THE TOP
            </p>

            {/* Techniques */}
            <div className="space-y-3">
              {techs.map(tech => (
                <TechniqueCard key={tech.id} tech={tech} color={sit.color} bg={sit.bg} />
              ))}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
              <ChevronLeft size={16} /> Different Situation
            </button>

            <div className="pb-10" />
          </>
        )}
      </div>
    </div>
  );
}