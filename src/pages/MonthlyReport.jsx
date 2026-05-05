import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Download, Loader, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function MonthlyReport() {
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [goals, setGoals] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [child, checkins, lessons, goals] = await Promise.all([
        base44.entities.ChildProfile.list("-created_date", 1),
        base44.entities.CheckIn.list("-created_date", 200),
        base44.entities.LessonProgress.filter({ completed: true }),
        base44.entities.Goal.list(),
      ]);
      setChild(child[0] || null);
      setCheckins(checkins);
      setLessons(lessons);
      setGoals(goals);
    });
  }, []);

  async function generatePDF() {
    if (!user) return;
    setGenerating(true);

    const [year, monthStr] = month.split("-");
    const monthNum = parseInt(monthStr);
    const monthName = new Date(year, monthNum - 1).toLocaleString("default", { month: "long" });

    // Filter data by month
    const monthCheckins = checkins.filter((c) => {
      const d = new Date(c.created_date);
      return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === monthNum;
    });

    const monthLessons = lessons.filter((l) => {
      const d = new Date(l.created_date);
      return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === monthNum;
    });

    const monthCompletedGoals = goals.filter(
      (g) =>
        g.progress === "completed" &&
        new Date(g.created_date).getFullYear() === parseInt(year) &&
        new Date(g.created_date).getMonth() + 1 === monthNum
    );

    // Create PDF content as HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px; background: white; color: #333;">
        <style>
          .header { border-bottom: 3px solid #2B5C3D; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #2B5C3D; font-size: 28px; }
          .header p { margin: 5px 0 0 0; color: #666; font-size: 12px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section-title { background: #2B5C3D; color: white; padding: 10px 15px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
          .stat-box { display: inline-block; margin-right: 20px; margin-bottom: 15px; }
          .stat-number { font-size: 24px; font-weight: bold; color: #5B8E6A; }
          .stat-label { font-size: 11px; color: #666; }
          .regulation-chart { margin: 15px 0; }
          .goal-item { background: #F5F5F5; padding: 12px; margin-bottom: 10px; border-left: 4px solid #5B8E6A; font-size: 12px; }
          .lesson-item { background: #FAFAFA; padding: 10px; margin-bottom: 8px; font-size: 11px; }
          .footer { border-top: 1px solid #DDD; padding-top: 20px; margin-top: 40px; font-size: 10px; color: #999; }
          .highlight { color: #2B5C3D; font-weight: bold; }
        </style>

        <div class="header">
          <h1>Monthly Progress Report</h1>
          <p><span class="highlight">${monthName} ${year}</span> • Family Report</p>
          <p style="margin-top: 10px;">Report generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- OVERVIEW SECTION -->
        <div class="section">
          <div class="section-title">📊 Overview</div>
          <p style="margin-top: 0; font-size: 12px;">
            Family: <span class="highlight">${user?.full_name || "Family"}</span>
            ${child ? ` • Child: <span class="highlight">${child.first_name}</span>` : ""}
          </p>
          <div style="margin-top: 15px;">
            <div class="stat-box">
              <div class="stat-number">${monthCheckins.length}</div>
              <div class="stat-label">Check-ins</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${monthLessons.length}</div>
              <div class="stat-label">Lessons Completed</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${monthCompletedGoals.length}</div>
              <div class="stat-label">Goals Completed</div>
            </div>
          </div>
        </div>

        <!-- REGULATION TRENDS -->
        ${
          monthCheckins.length > 0
            ? `
          <div class="section">
            <div class="section-title">📈 Regulation Trends</div>
            <p style="font-size: 11px; margin-top: 0; color: #666;">
              Based on ${monthCheckins.length} check-in(s) this month
            </p>
            <div style="margin-top: 15px;">
              <p style="margin: 0 0 8px 0; font-size: 11px;">
                <span class="highlight">Child's Average Regulation Score:</span>
                ${(monthCheckins.reduce((s, c) => s + (c.child_regulation || 0), 0) / monthCheckins.length).toFixed(1)}/5
              </p>
              <div style="background: #EEE; height: 8px; border-radius: 4px;">
                <div style="background: #5B8E6A; height: 100%; border-radius: 4px; width: ${(monthCheckins.reduce((s, c) => s + (c.child_regulation || 0), 0) / monthCheckins.length / 5) * 100}%;" />
              </div>
            </div>
            <div style="margin-top: 15px;">
              <p style="margin: 0 0 8px 0; font-size: 11px;">
                <span class="highlight">Parent's Average Calm Level:</span>
                ${(monthCheckins.reduce((s, c) => s + (c.parent_calm || 0), 0) / monthCheckins.length).toFixed(1)}/5
              </p>
              <div style="background: #EEE; height: 8px; border-radius: 4px;">
                <div style="background: #DAA520; height: 100%; border-radius: 4px; width: ${(monthCheckins.reduce((s, c) => s + (c.parent_calm || 0), 0) / monthCheckins.length / 5) * 100}%;" />
              </div>
            </div>
          </div>
        `
            : ""
        }

        <!-- LESSONS COMPLETED -->
        ${
          monthLessons.length > 0
            ? `
          <div class="section">
            <div class="section-title">📚 Lessons Completed</div>
            ${monthLessons.map((lesson, i) => `<div class="lesson-item">${i + 1}. Lesson ${lesson.lesson_id} completed on ${new Date(lesson.created_date).toLocaleDateString()}</div>`).join("")}
          </div>
        `
            : ""
        }

        <!-- GOALS -->
        ${
          monthCompletedGoals.length > 0
            ? `
          <div class="section">
            <div class="section-title">🎯 Goals Achieved</div>
            ${monthCompletedGoals.map((goal) => `
              <div class="goal-item">
                <strong>${goal.title}</strong>
                <p style="margin: 5px 0 0 0; color: #555;">${goal.description || "Goal completed"}</p>
              </div>
            `).join("")}
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>This report is for the family's personal records and to share with their care team.</p>
          <p>Rooted 21 • Strengthening Families Through Trauma-Informed Parenting</p>
        </div>
      </div>
    `;

    // Convert HTML to Canvas, then to PDF
    const canvas = await html2canvas(document.createElement("div"), {
      html: htmlContent,
      backgroundColor: "#FFFFFF",
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${monthName}-${year}-Family-Report.pdf`);
    setGenerating(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard">
          <ChevronLeft size={20} color={C.cream} />
        </Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
            Monthly Report
          </p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>
            Progress summary for care team
          </p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
        {/* INFO BANNER */}
        <div className="rounded-xl p-4 flex gap-3" style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` }}>
          <Calendar size={16} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>Monthly Summary</p>
            <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
              Generate a PDF report with your lessons, regulation trends, and completed goals to share with your therapist or caseworker.
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
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Check-ins</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Regulation trends & patterns</p>
                </div>
                <p className="text-lg font-bold" style={{ color: C.midGreen }}>
                  {checkins.filter((c) => {
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
                  {lessons.filter((l) => {
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
                  {goals
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