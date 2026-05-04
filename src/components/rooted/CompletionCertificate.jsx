import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { LESSONS } from "@/lib/lessons-data";
import { Download, X, Award } from "lucide-react";
import { jsPDF } from "jspdf";

export default function CompletionCertificate({ onClose }) {
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.ChildProfile.list("-created_date", 1),
      base44.entities.LessonProgress.filter({ completed: true }, "-updated_date", 1),
    ]).then(([u, children, lessons]) => {
      setUser(u);
      setChild(children[0] || null);
      if (lessons[0]) {
        setCompletionDate(new Date(lessons[0].updated_date));
      } else {
        setCompletionDate(new Date());
      }
    });
  }, []);

  async function generatePDF() {
    setGenerating(true);

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = 297, H = 210;

    // Background
    doc.setFillColor(250, 248, 243); // offWhite
    doc.rect(0, 0, W, H, "F");

    // Border frame
    doc.setDrawColor(47, 75, 58); // darkGreen
    doc.setLineWidth(3);
    doc.rect(8, 8, W - 16, H - 16);
    doc.setLineWidth(1);
    doc.setDrawColor(201, 168, 76); // gold
    doc.rect(12, 12, W - 24, H - 24);

    // Header ribbon
    doc.setFillColor(47, 75, 58);
    doc.rect(0, 0, W, 42, "F");

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(232, 223, 207); // cream
    doc.text("HALO Project", W / 2, 18, { align: "center" });

    doc.setFontSize(13);
    doc.setFont("times", "italic");
    doc.setTextColor(167, 184, 154); // lightGreen
    doc.text("Trauma-Informed Parenting Program  ·  TBRI® Curriculum", W / 2, 28, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(201, 168, 76);
    doc.text("CERTIFICATE OF COMPLETION", W / 2, 37, { align: "center" });

    // "This certifies that"
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(122, 110, 96);
    doc.text("This certifies that", W / 2, 58, { align: "center" });

    // Parent name
    const parentName = user?.full_name || "Program Participant";
    doc.setFont("times", "bolditalic");
    doc.setFontSize(26);
    doc.setTextColor(47, 75, 58);
    doc.text(parentName, W / 2, 72, { align: "center" });

    // Underline
    const nameWidth = doc.getTextWidth(parentName);
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.8);
    doc.line(W / 2 - nameWidth / 2, 75, W / 2 + nameWidth / 2, 75);

    // Body text
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(92, 74, 53);
    doc.text(
      "has successfully completed all 21 lessons of the HALO 10-Week Parenting Reset Program",
      W / 2, 84, { align: "center" }
    );

    const childName = child?.first_name;
    if (childName) {
      doc.text(
        `in support of their child, ${childName},`,
        W / 2, 92, { align: "center" }
      );
      doc.text(
        "demonstrating commitment to trauma-informed, TBRI®-based parenting.",
        W / 2, 100, { align: "center" }
      );
    } else {
      doc.text(
        "demonstrating commitment to trauma-informed, TBRI®-based parenting.",
        W / 2, 92, { align: "center" }
      );
    }

    // Completion date
    const dateStr = completionDate
      ? completionDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(47, 75, 58);
    doc.text(`Completed: ${dateStr}`, W / 2, 112, { align: "center" });

    // Divider
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.line(30, 118, W - 30, 118);

    // Lessons completed grid — 3 columns
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(47, 75, 58);
    doc.text("LESSONS COMPLETED", W / 2, 124, { align: "center" });

    const cols = 3;
    const colW = (W - 60) / cols;
    const startX = 30;
    let row = 0, col = 0;

    LESSONS.forEach((lesson, i) => {
      const x = startX + col * colW;
      const y = 130 + row * 7;

      // Checkmark circle
      doc.setFillColor(110, 143, 110); // midGreen
      doc.circle(x + 2, y - 1.5, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text("✓", x + 2, y - 0.5, { align: "center" });

      // Lesson text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(47, 75, 58);
      const label = `${lesson.id}. ${lesson.title}`;
      doc.text(label, x + 6, y, { maxWidth: colW - 10 });

      col++;
      if (col >= cols) { col = 0; row++; }
    });

    // Footer
    doc.setFillColor(47, 75, 58);
    doc.rect(0, H - 20, W, 20, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(167, 184, 154);
    doc.text(
      "HALO Project  ·  Rooted 21 Parenting Reset  ·  Created by Misty Stonerock, Community Behavioral Health Worker & Parent Advocate",
      W / 2, H - 10, { align: "center" }
    );
    doc.setTextColor(201, 168, 76);
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.text("Every child deserves to be seen, safe, soothed, and secure.", W / 2, H - 4, { align: "center" });

    const filename = `HALO_Certificate_${(parentName).replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
    setGenerating(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background: C.white }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: C.darkGreen }}>
          <Award size={20} color={C.gold} />
          <div className="flex-1">
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Program Certificate</p>
            <p className="text-[10px]" style={{ color: C.lightGreen }}>HALO 10-Week TBRI® Curriculum</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none" }}>
            <X size={18} color={C.lightGreen} />
          </button>
        </div>

        {/* Certificate preview */}
        <div className="px-5 py-5">
          <div className="rounded-2xl p-5 text-center mb-4" style={{ background: C.offWhite, border: `2px solid ${C.gold}` }}>
            <p className="text-3xl mb-2">🌳</p>
            <p className="font-serif font-bold text-lg leading-snug" style={{ color: C.darkGreen }}>
              Certificate of Completion
            </p>
            <p className="text-xs mt-1 mb-3" style={{ color: C.mutedText }}>HALO Project · Rooted 21 Program</p>

            <div className="rounded-xl px-4 py-3 mb-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-0.5" style={{ color: C.mutedText }}>Awarded to</p>
              <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>
                {user?.full_name || "—"}
              </p>
              {child?.first_name && (
                <p className="text-xs mt-0.5" style={{ color: C.brown }}>
                  in support of {child.first_name}
                </p>
              )}
            </div>

            <div className="flex justify-center gap-4 mb-3">
              <div className="text-center">
                <p className="text-xl font-extrabold" style={{ color: C.midGreen }}>21</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Lessons</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold" style={{ color: C.gold }}>10</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Weeks</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold" style={{ color: C.brown }}>100%</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Complete</p>
              </div>
            </div>

            <p className="text-[11px]" style={{ color: C.mutedText }}>
              {completionDate
                ? completionDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : "—"}
            </p>
          </div>

          {/* Lesson list */}
          <div className="rounded-xl px-3 py-2.5 mb-4 max-h-40 overflow-y-auto" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>ALL 21 LESSONS COMPLETED</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {LESSONS.map(l => (
                <div key={l.id} className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.midGreen }}>
                    <span className="text-[8px] text-white font-bold">✓</span>
                  </div>
                  <p className="text-[10px] truncate" style={{ color: C.darkGreen }}>{l.id}. {l.title}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generatePDF}
            disabled={generating}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}
          >
            <Download size={16} />
            {generating ? "Generating PDF…" : "Download Certificate PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}