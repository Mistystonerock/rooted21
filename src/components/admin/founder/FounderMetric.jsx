export default function FounderMetric({ label, value, detail }) {
  return (
    <div className="rounded-2xl p-5 bg-[#faf6f1]" style={{ border: "1.5px solid #f5ede2" }}>
      <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#8b6f54] uppercase">{label}</p>
      <p className="text-2xl font-black mt-2 text-[#6b9d6e]">{value}</p>
      {detail && <p className="text-[11px] mt-1 text-[#8b6f54]">{detail}</p>}
    </div>
  );
}