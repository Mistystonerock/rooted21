import { C } from "@/lib/rooted-constants";

const priorityColor = {
  low: "#2F855A",
  medium: "#A67C52",
  high: "#B84C2A",
};

export default function InsightSection({ title, items, emptyText, renderItem }) {
  return (
    <section className="rounded-3xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <h2 className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>{title}</h2>
      {items?.length ? (
        <div className="mt-3 space-y-3">
          {items.map((item, index) => (
            <div key={`${title}-${index}`} className="rounded-2xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              {renderItem(item, priorityColor)}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm" style={{ color: C.mutedText }}>{emptyText}</p>
      )}
    </section>
  );
}