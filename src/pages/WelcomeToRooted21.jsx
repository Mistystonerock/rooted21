import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FounderPhotoCard from "@/components/rooted/FounderPhotoCard";
import {
  Baby,
  BookOpen,
  Brain,
  CalendarDays,
  Car,
  ClipboardList,
  Compass,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  Heart,
  Home,
  Leaf,
  MapPin,
  MessageCircle,
  PenLine,
  Scale,
  School,
  ShieldCheck,
  Siren,
  SmilePlus,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const BG = "#faf6f1";
const CARD = "#ffffff";
const CREAM = "#f5ede2";
const GREEN = "#6b9d6e";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const BORDER = "rgba(120,85,60,0.2)";

const storySections = [
  {
    title: "Meet Misty",
    defaultOpen: true,
    text: `My name is Misty Stonerock.

I am a Community Behavioral Health Worker, Risk Management Worker, juvenile treatment court mentor, parent representative, student, advocate, mom, and community connector in Chillicothe and Ross County, Ohio.

Today, I work directly with families, youth, CPS, juvenile court, probation, schools, OhioRISE, CASA, behavioral health providers, housing resources, recovery supports, landlords, legal supports, and community agencies.

I help with crisis support, de-escalation, transportation, resources, behavior support, treatment goals, family advocacy, court support, school meetings, and wraparound services.

People call me when families are overwhelmed. They call me when a child is struggling. They call me when a parent does not know what to do next. They call me when a youth is in crisis. They call me when a family needs help with court, school, housing, treatment, resources, or just someone who will show up and not give up on them.

But before I ever worked beside these systems, I lived through them.

I was once the child people did not fully understand.

As a child, I had an IEP and was labeled as having behavioral issues. On paper, it looked like I had problems with focus, authority, and emotional control.

But what was not fully understood at the time was that I was dealing with trauma.

My reactions were not me being defiant. They were me trying to cope with things I did not understand and did not have the tools to express.

I did not need to be written off. I did not need people to assume my future was already decided. I did not need adults to look at me like I would never become anything.

I needed someone to look deeper.

I needed someone to ask what happened to me, not just what was wrong with me.

I needed understanding, structure, safety, and support.

I grew up carrying things a child should never have had to carry. The signs were there, but the pain underneath my behavior was not fully seen.

Because of that, I grew up feeling like the systems that were supposed to protect children failed us.

That anger stayed with me for a long time. I was angry at the schools. I was angry at the courts. I was angry at the systems. I felt like nobody saw the child underneath the behavior.

And when trauma is not understood, it does not just disappear.

It follows you. It shapes how you survive. It shapes how you respond. It shapes how you trust. It shapes how you see yourself.`
  },
  {
    title: "Becoming a Mother While Still Trying to Survive",
    text: `I became a mother young.

By the age of 18, I had three children.

I was still carrying my own trauma, still trying to survive, and still learning how to be a person in a world that had not always felt safe to me.

Having my first child changed something inside me.

For the first time, I felt a kind of love that gave me hope. The way my child looked at me, trusted me, and felt safe with me gave me something I had been searching for my whole life.

Becoming a mother made me protective. It gave me motivation. It gave me purpose. It gave me a reason to want more.

But love alone does not erase trauma.

I was young. I had little support. I was in unhealthy relationships. I experienced instability, housing struggles, fear, and situations no young mother should have to carry alone.

There were moments when I had nowhere to go. There were moments when I slept in a car with my children in the winter and tried to keep them distracted from the reality of what we were living through.

There were moments when I loved my children with everything in me, but still did not have the support, tools, safety, or guidance I needed.

That pain changed me.

And later, when the system became involved, I felt like people saw my struggle but did not see my love.

They saw my history. They saw my family name. They saw my mistakes. They saw my records.

But I did not feel like they saw the bond I had with my children. I did not feel like they saw the mother inside me who was scared, overwhelmed, hurt, and trying to survive.`
  },
  {
    title: "When the System Became Part of My Story",
    text: `I know what it feels like to have systems involved in your life.

I know what it feels like to sit across from people who already think they know who you are.

I know what it feels like to feel judged before anyone understands your story.

I know what it feels like to feel like your past is louder than your progress.

I know what it feels like to lose your children.

That is a pain that changes a person.

At that time in my life, I did not have the support I needed. I did not have family guiding me. I did not have someone helping me understand the system. I did not have tools to organize the chaos around me.

I was hurt. I was angry. I was lost.

And active addiction became part of my story.

My life became connected to courts, jail, and records that followed me everywhere.

For a long time, I believed the system only saw what I had done wrong.

Not what had happened to me. Not what I survived. Not how badly I wanted to be different. Not how much I loved my children.

For a long time, I hated the system.

I hated it because I felt judged by it. I hated it because I felt misunderstood by it. I hated it because I felt like it only saw my mistakes and not my trauma.

But then something changed.`
  },
  {
    title: "The System That Helped Save My Life",
    defaultOpen: true,
    text: `At 30 years old, I entered Ross County Juvenile Treatment Court with Judge Benson.

I was face to face with the same system I once believed failed me as a child.

Some of the same people were still there. And honestly, some people probably did not think I would make it.

But Ross County Juvenile Treatment Court with Judge Benson changed my life.

Recovery changed my life.

My recovery date is May 7, 2018.

Ross County Juvenile Treatment Court gave me structure when I needed structure, accountability when I needed accountability, support when I needed support, and a chance when I needed someone to believe I could become more than my past.

Judge Benson and the treatment court team helped me see that accountability and support could exist together.

Ross County Juvenile Treatment Court did not just help me get through a case.

It helped save my life.

It helped me become the mother I wanted to be. It helped me become the woman I was always meant to be. It helped me turn pain into purpose.

After graduating, I became connected to the same system in a new way. I went from being someone who felt failed by the system to becoming someone who now works beside the system to help families succeed.

I worked at CPS as a Family Peer Mentor for three years. I have mentored in Juvenile Treatment Court for years. I am now a Community Behavioral Health Worker and Risk Management provider.

I sit on Children First Council with Job and Family Services and other agencies in Ross County.

The same people I once thought failed me became mentors, supporters, and people who helped guide me.

I know this system from both sides.

I know what it feels like to be the child struggling. I know what it feels like to be the parent fighting to rebuild. And I know what it feels like to now sit beside families and help them take the next step.

That is why Rooted 21 exists.`
  },
  {
    title: "Why This Work Matters",
    text: `Now, years later, I work with children who are being labeled the same way I was.

I work with kids who are called defiant, disrespectful, aggressive, disruptive, attention-seeking, or difficult.

But when I look at them, I do not just see behavior.

I see a story. I see fear. I see survival. I see trauma. I see a child who may not know how to say, “I am overwhelmed.”

I see a child who may not feel safe. I see a child who has learned to protect themselves the only way they know how.

In my risk management work, I see the same pattern over and over again.

A child gets overwhelmed. A child shuts down. A child reacts. An adult responds with frustration. The child escalates. Then the child gets labeled as the problem.

But many times, the real issue is that nobody has stopped to ask what is underneath the behavior.

I have worked with children who become nonverbal when they are overstimulated. I have seen children create their own ways to communicate that they need a minute.

I have seen children shut down, cry, run, yell, or fight because they are trying to survive a feeling they do not know how to explain.

And too often, adults respond to that survival response with more pressure, more punishment, or more frustration. That can make things worse.

Not because teachers do not care. I believe many teachers do care.

But teachers are being asked to manage behaviors rooted in trauma without always being given the tools to understand trauma.

That is one of the biggest gaps I see.`
  },
  {
    title: "Why Schools Matter",
    text: `Schools are one of the most important places in a child’s life.

Children spend most of their day there. Teachers and school staff can become some of the most important adults a child will ever know.

For some children, school may be the safest place they have.

But for other children, school can also become another place where they feel misunderstood, labeled, or punished for survival behaviors.

I have seen children walk into school already in fight-or-flight mode because of what they are living through at home or in the community.

I have seen children who are overwhelmed before the day even begins.

I have seen children avoid school because they already feel like they are in trouble before they even walk through the door.

And I have seen how the response from adults can either help a child regulate or push them further into survival mode.

Something as simple as tone of voice, patience, giving a child a minute, using calm words, or recognizing effort can change the entire moment.

A child who is already carrying shame does not need more shame. A child who feels unsafe does not need more fear. A child who is struggling does not need to be reminded that they are failing.

They need someone to help them feel safe enough to learn.

That is why I fight so hard for trauma-informed support in schools.

Not because I think teachers are the problem.

Because I believe teachers can be one of the biggest parts of the solution when they are given the right tools.`
  },
  {
    title: "The Missing Piece",
    text: `In my community, many systems come together to support families.

Courts, CPS, probation, counselors, behavioral health providers, OhioRISE, CASA, treatment programs, and community agencies often work together to wrap services around a family.

But one of the biggest missing pieces is often the school system.

The same kids struggling in court, CPS, behavioral health, and risk management are often the same kids struggling in school.

If schools are not fully included in the trauma-informed support plan, we are missing one of the most important environments in that child’s life.

We cannot expect children to do better if the adults around them are not all working from the same understanding.

We cannot keep labeling children as problems when their behavior may be telling us they are overwhelmed, scared, dysregulated, or carrying trauma.

We need schools, families, courts, CPS, behavioral health, and community supports working together.

That is how we change outcomes.`
  },
  {
    title: "Why I Created Rooted 21",
    defaultOpen: true,
    text: `I created Rooted 21 because I kept seeing families being expected to navigate systems that were never explained to them in a way that felt human.

Parents were being told what they had to do, but not always being shown how to do it.

Families were trying to manage court dates, case plans, supervised visits, school meetings, IEPs, therapy appointments, housing needs, benefits, recovery, transportation, domestic violence concerns, child behavior, and their own mental health all at the same time.

That is a lot for any person.

And when families are overwhelmed, people sometimes mistake that for not caring.

But I know better.

Sometimes parents do care. They are just buried.

Buried under trauma. Buried under paperwork. Buried under shame. Buried under deadlines. Buried under systems they do not understand. Buried under trying to survive.

Rooted 21 was created to help families get organized before they feel lost.

It was created to help parents understand what to do next.

It was created to help families document progress, find resources, prepare for meetings, track behavior, build safety plans, and feel less alone.

It was created to help adults better understand children’s behavior through a trauma-informed lens.

It was created to help parents, caregivers, teachers, courts, CPS, and support teams see the full picture.

It was created because I know how much difference one tool, one reminder, one resource, one calm response, one supportive adult, and one next step can make.`
  },
  {
    title: "What Rooted 21 Is",
    text: `Rooted 21 is more than an app.

It is the thing I wish existed when I was younger.

It is the thing I wish existed when I was a parent trying to rebuild.

It is the thing I wish families had before everything falls apart.

Rooted 21 is designed to help families with parenting support, behavior tools, court preparation, school advocacy, IEP organization, safety planning, recovery support, resources, reminders, documentation, and wraparound communication.

It helps families stay organized. It helps parents understand their child’s behavior. It helps support teams see progress. It helps families find resources. It helps parents prepare for court and meetings.

It helps people take the next right step when life feels overwhelming.

Rooted 21 is built around the belief that change takes time, support, repetition, and understanding.

Many parents are not parenting from failure.

They are parenting from trauma. From stress. From fear. From survival. From generational pain. From never being taught another way.

Rooted 21 is here to help parents slow down, understand their responses, learn new tools, and better understand what their child may be trying to communicate through behavior.

The goal is not perfection.

The goal is progress.

One day. One tool. One response. One choice. One step at a time.`
  },
];

const helpCards = [
  { icon: MapPin, title: "Find resources" },
  { icon: ShieldCheck, title: "Build safety plans" },
  { icon: Target, title: "Track goals" },
  { icon: SmilePlus, title: "Log emotions" },
  { icon: Scale, title: "Prepare for court" },
  { icon: FolderOpen, title: "Organize documents" },
  { icon: CalendarDays, title: "Track reminders" },
  { icon: Heart, title: "Support recovery" },
  { icon: Home, title: "Navigate housing" },
  { icon: GraduationCap, title: "Prepare for meetings" },
  { icon: Siren, title: "Access crisis support" },
  { icon: Users, title: "Connect with support" },
  { icon: Users, title: "Parenting groups", description: "Parenting was never meant to be done alone. This section helps parents find groups, classes, and support from people who understand." },
  { icon: Brain, title: "Child behavior support", description: "Behavior is communication. This section helps adults understand what may be underneath the behavior and find calm next steps." },
  { icon: Flame, title: "Anger management groups", description: "Anger does not make you a bad person. This section helps parents, caregivers, teens, and families find tools, groups, and support to manage emotions in safer ways." },
  { icon: BookOpen, title: "Parent education" },
  { icon: Heart, title: "Family Treatment Court support" },
  { icon: Users, title: "Recovery meetings" },
  { icon: ShieldCheck, title: "Domestic violence safety support" },
  { icon: School, title: "IEP and school support" },
  { icon: FileText, title: "Court paperwork help" },
  { icon: Compass, title: "Legal resource guidance" },
  { icon: Home, title: "Benefits and food support" },
  { icon: Car, title: "Transportation support" },
  { icon: Baby, title: "Kinship and foster care support" },
  { icon: Heart, title: "Youth support" },
  { icon: MessageCircle, title: "Co-parenting communication help" },
  { icon: Heart, title: "Caregiver burnout support" },
  { icon: Users, title: "Wraparound team support", description: "This section helps families, schools, providers, courts, and community supports stay connected around the child’s needs." },
  { icon: Leaf, title: "Trauma-informed parenting tools" },
  { icon: School, title: "School advocacy support", description: "This section helps families prepare for school meetings, IEP conversations, behavior concerns, and communication with teachers." },
  { icon: MessageCircle, title: "Teacher communication support" },
  { icon: PenLine, title: "Behavior scripts" },
  { icon: TrendingUp, title: "Progress tracking" },
  { icon: ClipboardList, title: "Support plans" },
];

function Section({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: BORDER }}>
      <summary className="cursor-pointer list-none font-serif text-xl font-bold" style={{ color: DARK }}>
        <span className="inline-flex w-full items-center justify-between gap-3">
          {title}
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: CREAM, color: MUTED }}>Read More</span>
        </span>
      </summary>
      <div className="mt-4 space-y-4 text-sm leading-7" style={{ color: MUTED }}>
        {children}
      </div>
    </details>
  );
}

