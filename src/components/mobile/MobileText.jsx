/**
 * Mobile-optimized text component with enforced minimum font sizes.
 * Ensures WCAG compliance: body ≥14px, caption ≥12px.
 * Adds ARIA attributes for screen readers.
 */
export default function MobileText({
  children,
  variant = "body", // "body" | "caption" | "label" | "heading"
  className = "",
  ariaLabel = null,
  role = null,
  ...props
}) {
  const variantClasses = {
    body: "text-sm font-normal leading-relaxed", // 14px
    caption: "text-xs font-normal", // 12px
    label: "text-xs font-semibold", // 12px
    heading: "text-base font-bold", // 16px
  };

  return (
    <span
      className={`${variantClasses[variant]} ${className}`}
      aria-label={ariaLabel}
      role={role}
      {...props}
    >
      {children}
    </span>
  );
}