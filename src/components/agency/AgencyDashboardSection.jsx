export default function AgencyDashboardSection({ title, items }) {
  return (
    <section className="rounded-2xl border border-rooted-cream bg-white p-4 shadow-sm">
      <h2 className="font-serif text-base font-bold text-rooted-dark-green">{title}</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map(item => (
          <div key={item} className="rounded-xl bg-rooted-off-white px-3 py-2 text-sm font-semibold text-foreground">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}