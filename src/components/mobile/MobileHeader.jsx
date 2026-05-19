import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GOLD = "#c9973a";
const TEXT = "#f5e6c8";
const MUTED = "rgba(245,230,200,0.65)";

export default function MobileHeader({
  title = "Rooted 21",
  subtitle = "",
  backTo,
  onBack,
  rightSlot,
}) {
  const hasBack = backTo || onBack;

  return (
    <div
      role="banner"
      style={{
        background: "linear-gradient(135deg, #0a3d20 0%, #0d5c2a 100%)",
        borderBottom: `1px solid rgba(201,151,58,0.3)`,
        paddingTop: "max(12px, env(safe-area-inset-top))",
        position: "sticky",
        top: 0,
        zIndex: 10,
        marginBottom: 16,
        boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center gap-2 px-3 pb-3">
        {hasBack ? (
          backTo ? (
            <Link
              to={backTo}
              aria-label="Go back"
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: "rgba(201,151,58,0.15)", border: "1px solid rgba(201,151,58,0.3)", flexShrink: 0 }}
            >
              <ChevronLeft size={22} color={GOLD} />
            </Link>
          ) : (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: "rgba(201,151,58,0.15)", border: "1px solid rgba(201,151,58,0.3)", flexShrink: 0, cursor: "pointer" }}
            >
              <ChevronLeft size={22} color={GOLD} />
            </button>
          )
        ) : (
          <div style={{ width: 44, flexShrink: 0 }} />
        )}

        <div className="flex-1 text-center">
          <p className="font-serif font-bold text-sm leading-tight" style={{ color: TEXT }}>
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ minWidth: 44, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          {rightSlot ?? null}
        </div>
      </div>
    </div>
  );
}