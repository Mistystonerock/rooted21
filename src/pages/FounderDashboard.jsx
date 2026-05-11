import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Users, Eye, CheckCircle2, MessageSquare, TrendingUp, Download } from "lucide-react";
import AdminManagement from "@/components/rooted/AdminManagement";

export default function FounderDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
      ]).then(([u, waitlist, users, surveyList]) => {
        setUser(u);
      
      // Calculate stats
      const uniqueWaitlist = new Set(waitlist.map(w => w.email)).size;
      const uniqueUsers = new Set(users.map(usr => usr.email)).size;
      
      setStats({
        waitlistSignups: waitlist.length,
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
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Page Views</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: C.darkGreen }}>{stats?.waitlistSignups || 0}</p>
            <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>Landing page visits</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Signups</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: C.darkGreen }}>{stats?.uniqueWaitlist || 0}</p>
            <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>Waitlist registrations</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Users</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: C.darkGreen }}>{stats?.uniqueUsers || 0}</p>
            <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>App accounts created</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
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
          {["overview", "surveys", "admins"].map(tab => (
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
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
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
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>WAITLIST BREAKDOWN</p>
              <p className="text-sm mb-2" style={{ color: C.darkGreen }}>Total signups: <strong>{stats?.waitlistSignups}</strong></p>
              <p className="text-xs" style={{ color: C.mutedText }}>
                {stats?.uniqueWaitlist} unique emails (some people signed up multiple times)
              </p>
            </div>

            {/* Growth info */}
            <div className="rounded-2xl p-4" style={{ background: C.cream }}>
              <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
                <strong>Next Steps:</strong> Invite more founders/team members by creating additional admin users. Each admin gets full dashboard and data access.
              </p>
            </div>
          </div>
        )}

        {/* Surveys tab */}
        {activeTab === "admins" && (
          <AdminManagement />
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
                  style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
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
                <div key={survey.id} className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
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