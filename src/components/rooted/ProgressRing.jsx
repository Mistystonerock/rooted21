import { useEffect, useState } from "react";

export default function ProgressRing({ pct = 0, size = 80, stroke = 8, color = "#1a6b3a", label, sublabel }) {
  const [animPct, setAnimPct] = useState(0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animPct / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 200);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}>
          <span style={{ fontSize: size * 0.2, fontWeight: 900, color, lineHeight: 1 }}>{pct}%</span>
        </div>
      </div>
      {label && <p style={{ fontSize: 11, fontWeight: 700, color: "#2d4a35", textAlign: "center" }}>{label}</p>}
      {sublabel && <p style={{ fontSize: 10, color: "#8a9e8e", textAlign: "center" }}>{sublabel}</p>}
    </div>
  );
}