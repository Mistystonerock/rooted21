import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen, Target, TrendingUp, AlertTriangle, Zap, KeyRound, Users, Calendar,
  Heart, Library, BarChart2, CalendarDays, Shield, BookMarked, MessageSquare,
  FileText, CreditCard, QrCode, MapPin, CheckSquare, UserSearch, Info,
  ChevronRight, Sparkles,
} from "lucide-react";
import TreeLogo from "@/components/rooted/TreeLogo";
import BottomNav from "@/components/rooted/BottomNav";
import NotificationBell from "@/components/rooted/NotificationBell";
import AccessCodeEntry from "@/components/rooted/AccessCodeEntry";
import GenerateInvitationModal from "@/components/rooted/GenerateInvitationModal";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import MobileRefresh from "@/components/mobile/MobileRefresh";
import DarkModeToggle from "@/components/rooted/DarkModeToggle";
import ProgressRing from "@/components/rooted/ProgressRing";
import TrainingVideoSeries from "@/components/training/TrainingVideoSeries";

const BG = "#faf6f1";
const CARD = "#ffffff";
const BORDER = "rgba(120,85,60,0.2)";
const GOLD = "#a67c52";
const GREEN = "#6b9d6e";
const TEXT = "#1a1a1a";
const MUTED = "#8b6f54";

