import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import FounderSection from "@/components/admin/founder/FounderSection";
import FounderMetric from "@/components/admin/founder/FounderMetric";
import AdminCodeManager from "@/components/admin/AdminCodeManager";
import BetaTesterCodeManager from "@/components/admin/BetaTesterCodeManager";
import AdminManagement from "@/components/rooted/AdminManagement";
import ScalabilityOperationsPanel from "@/components/admin/founder/ScalabilityOperationsPanel";
import ProjectProtectionChecklist from "@/components/admin/founder/ProjectProtectionChecklist";
import FamilyFunVerificationQueue from "@/components/admin/founder/FamilyFunVerificationQueue";
import CourtResourceVerificationQueue from "@/components/court-packet/CourtResourceVerificationQueue";
import {
  Activity, BarChart3, Bell, BookOpen, CheckCircle2, ClipboardList, Database, DollarSign,
  GraduationCap, KeyRound, Library, LockKeyhole, MailPlus, Search, Settings,
  Shield, ShieldCheck, Star, UserCog, Users
} from "lucide-react";

const DARK = "#5a3d28";
const GREEN = "#6b9d6e";
const CREAM = "#f5ede2";
const BG = "#faf6f1";
const CARD = "#ffffff";
const MUTED = "#8b6f54";

const sectionList = [
  "analytics", "operations", "protection", "users", "resources", "courtResourceVerification", "familyFunVerification", "codes", "waitlist", "surveys", "beta", "classes", "content", "funding", "announcements", "settings"
];

function smallButton(label, onClick, tone = "green") {
  return (
    <button onClick={onClick} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: tone === "danger" ? "#FDECEC" : DARK, color: tone === "danger" ? "#B42318" : "#fff", border: "none" }}>
      {label}
    </button>
  );
}

