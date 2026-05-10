import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Download, Loader2, Shield, FileText, AlertTriangle, CheckCircle2, Calendar, Settings2, MessageSquare, BookOpen } from "lucide-react";

const LIFE_STORY_ENTRY_TYPES = [
  { value: "placement", label: "Placement" },
  { value: "school", label: "School Change" },
  { value: "milestone", label: "Milestone" },
  { value: "medical", label: "Medical" },
  { value: "family", label: "Family Moment" },
  { value: "loss", label: "Loss / Grief" },
  { value: "substance_exposure", label: "Substance Exposure" },
  { value: "physical_abuse", label: "Physical Abuse" },
  { value: "emotional_abuse", label: "Emotional Abuse" },
  { value: "sexual_abuse", label: "Sexual Abuse" },
  { value: "neglect", label: "Neglect" },
  { value: "other", label: "Other" },
];

const QUICK_RANGES = [
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 6 months", days: 180 },
  { label: "Last year", days: 365 },
  { label: "Custom", days: null },
];

const ALL_SECTIONS = [
  { key: "childProfile",    icon: "👤", label: "Child Profile & Background" },
  { key: "lifeStory",       icon: "📖", label: "Life Story Timeline" },
  { key: "behaviorLogs",    icon: "📋", label: "Behavior Incident Logs" },
  { key: "checkIns",        icon: "📈", label: "Daily Regulation Check-ins" },
  { key: "goals",           icon: "🎯", label: "Family Goals & Progress" },
  { key: "caseNotes",       icon: "📝", label: "Case Notes & Therapy Records" },
  { key: "calendarEvents",  icon: "📅", label: "Appointments & Calendar Events" },
  { key: "caseTasks",       icon: "✅", label: "Case Tasks & Action Items" },
  { key: "messages",        icon: "💬", label: "Communications Log" },
  { key: "certification",   icon: "⚖️", label: "Certification & Declaration", fixed: true },
];

