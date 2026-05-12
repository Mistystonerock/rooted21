import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function DarkModeToggle({ className = "" }) {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex items-center justify-center rounded-xl transition-all ${className}`}
      style={{
        width: 44,
        height: 44,
        background: dark ? "rgba(201,151,58,0.25)" : "rgba(255,255,255,0.15)",
        border: dark ? "1px solid rgba(201,151,58,0.4)" : "1px solid rgba(255,255,255,0.2)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {dark
        ? <Sun size={18} color="#f0c86a" />
        : <Moon size={18} color="#f5e6c8" />
      }
    </button>
  );
}