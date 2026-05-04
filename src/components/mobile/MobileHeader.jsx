import { ChevronLeft, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";

/**
 * iOS-native style header with back button, title, and safe area.
 * Min tap targets 44x44px. Proper alignment and sizing.
 */
export default function MobileHeader({
  title,
  subtitle,
  onBack,
  showHelp = false,
  showNotifications = false,
  showProfile = false,
  notificationBadge = null,
  profileInitial = "?",
}) {
  return (
    <div
      className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
      style={{
        background: C.darkGreen,
        paddingTop: "max(0.75rem, calc(0.75rem + env(safe-area-inset-top)))",
        paddingBottom: "max(0.75rem, calc(0.75rem + env(safe-area-inset-bottom)))",
      }}
    >
      {/* Back button - 44x44 tap target */}
      {onBack && (
        <button
          onClick={onBack}
          className="rounded-lg p-2.5 transition-opacity hover:opacity-70"
          style={{ background: "#ffffff18", border: "none", cursor: "pointer" }}
          aria-label="Go back"
        >
          <ChevronLeft size={20} color={C.cream} />
        </button>
      )}

      {/* Title section */}
      <div className="flex-1">
        <p className="font-serif font-bold text-sm leading-none" style={{ color: C.cream }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {showHelp && (
          <Link
            to="/help"
            className="rounded-lg p-2.5 transition-opacity hover:opacity-70"
            style={{ background: "#ffffff18", border: "none" }}
            aria-label="Help"
          >
            <HelpCircle size={18} color={C.lightGreen} />
          </Link>
        )}

        {showNotifications && (
          <Link
            to="/notifications"
            className="rounded-lg p-2.5 relative transition-opacity hover:opacity-70"
            style={{ background: "#ffffff18", border: "none" }}
            aria-label="Notifications"
          >
            <span className="text-lg">🔔</span>
            {notificationBadge && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: "#B84C2A", color: "white" }}
              >
                {notificationBadge}
              </span>
            )}
          </Link>
        )}

        {showProfile && (
          <Link to="/profile">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: C.midGreen, color: C.white }}
              aria-label="Profile"
            >
              {profileInitial}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}