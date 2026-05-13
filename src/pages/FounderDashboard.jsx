import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Users, Eye, CheckCircle2, MessageSquare, TrendingUp, Download } from "lucide-react";
import AdminManagement from "@/components/rooted/AdminManagement";
import AdminCodeManager from "@/components/admin/AdminCodeManager";

export default function FounderDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
    if (!authed) {
      base44.auth.redirectToLogin("/founder-dashboard");
        return;
      }

      Promise.all([
        base44.auth.me(),
        base44.entities.WaitlistSignup.list("-created_date", 10000),
        base44.entities.User.list("-created_date", 10000),
        base44.entities.Survey.list("-created_date", 10000),
      ]).then(([u, wl, users, surveyList]) => {
        setUser(u);
        setAllUsers(users);
        setWaitlist(wl);
      
      // Calculate stats
      const uniqueWaitlist = new Set(wl.map(w => w.email)).size;
      const uniqueUsers = new Set(users.map(usr => usr.email)).size;
      
      setStats({
        waitlistSignups: wl.length,
        uniqueWaitlist,
        registeredUsers: users.length,
        uniqueUsers,
        surveyResponses: surveyList.length,
        avgAppRating: surveyList.length > 0 
          ? (surveyList.reduce((sum, s) => sum + (s.app_overall || 0), 0) / surveyList.length).toFixed(1)
          : 0,
        recommendationRate: surveyList.length > 0
          ? Math.round((surveyList.filter(s => s.would_recommend).length / surveyList.length) * 100)
          : 0,
      });
      
      setSurveys(surveyList);
      setLoading(false);
      });
    });
  }, []);

  if (!user?.role || user.role !== "founder") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="text-center px-4">
          <p className="text-lg font-bold" style={{ color: C.darkGreen }}>Access Denied</p>
          <p className="text-sm mt-2" style={{ color: C.mutedText }}>This dashboard is for the founder only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="📊 Founder Dashboard" subtitle="Platform analytics & insights" />

      <div className="max-w-[680px] mx-auto px-4 py-5 space-y-4">
        {/* Docs link */}
        <a href="/app-docs" className="flex items-center justify-between rounded-2xl p-4"
          style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)", textDecoration: "none" }}>
          <div>
            <p className="font-bold text-sm" style={{ color: "#1a1a1a" }}>📋 App Documentation</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#8b6f54" }}>Frontend guide · Backend reference · LLM narrative</p>
          </div>
          <span className="text-lg" style={{ color: "#a67c52" }}>→</span>
        </a>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Page Views</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: C.darkGreen }}>{stats?.waitlistSignups || 0}</p>
            <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>Landing page visits</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Signups</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: C.darkGreen }}>{stats?.uniqueWaitlist || 0}</p>
            <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>Waitlist registrations</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Users</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: C.darkGreen }}>{stats?.uniqueUsers || 0}</p>
            <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>App accounts created</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Conversion</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: C.darkGreen }}>
              {stats?.uniqueWaitlist > 0 ? Math.round((stats.uniqueUsers / stats.uniqueWaitlist) * 100) : 0}%
            </p>
            <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>Signup → User rate</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: C.cream }}>
          {["overview", "users", "waitlist", "surveys", "admins"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-xs font-bold capitalize border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab ? C.darkGreen : "transparent",
                color: activeTab === tab ? C.darkGreen : C.mutedText,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
              <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>SURVEY INSIGHTS</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Responses</p>
                  <p className="text-xl font-bold" style={{ color: C.darkGreen }}>{stats?.surveyResponses || 0}</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Avg Rating</p>
                  <p className="text-xl font-bold" style={{ color: C.darkGreen }}>
                    {stats?.avgAppRating || "—"} <span style={{ fontSize: "14px" }}>⭐</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Would Recommend</p>
                  <p className="text-xl font-bold" style={{ color: C.midGreen }}>{stats?.recommendationRate || 0}%</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Response Rate</p>
                  <p className="text-xl font-bold" style={{ color: C.darkGreen }}>
                    {stats?.uniqueUsers > 0 
                      ? Math.round((stats.surveyResponses / stats.uniqueUsers) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Waitlist breakdown */}
            <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
              <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>WAITLIST BREAKDOWN</p>
              <p className="text-sm mb-2" style={{ color: C.darkGreen }}>Total signups: <strong>{stats?.waitlistSignups}</strong></p>
              <p className="text-xs" style={{ color: C.mutedText }}>
                {stats?.uniqueWaitlist} unique emails (some people signed up multiple times)
              </p>
            </div>

            {/* Growth info */}
            <div className="rounded-2xl p-4" style={{ background: "#f5ede2", border: "1.5px solid rgba(120,85,60,0.2)" }}>
              <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
                <strong>Next Steps:</strong> Invite more founders/team members by creating additional admin users. Each admin gets full dashboard and data access.
              </p>
            </div>
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>{allUsers.length} REGISTERED USERS</p>
              <button
                onClick={() => {
                  const csv = [
                    ["Name", "Email", "Role", "Joined"],
                    ...allUsers.map(u => [u.full_name || "", u.email, u.role || "user", new Date(u.created_date).toLocaleDateString()])
                  ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url;
                  a.download = `users-${new Date().toISOString().split("T")[0]}.csv`; a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                style={{ background: "#6b9d6e", color: "#ffffff", border: "none", cursor: "pointer" }}
              >
                <Download size={12} /> Export
              </button>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
              style={{ borderColor: "rgba(120,85,60,0.2)", background: "#ffffff", color: "#1a1a1a" }}
            />
            {allUsers
              .filter(u => !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()))
              .map(u => (
              <div key={u.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#ffffff", border: "1px solid rgba(120,85,60,0.2)", boxShadow: "0 6px 18px rgba(61,40,23,0.06)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: C.cream, color: C.darkGreen }}>
                  {u.full_name?.[0] || u.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: C.darkGreen }}>{u.full_name || "—"}</p>
                  <p className="text-[10px] truncate" style={{ color: C.mutedText }}>{u.email}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: C.mutedText }}>
                    Joined {new Date(u.created_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                  style={{ background: u.role === "founder" ? C.gold : u.role === "admin" ? C.darkGreen : C.cream, color: u.role === "founder" || u.role === "admin" ? "#fff" : C.mutedText }}>
                  {u.role || "user"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Waitlist tab */}
        {activeTab === "waitlist" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>{waitlist.length} WAITLIST SIGNUPS</p>
              <button
                onClick={() => {
                  const csv = [
                    ["Name", "Email", "Zip Code", "Family Type", "Message", "Signed Up"],
                    ...waitlist.map(w => [w.full_name || "", w.email, w.city || "", w.family_type || "", w.message || "", new Date(w.created_date).toLocaleDateString()])
                  ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url;
                  a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`; a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                style={{ background: "#6b9d6e", color: "#ffffff", border: "none", cursor: "pointer" }}
              >
                <Download size={12} /> Export
              </button>
            </div>
            {waitlist.map(w => (
              <div key={w.id} className="rounded-xl p-3" style={{ background: "#ffffff", border: "1px solid rgba(120,85,60,0.2)", boxShadow: "0 6px 18px rgba(61,40,23,0.06)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{w.full_name || "—"}</p>
                    <p className="text-[10px]" style={{ color: C.mutedText }}>{w.email}</p>
                    <div className="flex gap-2 mt-1">
                      {w.city && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: C.cream, color: C.mutedText }}>📍 {w.city}</span>}
                      {w.family_type && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: C.cream, color: C.mutedText }}>{w.family_type}</span>}
                    </div>
                  </div>
                  <p className="text-[9px] flex-shrink-0" style={{ color: C.mutedText }}>{new Date(w.created_date).toLocaleDateString()}</p>
                </div>
                {w.message && <p className="text-[10px] mt-2 italic" style={{ color: "#3a3028" }}>"{w.message}"</p>}
              </div>
            ))}
          </div>
        )}

        {/* Admins tab */}
        {activeTab === "admins" && (
          <div className="space-y-6">
            <AdminCodeManager />
            <AdminManagement />
          </div>
        )}

        {activeTab === "surveys" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>
                {surveys.length} RESPONSES
              </p>
              {surveys.length > 0 && (
                <button
                  onClick={() => {
                    const csv = [
                      ["Email", "Name", "Family Type", "Overall", "Ease of Use", "Features Helpful", "Would Recommend", "Most Helpful", "Needs Improvement", "Feedback"],
                      ...surveys.map(s => [
                        s.email,
                        s.full_name || "",
                        s.family_type || "",
                        s.app_overall || "",
                        s.ease_of_use || "",
                        s.features_helpful || "",
                        s.would_recommend ? "Yes" : "No",
                        s.most_helpful || "",
                        s.needs_improvement || "",
                        s.additional_feedback || "",
                      ])
                    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
                    
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `surveys-${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: "#6b9d6e", color: "#ffffff", border: "none", cursor: "pointer" }}
                >
                  <Download size={12} /> Export
                </button>
              )}
            </div>

            {surveys.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={24} color={C.cream} className="mx-auto mb-2" />
                <p className="text-sm" style={{ color: C.mutedText }}>No survey responses yet</p>
              </div>
            ) : (
              surveys.map(survey => (
                <div key={survey.id} className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid rgba(120,85,60,0.2)", boxShadow: "0 6px 18px rgba(61,40,23,0.06)" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{survey.full_name || survey.email}</p>
                      <p className="text-[10px]" style={{ color: C.mutedText }}>
                        {survey.family_type} • {new Date(survey.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{survey.app_overall}</p>
                      <p className="text-[9px]" style={{ color: C.mutedText }}>/ 5</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
                    <div>
                      <p style={{ color: C.mutedText }}>Ease</p>
                      <p className="font-bold" style={{ color: C.darkGreen }}>{survey.ease_of_use || "—"}/5</p>
                    </div>
                    <div>
                      <p style={{ color: C.mutedText }}>Features</p>
                      <p className="font-bold" style={{ color: C.darkGreen }}>{survey.features_helpful || "—"}/5</p>
                    </div>
                    <div>
                      <p style={{ color: C.mutedText }}>Recommend</p>
                      <p className="font-bold" style={{ color: survey.would_recommend ? C.midGreen : "#C0392B" }}>
                        {survey.would_recommend ? "Yes ✓" : "No"}
                      </p>
                    </div>
                  </div>

                  {survey.most_helpful && (
                    <div className="mb-2 pb-2" style={{ borderBottom: `1px solid ${C.cream}` }}>
                      <p className="text-[9px] font-bold" style={{ color: C.mutedText }}>Most Helpful</p>
                      <p className="text-xs" style={{ color: "#3a3028" }}>{survey.most_helpful}</p>
                    </div>
                  )}

                  {survey.needs_improvement && (
                    <div className="mb-2 pb-2" style={{ borderBottom: `1px solid ${C.cream}` }}>
                      <p className="text-[9px] font-bold" style={{ color: C.mutedText }}>Needs Improvement</p>
                      <p className="text-xs" style={{ color: "#3a3028" }}>{survey.needs_improvement}</p>
                    </div>
                  )}

                  {survey.additional_feedback && (
                    <div>
                      <p className="text-[9px] font-bold" style={{ color: C.mutedText }}>Additional Feedback</p>
                      <p className="text-xs" style={{ color: "#3a3028" }}>{survey.additional_feedback}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}