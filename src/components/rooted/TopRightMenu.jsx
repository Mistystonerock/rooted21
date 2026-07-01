import { useEffect, useRef, useState } from "react";
import { Accessibility, Bell, BookOpen, DoorOpen, Eye, FileCheck2, Home, Languages, LayoutDashboard, LifeBuoy, Menu, NotebookText, Settings, Shield, ShieldCheck, Sparkles, Type, Volume2, X } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { activateQuickExit } from "@/lib/survivorMode";
import { C } from "@/lib/rooted-constants";

const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

const FONT_SIZES = { normal: "16px", large: "18px", xlarge: "20px" };

const ROUTES = new Set([
  "/dashboard",
  "/welcome-to-rooted21",
  "/app-guide",
  "/resources",
  "/court-packet-helper",
  "/evidence-timeline",
  "/case-plan-tracker",
  "/automated-briefing",
  "/court-ready-document-generator",
  "/support-hub",
  "/communication-journal",
  "/family-stability-analytics",
  "/family-background",
  "/accessibility",
  "/privacy-center",
  "/founder-dashboard",
  "/resource-management",
  "/agency-admin",
]);

const mainMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Welcome Page", path: "/welcome-to-rooted21", icon: Home },
  { label: "Founder Note", icon: NotebookText },
  { label: "App Guide", path: "/app-guide", icon: BookOpen },
  { label: "Resources", path: "/resources", icon: LifeBuoy },
  { label: "Court Packet Helper", path: "/court-packet-helper", icon: FileCheck2 },
  { label: "Evidence Timeline", path: "/evidence-timeline", icon: FileCheck2 },
  { label: "Case Plan Tracker", path: "/case-plan-tracker", icon: FileCheck2 },
  { label: "Automated Briefing", path: "/automated-briefing", icon: FileCheck2 },
  { label: "Court-Ready Generator", path: "/court-ready-document-generator", icon: FileCheck2 },
  { label: "Support", path: "/support-hub", icon: Sparkles },
  { label: "Communication Journal", path: "/communication-journal", icon: NotebookText },
  { label: "Stability Analytics", path: "/family-stability-analytics", icon: Sparkles },
  { label: "Family Background", path: "/family-background", icon: NotebookText },
  { label: "Settings", icon: Settings },
  { label: "Accessibility", path: "/accessibility", icon: Accessibility },
  { label: "Privacy & Safety", path: "/privacy-center", icon: ShieldCheck },
];

const adminMenuItems = [
  { label: "Founder Dashboard", path: "/founder-dashboard", icon: Shield },
  { label: "Resource Verification Queue", path: "/resource-management", icon: FileCheck2 },
  { label: "Beta Tester Management", icon: Bell },
  { label: "Content Management", icon: NotebookText },
  { label: "Announcements", icon: Bell },
  { label: "Project Protection Checklist", icon: ShieldCheck },
];

const agencyRoles = ["agency_administrator", "agency_supervisor", "clinical_supervisor", "program_supervisor", "team_lead", "agency_director", "program_manager", "quality_assurance_staff", "compliance_officer", "executive_leadership", "contract_manager", "grant_administrator"];

const agencyMenuItems = [
  { label: "Agency Oversight", path: "/agency-admin", icon: LayoutDashboard },
];

