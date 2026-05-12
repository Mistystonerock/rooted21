import { Lock } from "lucide-react";

export default function PrivacyBadge({ className = "" }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 ${className}`}
      style={{
        background: "rgba(10,61,32,0.06)",
        border: "1px solid rgba(10,61,32,0.12)",
        display: "inline-flex",
      }}
    >
      <Lock size={12} color="#2d6a4f" />
      <p className="text-xs font-semibold" style={{ color: "#2d6a4f" }}>
        Your data is private and encrypted
      </p>
    </div>
  );
}