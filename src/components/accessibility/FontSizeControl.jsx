import { useEffect, useState } from "react";

const BG = "#0c1610";
const BORDER = "rgba(74, 222, 128, 0.25)";
const TEXT = "#e5e5e5";
const MUTED = "#a0a0a0";
const GREEN = "#4ade80";

export default function FontSizeControl() {
  const [size, setSize] = useState("normal");

  useEffect(() => {
    const saved = localStorage.getItem("fontSize") || "normal";
    setSize(saved);
    applyFontSize(saved);
  }, []);

  function applyFontSize(sizeKey) {
    const sizes = {
      normal: "16px",
      large: "18px",
      xlarge: "20px",
    };
    document.documentElement.style.fontSize = sizes[sizeKey];
  }

  function handleChange(newSize) {
    setSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem("fontSize", newSize);
  }

  return (
    <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 12, margin: "0 0 12px 0" }}>
        Font Size
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { key: "normal", label: "Normal" },
          { key: "large", label: "Large" },
          { key: "xlarge", label: "Extra Large" },
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => handleChange(option.key)}
            aria-label={`Set font size to ${option.label}`}
            aria-pressed={size === option.key}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: `1.5px solid ${size === option.key ? GREEN : BORDER}`,
              background: size === option.key ? "rgba(74, 222, 128, 0.12)" : "transparent",
              color: size === option.key ? GREEN : MUTED,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}