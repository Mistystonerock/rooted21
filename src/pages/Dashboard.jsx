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

const BG = "#0b1f12";
const CARD = "#12271a";
const BORDER = "rgba(255,255,255,0.07)";
const GOLD = "#c9973a";
const GREEN = "#3db870";
const TEXT = "#f0e8d8";
const MUTED = "rgba(240,232,216,0.5)";

// Feature tiles — each with its own color accent
const TILES = [
  { to: "/personalized-chat", emoji: null, icon: <Zap size={20} color={GOLD} />, label: "Parenting Support", sub: "Personalized to your family", accent: "#2a1f0a", border: `${GOLD}40` },
  { to: "/lessons", emoji: null, icon: <BookOpen size={20} color={GREEN} />, label: "Lessons", sub: null, accent: "#0e2a1a", border: `${GREEN}40` },
  { to: "/goals", emoji: null, icon: <Target size={20} color="#e07070" />, label: "Goals", sub: null, accent: "#2a1010", border: "#e0707040" },
  { to: "/daily-checkin", emoji: null, icon: <TrendingUp size={20} color={GREEN} />, label: "Daily Check-In", sub: "Quick mood & calm log", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/my-team", emoji: null, icon: <Users size={20} color="#7aaaee" />, label: "My Support Team", sub: "Message professionals", accent: "#12203a", border: "#7aaaee40" },
  { to: "/journal", emoji: null, icon: <BookMarked size={20} color={GOLD} />, label: "Reflection Journal", sub: "Private daily reflections", accent: "#2a1f0a", border: `${GOLD}30` },
  { to: "/support-guide", emoji: null, icon: <MessageSquare size={20} color={GREEN} />, label: "Support Conversation", sub: "AI talking points", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/family-dashboard", emoji: null, icon: <Calendar size={20} color="#7aaaee" />, label: "Family Dashboard", sub: "Calendar & inbox", accent: "#12203a", border: "#7aaaee30" },
  { to: "/respite-care", emoji: null, icon: <Heart size={20} color="#e07070" />, label: "Respite Care", sub: "Find vetted providers", accent: "#2a1010", border: "#e0707030" },
  { to: "/personalized-legal-feed", emoji: null, icon: <Library size={20} color={GOLD} />, label: "Legal Feed", sub: "Articles for your cases", accent: "#2a1f0a", border: `${GOLD}30` },
  { to: "/safety-plan", emoji: null, icon: <Shield size={20} color="#7aaaee" />, label: "Safety Plan", sub: "Crisis prep & resources", accent: "#12203a", border: "#7aaaee30" },
  { to: "/household-routine", emoji: null, icon: <CalendarDays size={20} color={GREEN} />, label: "Household Routine", sub: "Daily schedule", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/monthly-report", emoji: null, icon: <FileText size={20} color={GOLD} />, label: "Monthly Report", sub: "PDF for care team", accent: "#2a1f0a", border: `${GOLD}30` },
  { to: "/behavior-logs", emoji: null, icon: <BarChart2 size={20} color="#a09ef0" />, label: "Behavior Logs", sub: "Daily tracking", accent: "#1a1535", border: "#a09ef030" },
  { to: "/analytics", emoji: null, icon: <BarChart2 size={20} color={GOLD} />, label: "Behavior Analytics", sub: "Trends & insights", accent: "#2a1f0a", border: `${GOLD}40` },
  { to: "/milestones", emoji: "🏅", icon: null, label: "Milestones", sub: "Badges & rewards", accent: "#1a1808", border: "#c9973a30" },
  { to: "/co-parent-portal", emoji: null, icon: <Users size={20} color={GREEN} />, label: "Co-Parent Portal", sub: "Court-supervised messaging", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/billing", emoji: null, icon: <CreditCard size={20} color="#7aaaee" />, label: "Billing", sub: "Subscription & pricing", accent: "#12203a", border: "#7aaaee30" },
  { to: "/weekly-habits", emoji: null, icon: <CheckSquare size={20} color={GREEN} />, label: "Weekly Habits", sub: "Daily parenting streak", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/local-resources", emoji: null, icon: <MapPin size={20} color="#e07070" />, label: "Local Resources", sub: "Crisis lines near you", accent: "#2a1010", border: "#e0707030" },
  { to: "/professional-directory", emoji: null, icon: <UserSearch size={20} color={GREEN} />, label: "Find a Professional", sub: "Therapists & coaches", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/app-guide", emoji: null, icon: <Info size={20} color={GOLD} />, label: "App Guide", sub: "Everything this app can do", accent: "#2a1f0a", border: `${GOLD}30` },
  { to: "/care-calendar", emoji: null, icon: <CalendarDays size={20} color={GREEN} />, label: "Care Calendar", sub: "Shared family events", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/sensory-toolbox", emoji: "🧠", icon: null, label: "Sensory Toolbox", sub: "3-min regulation activities", accent: "#1a1535", border: "#a09ef030" },
  { to: "/emergency-toolbox", emoji: "🚨", icon: null, label: "Emergency Toolbox", sub: "Real-time crisis strategies", accent: "#2a0a0a", border: "#c0392b40", text: "#ff8070" },
  { to: "/child-profiles", emoji: "🧒", icon: null, label: "Child Profiles", sub: "Personalize AI insights", accent: "#0e2a1a", border: `${GREEN}20` },
  { to: "/growth-insights", emoji: "🌱", icon: null, label: "Growth Insights", sub: "AI weekly behavior reports", accent: "#0e2a1a", border: `${GREEN}40` },
  { to: "/behavioral-trends", emoji: "📈", icon: null, label: "Behavioral Trends", sub: "Visual progress charts", accent: "#1a1535", border: "#a09ef030" },
  { to: "/job-resources", emoji: "💼", icon: null, label: "Job Resources", sub: "Career, training & aid", accent: "#2a1f0a", border: `${GOLD}20` },
  { to: "/live-classes", emoji: "🎓", icon: null, label: "Live Classes", sub: "Join a parenting group", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/case-management", emoji: "⚖️", icon: null, label: "Case Management", sub: "Track legal matters", accent: "#12203a", border: "#7aaaee30" },
  { to: "/form-helper", emoji: "📝", icon: null, label: "Form & Paperwork Help", sub: "Guided help — what to file & how", accent: "#12203a", border: "#7aaaee40", text: "#7aaaee" },
  { to: "/case-plan-checklist", emoji: "✅", icon: null, label: "Case Plan Checklist", sub: "AI-powered task tracker", accent: "#0e2a1a", border: `${GREEN}30` },
  { to: "/documents", emoji: "🔒", icon: null, label: "Secure Documents", sub: "Store & share files", accent: "#12203a", border: "#7aaaee20" },
  { to: "/document-scanner", emoji: "📷", icon: null, label: "Document Scanner", sub: "AI OCR & extraction", accent: "#1a1535", border: "#a09ef030" },
  { to: "/court-ready-export", emoji: "⚖️", icon: null, label: "Court-Ready Export", sub: "Certified PDF for court", accent: "#2a1005", border: "#e0702030", text: "#ff9060" },
  { to: "/court-ready-summary", emoji: "📜", icon: null, label: "Court-Ready Summary", sub: "Journal + incidents → PDF", accent: "#2a1005", border: "#e0702030", text: "#ff9060" },
  { to: "/visitation-tracker", emoji: "👨‍👧", icon: null, label: "Visitation Tracker", sub: "Log visits for court", accent: "#0e2a1a", border: `${GREEN}20` },
  { to: "/medication-manager", emoji: "💊", icon: null, label: "Medications", sub: "Track prescriptions & refills", accent: "#12203a", border: "#7aaaee20" },
  { to: "/incident-reports", emoji: "📋", icon: null, label: "Incident Reports", sub: "Document critical events", accent: "#2a1005", border: "#e0702030", text: "#ff9060" },
  { to: "/reunification-tracker", emoji: "🏠", icon: null, label: "Reunification Plan", sub: "Track court-ordered services", accent: "#0e2a1a", border: `${GREEN}20` },
  { to: "/team-contacts", emoji: "📞", icon: null, label: "Team Contacts", sub: "Caseworker, CASA & more", accent: "#0e2a1a", border: `${GREEN}20` },
  { to: "/peer-support", emoji: "🤝", icon: null, label: "Parent Community", sub: "Connect with parents", accent: "#251232", border: "#c080e030" },
  { to: "/life-story", emoji: "📖", icon: null, label: "Child Life Story", sub: "Build their timeline", accent: "#0e2a1a", border: `${GREEN}20` },
  { to: "/education-hub", emoji: "📚", icon: null, label: "Education Hub", sub: "FASD, RAD, grief & more", accent: "#12203a", border: "#7aaaee30" },
  { to: "/rights-card", emoji: "🪪", icon: null, label: "Know Your Rights", sub: "IEP, CPS, court", accent: "#0e2a1a", border: `${GREEN}20` },
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
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.13em", color: MUTED, marginTop: 1 }}>PARENTING NETWORK</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DarkModeToggle />
            <NotificationBell />
            <button
              onClick={() => navigate("/profile")}
              aria-label="My profile"
              style={{ width: 38, height: 38, borderRadius: "50%", background: `${GREEN}20`, border: `2px solid ${GREEN}40`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: TEXT, cursor: "pointer" }}
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
            style={{ background: `linear-gradient(135deg, #162e1f 0%, #0f2216 100%)`, border: `1.5px solid ${GREEN}30`, borderRadius: 18, padding: "18px 18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: `0 4px 24px rgba(61,184,112,0.08)` }}
          >
            <div>
              <p className="font-serif font-bold" style={{ fontSize: 21, color: TEXT, lineHeight: 1.2 }}>
                Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 🌿
              </p>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 5 }}>You are not alone in this journey.</p>
            </div>
            <Link to="/personalized-chat" style={{ background: `${GREEN}18`, border: `1.5px solid ${GREEN}50`, borderRadius: 11, padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
              <Sparkles size={13} color={GREEN} />
              <span style={{ fontSize: 12, fontWeight: 800, color: GREEN, whiteSpace: "nowrap" }}>AI Coach</span>
            </Link>
          </motion.div>

          {/* Quick Actions */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: MUTED, marginBottom: 10 }}>QUICK ACTIONS</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { to: "/chat?crisis=1", emoji: null, label: "Help Me\nRight Now", sub: "Immediate support", bg: "linear-gradient(145deg,#3a0f0f,#5a1a1a)", border: "#c0392b", textColor: "#ff8070", issos: true },
                { to: "/daily-checkin", emoji: "✅", label: "Check-In", sub: "Daily check-in & mood", bg: `linear-gradient(145deg, #0e2a1a, #162e20)`, border: GREEN, textColor: GREEN },
                { to: "/safety-plan", emoji: "🛡️", label: "Safety Plan", sub: "Crisis plan & resources", bg: `linear-gradient(145deg, #101830, #182240)`, border: "#4a80d0", textColor: "#7aaaee" },
              ].map((a, i) => (
                <motion.div key={a.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Link to={a.to} style={{ display: "block", background: a.bg, border: `1.5px solid ${a.border}40`, borderRadius: 16, padding: "14px 10px", textAlign: "center", textDecoration: "none", boxShadow: `0 2px 14px ${a.border}18` }}>
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
            <Link to="/lessons" style={{ background: `linear-gradient(135deg,#12271a,#0f1f14)`, border: `1.5px solid ${GREEN}30`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <ProgressRing pct={progressPct} size={72} color={GREEN} />
              <p style={{ fontWeight: 700, fontSize: 12, color: TEXT }}>Lessons</p>
              <p style={{ fontSize: 11, color: MUTED }}>{completedLessons}/21 done</p>
            </Link>
            {latestCheckin ? (
              <Link to="/progress" style={{ background: `linear-gradient(135deg,#12271a,#0f1f14)`, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, textDecoration: "none" }}>
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
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: MUTED, marginBottom: 10 }}>ALL FEATURES</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {TILES.map((tile, i) => (
                <Link key={tile.to + tile.label} to={tile.to} style={{
                  background: `linear-gradient(145deg, ${tile.accent}, #0b1f12)`,
                  border: `1.5px solid ${tile.border}`,
                  borderRadius: 16, padding: "14px 12px",
                  textDecoration: "none", display: "flex", flexDirection: "column", gap: 6,
                  boxShadow: `0 2px 10px rgba(0,0,0,0.2)`,
                }}>
                  {tile.icon ? (
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {tile.icon}
                    </div>
                  ) : (
                    <div style={{ fontSize: 24 }}>{tile.emoji}</div>
                  )}
                  <p style={{ fontWeight: 700, fontSize: 13, color: tile.text || TEXT, lineHeight: 1.25 }}>{tile.label}</p>
                  {tile.sub && <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{tile.sub}</p>}
                </Link>
              ))}
            </div>
          </div>

          {/* Child profile */}
          {child ? (
            <Link to="/child-profile" style={{ display: "block", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14, textDecoration: "none" }}>
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
              <p style={{ fontWeight: 700, fontSize: 13, color: GREEN }}>+ Add Child Profile</p>
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
            <p style={{ fontSize: 12, color: "#ff8070" }}>
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