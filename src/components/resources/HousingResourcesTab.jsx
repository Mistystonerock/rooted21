import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";

const HOUSING_LINKS = [
  {
    title: "Houses & Rentals Near You",
    description: "Search rentals, apartments, houses, townhomes, and local listings by zip code.",
    emoji: "🏠",
    url: "/housing-resources",
    button: "Find Rentals",
  },
  {
    title: "Housing Assistance",
    description: "Emergency shelter, rental assistance, Section 8, low-income housing, and utilities help.",
    emoji: "🤝",
    url: "/housing-resources",
    button: "Find Housing Help",
  },
];

export default function HousingResourcesTab() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
        <p className="text-3xl mb-2">🏠</p>
        <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Housing Resources</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
          Find houses for rent, emergency shelter, rental assistance, low-income housing, and utilities help in one place.
        </p>
      </div>

      {HOUSING_LINKS.map((item) => (
        <Link key={item.title} to={item.url} className="block rounded-2xl p-4 no-underline" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-start gap-3">
            <span className="text-3xl">{item.emoji}</span>
            <div className="flex-1">
              <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{item.description}</p>
              <span className="mt-3 inline-flex rounded-xl px-4 py-2.5 text-sm font-bold" style={{ background: C.darkGreen, color: "#fff" }}>
                {item.button}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}