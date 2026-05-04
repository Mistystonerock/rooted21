import { Link, useLocation } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import { Home, BookOpen, Target, TrendingUp, MessageCircle } from "lucide-react";

const NAV = [
  { path: "/", label: "Home", icon: Home },
  { path: "/chat", label: "AI Chat", icon: MessageCircle },
  { path: "/lessons", label: "Lessons", icon: BookOpen },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/progress", label: "Progress", icon: TrendingUp },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-1 pt-2 pb-3"
      style={{
        background: C.white,
        borderTop: `1px solid ${C.cream}`,
        boxShadow: "0 -2px 12px rgba(47,75,58,.08)",
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
              color={active ? C.darkGreen : C.mutedText}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span
              className="text-[9px] font-bold"
              style={{ color: active ? C.darkGreen : C.mutedText }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}