function defaultSections() {
  const obj = {};
  ALL_SECTIONS.forEach(s => { obj[s.key] = true; });
  return obj;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export default function CourtReadyExport() {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [quickRange, setQuickRange] = useState(90);
  const [dateFrom, setDateFrom] = useState(() => daysAgo(90));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [includeSections, setIncludeSections] = useState(defaultSections());
  const [entryTypeFilter, setEntryTypeFilter] = useState([]);
  const [messageSource, setMessageSource] = useState("both");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [declared, setDeclared] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.ChildProfile.list("-created_date", 10).then(c => {
        setChildren(c);
        if (c.length > 0) setSelectedChild(c[0].first_name);
      });
    });
  }, []);

  function applyQuickRange(days) {
    setQuickRange(days);
    if (days) {
      setDateFrom(daysAgo(days));
      setDateTo(new Date().toISOString().split("T")[0]);
    }
  }

  function toggleSection(key) {
    setIncludeSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleEntryType(val) {
    setEntryTypeFilter(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  }

  async function handleGenerate() {
    if (!declared) return;
    setGenerating(true);
    setError(null);
    setResult(null);

    const response = await base44.functions.invoke("generateCourtReadyReport", {
      dateFrom,
      dateTo,
      childName: selectedChild,
      includeSections,
      entryTypeFilter,
      messageSource,
    });

    if (response.data?.success && response.data?.base64) {
      const { base64, fileName, reportId, summary } = response.data;
      const byteChars = atob(base64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setResult({ reportId, summary, fileName });
    } else {
      setError(response.data?.error || "Failed to generate report. Please try again.");
    }
    setGenerating(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Court-Ready Summary Report" subtitle="Ohio custody & foster care documentation" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <Shield size={22} color="#fff" />
            </div>
            <div>
              <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Court-Ready Documentation</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>ORC §2151.421 · §3109.04 · §5103.0212 Compliant</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            Generates a certified, multi-section PDF including Life Story timeline, messaging logs, behavior records, and a signed accuracy declaration — formatted for Ohio custody and foster care proceedings.
          </p>
        </div>

        {/* Legal warning */}
        <div className="rounded-xl p-3.5 flex gap-3" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
          <AlertTriangle size={15} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
            This report is for legal use. Consult your attorney before submitting to court or CPS. All records are pulled from your account and timestamped at generation.
          </p>
        </div>

        {/* Child selector */}
        {children.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <label className="block text-[9px] font-bold mb-1.5" style={{ color: C.mutedText }}>CHILD SUBJECT</label>
            <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}>
              {children.map(c => (
                <option key={c.id} value={c.first_name}>{c.first_name}{c.last_name ? " " + c.last_name : ""}</option>
              ))}
            </select>
          </div>
        )}

        {/* Quick timeframe selector */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} color={C.midGreen} />
            <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>REPORTING PERIOD</p>
          </div>
          {/* Quick range pills */}
          <div className="flex flex-wrap gap-2">
            {QUICK_RANGES.map(r => (
              <button key={r.label} onClick={() => applyQuickRange(r.days)}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: quickRange === r.days ? C.darkGreen : C.cream,
                  color: quickRange === r.days ? "#fff" : C.darkGreen,
                  border: "none", cursor: "pointer",
                }}>
                {r.label}
              </button>
            ))}
          </div>
          {/* Custom date range (always shown when quickRange is null) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold mb-1" style={{ color: C.mutedText }}>FROM</label>
              <input type="date" value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setQuickRange(null); }}
                className="w-full rounded-xl px-3 py-2.5 text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>
            <div>
              <label className="block text-[9px] font-bold mb-1" style={{ color: C.mutedText }}>TO</label>
              <input type="date" value={dateTo}
                max={new Date().toISOString().split("T")[0]}
                onChange={e => { setDateTo(e.target.value); setQuickRange(null); }}
                className="w-full rounded-xl px-3 py-2.5 text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }} />
            </div>
          </div>
        </div>

        {/* Section toggles */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-[10px] font-extrabold tracking-wider mb-3" style={{ color: C.mutedText }}>
            REPORT SECTIONS
          </p>
          <div className="space-y-2">
            {ALL_SECTIONS.map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <span style={{ fontSize: 13, width: 20, flexShrink: 0 }}>{s.icon}</span>
                <p className="flex-1 text-xs" style={{ color: s.fixed ? C.mutedText : C.darkGreen }}>{s.label}</p>
                {s.fixed ? (
                  <CheckCircle2 size={15} color={C.midGreen} />
                ) : (
                  <button
                    onClick={() => toggleSection(s.key)}
                    className="rounded-full transition-all flex-shrink-0"
                    style={{
                      width: 38, height: 22,
                      background: includeSections[s.key] ? C.darkGreen : "#ddd",
                      border: "none", cursor: "pointer", position: "relative",
                    }}
                    aria-label={`Toggle ${s.label}`}
                  >
                    <span style={{
                      position: "absolute",
                      top: 3, left: includeSections[s.key] ? 18 : 3,
                      width: 16, height: 16, borderRadius: "50%",
                      background: "#fff", transition: "left 0.2s",
                      display: "block",
                    }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advanced filters — Life Story & Messages */}
        <button
          onClick={() => setShowAdvanced(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{ background: C.cream, border: `1px solid ${C.cream}`, cursor: "pointer" }}
        >
          <div className="flex items-center gap-2">
            <Settings2 size={14} color={C.midGreen} />
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Advanced Filters</p>
            <p className="text-[10px]" style={{ color: C.mutedText }}>Life Story types · Message source</p>
          </div>
          <span className="text-xs" style={{ color: C.midGreen }}>{showAdvanced ? "▲" : "▼"}</span>
        </button>

        {showAdvanced && (
          <div className="rounded-2xl p-4 space-y-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>

            {/* Life story entry type filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={13} color={C.midGreen} />
                <p className="text-[10px] font-bold" style={{ color: C.darkGreen }}>Life Story — Entry Types</p>
                <p className="text-[9px] ml-auto" style={{ color: C.mutedText }}>
                  {entryTypeFilter.length === 0 ? "All included" : `${entryTypeFilter.length} selected`}
                </p>
              </div>
              <p className="text-[10px] mb-2" style={{ color: C.mutedText }}>
                Leave unselected to include all types. Check specific types to limit the report.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {LIFE_STORY_ENTRY_TYPES.map(et => (
                  <button key={et.value}
                    onClick={() => toggleEntryType(et.value)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
                    style={{
                      background: entryTypeFilter.includes(et.value) ? C.darkGreen : C.offWhite,
                      color: entryTypeFilter.includes(et.value) ? "#fff" : C.darkGreen,
                      border: `1px solid ${entryTypeFilter.includes(et.value) ? C.darkGreen : C.cream}`,
                      cursor: "pointer",
                    }}>
                    {et.label}
                  </button>
                ))}
              </div>
              {entryTypeFilter.length > 0 && (
                <button onClick={() => setEntryTypeFilter([])}
                  className="mt-2 text-[10px] font-bold underline"
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.midGreen }}>
                  Clear filter (include all)
                </button>
              )}
            </div>

            {/* Message source */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} color={C.midGreen} />
                <p className="text-[10px] font-bold" style={{ color: C.darkGreen }}>Message Source</p>
              </div>
              <div className="flex gap-2">
                {[
                  { value: "both", label: "All Messages" },
                  { value: "coparenting", label: "Co-Parent Portal Only" },
                  { value: "secure", label: "Secure Messages Only" },
                ].map(opt => (
                  <button key={opt.value}
                    onClick={() => setMessageSource(opt.value)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all"
                    style={{
                      background: messageSource === opt.value ? C.darkGreen : C.offWhite,
                      color: messageSource === opt.value ? "#fff" : C.darkGreen,
                      border: `1px solid ${messageSource === opt.value ? C.darkGreen : C.cream}`,
                      cursor: "pointer",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Declaration checkbox */}
        <div className="rounded-2xl p-4" style={{ background: "#F0F7F2", border: `1.5px solid ${C.midGreen}` }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={declared}
              onChange={e => setDeclared(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
              style={{ accentColor: C.darkGreen, width: 16, height: 16 }}
            />
            <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
              I, <strong>{user?.full_name || "the undersigned"}</strong>, declare under penalty of perjury that the records in this report are true and accurate to the best of my knowledge, and I am authorized to generate this document for use in legal or child welfare proceedings. I affirm this report carries certified accuracy pursuant to Ohio record-keeping standards.
            </p>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-3.5 flex gap-2" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
            <AlertTriangle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} color={C.midGreen} />
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Report Generated & Downloaded</p>
            </div>
            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>Report ID: {result.reportId}</p>
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {Object.entries(result.summary).map(([key, val]) => (
                <div key={key} className="text-center rounded-xl p-2" style={{ background: C.white }}>
                  <p className="text-sm font-extrabold" style={{ color: C.darkGreen }}>{val}</p>
                  <p className="text-[9px] leading-tight" style={{ color: C.mutedText }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !declared || !user}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: declared ? C.darkGreen : C.mutedText,
            color: "#fff",
            border: "none",
            cursor: declared && !generating ? "pointer" : "not-allowed",
            opacity: generating ? 0.75 : 1,
          }}
        >
          {generating ? (
            <><Loader2 size={17} className="animate-spin" /> Building Court-Ready PDF…</>
          ) : (
            <><FileText size={17} /> Generate & Download Report</>
          )}
        </button>

        {!declared && (
          <p className="text-center text-[11px]" style={{ color: C.mutedText }}>
            Please check the declaration box above to enable export.
          </p>
        )}

        <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
          <p className="text-[11px] leading-relaxed text-center" style={{ color: C.mutedText }}>
            Each report receives a unique Report ID and is timestamped at generation. Rooted 21 does not retain exported PDFs. Store your copy securely.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}