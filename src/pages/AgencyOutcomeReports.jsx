import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { TrendingUp, Users, CheckCircle, AlertCircle, Download, FileText, Star } from "lucide-react";

const MOCK_AGENCY = {
  name: "Sunrise Foster Agency",
  families: 142,
  activeParents: 89,
  period: "Jan–May 2026",
};

const OUTCOME_METRICS = [
  { label: "Avg. Regulation Score Improvement", value: "+34%", icon: TrendingUp, color: C.midGreen, desc: "Parents report calmer responses to behavior within 30 days" },
  { label: "Crisis Escalations Avoided", value: "218", icon: CheckCircle, color: "#4A9E6A", desc: "Situations redirected using in-app guidance instead of 911 or hospitalization" },
  { label: "IEP Meeting Preparation Rate", value: "91%", icon: Star, color: C.gold, desc: "Parents used Rights Card or Meeting Prep before their child's IEP" },
  { label: "Active Weekly Engagement", value: "73%", icon: Users, color: C.brown, desc: "Families using the app at least 3x per week" },
  { label: "Case Plan Completion Rate", value: "+48%", icon: FileText, color: "#4A90D9", desc: "Improvement vs. agency average pre-Rooted 21 adoption" },
  { label: "Court Ready Reports Generated", value: "67", icon: AlertCircle, color: "#7B5EA7", desc: "Families arrived to hearings with documented behavioral evidence" },
];

const MONTHLY_ENGAGEMENT = [
  { month: "Jan", sessions: 412, crises: 34 },
  { month: "Feb", sessions: 589, crises: 21 },
  { month: "Mar", sessions: 743, crises: 18 },
  { month: "Apr", sessions: 891, crises: 12 },
  { month: "May", sessions: 1024, crises: 9 },
];

const CHECKIN_TREND = [
  { week: "W1", regulation: 4.1, calm: 3.8 },
  { week: "W2", regulation: 4.4, calm: 4.0 },
  { week: "W3", regulation: 5.1, calm: 4.6 },
  { week: "W4", regulation: 5.8, calm: 5.2 },
  { week: "W5", regulation: 6.4, calm: 5.9 },
  { week: "W6", regulation: 7.1, calm: 6.4 },
  { week: "W7", regulation: 7.6, calm: 7.0 },
  { week: "W8", regulation: 8.2, calm: 7.5 },
];

const TESTIMONIALS = [
  { name: "Foster Parent, Maricopa County", quote: "I haven't called my caseworker in a panic in 6 weeks. I handle it in the app first.", stars: 5 },
  { name: "Kinship Caregiver, Ohio", quote: "My granddaughter's school behavior improved so much after I started logging consistently.", stars: 5 },
  { name: "Adoptive Parent, Texas", quote: "We got to court with 3 months of documented behavior data. The judge noticed.", stars: 5 },
];

