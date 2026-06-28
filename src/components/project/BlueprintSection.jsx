import { C } from "@/lib/rooted-constants";

export default function BlueprintSection({ section, index }) {
  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ background: `${C.midGreen}18`, color: C.midGreen }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h2 className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>{section.title}</h2>
          <p className="mt-1 text-xs leading-6" style={{ color: C.mutedText }}>{section.intro}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {section.items.map(item => (
          <li key={item} className="rounded-xl px-3 py-2 text-xs leading-6" style={{ background: C.offWhite, color: C.darkText, border: `1px solid ${C.cream}` }}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}