import { Heart, Home, School, ShieldCheck, Sparkles, Users } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const CHILD_SAFETY_ITEMS = [
  {
    icon: Users,
    title: "Trusted adults",
    text: "Help your child name safe adults they can go to, such as a caregiver, teacher, counselor, coach, neighbor, or family member. You are not alone, and support is available."
  },
  {
    icon: ShieldCheck,
    title: "Emergency code words",
    text: "Choose simple words or phrases that mean “I need help,” “call me,” or “go to our safe place.” Practice only when it feels calm and safe."
  },
  {
    icon: Home,
    title: "Safe places",
    text: "Identify nearby places where your child can go if they feel unsafe, such as a trusted home, school office, library, neighbor, or public location."
  },
  {
    icon: School,
    title: "School safety planning",
    text: "If it feels safe, consider sharing only necessary information with a trusted school contact so pickup, calls, and emergency plans are handled carefully."
  },
  {
    icon: Sparkles,
    title: "Calming exercises",
    text: "Try child-friendly grounding: name 5 things they see, hold a soft object, breathe like smelling a flower and blowing a candle, or press feet into the floor."
  },
  {
    icon: Heart,
    title: "After violence exposure",
    text: "Children may need reassurance, routine, quiet choices, and gentle reminders that what happened was not their fault. Healing can happen at their pace."
  }
];

const COPING_PROMPTS = [
  "You deserve safety.",
  "You are not alone.",
  "Support is available.",
  "Leaving can be dangerous, and planning matters.",
  "You can move at your own pace."
];

export default function ChildSafetyPlanningSection() {
  return (
    <section className="mt-4 rounded-3xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `${C.midGreen}22` }}>
          <ShieldCheck size={22} color={C.darkGreen} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: C.midGreen }}>Child safety support</p>
          <h3 className="mt-1 font-serif text-lg font-black leading-tight" style={{ color: C.darkGreen }}>
            Gentle planning for children
          </h3>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: C.mutedText }}>
            This is a calm planning guide, not a checklist you have to finish today. Use what feels safe and skip what does not.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {CHILD_SAFETY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: `${C.midGreen}18` }}>
                  <Icon size={16} color={C.darkGreen} />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: C.darkGreen }}>{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{item.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
        <p className="text-xs font-black" style={{ color: C.darkGreen }}>Supportive reminders</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {COPING_PROMPTS.map((prompt) => (
            <span key={prompt} className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: C.cream, color: C.darkGreen }}>
              {prompt}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}