/**
 * Mobile-optimized text component.
 * Enforces minimum font sizes per WCAG:
 *   body    → 14px (text-sm)
 *   caption → 12px (text-xs)
 *   label   → 12px bold
 *   heading → 16px bold
 *
 * Pass `as` prop to render as any HTML element (default: span).
 */
export default function MobileText({
  children,
  variant = "body",
  as: Tag = "span",
  className = "",
  style,
  ...rest
}) {
  const styles = {
    body:    { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
    label:   { fontSize: 12, fontWeight: 600, lineHeight: 1.4 },
    heading: { fontSize: 16, fontWeight: 700, lineHeight: 1.3 },
  };

  return (
    <Tag
      className={className}
      style={{ ...styles[variant], ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}