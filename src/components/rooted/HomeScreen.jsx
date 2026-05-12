import { useState, useEffect } from "react";
import { C } from "@/lib/rooted-constants";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Bell, Home, LayoutGrid, BookOpen, MoreHorizontal, Sparkles, ChevronRight, Users, BookMarked, CalendarDays, Heart, Library, Shield, Calendar, Package } from "lucide-react";
import TreeLogo from "./TreeLogo";
import { base44 } from "@/api/base44Client";

const BG = "#0d2818";
const CARD = "#132d1f";
const CARD2 = "#162f21";
const BORDER = "rgba(255,255,255,0.08)";
const GOLD = "#c9973a";
const GREEN = "#3db870";
const TEXT = "#f0e8d8";
const MUTED = "rgba(240,232,216,0.55)";

const QUICK_ACTIONS = [
  { to: "/chat?crisis=1", icon: "SOS", label: "Help Me Right Now", sub: "Get immediate support", bg: "#3a1a1a", border: "#c0392b", iconBg: "#c0392b", textColor: "#ff8070", issos: true },
  { to: "/daily-checkin", icon: "✓", label: "Check-In", sub: "Daily check-in & mood", bg: CARD, border: GREEN, iconBg: CARD, textColor: GREEN },
  { to: "/behavior-logs", icon: "📊", label: "Log Behavior", sub: "Track & understand behaviors", bg: "#1a1a3a", border: "#6c63ff", iconBg: "#2d2a5e", textColor: "#a09ef0" },
  { to: "/safety-plan", icon: "🛡", label: "Safety Plan", sub: "Crisis plan & resources", bg: "#1a2040", border: "#3a6ccc", iconBg: "#1e2e5a", textColor: "#7aaaee" },
];

const FEATURES = [
  { to: "/my-team", icon: <Users size={18} color={GREEN} />, label: "My Support Team", sub: "Message your professionals" },
  { to: "/journal", icon: <BookMarked size={18} color={GOLD} />, label: "Reflection Journal", sub: "Private daily reflections" },
  { to: "/family-dashboard", icon: <CalendarDays size={18} color="#7aaaee" />, label: "Family Dashboard", sub: "Calendar & inbox" },
  { to: "/respite-care", icon: <Heart size={18} color="#e07070" />, label: "Respite Care", sub: "Find vetted providers" },
  { to: "/personalized-legal-feed", icon: <Library size={18} color={GOLD} />, label: "Legal Feed", sub: "Articles for your cases" },
  { to: "/safety-plan", icon: <Shield size={18} color="#7aaaee" />, label: "Safety Plan", sub: "Crisis prep & resources" },
  { to: "/household-routine", icon: <Home size={18} color={GREEN} />, label: "Household Routine", sub: "Your home's daily schedule" },
  { to: "/resource-library", icon: <Package size={18} color={GOLD} />, label: "Tools & Resources", sub: "Guides, scripts & printables" },
  { to: "/peer-support", icon: <Users size={18} color="#c080e0" />, label: "Community", sub: "Connect with other parents" },
];