export default function FounderDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [openSections, setOpenSections] = useState(() => Object.fromEntries(sectionList.map((s, i) => [s, i < 3])));
  const [allUsers, setAllUsers] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [comingSoonMode, setComingSoonMode] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [betaCodes, setBetaCodes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [funding, setFunding] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resourceListings, setResourceListings] = useState([]);
  const [resourceReports, setResourceReports] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [classForm, setClassForm] = useState({ title: "", abbr: "MSOYW", date: "", time: "", description: "", max_capacity: 30, is_published: true });
  const [contentForm, setContentForm] = useState({ title: "", category: "resource_library", resource_type: "article", body: "", url: "", status: "draft" });
  const [fundingForm, setFundingForm] = useState({ source_name: "", record_type: "donation", amount: "", status: "received", record_date: new Date().toISOString().slice(0, 10), notes: "" });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", target_role: "all" });

  useEffect(() => { boot(); }, []);

  async function boot() {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      base44.auth.redirectToLogin("/founder-dashboard");
      return;
    }

    const me = await base44.auth.me();
    setUser(me);
    if (me?.role !== "founder") {
      setDenied(true);
      setLoading(false);
      return;
    }

    try {
      await loadFounderData();
    } finally {
      setLoading(false);
    }
  }

  async function loadFounderData() {
    const safe = (p, fallback = []) => p.catch(() => fallback);
    const [users, wl, surveyList, betaList, liveClasses, enrollmentList, contentList, fundingList, announcementList, resourceList, reportList, maintenanceRes] = await Promise.all([
      safe(base44.functions.invoke("getFounderUsers", {}).then(r => r.data.users), []),
      safe(base44.entities.WaitlistSignup.list("-created_date", 10000), []),
      safe(base44.entities.Survey.list("-created_date", 10000), []),
      safe(base44.entities.BetaTesterCode.list("-created_date", 10000), []),
      safe(base44.entities.LiveClass.list("-created_date", 1000), []),
      safe(base44.entities.ClassEnrollment.list("-created_date", 10000), []),
      safe(base44.entities.ContentItem.list("-updated_date", 1000), []),
      safe(base44.entities.GrantDonation.list("-record_date", 1000), []),
      safe(base44.entities.Announcement.list("-created_date", 500), []),
      safe(base44.entities.ResourceListing.list("-updated_date", 1000), []),
      safe(base44.entities.ResourceReport.list("-reported_at", 500), []),
      safe(base44.functions.invoke("getMaintenanceMode", {}).then(r => r.data), { comingSoonMode: false, maintenanceMode: false }),
    ]);
    setAllUsers(users);
    setWaitlist(wl);
    setSurveys(surveyList);
    setBetaCodes(betaList);
    setClasses(liveClasses);
    setEnrollments(enrollmentList);
    setContentItems(contentList);
    setFunding(fundingList);
    setAnnouncements(announcementList);
    setResourceListings(resourceList);
    setResourceReports(reportList);
    setMaintenanceMode(maintenanceRes.maintenanceMode === true || maintenanceRes.enabled === true);
    setComingSoonMode(maintenanceRes.comingSoonMode !== false);
  }

  async function toggleMaintenanceMode(enabled) {
    const res = await base44.functions.invoke("setMaintenanceMode", { enabled });
    setMaintenanceMode(res.data.maintenanceMode === true || res.data.enabled === true);
    setComingSoonMode(res.data.comingSoonMode !== false);
  }

  async function toggleComingSoonMode(enabled) {
    const res = await base44.functions.invoke("setMaintenanceMode", { comingSoonMode: enabled });
    setMaintenanceMode(res.data.maintenanceMode === true || res.data.enabled === true);
    setComingSoonMode(res.data.comingSoonMode !== false);
  }

  const stats = useMemo(() => {
    const activeUsers = allUsers.filter(u => u.is_active !== false).length;
    const completedEnrollments = enrollments.filter(e => e.status === "completed").length;
    const totalFunding = funding.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const avgRating = surveys.length ? (surveys.reduce((sum, s) => sum + Number(s.app_overall || 0), 0) / surveys.length).toFixed(1) : "—";
    return { activeUsers, completedEnrollments, totalFunding, avgRating };
  }, [allUsers, enrollments, funding, surveys]);

  const filteredUsers = allUsers.filter(u => !search || `${u.full_name || ""} ${u.email || ""} ${u.role || ""}`.toLowerCase().includes(search.toLowerCase()));

  function toggle(id) {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function updateUser(id, updates) {
    const res = await base44.functions.invoke("updateUserAsFounder", { userId: id, updates });
    const updated = res.data.user;
    setAllUsers(prev => prev.map(u => u.id === id ? updated : u));
    if (selectedProfile?.id === id) setSelectedProfile(updated);
  }

  async function inviteWaitlistPerson(person) {
    await base44.users.inviteUser(person.email, "user");
    const updated = await base44.entities.WaitlistSignup.update(person.id, { notified_at_launch: true });
    setWaitlist(prev => prev.map(w => w.id === person.id ? updated : w));
  }

  async function saveClass(e) {
    e.preventDefault();
    const created = await base44.entities.LiveClass.create({ ...classForm, max_capacity: Number(classForm.max_capacity || 30) });
    setClasses(prev => [created, ...prev]);
    setClassForm({ title: "", abbr: "MSOYW", date: "", time: "", description: "", max_capacity: 30, is_published: true });
  }

  async function saveContent(e) {
    e.preventDefault();
    const created = await base44.entities.ContentItem.create({ ...contentForm, updated_by: user.email });
    setContentItems(prev => [created, ...prev]);
    setContentForm({ title: "", category: "resource_library", resource_type: "article", body: "", url: "", status: "draft" });
  }

  async function saveFunding(e) {
    e.preventDefault();
    const created = await base44.entities.GrantDonation.create({ ...fundingForm, amount: Number(fundingForm.amount || 0) });
    setFunding(prev => [created, ...prev]);
    setFundingForm({ source_name: "", record_type: "donation", amount: "", status: "received", record_date: new Date().toISOString().slice(0, 10), notes: "" });
  }

  async function issueCertificate(enrollment) {
    const updated = await base44.entities.ClassEnrollment.update(enrollment.id, { certificate_issued: true, certificate_issued_date: new Date().toISOString().slice(0, 10), status: "completed" });
    setEnrollments(prev => prev.map(e => e.id === enrollment.id ? updated : e));
  }

  async function sendAnnouncement(e) {
    e.preventDefault();
    const recipients = allUsers.filter(u => u.is_active !== false && (announcementForm.target_role === "all" || u.role === announcementForm.target_role));
    await Promise.all(recipients.map(recipient => base44.integrations.Core.SendEmail({
      to: recipient.email,
      subject: announcementForm.title,
      body: announcementForm.message,
      from_name: "Rooted 21"
    })));
    const created = await base44.entities.Announcement.create({ ...announcementForm, sent_by: user.email, sent_at: new Date().toISOString(), recipient_count: recipients.length, status: "sent" });
    setAnnouncements(prev => [created, ...prev]);
    setAnnouncementForm({ title: "", message: "", target_role: "all" });
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${GREEN} transparent ${GREEN} ${GREEN}` }} /></div>;
  }

  if (denied) {
    return <div className="min-h-screen flex items-center justify-center px-4" style={{ background: BG }}><div className="max-w-sm text-center rounded-3xl p-8 bg-white"><Shield className="mx-auto mb-3" color={DARK} /><h1 className="font-serif font-bold text-xl" style={{ color: DARK }}>Founder access only</h1><p className="text-sm mt-2" style={{ color: MUTED }}>This page is restricted to the founder role and is not visible to other accounts.</p></div></div>;
  }

  return (
    <div className="min-h-screen" style={{ background: BG, color: DARK }}>
      <header className="sticky top-0 z-20 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.92)", borderBottom: `1.5px solid ${CREAM}`, paddingTop: "max(14px, env(safe-area-inset-top))" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: CREAM, border: `1.5px solid ${GREEN}30` }}><Shield color={GREEN} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold tracking-[0.22em]" style={{ color: MUTED }}>ROOTED 21</p>
            <h1 className="font-serif font-bold text-xl md:text-2xl" style={{ color: DARK }}>Founder Dashboard</h1>
            <p className="mt-1 text-xs" style={{ color: MUTED }}>Founder tools, platform health, and admin actions</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center">
            <span className="hidden rounded-full px-3 py-1 text-[10px] font-black sm:inline-flex" style={{ background: CREAM, color: DARK }}>Founder tools</span>
            <button onClick={loadFounderData} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: GREEN, color: "#fff", border: "none" }}>Refresh</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-7 pb-36 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FounderMetric label="Active users" value={stats.activeUsers} detail={`${allUsers.length} total accounts`} />
          <FounderMetric label="Waitlist" value={waitlist.length} detail={`${waitlist.filter(w => w.notified_at_launch).length} invited`} />
          <FounderMetric label="Survey rating" value={stats.avgRating} detail={`${surveys.length} responses`} />
          <FounderMetric label="Funding logged" value={`$${stats.totalFunding.toLocaleString()}`} detail={`${funding.length} records`} />
        </div>

        <FounderSection title="Platform Analytics" subtitle="Real-time user counts, activity totals, and usage stats" icon={BarChart3} open={openSections.analytics} onToggle={() => toggle("analytics")}>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: "#faf6f1", borderColor: "#d7c7aa" }}>
              <div>
                <p className="font-bold">Coming Soon Mode</p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>{comingSoonMode ? "Public visitors see the Coming Soon signup page." : "Public visitors see the normal public landing page."}</p>
              </div>
              <button onClick={() => toggleComingSoonMode(!comingSoonMode)} className="relative h-9 w-16 rounded-full transition-colors" style={{ background: comingSoonMode ? GREEN : "#c7b89a", border: "none" }} aria-label="Toggle coming soon mode">
                <span className="absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all" style={{ left: comingSoonMode ? 34 : 4 }} />
              </button>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: "#faf6f1", borderColor: "#d7c7aa" }}>
              <div>
                <p className="font-bold">Maintenance Mode</p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>{maintenanceMode ? "Non-admin logged-in users see the maintenance message." : "Logged-in users access the app normally."}</p>
              </div>
              <button onClick={() => toggleMaintenanceMode(!maintenanceMode)} className="relative h-9 w-16 rounded-full transition-colors" style={{ background: maintenanceMode ? GREEN : "#c7b89a", border: "none" }} aria-label="Toggle maintenance mode">
                <span className="absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all" style={{ left: maintenanceMode ? 34 : 4 }} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <FounderMetric label="Users" value={allUsers.length} detail="Registered accounts" />
            <FounderMetric label="Active" value={stats.activeUsers} detail="Not deactivated" />
            <FounderMetric label="Classes" value={classes.length} detail={`${enrollments.length} enrollments`} />
            <FounderMetric label="Certificates" value={enrollments.filter(e => e.certificate_issued).length} detail="Issued completions" />
            <FounderMetric label="Beta codes" value={betaCodes.length} detail={`${betaCodes.filter(c => c.status === "active").length} active`} />
            <FounderMetric label="Feedback" value={surveys.length} detail="Survey submissions" />
            <FounderMetric label="Content" value={contentItems.length} detail={`${contentItems.filter(c => c.status === "published").length} published`} />
            <FounderMetric label="Announcements" value={announcements.length} detail="Messages sent" />
          </div>
        </FounderSection>

        <FounderSection title="Statewide Operations Architecture" subtitle="Production monitoring, scalability readiness, integrations, offline drafts, and audit infrastructure" icon={Activity} open={openSections.operations} onToggle={() => toggle("operations")}>
          <ScalabilityOperationsPanel />
        </FounderSection>

        <FounderSection title="Project Protection Checklist" subtitle="Ownership, backup, export readiness, and long-term platform protection" icon={ShieldCheck} open={openSections.protection} onToggle={() => toggle("protection")}>
          <ProjectProtectionChecklist />
        </FounderSection>

        <FounderSection title="User Management" subtitle="Search users, view profiles, change roles, and deactivate accounts" icon={UserCog} open={openSections.users} onToggle={() => toggle("users")}>
          <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color={MUTED} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or role" className="w-full rounded-2xl border pl-9 pr-3 py-3 text-sm" style={{ borderColor: "#d7c7aa" }} /></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="text-left text-[10px] uppercase tracking-widest" style={{ color: MUTED }}><th className="py-2">User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{filteredUsers.map(u => <tr key={u.id} className="border-t" style={{ borderColor: "#eee2cc" }}><td className="py-3"><strong>{u.full_name || "—"}</strong><p className="text-xs" style={{ color: MUTED }}>{u.email}</p></td><td><select value={u.role || "user"} onChange={e => updateUser(u.id, { role: e.target.value })} className="rounded-xl border px-2 py-2 text-xs"><option value="user">user</option><option value="professional">professional</option><option value="admin">admin</option><option value="court_staff">court_staff</option><option value="founder">founder</option></select></td><td><span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: u.is_active === false ? "#FDECEC" : "#EAF4EA", color: u.is_active === false ? "#B42318" : "#2F7D32" }}>{u.is_active === false ? "Inactive" : "Active"}</span></td><td className="text-xs" style={{ color: MUTED }}>{u.created_date ? new Date(u.created_date).toLocaleDateString() : "—"}</td><td className="flex gap-2 py-3">{smallButton("View", () => setSelectedProfile(u))}{u.is_active === false ? smallButton("Reactivate", () => updateUser(u.id, { is_active: true, deactivated_at: null })) : smallButton("Deactivate", () => updateUser(u.id, { is_active: false, deactivated_at: new Date().toISOString() }), "danger")}</td></tr>)}</tbody></table></div>
          {selectedProfile && <div className="rounded-2xl p-4" style={{ background: "#faf6f1", border: "1px solid #d7c7aa" }}><div className="flex justify-between gap-3"><div><p className="font-serif font-bold text-lg">{selectedProfile.full_name || "User profile"}</p><p className="text-sm" style={{ color: MUTED }}>{selectedProfile.email}</p></div>{smallButton("Close", () => setSelectedProfile(null))}</div><div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs"><p><strong>Role:</strong> {selectedProfile.role || "user"}</p><p><strong>Phone:</strong> {selectedProfile.phone || "—"}</p><p><strong>SMS:</strong> {selectedProfile.sms_reminders ? "On" : "Off"}</p><p><strong>Viewed app:</strong> {selectedProfile.has_viewed_app ? "Yes" : "No"}</p></div></div>}
        </FounderSection>

        <FounderSection title="Resource Verification Queue" subtitle="Outdated statewide resources, crisis-priority listings, and admin review workflow" icon={Database} open={openSections.resources} onToggle={() => toggle("resources")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <FounderMetric label="Resources" value={resourceListings.length} detail="Statewide listings" />
            <FounderMetric label="Verified" value={resourceListings.filter(r => r.verification_status === "verified").length} detail="Trusted badge active" />
            <FounderMetric label="Need review" value={resourceListings.filter(r => r.verification_status === "needs_review").length} detail="60+ day queue" />
            <FounderMetric label="Outdated" value={resourceListings.filter(r => r.verification_status === "outdated").length} detail="90+ day queue" />
            <FounderMetric label="Closed" value={resourceListings.filter(r => r.verification_status === "closed").length} detail="Not active" />
            <FounderMetric label="Pending reports" value={resourceReports.filter(r => r.status === "pending").length} detail="Private community reports" />
            <FounderMetric label="Counties" value={new Set(resourceListings.map(r => r.county).filter(Boolean)).size} detail="Resource coverage" />
            <FounderMetric label="Categories" value={new Set(resourceListings.map(r => r.category).filter(Boolean)).size} detail="Service types" />
          </div>
          <a href="/resource-management" className="inline-flex rounded-xl px-4 py-2 text-sm font-bold no-underline" style={{ background: DARK, color: "#fff" }}>Open Resource Management</a>
        </FounderSection>

        <FounderSection title="Court Resource Verification Queue" subtitle="Court forms, official links, county-specific resources, reports, and 60-day review tracking" icon={Database} open={openSections.courtResourceVerification} onToggle={() => toggle("courtResourceVerification")}>
          <CourtResourceVerificationQueue resourceListings={resourceListings} resourceReports={resourceReports} />
        </FounderSection>

        <FounderSection title="Free & Low-Cost Fun Verification Queue" subtitle="Family activity verification, user reports, broken links, price changes, and seasonal updates" icon={Database} open={openSections.familyFunVerification} onToggle={() => toggle("familyFunVerification")}>
          <FamilyFunVerificationQueue resourceListings={resourceListings} resourceReports={resourceReports} onRefresh={loadFounderData} />
        </FounderSection>

        <FounderSection title="Access Code Management" subtitle="Generate beta/admin codes, review status, and revoke access" icon={KeyRound} open={openSections.codes} onToggle={() => toggle("codes")}>
          <BetaTesterCodeManager />
          <AdminCodeManager />
        </FounderSection>

        <FounderSection title="Waitlist Management" subtitle="Review waitlist signups and invite people into the app" icon={MailPlus} open={openSections.waitlist} onToggle={() => toggle("waitlist")}>
          <div className="grid md:grid-cols-2 gap-3">{waitlist.map(w => <div key={w.id} className="rounded-2xl p-4 border" style={{ borderColor: "#d7c7aa", background: "#faf6f1" }}><div className="flex justify-between gap-3"><div><p className="font-bold">{w.first_name || w.full_name || "Waitlist signup"}</p><p className="text-xs" style={{ color: MUTED }}>{w.email}</p></div><span className="text-[10px] font-bold">{w.notified_at_launch ? "Invited" : "Waiting"}</span></div><p className="text-xs mt-2" style={{ color: MUTED }}>{w.role_type || w.family_type || "—"}{w.signed_up_at ? ` · Signed up ${new Date(w.signed_up_at).toLocaleDateString()}` : ""}</p>{w.message && <p className="text-xs mt-2 italic">“{w.message}”</p>}<div className="mt-3">{smallButton(w.notified_at_launch ? "Invite again" : "Invite", () => inviteWaitlistPerson(w))}</div></div>)}</div>
        </FounderSection>

        <FounderSection title="Survey and Feedback" subtitle="Submitted ratings, recommendations, and written feedback" icon={Star} open={openSections.surveys} onToggle={() => toggle("surveys")}>
          <div className="grid md:grid-cols-2 gap-3">{surveys.map(s => <div key={s.id} className="rounded-2xl p-4 border" style={{ borderColor: "#d7c7aa" }}><div className="flex justify-between"><div><p className="font-bold">{s.full_name || s.email}</p><p className="text-xs" style={{ color: MUTED }}>{s.family_type || "—"}</p></div><p className="font-black text-xl">{s.app_overall || "—"}/5</p></div><p className="text-xs mt-3"><strong>Most helpful:</strong> {s.most_helpful || "—"}</p><p className="text-xs mt-2"><strong>Improve:</strong> {s.needs_improvement || "—"}</p>{s.additional_feedback && <p className="text-xs mt-2 italic">“{s.additional_feedback}”</p>}</div>)}</div>
        </FounderSection>

        <FounderSection title="Beta Tester Management" subtitle="Beta code holders, status, usage, and tester activity" icon={Users} open={openSections.beta} onToggle={() => toggle("beta")}>
          <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead><tr className="text-left text-[10px] uppercase" style={{ color: MUTED }}><th>Code</th><th>Role</th><th>Status</th><th>Used By</th><th>Expires</th></tr></thead><tbody>{betaCodes.map(c => <tr key={c.id} className="border-t" style={{ borderColor: "#eee2cc" }}><td className="py-3 font-mono font-bold">{c.code}</td><td>{c.tester_role}</td><td>{c.status}</td><td>{c.used_by_email || "—"}</td><td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>
        </FounderSection>

        <FounderSection title="Class and Program Management" subtitle="Manage MSOYW, PPSW, anger management, enrollments, and certificates" icon={GraduationCap} open={openSections.classes} onToggle={() => toggle("classes")}>
          <form onSubmit={saveClass} className="grid md:grid-cols-3 gap-2 rounded-2xl p-4" style={{ background: "#faf6f1", border: "1px solid #d7c7aa" }}><input required placeholder="Class title" value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><select value={classForm.abbr} onChange={e => setClassForm({ ...classForm, abbr: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option>MSOYW</option><option>PPSW</option><option>Anger Management</option></select><input required placeholder="Date" value={classForm.date} onChange={e => setClassForm({ ...classForm, date: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><input placeholder="Time" value={classForm.time} onChange={e => setClassForm({ ...classForm, time: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><input placeholder="Capacity" type="number" value={classForm.max_capacity} onChange={e => setClassForm({ ...classForm, max_capacity: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><button className="rounded-xl px-3 py-2 text-sm font-bold" style={{ background: DARK, color: "#fff", border: "none" }}>Create class</button><textarea placeholder="Description" value={classForm.description} onChange={e => setClassForm({ ...classForm, description: e.target.value })} className="md:col-span-3 rounded-xl border px-3 py-2 text-sm" /></form>
          <div className="grid lg:grid-cols-2 gap-3">{classes.map(cls => <div key={cls.id} className="rounded-2xl p-4 border" style={{ borderColor: "#d7c7aa" }}><div className="flex justify-between gap-3"><div><p className="font-bold">{cls.title}</p><p className="text-xs" style={{ color: MUTED }}>{cls.abbr} · {cls.date} · {cls.time || "Time TBD"}</p></div><span className="text-[10px] font-bold">{enrollments.filter(e => e.class_id === cls.id).length}/{cls.max_capacity || 30}</span></div>{enrollments.filter(e => e.class_id === cls.id).slice(0, 5).map(en => <div key={en.id} className="mt-2 flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#faf6f1" }}><span className="text-xs">{en.user_name || en.user_email}</span>{en.certificate_issued ? <CheckCircle2 size={16} color={GREEN} /> : smallButton("Issue certificate", () => issueCertificate(en))}</div>)}</div>)}</div>
        </FounderSection>

        <FounderSection title="Content Management" subtitle="Edit Resource Library entries and app content drafts" icon={Library} open={openSections.content} onToggle={() => toggle("content")}>
          <form onSubmit={saveContent} className="grid md:grid-cols-3 gap-2 rounded-2xl p-4" style={{ background: "#faf6f1", border: "1px solid #d7c7aa" }}><input required placeholder="Title" value={contentForm.title} onChange={e => setContentForm({ ...contentForm, title: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><select value={contentForm.category} onChange={e => setContentForm({ ...contentForm, category: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="resource_library">Resource Library</option><option value="app_content">App Content</option><option value="legal">Legal</option><option value="education">Education</option><option value="support">Support</option></select><select value={contentForm.status} onChange={e => setContentForm({ ...contentForm, status: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><input placeholder="URL" value={contentForm.url} onChange={e => setContentForm({ ...contentForm, url: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><input placeholder="Author/source" value={contentForm.author || ""} onChange={e => setContentForm({ ...contentForm, author: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><button className="rounded-xl px-3 py-2 text-sm font-bold" style={{ background: DARK, color: "#fff", border: "none" }}>Save content</button><textarea placeholder="Description or content body" value={contentForm.body} onChange={e => setContentForm({ ...contentForm, body: e.target.value })} className="md:col-span-3 rounded-xl border px-3 py-2 text-sm" /></form>
          <div className="grid md:grid-cols-2 gap-3">{contentItems.map(item => <div key={item.id} className="rounded-2xl p-4 border" style={{ borderColor: "#d7c7aa" }}><p className="font-bold">{item.title}</p><p className="text-xs" style={{ color: MUTED }}>{item.category} · {item.status}</p><p className="text-xs mt-2">{item.body || "No body yet"}</p></div>)}</div>
        </FounderSection>

        <FounderSection title="Grant and Donation Tracker" subtitle="Mission-driven grant, donation, sponsorship, and expense logging" icon={DollarSign} open={openSections.funding} onToggle={() => toggle("funding")}>
          <form onSubmit={saveFunding} className="grid md:grid-cols-5 gap-2 rounded-2xl p-4" style={{ background: "#faf6f1", border: "1px solid #d7c7aa" }}><input required placeholder="Source" value={fundingForm.source_name} onChange={e => setFundingForm({ ...fundingForm, source_name: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><select value={fundingForm.record_type} onChange={e => setFundingForm({ ...fundingForm, record_type: e.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="grant">Grant</option><option value="donation">Donation</option><option value="sponsorship">Sponsorship</option><option value="expense">Expense</option></select><input required type="number" placeholder="Amount" value={fundingForm.amount} onChange={e => setFundingForm({ ...fundingForm, amount: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><input required type="date" value={fundingForm.record_date} onChange={e => setFundingForm({ ...fundingForm, record_date: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" /><button className="rounded-xl px-3 py-2 text-sm font-bold" style={{ background: DARK, color: "#fff", border: "none" }}>Log</button></form>
          <div className="grid md:grid-cols-2 gap-3">{funding.map(f => <div key={f.id} className="rounded-2xl p-4 border" style={{ borderColor: "#d7c7aa" }}><div className="flex justify-between"><p className="font-bold">{f.source_name}</p><p className="font-black">${Number(f.amount || 0).toLocaleString()}</p></div><p className="text-xs" style={{ color: MUTED }}>{f.record_type} · {f.status} · {f.record_date}</p></div>)}</div>
        </FounderSection>

        <FounderSection title="Announcements" subtitle="Send messages to all users or specific role groups" icon={Bell} open={openSections.announcements} onToggle={() => toggle("announcements")}>
          <form onSubmit={sendAnnouncement} className="space-y-2 rounded-2xl p-4" style={{ background: "#faf6f1", border: "1px solid #d7c7aa" }}><input required placeholder="Announcement title" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" /><select value={announcementForm.target_role} onChange={e => setAnnouncementForm({ ...announcementForm, target_role: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm"><option value="all">All users</option><option value="user">Parents/caregivers</option><option value="professional">Professionals</option><option value="admin">Admins</option><option value="founder">Founder</option></select><textarea required placeholder="Message" value={announcementForm.message} onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm min-h-[110px]" /><button className="rounded-xl px-4 py-2 text-sm font-bold" style={{ background: DARK, color: "#fff", border: "none" }}>Send announcement</button></form>
          <div className="space-y-2">{announcements.map(a => <div key={a.id} className="rounded-2xl p-4 border" style={{ borderColor: "#d7c7aa" }}><p className="font-bold">{a.title}</p><p className="text-xs" style={{ color: MUTED }}>{a.target_role} · {a.recipient_count || 0} recipients</p><p className="text-xs mt-2">{a.message}</p></div>)}</div>
        </FounderSection>

        <FounderSection title="Account Settings" subtitle="Founder security preferences, including two-factor authentication" icon={LockKeyhole} open={openSections.settings} onToggle={() => toggle("settings")}>
          <div className="rounded-2xl p-4 border flex items-center justify-between gap-4" style={{ borderColor: "#d7c7aa", background: "#faf6f1" }}><div><p className="font-bold">Two-factor authentication</p><p className="text-xs mt-1" style={{ color: MUTED }}>Stores the founder security preference for account hardening.</p></div><button onClick={() => updateUser(user.id, { two_factor_enabled: !user.two_factor_enabled }).then(() => setUser(prev => ({ ...prev, two_factor_enabled: !prev.two_factor_enabled })))} className="rounded-xl px-4 py-2 text-xs font-bold" style={{ background: user.two_factor_enabled ? GREEN : DARK, color: "#fff", border: "none" }}>{user.two_factor_enabled ? "Enabled" : "Enable 2FA"}</button></div>
        </FounderSection>

        <div className="pb-16" />
      </main>
    </div>
  );
}