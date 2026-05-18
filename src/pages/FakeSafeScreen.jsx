import MobileHeader from "@/components/mobile/MobileHeader";
import { C } from "@/lib/rooted-constants";

const SCREENS = {
  weather: {
    title: "Local Weather",
    subtitle: "Today’s simple forecast",
    heading: "68° and partly cloudy",
    body: "A calm day with light wind and mild evening temperatures.",
    items: ["Morning: 62°", "Afternoon: 68°", "Evening: 59°", "Chance of rain: 12%"]
  },
  notes: {
    title: "Notes",
    subtitle: "Personal reminders",
    heading: "Today’s notes",
    body: "A quiet place to keep small reminders for the day.",
    items: ["Drink water", "Pick up groceries", "Fold laundry", "Call about appointment"]
  },
  parenting_article: {
    title: "Parenting Tips",
    subtitle: "Quick read",
    heading: "Helping kids transition calmly",
    body: "Small routines, simple choices, and gentle reminders can make daily transitions easier.",
    items: ["Give a five-minute warning", "Offer two simple choices", "Use a calm voice", "Praise the next right step"]
  }
};

export default function FakeSafeScreen() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || "weather";
  const screen = SCREENS[mode] || SCREENS.weather;

  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title={screen.title} subtitle={screen.subtitle} backTo="/" />
      <div className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <h1 className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>{screen.heading}</h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>{screen.body}</p>
        </section>
        {screen.items.map(item => (
          <div key={item} className="rounded-2xl p-4 text-sm font-bold shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}`, color: C.darkGreen }}>{item}</div>
        ))}
      </div>
    </main>
  );
}