export default function AgencyOutcomeReports() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  function handleExportPDF() {
    window.print();
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Agency Outcome Report"
        subtitle={MOCK_AGENCY.period}
        backTo="/dashboard"
        rightSlot={
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold"
            style={{ background: "rgba(201,151,58,0.2)", color: C.gold, border: "none", cursor: "pointer" }}
          >
            <Download size={13} /> Export
          </button>
        }
      />

      <div className="max-w-[600px] mx-auto px-4 py-4 space-y-4">

        {/* Agency Hero */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-serif font-bold text-lg" style={{ color: C.cream }}>{MOCK_AGENCY.name}</p>
              <p className="text-xs mt-0.5" style={{ color: C.lightGreen }}>Rooted 21 Agency Partner Report</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(245,230,200,0.55)" }}>{MOCK_AGENCY.period}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: C.gold }}>{MOCK_AGENCY.activeParents}</p>
              <p className="text-[10px] font-bold" style={{ color: C.lightGreen }}>ACTIVE FAMILIES</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { label: "Total Families", val: MOCK_AGENCY.families },
              { label: "App Sessions", val: "3,659" },
              { label: "Crisis Redirects", val: "218" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold" style={{ color: C.cream }}>{s.val}</p>
                <p className="text-[10px]" style={{ color: C.lightGreen }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: C.white }}>
          {[
            { id: "overview", label: "Outcomes" },
            { id: "trends", label: "Trends" },
            { id: "testimonials", label: "Voices" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeTab === t.id ? C.darkGreen : "transparent",
                color: activeTab === t.id ? "#fff" : C.mutedText,
                border: "none", cursor: "pointer",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Outcomes Tab */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold" style={{ color: C.mutedText }}>KEY OUTCOME METRICS</p>
            {OUTCOME_METRICS.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#ffffff", border: "1px solid #e8dcc8" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.color + "18" }}>
                    <Icon size={18} color={m.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold" style={{ color: "#1a1a1a" }}>{m.label}</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "#666" }}>{m.desc}</p>
                  </div>
                  <p className="text-lg font-bold flex-shrink-0" style={{ color: m.color }}>{m.value}</p>
                </div>
              );
            })}

            {/* ROI callout */}
            <div className="rounded-2xl p-4" style={{ background: "#0a3d20" }}>
              <p className="font-serif font-bold text-sm" style={{ color: C.gold }}>Estimated ROI for Your Agency</p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
                Based on national averages: each crisis hospitalization costs $8,000–$22,000.
                Rooted 21 redirected <strong style={{ color: C.cream }}>218 escalations</strong> this period —
                an estimated <strong style={{ color: C.cream }}>$1.7M–$4.8M</strong> in prevented system costs.
              </p>
              <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(201,151,58,0.15)", border: "1px solid rgba(201,151,58,0.3)" }}>
                <p className="text-xs font-bold" style={{ color: C.gold }}>Annual Agency License: $4,800 / $9,600 / $18,000</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(201,151,58,0.7)" }}>Tiers based on family count. Contact us for a custom quote.</p>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid #e8dcc8" }}>
              <p className="text-xs font-bold mb-3" style={{ color: "#1a1a1a" }}>Monthly App Sessions vs. Crisis Events</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={MONTHLY_ENGAGEMENT} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d4" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill={C.midGreen} radius={[4, 4, 0, 0]} name="App Sessions" />
                  <Bar dataKey="crises" fill={C.brown} radius={[4, 4, 0, 0]} name="Crisis Events" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-center mt-2" style={{ color: "#999" }}>
                As sessions ↑, crisis events ↓ — inverse correlation validates the model
              </p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid #e8dcc8" }}>
              <p className="text-xs font-bold mb-3" style={{ color: "#1a1a1a" }}>8-Week Regulation Score Trend (Avg across families)</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={CHECKIN_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d4" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#888" }} />
                  <YAxis domain={[3, 10]} tick={{ fontSize: 10, fill: "#888" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="regulation" stroke={C.midGreen} strokeWidth={2.5} dot={{ r: 3 }} name="Child Regulation" />
                  <Line type="monotone" dataKey="calm" stroke={C.gold} strokeWidth={2.5} dot={{ r: 3 }} name="Parent Calm" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ background: C.midGreen }} />
                  <p className="text-[10px]" style={{ color: "#999" }}>Child Regulation</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ background: C.gold }} />
                  <p className="text-[10px]" style={{ color: "#999" }}>Parent Calm</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === "testimonials" && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold" style={{ color: C.mutedText }}>PARENT VOICES FROM YOUR AGENCY</p>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid #e8dcc8" }}>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(t.stars)].map((_, s) => (
                    <Star key={s} size={12} color={C.gold} fill={C.gold} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: "#1a1a1a" }}>"{t.quote}"</p>
                <p className="text-[10px] font-bold mt-2" style={{ color: C.mutedText }}>— {t.name}</p>
              </div>
            ))}

            <div className="rounded-2xl p-4 text-center" style={{ background: C.darkGreen }}>
              <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Want this report for your agency?</p>
              <p className="text-[11px] mt-1" style={{ color: C.lightGreen }}>We generate custom outcome reports for all agency partners quarterly.</p>
              <a
                href="mailto:rooted21network@gmail.com?subject=Agency Partnership Inquiry"
                className="inline-block mt-3 px-5 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: C.gold, color: C.darkGreen, textDecoration: "none" }}
              >
                Contact Us for Pricing →
              </a>
            </div>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}