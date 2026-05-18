import MobileHeader from "@/components/mobile/MobileHeader";
import { C } from "@/lib/rooted-constants";

export default function FakeSafeScreen() {
  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Daily Wellness Checklist" subtitle="A quiet place to pause" backTo="/" />
      <div className="mx-auto max-w-[520px] space-y-3 px-4 py-5">
        {["Drink water", "Take three slow breaths", "Stretch your shoulders", "Check today’s weather", "Write one small task"].map(item => (
          <div key={item} className="rounded-2xl p-4 text-sm font-bold" style={{ background: C.white, border: `1px solid ${C.cream}`, color: C.darkGreen }}>{item}</div>
        ))}
      </div>
    </main>
  );
}