import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";

/**
 * iOS-style navigation bar.
 * - 44px minimum tap targets on all interactive elements
 * - Proper safe-area-inset-top handling
 * - Left: back button | Center: title | Right: actions slot
 */
export default function MobileHeader({
  title,
  subtitle,
  backTo,        // string path — renders a <Link>
  onBack,        // function — renders a <button>
  rightSlot,     // arbitrary JSX for right side
}) {
  const hasBack = backTo || onBack;

  return (
    <div
      role="banner"
      style={{
        background: C.darkGreen,
        paddingTop: "max(12px, env(safe-area-inset-top))",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="flex items-center gap-2 px-3 pb-3">
        {/* Back button — always 44×44 */}
        {hasBack ? (
          backTo ? (
            <Link
              to={backTo}
              aria-label="Go back"
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: "#ffffff18", flexShrink: 0 }}
            >
              <ChevronLeft size={22} color={C.cream} />
            </Link>
          ) : (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: "#ffffff18", flexShrink: 0, border: "none", cursor: "pointer" }}
            >
              <ChevronLeft size={22} color={C.cream} />
            </button>
          )
        ) : (
          // Placeholder keeps title centered when no back button
          <div style={{ width: 44, flexShrink: 0 }} />
        )}

        {/* Title — centered */}
        <div className="flex-1 text-center">
          <p className="font-serif font-bold text-sm leading-tight" style={{ color: C.cream }}>
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] mt-0.5" style={{ color: C.lightGreen }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right slot — must be 44×44 if interactive */}
        <div style={{ minWidth: 44, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          {rightSlot ?? null}
        </div>
      </div>
    </div>
  );
}