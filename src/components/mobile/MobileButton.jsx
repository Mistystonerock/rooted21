/**
 * Mobile-optimized button with 44x44px minimum tap target.
 * Supports icon-only with ARIA label.
 */
export default function MobileButton({
  children,
  onClick,
  disabled = false,
  variant = "primary", // "primary" | "secondary" | "outline" | "danger"
  size = "lg", // "lg" (44px) | "sm" (36px)
  className = "",
  ariaLabel = null,
  ...props
}) {
  const baseClasses = "rounded-lg font-bold transition-all active:scale-95";
  
  const sizeClasses = {
    lg: "py-3 px-4 text-sm min-h-11",
    sm: "py-2.5 px-3 text-xs min-h-9",
  };

  const variantClasses = {
    primary: "bg-green-700 text-white hover:opacity-90",
    secondary: "bg-gray-200 text-gray-900 hover:opacity-80",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:opacity-90",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-label={ariaLabel}
      style={{
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      {...props}
    >
      {children}
    </button>
  );
}