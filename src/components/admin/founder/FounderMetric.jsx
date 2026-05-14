export default function FounderMetric({ label, value, detail }) {
  return (
    <div className="rounded-2xl p-4 border border-[#d7c7aa]/60 bg-[#faf6f1]">
      <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#6b5b48] uppercase">{label}</p>
      <p className="text-2xl font-black mt-2 text-[#0b2f1b]">{value}</p>
      {detail && <p className="text-[11px] mt-1 text-[#6b5b48]">{detail}</p>}
    </div>
  );
}