// Feature tiles — each with its own color accent
const TILES = [
  { to: "/resources", emoji: "🗂️", icon: null, label: "Resources", sub: "Local help, jobs, benefits, court forms, substance support", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/support-hub", emoji: "🤝", icon: null, label: "Support", sub: "Crisis tools, conversations, team contacts", accent: "#12203a", border: "#7aaaee30" },
  { id: "behavior-log-button", to: "/behavior-hub", emoji: "🧠", icon: null, label: "Behavior", sub: "Logs, analytics, trends, regulation tools", accent: "#1a1535", border: "#a09ef030" },
  { to: "/education-hub", emoji: "📚", icon: null, label: "Education", sub: "Lessons, classes, guides, worksheets", accent: "#2a1f0a", border: `${GOLD}30` },
  { to: "/communications", emoji: "💬", icon: null, label: "Communications", sub: "Messages, agency emails, meeting notes, court audit trail", accent: "#102b24", border: `${GREEN}30` },
  { to: "/communication-tone-tool", emoji: "⚖️", icon: null, label: "Tone Check", sub: "AI feedback and court-appropriate message rewrites", accent: "#102b24", border: `${GREEN}30` },
  { to: "/compliance-risks", emoji: "⚖️", icon: null, label: "Compliance Risks", sub: "AI court-readiness predictions and corrective actions", accent: "#2a1f0a", border: `${GOLD}30` },
  { to: "/consent-forms", emoji: "📝", icon: null, label: "Consent Forms", sub: "Release of information and signed consent templates", accent: "#102b24", border: `${GREEN}30` },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [goals, setGoals] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showTour, setShowTour] = useState(false);

  async function handleRefresh() {
    await Promise.all([
      base44.auth.me().then(setUser),
      base44.entities.ChildProfile.list("-created_date", 1).then(r => setChild(r[0] || null)),
      base44.entities.Goal.filter({ progress: "in_progress" }, "-created_date", 3).then(setGoals),
      base44.entities.LessonProgress.filter({ completed: true }, "-created_date", 50).then(setLessonProgress),
      base44.entities.CheckIn.list("-created_date", 3).then(setRecentCheckins),
    ]);
    queryClient.invalidateQueries();
  }

  useEffect(() => {
    handleRefresh();
    const hasSeenTour = localStorage.getItem("rooted21_tour_seen");
    if (!hasSeenTour) setShowTour(true);
  }, []);

  const completedLessons = lessonProgress.length;
  const progressPct = Math.round((completedLessons / 21) * 100);
  const latestCheckin = recentCheckins[0];

  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT, fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{
        background: BG, paddingTop: "max(12px, env(safe-area-inset-top))",
        position: "sticky", top: 0, zIndex: 10,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div className="flex items-center gap-3 px-4 pb-3">
          <TreeLogo size={32} />
          <div>
            <div className="font-serif font-bold text-base" style={{ color: TEXT }}>
              Rooted <span style={{ color: GOLD }}>21</span>
            </div>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.13em", color: MUTED, marginTop: 1 }}>PARENTING NETWORK</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DarkModeToggle />
            <NotificationBell />
            <button
              onClick={() => navigate("/profile")}
              aria-label="My profile"
              style={{ width: 38, height: 38, borderRadius: "50%", background: CARD, border: `2px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: TEXT, cursor: "pointer" }}
            >
              {user?.full_name?.[0] || "?"}
            </button>
          </div>
        </div>
      </div>

      <MobileRefresh onRefresh={handleRefresh}>
        <div className="max-w-[520px] mx-auto px-4 py-4 space-y-5">

          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: "20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: `0 8px 24px rgba(61,40,23,0.08)` }}
          >
            <div>
              <p className="font-serif font-bold" style={{ fontSize: 21, color: TEXT, lineHeight: 1.2 }}>
                Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 🌿
              </p>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 5 }}>You are not alone in this journey.</p>
            </div>
            <Link to="/personalized-chat" style={{ background: GREEN, border: `1.5px solid ${GREEN}`, borderRadius: 11, padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
              <Sparkles size={13} color="#ffffff" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap" }}>AI Coach</span>
            </Link>
          </motion.div>

          <TrainingVideoSeries compact />

          {/* Quick Actions */}
          <div id="quick-actions">
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: GREEN, marginBottom: 10 }}>QUICK ACTIONS</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { id: "sos-button", to: "/chat?crisis=1", emoji: null, label: "Help Me\nRight Now", sub: "Immediate support", bg: CARD, border: "#B84C2A", textColor: "#B84C2A", issos: true },
                { id: "checkin-button", to: "/daily-checkin", emoji: "✅", label: "Check-In", sub: "Daily check-in & mood", bg: CARD, border: GREEN, textColor: GREEN },
                { id: "safety-plan-button", to: "/safety-plan", emoji: "🛡️", label: "Safety Plan", sub: "Crisis plan & resources", bg: CARD, border: GOLD, textColor: GOLD },
              ].map((a, i) => (
                <motion.div key={a.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Link id={a.id} to={a.to} style={{ display: "block", background: a.bg, border: `1.5px solid ${a.border}`, borderRadius: 16, padding: "14px 10px", textAlign: "center", textDecoration: "none", boxShadow: `0 8px 24px rgba(61,40,23,0.08)` }}>
                    {a.issos ? (
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", border: "2.5px solid #ff4444", fontWeight: 900, fontSize: 11, color: "#fff", boxShadow: "0 2px 10px rgba(192,57,43,0.5)" }}>SOS</div>
                    ) : (
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{a.emoji}</div>
                    )}
                    <p style={{ fontWeight: 800, fontSize: 12, color: a.textColor, lineHeight: 1.3, whiteSpace: "pre-line" }}>{a.label}</p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{a.sub}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress + Last Check-in */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Link to="/lessons" style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none", boxShadow: `0 8px 24px rgba(61,40,23,0.08)` }}>
              <ProgressRing pct={progressPct} size={72} color={GREEN} />
              <p style={{ fontWeight: 700, fontSize: 12, color: TEXT }}>Lessons</p>
              <p style={{ fontSize: 11, color: MUTED }}>{completedLessons}/21 done</p>
            </Link>
            {latestCheckin ? (
              <Link to="/progress" style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, textDecoration: "none", boxShadow: `0 8px 24px rgba(61,40,23,0.08)` }}>
                <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 14, color: TEXT }}>Last Check-In</p>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 30, fontWeight: 900, color: GREEN, lineHeight: 1 }}>{latestCheckin.child_regulation}</p>
                    <p style={{ fontSize: 10, color: MUTED }}>Child</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 30, fontWeight: 900, color: GOLD, lineHeight: 1 }}>{latestCheckin.parent_calm}</p>
                    <p style={{ fontSize: 10, color: MUTED }}>You</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>View trends →</p>
              </Link>
            ) : (
              <Link to="/daily-checkin" style={{ background: `${GREEN}10`, border: `1.5px dashed ${GREEN}50`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", textAlign: "center" }}>
                <p style={{ fontSize: 26 }}>📊</p>
                <p style={{ fontWeight: 700, fontSize: 12, color: TEXT }}>Start your first check-in</p>
              </Link>
            )}
          </div>

          {/* All Features */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: GREEN, marginBottom: 10 }}>ALL FEATURES</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {TILES.map((tile, i) => (
                <Link id={tile.id} key={tile.to + tile.label} to={tile.to} style={{
                  background: CARD,
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 16, padding: "14px 12px",
                  textDecoration: "none", display: "flex", flexDirection: "column", gap: 6,
                  boxShadow: `0 8px 24px rgba(61,40,23,0.08)`,
                }}>
                  {tile.icon ? (
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {tile.icon}
                    </div>
                  ) : (
                    <div style={{ fontSize: 24 }}>{tile.emoji}</div>
                  )}
                  <p style={{ fontWeight: 700, fontSize: 13, color: TEXT, lineHeight: 1.25 }}>{tile.label}</p>
                  {tile.sub && <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{tile.sub}</p>}
                </Link>
              ))}
            </div>
          </div>

          {/* Child profile */}
          {child ? (
            <Link to="/child-profile" style={{ display: "block", background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: 14, textDecoration: "none", boxShadow: `0 8px 24px rgba(61,40,23,0.08)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${GREEN}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🧒</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>{child.first_name}</p>
                  <p style={{ fontSize: 11, color: MUTED }}>Child profile · Tap to edit</p>
                </div>
              </div>
            </Link>
          ) : (
            <Link to="/child-profile" style={{ display: "block", background: `${GREEN}10`, border: `1.5px dashed ${GREEN}40`, borderRadius: 16, padding: 14, textDecoration: "none", textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#48D17A" }}>+ Add Child Profile</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Helps professionals support your family</p>
            </Link>
          )}

          {/* Access codes */}
          {showCodeEntry ? (
            <AccessCodeEntry onLinked={() => setShowCodeEntry(false)} onDismiss={() => setShowCodeEntry(false)} />
          ) : (
            <>
              <button onClick={() => setShowCodeEntry(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: CARD, border: `1.5px dashed ${GREEN}50`, borderRadius: 16, padding: 14, cursor: "pointer", textAlign: "left" }}>
                <KeyRound size={20} color={GREEN} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>Enter Professional Access Code</p>
                  <p style={{ fontSize: 11, color: MUTED }}>Link your account to your assigned professional</p>
                </div>
              </button>
              {child && (
                <button onClick={() => setShowInvitationModal(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: CARD, border: `1.5px dashed ${GOLD}50`, borderRadius: 16, padding: 14, cursor: "pointer", textAlign: "left" }}>
                  <QrCode size={20} color={GOLD} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>Generate Invitation Code</p>
                    <p style={{ fontSize: 11, color: MUTED }}>Share with a professional to auto-link them</p>
                  </div>
                </button>
              )}
            </>
          )}

          {showInvitationModal && (
            <GenerateInvitationModal childName={child?.first_name} onClose={() => setShowInvitationModal(false)} onSuccess={() => setShowInvitationModal(false)} />
          )}

          {/* Crisis reminder */}
          <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <AlertTriangle size={15} color="#ff8070" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "#FF6B5A", fontWeight: 600 }}>
              In crisis? Call or text <strong>988</strong>. In danger, call <strong>911</strong>.
            </p>
          </div>

          <div className="pb-16" />
        </div>
      </MobileRefresh>

      <BottomNav />

      {showTour && (
        <OnboardingTour onComplete={() => { setShowTour(false); localStorage.setItem("rooted21_tour_seen", "true"); }} />
      )}
    </div>
  );
}