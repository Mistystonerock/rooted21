import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Leaf,
  MapPin,
  ShieldCheck,
  Target,
  SmilePlus,
  Scale,
  FolderOpen,
  CalendarDays,
  Home,
  GraduationCap,
  Siren,
  Users,
  Compass,
  ChevronRight,
} from "lucide-react";

const BG = "#faf6f1";
const CARD = "#ffffff";
const CREAM = "#f5ede2";
const GREEN = "#6b9d6e";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const BORDER = "rgba(120,85,60,0.2)";

const helpCards = [
  { icon: MapPin, text: "Find resources" },
  { icon: ShieldCheck, text: "Build safety plans" },
  { icon: Target, text: "Track goals" },
  { icon: SmilePlus, text: "Log emotions" },
  { icon: Scale, text: "Prepare for court" },
  { icon: FolderOpen, text: "Organize documents" },
  { icon: CalendarDays, text: "Track reminders" },
  { icon: Heart, text: "Support recovery" },
  { icon: Home, text: "Navigate housing" },
  { icon: GraduationCap, text: "Prepare for meetings" },
  { icon: Siren, text: "Access crisis support" },
  { icon: Users, text: "Connect with support" },
  { icon: Compass, text: "Understand next steps" },
];

function Section({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: BORDER }}>
      <summary className="cursor-pointer list-none font-serif text-xl font-bold" style={{ color: DARK }}>
        <span className="inline-flex w-full items-center justify-between gap-3">
          {title}
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: CREAM, color: MUTED }}>Open</span>
        </span>
      </summary>
      <div className="mt-4 space-y-4 text-sm leading-7" style={{ color: MUTED }}>
        {children}
      </div>
    </details>
  );
}

function Paragraphs({ children }) {
  return children.split("\n\n").map((text) => <p key={text}>{text}</p>);
}

export default function WelcomeToRooted21({ user, onContinue }) {
  const navigate = useNavigate();

  const dashboardPath = useMemo(() => {
    if (user?.role === "founder") return "/founder-dashboard";
    if (user?.role === "admin") return "/resource-management";
    if (user?.role === "professional") return "/professional";
    return "/dashboard";
  }, [user?.role]);

  function continueToDashboard() {
    onContinue?.();
    navigate(dashboardPath, { replace: true });
  }

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: BG, color: DARK }}>
      <main className="mx-auto max-w-3xl space-y-4 pb-10">
        <section className="rounded-[2rem] border p-6 text-center shadow-sm" style={{ background: CARD, borderColor: BORDER }}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: CREAM }}>
            <Leaf size={28} color={GREEN} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: GREEN }}>Rooted 21</p>
          <h1 className="mt-2 font-serif text-3xl font-black md:text-4xl" style={{ color: DARK }}>Welcome to Rooted 21</h1>
          <div className="mx-auto mt-4 max-w-2xl space-y-4 text-sm leading-7" style={{ color: MUTED }}>
            <p>I’m so glad you’re here.</p>
            <p>Rooted 21 was created for parents, caregivers, and families who are trying to navigate hard systems while still holding everything together at home.</p>
            <p>This app is not here to judge you. It is here to help you breathe, get organized, find support, and take the next right step.</p>
            <p className="font-bold" style={{ color: DARK }}>You do not have to figure everything out all at once. Start with one step.</p>
          </div>
        </section>

        <Section title="Meet the Founder" defaultOpen>
          <Paragraphs>{`My name is Misty Stonerock, and I am the founder of Rooted 21.

I am a Community Behavioral Health Worker, parent advocate, juvenile treatment court mentor, and someone with lived experience. I have worked closely with families, CPS, courts, schools, behavioral health providers, housing resources, recovery supports, landlords, legal supports, and community agencies.

I have sat with families in crisis. I have helped parents prepare for court. I have supported people through recovery, housing barriers, school meetings, safety planning, and moments where they felt like nobody was listening.

I know how overwhelming these systems can feel.

I also know that families are not broken. Most families are tired, scared, unheard, under-supported, and trying to survive systems that can be hard to understand.

Rooted 21 was built from that truth.`}</Paragraphs>
        </Section>

        <Section title="Why I Created Rooted 21">
          <Paragraphs>{`I created Rooted 21 because I kept seeing the same thing over and over again.

Families were being told what they needed to do, but they were not always being given the tools, support, reminders, organization, or plain-language help to actually do it.

Parents were trying to keep up with case plans, court dates, visits, school meetings, therapy appointments, housing needs, benefits, recovery, safety concerns, and their child’s behavior — all at the same time.

That is a lot for any person.

I wanted to build something that could help families feel less alone and more prepared.`}</Paragraphs>
          <div className="rounded-2xl p-4" style={{ background: CREAM }}>
            {[
              "What do I need to do next?",
              "Where do I find help?",
              "What do I need to document?",
              "What do I need to bring to court?",
              "How do I stay organized?",
              "How do I support my child when things get hard?",
              "How do I keep going when I feel overwhelmed?",
            ].map(item => <p key={item} className="py-1 font-bold" style={{ color: DARK }}>• {item}</p>)}
          </div>
          <p>Rooted 21 was created to bring those answers into one safe place.</p>
        </Section>

        <Section title="The Mission">
          <div className="rounded-2xl p-4 text-center font-serif text-xl font-bold leading-9" style={{ background: CREAM, color: DARK }}>
            <p>Real Support. Real Tools. Real Change.</p>
            <p>Stronger Parents. Stronger Kids. Stronger Families.</p>
          </div>
          <Paragraphs>{`The mission of Rooted 21 is to help families build safety, stability, healing, and confidence while navigating systems that can feel confusing and heavy.

This app was created to support families with tools, education, resources, documentation, reminders, emotional support, and guidance.

It is here to help families feel more prepared, more supported, and less alone.

Rooted 21 is not just about parenting. It is about helping families stay rooted while they are walking through hard seasons.`}</Paragraphs>
        </Section>

        <Section title="What Rooted 21 Helps With" defaultOpen>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {helpCards.map(({ icon: Icon, text }) => (
              <div key={text} className="rounded-2xl border p-3" style={{ background: BG, borderColor: BORDER }}>
                <Icon size={18} color={GREEN} />
                <p className="mt-2 text-xs font-bold leading-5" style={{ color: DARK }}>{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="How to Start" defaultOpen>
          <Paragraphs>{`You do not have to use everything at once.

Start where you are.

Use the Dashboard when you want to see your main tools. Use SOS when you need support right away. Use Resources when you need help in your community. Use Documents when you need to stay organized. Use Logs when you want to track progress, behaviors, visits, or important events. Use reminders so important dates do not get lost. Use the Welcome and Help sections anytime you feel unsure.

One step at a time is still progress.`}</Paragraphs>
        </Section>

        <Section title="You Are Not Alone Here" defaultOpen>
          <Paragraphs>{`I built Rooted 21 because I know what it feels like to need support, to fight through hard seasons, and to want better for your family.

This app was created with love, lived experience, and a deep belief that families deserve tools that actually help.

You are not just a case. You are not just paperwork. You are not just a number in a system.

You are a person. Your family matters. Your story matters. Your progress matters.

Rooted 21 is here to help you find your next right step.

You are not alone here.`}</Paragraphs>
        </Section>

        <button
          type="button"
          onClick={continueToDashboard}
          className="sticky bottom-4 z-10 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black shadow-lg"
          style={{ background: GREEN, color: "#fff", border: "none" }}
        >
          Continue to My Dashboard <ChevronRight size={18} />
        </button>
      </main>
    </div>
  );
}