export default function HomeScreen({ onHelp, error, onOpenHistory, onOpenTrends }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checkins, setCheckins] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [goals, setGoals] = useState(0);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
    }).catch(() => {});
    // Load stats
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    base44.entities.CheckIn.list("-created_date", 50).then(r => {
      const thisWeek = r.filter(c => new Date(c.created_date) >= weekAgo);
      setCheckins(thisWeek.length);
    }).catch(() => {});
    base44.entities.LessonProgress.filter({ completed: true }, "-created_date", 100).then(r => setLessons(r.length)).catch(() => {});
    base44.entities.Goal.filter({ progress: "in_progress" }, "-created_date", 50).then(r => setGoals(r.length)).catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const progressPct = Math.round((lessons / 21) * 100);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--font-sans)", color: TEXT, paddingBottom: 90 }}>

      {/* ── TOP NAV ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "max(16px, env(safe-area-inset-top)) 16px 12px", background: BG, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TreeLogo size={32} />
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: 18, color: TEXT, lineHeight: 1 }}>
              Rooted <span style={{ color: GOLD }}>21</span>
            </p>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, marginTop: 1 }}>PARENTING NETWORK</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/chat")} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <MessageCircle size={18} color={TEXT} />
          </button>
          <button onClick={() => navigate("/notifications")} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <Bell size={18} color={TEXT} />
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#e05555", border: `1.5px solid ${BG}` }} />
          </button>
          <button onClick={() => navigate("/profile")} style={{ background: CARD, border: `1.5px solid ${GREEN}40`, borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 800, fontSize: 15, color: TEXT }}>
            {user?.full_name?.[0] || "?"}
          </button>
        </div>
      </div>

      <div style={{ padding: "0 16px", maxWidth: 520, margin: "0 auto" }}>

        {/* ── WELCOME CARD ── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 18px 16px", marginBottom: 22, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: 20, color: TEXT, lineHeight: 1.2 }}>
              Welcome back, {firstName} 🌿
            </p>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 5 }}>You are not alone in this journey.</p>
          </div>
          <Link to="/personalized-chat" style={{ background: CARD2, border: `1px solid ${GREEN}60`, borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
            <Sparkles size={14} color={GREEN} />
            <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, whiteSpace: "nowrap" }}>Chat to Edit</span>
          </Link>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", color: MUTED, marginBottom: 10 }}>QUICK ACTIONS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 22 }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.to} to={a.to} style={{ background: a.bg, border: `1.5px solid ${a.border}30`, borderRadius: 14, padding: "12px 8px", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
              {a.issos ? (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: a.iconBg, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #ff4444", fontWeight: 900, fontSize: 10, color: "#fff" }}>SOS</div>
              ) : a.icon.length <= 2 && /[a-zA-Z✓]/.test(a.icon) ? (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: a.iconBg, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${a.border}80`, fontSize: 18, color: a.textColor, fontWeight: 800 }}>{a.icon}</div>
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 10, background: a.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{a.icon}</div>
              )}
              <p style={{ fontSize: 11, fontWeight: 800, color: a.textColor, lineHeight: 1.2 }}>{a.label}</p>
              <p style={{ fontSize: 9, color: MUTED, lineHeight: 1.3 }}>{a.sub}</p>
              <ChevronRight size={10} color={MUTED} />
            </Link>
          ))}
        </div>

        {/* ── YOUR PROGRESS ── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "16px 18px", marginBottom: 22 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: MUTED, marginBottom: 14 }}>YOUR PROGRESS</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Ring */}
            <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle cx="44" cy="44" r="36" fill="none" stroke={GREEN} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPct / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 44 44)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontWeight: 900, fontSize: 18, color: TEXT, lineHeight: 1 }}>{progressPct}%</p>
                <p style={{ fontSize: 9, color: MUTED, textAlign: "center", lineHeight: 1.2, marginTop: 2 }}>Journey<br/>Progress</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                {[
                  { val: checkins, label: "Check-ins\nThis Week" },
                  { val: lessons, label: "Lessons\nCompleted" },
                  { val: goals, label: "Goals\nActive" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", flex: 1 }}>
                    <p style={{ fontWeight: 900, fontSize: 22, color: TEXT, lineHeight: 1 }}>{s.val}</p>
                    <p style={{ fontSize: 9, color: MUTED, lineHeight: 1.4, marginTop: 3, whiteSpace: "pre-line" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: MUTED, fontStyle: "italic", marginBottom: 8 }}>Every small step creates lasting change.</p>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 5, overflow: "hidden" }}>
                <div style={{ width: `${progressPct}%`, height: "100%", background: GREEN, borderRadius: 4, transition: "width 0.8s ease" }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", color: MUTED }}>FEATURES</p>
          <Link to="/dashboard" style={{ fontSize: 11, fontWeight: 700, color: GREEN, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
            View All <ChevronRight size={12} color={GREEN} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 22 }}>
          {FEATURES.map(f => (
            <Link key={f.to} to={f.to} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 10px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {f.icon}
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>{f.label}</p>
              <p style={{ fontSize: 9, color: MUTED, lineHeight: 1.4 }}>{f.sub}</p>
            </Link>
          ))}
        </div>

        {/* ── AI BANNER ── */}
        <div style={{ background: CARD, border: `1.5px solid ${GREEN}40`, borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${GREEN}18`, border: `1.5px solid ${GREEN}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>🧠</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: TEXT }}>AI Parenting Support</p>
              <span style={{ background: `${GREEN}25`, color: GREEN, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 5, letterSpacing: "0.06em" }}>BETA</span>
            </div>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>Get personalized guidance and real-time support.</p>
          </div>
          <Link to="/personalized-chat" style={{ background: CARD2, border: `1px solid ${GREEN}60`, borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
            <Sparkles size={13} color={GREEN} />
            <span style={{ fontSize: 11, fontWeight: 800, color: GREEN, whiteSpace: "nowrap" }}>Ask AI Coach</span>
          </Link>
        </div>

        {error && <p style={{ fontSize: 12, color: "#ff8070", textAlign: "center", marginTop: 8 }}>⚠️ {error}</p>}

      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f1f14", borderTop: `1px solid ${BORDER}`, paddingBottom: "max(12px, env(safe-area-inset-bottom))", zIndex: 20, display: "flex", alignItems: "center" }}>
        {[
          { to: "/home", icon: <Home size={20} />, label: "Home", active: true },
          { to: "/dashboard", icon: <LayoutGrid size={20} />, label: "Dashboard" },
        ].map(n => (
          <Link key={n.to} to={n.to} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0", textDecoration: "none", color: n.active ? GREEN : MUTED }}>
            {n.icon}
            <span style={{ fontSize: 10, fontWeight: 700 }}>{n.label}</span>
          </Link>
        ))}

        {/* SOS center button */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "4px 0" }}>
          <Link to="/chat?crisis=1" style={{ width: 54, height: 54, borderRadius: "50%", background: "#c0392b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textDecoration: "none", boxShadow: "0 4px 16px rgba(192,57,43,0.5)", border: "3px solid #0f1f14", marginTop: -16 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>SOS</span>
          </Link>
        </div>

        {[
          { to: "/lessons", icon: <BookOpen size={20} />, label: "Lessons" },
          { to: "/dashboard", icon: <MoreHorizontal size={20} />, label: "More" },
        ].map(n => (
          <Link key={n.to + n.label} to={n.to} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0", textDecoration: "none", color: MUTED }}>
            {n.icon}
            <span style={{ fontSize: 10, fontWeight: 700 }}>{n.label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}