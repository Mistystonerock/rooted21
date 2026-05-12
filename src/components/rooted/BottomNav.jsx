import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Target, TrendingUp, MessageCircle } from "lucide-react";

const GOLD = "#c9973a";
const TEXT = "#f5e6c8";
const MUTED = "rgba(245,230,200,0.45)";

const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/chat", label: "AI Chat", icon: MessageCircle },
  { path: "/lessons", label: "Lessons", icon: BookOpen },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/progress", label: "Progress", icon: TrendingUp },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-1 pt-2"
      style={{
        background: "linear-gradient(180deg, #0a3d20 0%, #071f10 100%)",
        borderTop: `1px solid rgba(201,151,58,0.35)`,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      {NAV.map(({ path, label, icon: Icon }) => {
        const active = pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
            style={{ minWidth: 52, textDecoration: "none" }}
          >
            <Icon
              size={20}
              color={active ? GOLD : MUTED}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span
              className="text-[9px] font-bold"
              style={{ color: active ? GOLD : MUTED }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}