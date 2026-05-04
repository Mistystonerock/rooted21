import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { ChevronRight, ChevronDown, Printer, RotateCcw, CheckCircle2 } from "lucide-react";

const WORKSHEETS = [
  {
    id: "feelings-map",
    category: "Emotional Awareness",
    emoji: "🗺️",
    title: "My Feelings Map",
    subtitle: "Parent & Child — Ages 4–12",
    desc: "Help your child identify and name what they feel in their body when big emotions arrive.",
    fields: [
      { id: "f1", label: "When I feel angry, my body feels…", placeholder: "e.g. hot, tight, shaky", type: "text" },
      { id: "f2", label: "When I feel scared, my body feels…", placeholder: "e.g. frozen, heart beats fast", type: "text" },
      { id: "f3", label: "When I feel sad, my body feels…", placeholder: "e.g. heavy, tired, tears", type: "text" },
      { id: "f4", label: "When I feel happy, my body feels…", placeholder: "e.g. light, smiley, bouncy", type: "text" },
      { id: "f5", label: "The feeling I have most often is…", placeholder: "e.g. worried", type: "text" },
      { id: "f6", label: "One thing that helps me feel better is…", placeholder: "e.g. hugs, music, my pet", type: "text" },
    ]
  },
  {
    id: "anger-volcano",
    category: "Anger Management",
    emoji: "🌋",
    title: "My Anger Volcano",
    subtitle: "Parent & Child — Ages 5–14",
    desc: "Explore what builds up anger before it explodes and what helps it cool down.",
    fields: [
      { id: "a1", label: "Things that make my anger start to build (triggers):", placeholder: "e.g. being told no, loud noises, being left out", type: "textarea" },
      { id: "a2", label: "Signs my anger is rising (warning signs):", placeholder: "e.g. clenched fists, holding breath, loud voice", type: "text" },
      { id: "a3", label: "What the eruption looks like for me:", placeholder: "e.g. yelling, throwing things, shutting down", type: "text" },
      { id: "a4", label: "What I need when I'm erupting:", placeholder: "e.g. space, a hug, someone to listen", type: "text" },
      { id: "a5", label: "3 things I can do BEFORE I erupt:", placeholder: "1.", type: "textarea" },
      { id: "a6", label: "How I want to feel after I cool down:", placeholder: "e.g. calm, safe, understood", type: "text" },
      { id: "a7", label: "Parent: What I notice before my child erupts:", placeholder: "e.g. becomes quiet, avoids eye contact…", type: "text" },
      { id: "a8", label: "Parent: How I can best support my child in that moment:", placeholder: "e.g. get low, stay calm, don't lecture…", type: "text" },
    ]
  },
  {
    id: "behavior-detective",
    category: "Behavior Understanding",
    emoji: "🔍",
    title: "Behavior Detective",
    subtitle: "Parent — Reflection Tool",
    desc: "Use this after a hard moment to look underneath the behavior and understand the need driving it.",
    fields: [
      { id: "b1", label: "What happened? (just the facts):", placeholder: "e.g. My child refused to get in the car after school", type: "textarea" },
      { id: "b2", label: "What did the behavior look like?", placeholder: "e.g. ran away, screamed, went limp", type: "text" },
      { id: "b3", label: "What was happening right before? (antecedent):", placeholder: "e.g. transition from school, skipped lunch, no sleep", type: "textarea" },
      { id: "b4", label: "What need might have been unmet?", placeholder: "e.g. felt unsafe, needed control, overwhelmed by sensory input", type: "textarea" },
      { id: "b5", label: "What emotion do you think your child was feeling?", placeholder: "e.g. fear, shame, helplessness", type: "text" },
      { id: "b6", label: "What did you do in the moment?", placeholder: "e.g. I got firm / I got low and calm / I walked away", type: "text" },
      { id: "b7", label: "What would you try differently next time?", placeholder: "e.g. give a 5-minute warning, offer a choice, stay quieter", type: "textarea" },
      { id: "b8", label: "One thing your child did well today:", placeholder: "e.g. came back to me after calming down", type: "text" },
    ]
  },
  {
    id: "calm-toolkit",
    category: "Regulation Tools",
    emoji: "🧰",
    title: "My Calm-Down Toolkit",
    subtitle: "Parent & Child — Ages 5+",
    desc: "Build a personalized set of calming strategies together so your child knows what to reach for.",
    fields: [
      { id: "c1", label: "My name is:", placeholder: "Child's first name", type: "text" },
      { id: "c2", label: "My favorite calm-down place at home is:", placeholder: "e.g. my bedroom, the beanbag, the backyard", type: "text" },
      { id: "c3", label: "Things I can do with my body to calm down:", placeholder: "e.g. jump, squeeze a pillow, take deep breaths, hug someone", type: "textarea" },
      { id: "c4", label: "Things I can do with my mind to calm down:", placeholder: "e.g. count to 10, think of my happy place, say 'I am safe'", type: "textarea" },
      { id: "c5", label: "Things that help me feel safe:", placeholder: "e.g. my blanket, my dog, soft music, my parent nearby", type: "textarea" },
      { id: "c6", label: "The person I most want near me when I'm upset:", placeholder: "e.g. Mom, Grandma, my teacher", type: "text" },
      { id: "c7", label: "One thing I want grown-ups to know about how to help me:", placeholder: "e.g. don't touch me, talk quietly, give me space first", type: "textarea" },
    ]
  },
  {
    id: "connection-check",
    category: "Parent-Child Connection",
    emoji: "💛",
    title: "Our Connection Check-In",
    subtitle: "Parent & Child — Weekly",
    desc: "A simple weekly conversation guide to strengthen your bond and stay in tune with each other.",
    fields: [
      { id: "cc1", label: "Child: The best part of my week was…", placeholder: "e.g. playing with my friend, eating pizza, being hugged", type: "text" },
      { id: "cc2", label: "Child: The hardest part of my week was…", placeholder: "e.g. a fight at school, missing someone, feeling left out", type: "text" },
      { id: "cc3", label: "Child: I felt really loved this week when…", placeholder: "e.g. you read to me, you stayed calm, you noticed I was sad", type: "text" },
      { id: "cc4", label: "Child: One thing I wish was different:", placeholder: "e.g. more outside time, less yelling, more hugs", type: "text" },
      { id: "cc5", label: "Parent: Something I noticed about my child this week:", placeholder: "e.g. seemed more anxious, laughed more, made a friend", type: "text" },
      { id: "cc6", label: "Parent: One thing I'm proud of my child for:", placeholder: "e.g. tried something hard, told me the truth, shared", type: "text" },
      { id: "cc7", label: "Parent: One thing I'm proud of MYSELF for this week:", placeholder: "e.g. stayed calm during a meltdown, asked for help", type: "text" },
      { id: "cc8", label: "Something fun we want to do together next week:", placeholder: "e.g. bake cookies, go to the park, movie night", type: "text" },
    ]
  },
  {
    id: "safe-unsafe",
    category: "Safety & Trust",
    emoji: "🛡️",
    title: "Safe vs. Unsafe Feelings",
    subtitle: "Parent & Child — Ages 4–10",
    desc: "Help your child learn to identify safe and unsafe feelings in their body and environment.",
    fields: [
      { id: "s1", label: "Safe feelings feel like… (in my body):", placeholder: "e.g. warm, relaxed, slow breathing, happy tummy", type: "text" },
      { id: "s2", label: "Unsafe feelings feel like… (in my body):", placeholder: "e.g. tight chest, shaky, want to run away", type: "text" },
      { id: "s3", label: "Places that feel safe to me:", placeholder: "e.g. my room, grandma's house, the library", type: "text" },
      { id: "s4", label: "People who make me feel safe:", placeholder: "e.g. Mom, my teacher, my dog", type: "text" },
      { id: "s5", label: "When I feel unsafe, I can:", placeholder: "e.g. find my safe person, go to my calm corner, take deep breaths", type: "textarea" },
      { id: "s6", label: "My safe word or signal when I need help:", placeholder: "e.g. 'I need a break', hold up 3 fingers, say the code word", type: "text" },
    ]
  },
];

