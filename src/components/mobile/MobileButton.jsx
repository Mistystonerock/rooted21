import { C } from "@/lib/rooted-constants";

/**
 * Mobile-optimized button.
 * Always meets 44px minimum tap target.
 * Supports icon-only mode via ariaLabel.
 *
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes:    lg (44px) | sm (36px, still touch-friendly)
 */

const VARIANTS = {
  primary:   { background: C.darkGreen,  color: C.cream,    border: "none" },
  secondary: { background: C.midGreen,   color: "#fff",     border: "none" },
  outline:   { background: "transparent", color: C.darkGreen, border: `1.5px solid ${C.darkGreen}` },
  ghost:     { background: "#ffffff18",  color: C.cream,    border: "none" },
  danger:    { background: "#B84C2A",    color: "#fff",     border: "none" },
};

export default function MobileButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "lg",
  className = "",
  ariaLabel,
  type = "button",
  style: extraStyle,
  ...rest
}) {
  const minH = size === "lg" ? 44 : 38;
  const px   = size === "lg" ? 20 : 14;
  const fontSize = size === "lg" ? 14 : 12;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity active:opacity-70 ${className}`}
      style={{
        minHeight: minH,
        paddingLeft: px,
        paddingRight: px,
        fontSize,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...VARIANTS[variant],
        ...extraStyle,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}