export default function TopRightMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("rooted21_font_size") || "normal");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("rooted21_high_contrast") === "true");
  const [language, setLanguage] = useState(() => localStorage.getItem("rooted21_language") || "en");
  const [rememberPhone, setRememberPhone] = useState(() => localStorage.getItem("rooted21_remember_this_phone") === "true");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontSize] || FONT_SIZES.normal;
    localStorage.setItem("rooted21_font_size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.body.classList.toggle("rooted-high-contrast", highContrast);
    localStorage.setItem("rooted21_high_contrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const selected = LANGUAGES.find(item => item.code === language) || LANGUAGES[0];
    document.documentElement.lang = selected.code;
    document.documentElement.dir = selected.dir;
    localStorage.setItem("rooted21_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("rooted21_remember_this_phone", String(rememberPhone));
  }, [rememberPhone]);

  useEffect(() => {
    if (!open) return;

    const closeMenu = () => {
      setOpen(false);
      setTimeout(() => buttonRef.current?.focus?.(), 0);
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    const closeOnOutsideClick = (event) => {
      if (menuRef.current?.contains(event.target) || buttonRef.current?.contains(event.target)) return;
      closeMenu();
    };

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick, { passive: true });
    setTimeout(() => menuRef.current?.querySelector("button, a, select")?.focus?.(), 0);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
    };
  }, [open]);

  function readPageSummary() {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      if (speaking) {
        setSpeaking(false);
        return;
      }
      const mainText = document.querySelector("main")?.innerText || document.body.innerText || "Rooted 21";
      const utterance = new SpeechSynthesisUtterance(mainText.slice(0, 1800));
      utterance.lang = language;
      utterance.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
    }
  }

  function goTo(path) {
    try {
      if (!path || !ROUTES.has(path)) return;
      setOpen(false);
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch {
      setOpen(false);
    }
  }

  function MenuItem({ item }) {
    const Icon = item.icon;
    const ready = item.path && ROUTES.has(item.path);

    return (
      <button
        type="button"
        onClick={() => ready && goTo(item.path)}
        disabled={!ready}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold"
        style={{
          background: C.offWhite,
          color: ready ? C.darkGreen : C.mutedText,
          border: `1px solid ${C.cream}`,
          cursor: ready ? "pointer" : "not-allowed",
          opacity: ready ? 1 : 0.75,
        }}
      >
        <span className="flex items-center gap-2"><Icon size={14} /> {item.label}</span>
        <span className="text-[10px]">{ready ? "Open" : "Coming soon"}</span>
      </button>
    );
  }

  const showFounderLink = user?.role === "founder" || user?.role === "admin";
  const showAgencyLink = agencyRoles.includes(user?.role);
  const isFounderDashboard = window.location.pathname === "/founder-dashboard";

  if (isFounderDashboard) return null;

  return (
    <div className={`fixed right-3 z-[60] ${isFounderDashboard ? "top-24" : "top-16"}`} style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="rounded-full shadow-lg"
        style={{ width: 46, height: 46, background: C.darkGreen, color: C.cream, border: `2px solid ${C.gold}` }}
      >
        {open ? <X size={20} /> : <Menu size={22} />}
      </button>

      {open && (
        <section
          ref={menuRef}
          role="dialog"
          aria-label="App menu"
          className="mt-2 w-[min(350px,calc(100vw-24px))] rounded-2xl p-4 shadow-xl transition-all"
          style={{ background: C.white, border: `1.5px solid ${C.cream}`, maxHeight: "calc(100vh - 9rem)", overflowY: "auto" }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Rooted 21 menu</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-xl px-2 py-1" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              {mainMenuItems.map(item => <MenuItem key={item.label} item={item} />)}
            </div>

            {showFounderLink && (
              <div className="space-y-2 border-t pt-3" style={{ borderColor: C.cream }}>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide" style={{ color: C.darkGreen }}><Shield size={14} /> Founder/Admin</p>
                {adminMenuItems.map(item => <MenuItem key={item.label} item={item} />)}
              </div>
            )}

            {showAgencyLink && (
              <div className="space-y-2 border-t pt-3" style={{ borderColor: C.cream }}>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide" style={{ color: C.darkGreen }}><ShieldCheck size={14} /> Agency Oversight</p>
                {agencyMenuItems.map(item => <MenuItem key={item.label} item={item} />)}
              </div>
            )}

            <div className="border-t pt-3" style={{ borderColor: C.cream }}>
              <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide" style={{ color: C.darkGreen }}><Accessibility size={14} /> Accessibility tools</p>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}><Languages size={14} /> Language</span>
                  <select value={language} onChange={event => setLanguage(event.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}>
                    {LANGUAGES.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}
                  </select>
                </label>

                <div>
                  <p className="mb-1 flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}><Type size={14} /> Font size</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "normal", label: "A" },
                      { key: "large", label: "A+" },
                      { key: "xlarge", label: "A++" },
                    ].map(item => (
                      <button key={item.key} type="button" onClick={() => setFontSize(item.key)} className="rounded-xl px-2 py-2 text-xs font-black" style={{ background: fontSize === item.key ? C.darkGreen : C.offWhite, color: fontSize === item.key ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={() => setHighContrast(value => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold" style={{ background: highContrast ? C.darkGreen : C.offWhite, color: highContrast ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>
                  <span className="flex items-center gap-2"><Eye size={14} /> High contrast</span>
                  <span>{highContrast ? "On" : "Off"}</span>
                </button>

                <button type="button" onClick={readPageSummary} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold" style={{ background: C.gold, color: C.darkGreen, border: "none" }}>
                  <span className="flex items-center gap-2"><Volume2 size={14} /> Read page aloud</span>
                  <span>{speaking ? "Stop" : "Play"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 border-t pt-3" style={{ borderColor: C.cream }}>
              {window.location.pathname !== "/safe-screen" && (
                <button type="button" onClick={activateQuickExit} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>
                  <span className="flex items-center gap-2"><DoorOpen size={14} /> Quick exit</span>
                  <span>Open</span>
                </button>
              )}

              <button type="button" onClick={() => setRememberPhone(value => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold" style={{ background: rememberPhone ? C.darkGreen : C.offWhite, color: rememberPhone ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>
                <span>Remember sign-in on this phone</span>
                <span>{rememberPhone ? "On" : "Off"}</span>
              </button>

              <LogoutButton variant="menu" style={{ width: "100%", justifyContent: "space-between", background: C.offWhite, border: `1px solid ${C.cream}`, color: "#b42318", boxShadow: "none" }} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}