const CATEGORY_COLORS = {
  "Emotional Awareness": C.midGreen,
  "Anger Management": "#B84C2A",
  "Behavior Understanding": C.brown,
  "Regulation Tools": "#5B8DB8",
  "Parent-Child Connection": C.gold,
  "Safety & Trust": C.darkGreen,
};

function WorksheetForm({ ws, onClose }) {
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  function handleChange(id, val) {
    setValues(prev => ({ ...prev, [id]: val }));
  }

  function handleReset() {
    setValues({});
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handlePrint() {
    window.print();
  }

  const catColor = CATEGORY_COLORS[ws.category] || C.darkGreen;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${catColor}30` }}>
      {/* Worksheet header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: catColor }}>
        <span className="text-xl">{ws.emoji}</span>
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: "white" }}>{ws.title}</p>
          <p className="text-[10px] opacity-80" style={{ color: "white" }}>{ws.subtitle}</p>
        </div>
        <button onClick={onClose} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-80 hover:opacity-100"
          style={{ background: "#ffffff25", border: "none", color: "white", cursor: "pointer" }}>
          ✕ Close
        </button>
      </div>

      <div className="p-4 space-y-4" style={{ background: C.white }}>
        <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>{ws.desc}</p>

        {/* Fields */}
        <div className="space-y-3">
          {ws.fields.map(field => (
            <div key={field.id}>
              <label className="block text-xs font-bold mb-1.5" style={{ color: C.darkGreen }}>
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.id] || ""}
                  onChange={e => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
                  style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none" }}
                />
              ) : (
                <input
                  type="text"
                  value={values[field.id] || ""}
                  onChange={e => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                  style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: C.cream, border: "none", color: C.mutedText, cursor: "pointer" }}
          >
            <RotateCcw size={11} /> Reset
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: `${catColor}15`, border: "none", color: catColor, cursor: "pointer" }}
          >
            <Printer size={11} /> Print
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: saved ? C.midGreen : catColor, border: "none", color: "white", cursor: "pointer" }}
          >
            {saved ? <><CheckCircle2 size={11} /> Saved!</> : "Save Responses"}
          </button>
        </div>

        <p className="text-[10px] text-center" style={{ color: C.mutedText }}>
          Responses are saved in this session only. Use Print to keep a copy.
        </p>
      </div>
    </div>
  );
}

export default function FillableWorksheets() {
  const [openId, setOpenId] = useState(null);

  const catFilter = [...new Set(WORKSHEETS.map(w => w.category))];
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? WORKSHEETS
    : WORKSHEETS.filter(w => w.category === activeCategory);

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
          ✏️ FILLABLE WORKSHEETS
        </p>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${C.midGreen}18`, color: C.midGreen }}>
          {WORKSHEETS.length} worksheets
        </span>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
        <button
          onClick={() => setActiveCategory("all")}
          className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full"
          style={{
            background: activeCategory === "all" ? C.darkGreen : C.cream,
            color: activeCategory === "all" ? C.white : C.mutedText,
            border: "none", cursor: "pointer",
          }}
        >
          All
        </button>
        {catFilter.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
            style={{
              background: activeCategory === cat ? CATEGORY_COLORS[cat] : `${CATEGORY_COLORS[cat]}18`,
              color: activeCategory === cat ? C.white : CATEGORY_COLORS[cat],
              border: "none", cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Worksheet cards */}
      {filtered.map(ws => {
        const catColor = CATEGORY_COLORS[ws.category] || C.darkGreen;
        const isOpen = openId === ws.id;
        return (
          <div key={ws.id}>
            {/* Collapsed card */}
            {!isOpen && (
              <button
                onClick={() => setOpenId(ws.id)}
                className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md"
                style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${catColor}15` }}>
                  {ws.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{ws.title}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${catColor}15`, color: catColor }}>
                      {ws.category}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>{ws.subtitle}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "#3a3028" }}>{ws.desc}</p>
                </div>
                <ChevronRight size={14} color={C.mutedText} className="flex-shrink-0" />
              </button>
            )}

            {/* Expanded form */}
            {isOpen && (
              <WorksheetForm ws={ws} onClose={() => setOpenId(null)} />
            )}
          </div>
        );
      })}
    </div>
  );
}