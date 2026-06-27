import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Download, Loader, Calendar, TrendingUp } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import ChildSelector from "@/components/children/ChildSelector";
import { filterRecordsForChild, getChildDisplayName } from "@/lib/child-selection";
import jsPDF from "jspdf";

const MOODS = ["calm", "sad", "anxious", "angry", "dysregulated"];
const MOOD_LABELS = { calm: "Calm", sad: "Sad", anxious: "Anxious", angry: "Angry", dysregulated: "Dysregulated" };

function getLogDate(log) {
  return log.entry_date || log.created_date?.slice(0, 10) || "";
}

function filterByMonth(records, month, dateGetter = (record) => record.created_date) {
  const [year, monthStr] = month.split("-");
  return records.filter((record) => {
    const dateValue = dateGetter(record);
    if (!dateValue) return false;
    const d = dateValue.length > 10 ? new Date(dateValue) : new Date(`${dateValue}T00:00:00`);
    return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(monthStr);
  });
}

function previousMonth(month) {
  const [year, monthStr] = month.split("-").map(Number);
  const date = new Date(year, monthStr - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function topCounts(logs, field) {
  const counts = {};
  logs.forEach((log) => {
    const value = (log[field] || "").trim();
    if (value) counts[value] = (counts[value] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function summarizeBehaviorLogs(currentLogs, previousLogs) {
  const moodCounts = MOODS.reduce((acc, mood) => ({ ...acc, [mood]: currentLogs.filter(log => log.child_mood === mood).length }), {});
  const previousMoodCounts = MOODS.reduce((acc, mood) => ({ ...acc, [mood]: previousLogs.filter(log => log.child_mood === mood).length }), {});
  const calmerNow = (moodCounts.calm || 0) - (previousMoodCounts.calm || 0);
  const highStressNow = (moodCounts.anxious || 0) + (moodCounts.angry || 0) + (moodCounts.dysregulated || 0);
  const highStressBefore = (previousMoodCounts.anxious || 0) + (previousMoodCounts.angry || 0) + (previousMoodCounts.dysregulated || 0);

  return {
    moodCounts,
    topTriggers: topCounts(currentLogs, "trigger"),
    topResponses: topCounts(currentLogs, "parent_response"),
    progressNotes: [
      calmerNow > 0 ? `Calm moments increased by ${calmerNow} compared with the previous month.` : "Calm moments stayed steady or need continued support.",
      highStressNow < highStressBefore ? "High-stress incidents decreased compared with the previous month." : "High-stress incidents should continue to be watched and supported.",
      currentLogs.length > previousLogs.length ? "More behavior entries were documented this month, giving the support team stronger pattern data." : "Documentation volume was steady or lower than last month."
    ]
  };
}

export default function MonthlyReport() {
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [reportMode, setReportMode] = useState("child");
  const [checkins, setCheckins] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [goals, setGoals] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [child, checkins, lessons, goals, behaviorLogs] = await Promise.all([
        base44.entities.ChildProfile.list("-created_date", 1),
        base44.entities.CheckIn.list("-created_date", 200),
        base44.entities.LessonProgress.filter({ completed: true }),
        base44.entities.Goal.list(),
        base44.entities.BehaviorLog.list("-entry_date", 500),
      ]);
      setChild(child[0] || null);
      setCheckins(checkins);
      setLessons(lessons);
      setGoals(goals);
      setBehaviorLogs(behaviorLogs);
    });
  }, []);

  async function generatePDF() {
    if (!user) return;
    setGenerating(true);

    const [year, monthStr] = month.split("-");
    const monthNum = parseInt(monthStr);
    const monthName = new Date(year, monthNum - 1).toLocaleString("default", { month: "long" });
    const reportChildName = reportMode === "all" ? "All children" : child ? getChildDisplayName(child) : "Selected child";
    const reportCheckins = reportMode === "all" ? checkins : filterRecordsForChild(checkins, child);
    const reportLessons = reportMode === "all" ? lessons : filterRecordsForChild(lessons, child);
    const reportGoals = reportMode === "all" ? goals : filterRecordsForChild(goals, child);
    const reportBehaviorLogs = reportMode === "all" ? behaviorLogs : filterRecordsForChild(behaviorLogs, child);
    const monthCheckins = filterByMonth(reportCheckins, month);
    const monthLessons = filterByMonth(reportLessons, month);
    const monthCompletedGoals = filterByMonth(reportGoals, month).filter(goal => goal.progress === "completed");
    const monthBehaviorLogs = filterByMonth(reportBehaviorLogs, month, getLogDate);
    const previousBehaviorLogs = filterByMonth(reportBehaviorLogs, previousMonth(month), getLogDate);
    const behaviorSummary = summarizeBehaviorLogs(monthBehaviorLogs, previousBehaviorLogs);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 16;
    let y = 18;

    const addText = (text, size = 10, style = "normal", color = [70, 70, 70]) => {
      pdf.setFont("helvetica", style);
      pdf.setFontSize(size);
      pdf.setTextColor(...color);
      const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
      lines.forEach(line => {
        if (y > 276) {
          pdf.addPage();
          y = 18;
        }
        pdf.text(line, margin, y);
        y += size * 0.45 + 2;
      });
    };

    const addSection = (title) => {
      if (y > 260) {
        pdf.addPage();
        y = 18;
      }
      y += 4;
      pdf.setFillColor(43, 92, 61);
      pdf.rect(margin, y, pageWidth - margin * 2, 9, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(title, margin + 3, y + 6);
      y += 14;
    };

    pdf.setTextColor(43, 92, 61);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("Monthly Behavior & Progress Summary", margin, y);
    y += 9;
    addText(`${monthName} ${year} • ${reportChildName} • Generated ${new Date().toLocaleDateString()}`, 9);

    addSection("Overview");
    addText(`Behavior logs: ${monthBehaviorLogs.length} • Check-ins: ${monthCheckins.length} • Lessons completed: ${monthLessons.length} • Goals completed: ${monthCompletedGoals.length}`, 11, "bold", [43, 92, 61]);
    addText("This summary is written for parents to share with a therapist, caseworker, school team, or other trusted support person.");

    addSection("Behavior Progress & Trends");
    behaviorSummary.progressNotes.forEach(note => addText(`• ${note}`));
    MOODS.forEach(mood => addText(`• ${MOOD_LABELS[mood]}: ${behaviorSummary.moodCounts[mood]} logged time${behaviorSummary.moodCounts[mood] === 1 ? "" : "s"}`));

    addSection("Common Triggers");
    if (behaviorSummary.topTriggers.length) {
      behaviorSummary.topTriggers.forEach(([trigger, count]) => addText(`• ${trigger}: ${count} time${count === 1 ? "" : "s"}`));
    } else {
      addText("No repeated triggers were documented this month.");
    }

    addSection("Helpful Parent Responses");
    if (behaviorSummary.topResponses.length) {
      behaviorSummary.topResponses.forEach(([response, count]) => addText(`• ${response}: ${count} time${count === 1 ? "" : "s"}`));
    } else {
      addText("No parent response patterns were documented this month.");
    }

    if (monthBehaviorLogs.length) {
      addSection("Behavior Log Highlights");
      monthBehaviorLogs.slice(0, 8).forEach(log => {
        addText(`• ${getLogDate(log)} — ${log.behavior_description}${log.outcome ? ` Outcome: ${log.outcome}` : ""}`);
      });
    }

    addSection("Support Team Note");
    addText("These notes are family-entered observations meant to support planning, communication, and pattern recognition. They do not replace professional evaluation or clinical judgment.", 9);

    pdf.save(`${monthName}-${year}-Behavior-Progress-Summary.pdf`);
    setGenerating(false);
  }

  const previewCheckins = reportMode === "all" ? checkins : filterRecordsForChild(checkins, child);
  const previewLessons = reportMode === "all" ? lessons : filterRecordsForChild(lessons, child);
  const previewGoals = reportMode === "all" ? goals : filterRecordsForChild(goals, child);
  const previewBehaviorLogs = reportMode === "all" ? behaviorLogs : filterRecordsForChild(behaviorLogs, child);
  const selectedMonthBehaviorLogs = filterByMonth(previewBehaviorLogs, month, getLogDate);
  const selectedPreviousBehaviorLogs = filterByMonth(previewBehaviorLogs, previousMonth(month), getLogDate);
  const behaviorSummary = summarizeBehaviorLogs(selectedMonthBehaviorLogs, selectedPreviousBehaviorLogs);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Monthly Report"
        subtitle="Progress summary for care team"
        backTo="/dashboard"
      />

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
        <ChildSelector selectedChild={child} onChange={setChild} />

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setReportMode("child")} className="rounded-xl py-2.5 text-xs font-bold" style={{ background: reportMode === "child" ? C.darkGreen : C.white, color: reportMode === "child" ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>Selected Child</button>
          <button onClick={() => setReportMode("all")} className="rounded-xl py-2.5 text-xs font-bold" style={{ background: reportMode === "all" ? C.darkGreen : C.white, color: reportMode === "all" ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>All Children</button>
        </div>

        {/* INFO BANNER */}
        <div className="rounded-xl p-4 flex gap-3" style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` }}>
          <Calendar size={16} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>Monthly Summary</p>
            <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
              Generate a PDF report with behavior patterns, triggers, progress trends, lessons, and goals to share with your support team.
            </p>
          </div>
        </div>

        {/* MONTH SELECTOR */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <label className="block text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>
            SELECT MONTH
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm font-sans"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>

        {/* DATA PREVIEW */}
        {user && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
              REPORT CONTENTS
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: C.offWhite }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Behavior Logs</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Triggers, moods, responses & outcomes</p>
                </div>
                <p className="text-lg font-bold" style={{ color: C.midGreen }}>
                  {selectedMonthBehaviorLogs.length}
                </p>
              </div>

              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: C.offWhite }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Check-ins</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Regulation trends & patterns</p>
                </div>
                <p className="text-lg font-bold" style={{ color: C.midGreen }}>
                  {previewCheckins.filter((c) => {
                    const [year, monthStr] = month.split("-");
                    const d = new Date(c.created_date);
                    return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(monthStr);
                  }).length}
                </p>
              </div>

              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: C.offWhite }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Lessons Completed</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Curriculum progress</p>
                </div>
                <p className="text-lg font-bold" style={{ color: C.brown }}>
                  {previewLessons.filter((l) => {
                    const [year, monthStr] = month.split("-");
                    const d = new Date(l.created_date);
                    return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(monthStr);
                  }).length}
                </p>
              </div>

              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: C.offWhite }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Goals Completed</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Family milestone achievements</p>
                </div>
                <p className="text-lg font-bold" style={{ color: C.gold }}>
                  {previewGoals
                    .filter((g) => {
                      const [year, monthStr] = month.split("-");
                      const d = new Date(g.created_date);
                      return (
                        g.progress === "completed" &&
                        d.getFullYear() === parseInt(year) &&
                        d.getMonth() + 1 === parseInt(monthStr)
                      );
                    }).length}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedMonthBehaviorLogs.length > 0 && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} color={C.midGreen} />
              <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Behavior Trends for Support Team</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map(mood => (
                <div key={mood} className="rounded-lg p-2 text-center" style={{ background: C.offWhite }}>
                  <p className="text-sm font-black" style={{ color: C.darkGreen }}>{behaviorSummary.moodCounts[mood]}</p>
                  <p className="text-[9px] leading-tight" style={{ color: C.mutedText }}>{MOOD_LABELS[mood]}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {behaviorSummary.progressNotes.map(note => (
                <p key={note} className="rounded-lg px-3 py-2 text-[11px] leading-5" style={{ background: `${C.midGreen}10`, color: C.mutedText }}>
                  {note}
                </p>
              ))}
            </div>
            {behaviorSummary.topTriggers.length > 0 && (
              <div>
                <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>COMMON TRIGGERS</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {behaviorSummary.topTriggers.map(([trigger, count]) => (
                    <span key={trigger} className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>
                      {trigger} · {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOWNLOAD BUTTON */}
        <button
          onClick={generatePDF}
          disabled={generating || !user}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: C.darkGreen,
            border: "none",
            color: C.cream,
            cursor: "pointer",
            opacity: generating || !user ? 0.6 : 1,
          }}
        >
          {generating ? (
            <>
              <Loader size={14} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={16} />
              Download {month.split("-")[1]}/{month.split("-")[0]} Report
            </>
          )}
        </button>

        <p className="text-xs text-center" style={{ color: C.mutedText }}>
          PDF reports are ready to print and share with your care team.
        </p>

        <div className="pb-8" />
      </div>
    </div>
  );
}