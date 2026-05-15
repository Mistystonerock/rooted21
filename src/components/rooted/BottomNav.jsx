import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, BookOpen } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

const BG = "#0f1f14";
const BORDER = "rgba(255,255,255,0.08)";
const GREEN = "#3db870";
const MUTED = "rgba(240,232,216,0.45)";

export default function BottomNav() {
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Home */}
      <Link to="/home" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0", textDecoration: "none", color: isActive("/home") ? GREEN : MUTED }}>
        <Home size={20} strokeWidth={isActive("/home") ? 2.5 : 1.8} />
        <span style={{ fontSize: 10, fontWeight: 700 }}>Home</span>
      </Link>

      {/* Dashboard */}
      <Link to="/dashboard" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0", textDecoration: "none", color: isActive("/dashboard") ? GREEN : MUTED }}>
        <LayoutGrid size={20} strokeWidth={isActive("/dashboard") ? 2.5 : 1.8} />
        <span style={{ fontSize: 10, fontWeight: 700 }}>Dashboard</span>
      </Link>

      {/* SOS center button */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", paddingBottom: 4 }}>
        <Link
          to="/chat?crisis=1"
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "#c0392b",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(192,57,43,0.5)",
            border: `3px solid ${BG}`,
            marginTop: -18,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>SOS</span>
        </Link>
        <span style={{ position: "absolute", fontSize: 9, fontWeight: 700, color: MUTED, marginTop: 46, paddingTop: 10 }}>SOS</span>
      </div>

      {/* Lessons */}
      <Link to="/lessons" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0", textDecoration: "none", color: isActive("/lessons") ? GREEN : MUTED }}>
        <BookOpen size={20} strokeWidth={isActive("/lessons") ? 2.5 : 1.8} />
        <span style={{ fontSize: 10, fontWeight: 700 }}>Lessons</span>
      </Link>

      {/* Log Out */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0", color: "#ff8a80" }}>
        <LogoutButton variant="menu" style={{ background: "transparent", border: "none", color: "#ff8a80", boxShadow: "none", padding: 0 }} />
      </div>
    </nav>
  );
}