function Paragraphs({ text }) {
  return text.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>);
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
      <main className="mx-auto max-w-3xl space-y-4 pb-48 md:pb-32">
        <section className="rounded-[2rem] border p-6 text-center shadow-sm" style={{ background: CARD, borderColor: BORDER }}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: CREAM }}>
            <Leaf size={28} color={GREEN} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: GREEN }}>Rooted 21</p>
          <h1 className="mt-2 font-serif text-3xl font-black md:text-4xl" style={{ color: DARK }}>Welcome to Rooted 21</h1>
          <div className="mx-auto mt-4 max-w-2xl space-y-4 text-sm leading-7" style={{ color: MUTED }}>
            <Paragraphs text={`I’m so glad you’re here.

Before you go any further into this app, I want you to know something important.

Rooted 21 was not built by someone who only studied trauma, systems, parenting, or behavior from the outside.

It was built by someone who has lived it.

It was built by someone who knows what it feels like to be the child no one understood.

The student who was labeled.

The parent who made mistakes.

The person who sat across from the system scared, angry, ashamed, and overwhelmed.

The person who had to rebuild her life from the ground up.

And the person who now works every day to help children and families feel seen, supported, and understood.

Rooted 21 was created for families who are trying to survive hard systems while still holding everything together at home.

This app is not here to judge you.

It is here to help you breathe, get organized, find support, understand your next step, and remember that you are not alone.`} />
          </div>
        </section>

        {storySections.map((section) => (
          <Section key={section.title} title={section.title} defaultOpen={section.defaultOpen}>
            {section.title === "Meet Misty" && <FounderPhotoCard />}
            <Paragraphs text={section.text} />
          </Section>
        ))}

        <Section title="The Mission" defaultOpen>
          <div className="rounded-2xl p-4 text-center font-serif text-xl font-bold leading-9" style={{ background: CREAM, color: DARK }}>
            <p>Real Support. Real Tools. Real Change.</p>
            <p>Stronger Parents. Stronger Kids. Stronger Families.</p>
          </div>
          <Paragraphs text={`My mission is to turn pain into purpose by helping families break generational cycles, supporting parents with real tools instead of judgment, advocating for children who have experienced trauma, and building a community where healing, accountability, and growth can happen together.

Rooted 21 exists because families need more than orders, paperwork, and expectations.

They need support. They need tools. They need reminders. They need plain language. They need connection. They need someone to believe they are more than their worst day.

This app is not just about parenting.

It is about helping families stay rooted while they are walking through hard seasons.

It is about helping people feel seen, supported, prepared, and less alone.

It is about helping children feel safe enough to learn, grow, and succeed.

It is about taking lived experience and turning it into something that can help the next family.`} />
        </Section>

        <Section title="What Rooted 21 Helps With" defaultOpen>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {helpCards.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border p-3" style={{ background: BG, borderColor: BORDER }}>
                <Icon size={18} color={GREEN} />
                <p className="mt-2 text-xs font-bold leading-5" style={{ color: DARK }}>{title}</p>
                {description && <p className="mt-2 text-[11px] leading-5" style={{ color: MUTED }}>{description}</p>}
              </div>
            ))}
          </div>
        </Section>

        <Section title="You Are Not Alone Here" defaultOpen>
          <Paragraphs text={`I built Rooted 21 because I know what it feels like to need help and not know where to start.

I know what it feels like to have people judge your past before they see your progress.

I know what it feels like to be labeled before someone understands your story.

I know what it feels like to be counted out and still have something inside you fighting to become more.

I know what it feels like to want better for your children.

I know what it feels like to carry shame.

I know what it feels like to rebuild.

I know what it feels like to look at a child and know there is more underneath the behavior.

That is why this app was created with love, lived experience, and a deep belief that families deserve tools that actually help.

You are not just a case.

You are not just paperwork.

You are not just a number in a system.

You are not your worst day.

You are not your past.

You are not the labels people placed on you.

You are a person.

Your family matters.

Your story matters.

Your healing matters.

Your progress matters.

Your children matter.

Your future matters.

Rooted 21 is here to help you find your next right step.

You are not alone here.`} />
        </Section>

        <div className="pb-10 text-center">
          <button
            type="button"
            onClick={continueToDashboard}
            className="text-sm font-bold underline"
            style={{ background: "transparent", color: GREEN, border: "none" }}
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}