import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import { jsPDF } from "npm:jspdf@4.2.1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const ML = 16, MR = 16, MT = 16;
    const CW = PW - ML - MR;
    let y = MT;

    const DARK_GREEN = [27, 68, 44];
    const MID_GREEN = [88, 140, 100];
    const GOLD = [180, 130, 40];
    const TEXT = [40, 35, 30];
    const LIGHT_GRAY = [245, 245, 245];
    const MED_GRAY = [180, 180, 180];

    function checkPage(needed = 14) {
      if (y + needed > PH - 18) {
        addPageFooter();
        doc.addPage();
        y = MT + 4;
        addPageHeader();
      }
    }

    function addText(text, fontSize = 9, color = TEXT, bold = false, indent = 0) {
      checkPage(fontSize * 0.5 + 3);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ""), CW - indent);
      doc.text(lines, ML + indent, y);
      y += lines.length * (fontSize * 0.42) + 2;
    }

    function addHeading(text, fontSize = 14, color = DARK_GREEN) {
      checkPage(fontSize * 0.8 + 6);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text(text, ML, y);
      y += fontSize * 0.6 + 4;
    }

    function addSectionHeader(text, emoji = "") {
      checkPage(12);
      doc.setFillColor(...DARK_GREEN);
      doc.roundedRect(ML, y - 4, CW, 9, 1.2, 1.2, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`${emoji} ${text}`, ML + 3, y + 1.2);
      y += 11;
    }

    function addHRule(color = MED_GRAY) {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.3);
      doc.line(ML, y, PW - MR, y);
      y += 3;
    }

    function addPageHeader() {
      doc.setFillColor(...DARK_GREEN);
      doc.rect(0, 0, PW, 8, "F");
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("ROOTED 21 — PROFESSIONAL OVERVIEW  |  Parenting Network for Foster, Adoptive & Kinship Families", ML, 5);
    }

    function addPageFooter() {
      const pg = doc.internal.pages.length - 1;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${pg}`, ML, PH - 6);
      doc.text("© 2026 Rooted 21 Parenting Network  |  www.rooted21.org", PW - MR - 75, PH - 6);
    }

    // ═══════════════════════════════════════════════════════════════
    // COVER PAGE
    // ═══════════════════════════════════════════════════════════════
    addPageHeader();

    doc.setFillColor(...DARK_GREEN);
    doc.roundedRect(ML, y + 6, CW, 35, 3, 3, "F");
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ROOTED 21", ML + CW / 2, y + 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(180, 210, 190);
    doc.text("Parenting Support Network", ML + CW / 2, y + 27, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Overview", ML + CW / 2, y + 33, { align: "center" });
    y += 48;

    addText("A comprehensive digital platform designed for foster, adoptive, and kinship families.", 11, DARK_GREEN, true);
    y += 2;
    addText(
      "Rooted 21 combines evidence-based parenting education, court-compliant case documentation, and community support in one secure application.",
      10,
      TEXT
    );
    y += 12;

    doc.setFillColor(...GOLD);
    doc.roundedRect(ML, y, CW, 12, 2, 2, "F");
    y += 2;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("✓ Ohio Compliant  |  ✓ Court-Ready Documentation  |  ✓ Trauma-Informed", ML + CW / 2, y + 4, {
      align: "center",
    });
    y += 14;

    addSectionHeader("WHO THIS SERVES", "👥");
    const audiences = [
      { label: "Courts & Legal Professionals", icon: "⚖️", desc: "Certified records, objective evidence, compliance documentation" },
      { label: "Child Welfare & Social Services", icon: "📋", desc: "Progress tracking, case plan monitoring, team coordination" },
      { label: "Therapists & Mental Health Providers", icon: "🧑‍⚕️", desc: "Behavioral data, regulation trends, family progress" },
      {
        label: "Foster, Adoptive & Kinship Families",
        icon: "👨‍👩‍👧",
        desc: "Parenting education, crisis support, documentation help",
      },
    ];
    audiences.forEach((aud) => {
      checkPage(10);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...MID_GREEN);
      doc.text(`${aud.icon} ${aud.label}`, ML + 2, y);
      y += 4;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(aud.desc, CW - 6);
      doc.text(lines, ML + 4, y);
      y += lines.length * 3.2 + 2;
    });

    addPageFooter();

    // ═══════════════════════════════════════════════════════════════
    // PAGE 2 — CORE FEATURES (PART 1)
    // ═══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();

    addSectionHeader("CORE FEATURES — PARENTING EDUCATION & TOOLS", "📚");

    const features1 = [
      { emoji: "🧠", title: "Personalized Parenting Coach", desc: "AI-powered, trauma-informed guidance tailored to family needs" },
      { emoji: "📚", title: "21-Lesson Curriculum", desc: "Evidence-based parenting lessons with quizzes and completion tracking" },
      { emoji: "🎓", title: "Live Parenting Classes", desc: "Weekly instructor-led training on attachment, trauma, and regulation" },
      { emoji: "📈", title: "Daily Regulation Check-ins", desc: "Track child regulation and parent calm with trend visualization" },
      { emoji: "📋", title: "Behavior & Incident Logs", desc: "Document critical incidents, triggers, and responses for case records" },
      { emoji: "🎯", title: "Family Goals & Progress", desc: "Set, monitor, and celebrate goal completion with milestones" },
    ];

    features1.forEach((f) => {
      checkPage(12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK_GREEN);
      doc.text(`${f.emoji} ${f.title}`, ML + 2, y);
      y += 4;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(f.desc, CW - 6);
      doc.text(lines, ML + 4, y);
      y += lines.length * 3 + 3;
    });

    addPageFooter();

    // ═══════════════════════════════════════════════════════════════
    // PAGE 3 — CORE FEATURES (PART 2)
    // ═══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();

    addSectionHeader("CORE FEATURES — CASE MANAGEMENT & DOCUMENTATION", "⚖️");

    const features2 = [
      { emoji: "📖", title: "Child Life Story Timeline", desc: "Preserve child's history with sensitive trauma documentation" },
      { emoji: "⚖️", title: "Court-Ready Reports", desc: "Certified, timestamped reports compliant with ORC §2151.421 & §3109.04" },
      { emoji: "📝", title: "Case Plan Checklist", desc: "Track and prove completion of court-ordered items with proof uploads" },
      { emoji: "🔒", title: "Secure Document Vault", desc: "Encrypted storage for IEPs, court orders, and medical records" },
      { emoji: "💬", title: "Monitored Co-Parenting Messaging", desc: "Court-admissible messaging with tone analysis and de-escalation" },
      { emoji: "🤝", title: "Partnership Health Score", desc: "AI-analyzed co-parenting relationship metrics and sentiment tracking" },
    ];

    features2.forEach((f) => {
      checkPage(12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK_GREEN);
      doc.text(`${f.emoji} ${f.title}`, ML + 2, y);
      y += 4;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(f.desc, CW - 6);
      doc.text(lines, ML + 4, y);
      y += lines.length * 3 + 3;
    });

    addPageFooter();

    // ═══════════════════════════════════════════════════════════════
    // PAGE 4 — CORE FEATURES (PART 3)
    // ═══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();

    addSectionHeader("CORE FEATURES — SUPPORT & COORDINATION", "🤲");

    const features3 = [
      { emoji: "📞", title: "Team Contact Directory", desc: "Central registry for caseworkers, therapists, attorneys, providers" },
      { emoji: "📅", title: "Legal Calendar & Reminders", desc: "Automatic alerts for court dates, visitations, document deadlines" },
      { emoji: "💊", title: "Medication Manager", desc: "Track prescriptions, dosages, pharmacy info, and side effects" },
      { emoji: "🚗", title: "Visitation Tracker", desc: "Log visits with child behavior observations and safety concerns" },
      { emoji: "💰", title: "Shared Expense Tracker", desc: "Document and split child-related expenses with payment tracking" },
      { emoji: "🚨", title: "Crisis & Emergency Toolbox", desc: "Evidence-based de-escalation strategies for behavioral crises" },
    ];

    features3.forEach((f) => {
      checkPage(12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK_GREEN);
      doc.text(`${f.emoji} ${f.title}`, ML + 2, y);
      y += 4;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(f.desc, CW - 6);
      doc.text(lines, ML + 4, y);
      y += lines.length * 3 + 3;
    });

    addPageFooter();

    // ═══════════════════════════════════════════════════════════════
    // PAGE 5 — CORE FEATURES (PART 4)
    // ═══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();

    addSectionHeader("CORE FEATURES — INSIGHTS & COMMUNITY", "💡");

    const features4 = [
      { emoji: "📊", title: "Growth Insights & Analytics", desc: "Weekly AI-generated reports on behavioral trends and progress" },
      { emoji: "🏥", title: "Education Hub", desc: "Evidence-based guides for FASD, RAD, attachment, grief, racial identity" },
      { emoji: "👥", title: "Community & Peer Support", desc: "Anonymous forums, peer matching, judgment-free discussion groups" },
    ];

    features4.forEach((f) => {
      checkPage(12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK_GREEN);
      doc.text(`${f.emoji} ${f.title}`, ML + 2, y);
      y += 4;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(f.desc, CW - 6);
      doc.text(lines, ML + 4, y);
      y += lines.length * 3 + 3;
    });

    y += 4;
    addSectionHeader("TOTAL FEATURES: 23+ Core Capabilities", "✓");
    addText("All designed with trauma-informed principles and evidence-based practices.", 9, TEXT);

    addPageFooter();

    // ═══════════════════════════════════════════════════════════════
    // PAGE 6 — COMPLIANCE
    // ═══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();

    addSectionHeader("OHIO COMPLIANCE & STANDARDS", "⚖️");

    addHeading("Legal Framework", 11, DARK_GREEN);
    const compliance = [
      "ORC §2151.421 — Child Custody Records & Documentation",
      "ORC §3109.04 — Parental Rights & Responsibilities",
      "ORC §5103.0212 — Foster Care Record-Keeping Standards",
      "ODJFS Guidelines for Child Welfare Documentation",
    ];

    compliance.forEach((item) => {
      checkPage(6);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(`• ${item}`, CW - 4);
      doc.text(lines, ML + 2, y);
      y += lines.length * 3.2 + 1;
    });

    y += 3;
    addHeading("Data & Security Standards", 11, DARK_GREEN);
    const security = [
      "SHA-256 Audit Logging — All messages timestamped and cryptographically verified",
      "Tamper Detection — Content hash verification prevents document alteration",
      "Court-Admissible Evidence — Records formatted and maintained per legal standards",
      "Encrypted Storage — All sensitive data encrypted at rest and in transit",
      "Access Control — Role-based permissions for courts, agencies, families",
    ];

    security.forEach((item) => {
      checkPage(8);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(`• ${item}`, CW - 4);
      doc.text(lines, ML + 2, y);
      y += lines.length * 3.2 + 2;
    });

    addPageFooter();

    // ═══════════════════════════════════════════════════════════════
    // PAGE 7 — USE CASES
    // ═══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();

    addSectionHeader("IMPLEMENTATION USE CASES", "📋");

    const useCases = [
      {
        audience: "Court System",
        cases: [
          "Compile certified case documentation for custody hearings",
          "Access objective behavioral records and timelines",
          "Review court-ordered compliance with case plans",
          "Evaluate family progress for reunification decisions",
        ],
      },
      {
        audience: "Child Welfare Agencies",
        cases: [
          "Monitor caregiver progress on assigned service plans",
          "Verify completion of mandated training and services",
          "Coordinate with therapists, schools, and medical providers",
          "Generate quarterly progress reports for case reviews",
        ],
      },
      {
        audience: "Mental Health Providers",
        cases: [
          "Review child behavioral patterns and emotional trends",
          "Track medication effectiveness and side effects",
          "Coordinate care plan with family support systems",
          "Monitor parent regulation and caregiver stress",
        ],
      },
      {
        audience: "Foster, Adoptive & Kinship Families",
        cases: [
          "Learn trauma-informed parenting strategies weekly",
          "Document daily progress and behavioral improvements",
          "Prove compliance with court orders and case plans",
          "Access support community and resources",
        ],
      },
    ];

    useCases.forEach((uc) => {
      checkPage(18);
      addHeading(uc.audience, 11, MID_GREEN);
      uc.cases.forEach((c) => {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT);
        const lines = doc.splitTextToSize(`• ${c}`, CW - 4);
        doc.text(lines, ML + 2, y);
        y += lines.length * 3.2 + 1.5;
      });
      y += 2;
    });

    addPageFooter();

    // ═══════════════════════════════════════════════════════════════
    // PAGE 8 — KEY BENEFITS
    // ═══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();

    addSectionHeader("KEY BENEFITS & IMPACT", "🎯");

    const benefits = [
      {
        title: "For Families",
        points: [
          "Access to trauma-informed education anytime, anywhere",
          "Tools to track progress and celebrate wins",
          "Documented proof of compliance for court proceedings",
          "Support community and professional resources",
        ],
      },
      {
        title: "For Professionals",
        points: [
          "Comprehensive, objective family data in one platform",
          "Reduced time spent on documentation",
          "Real-time progress monitoring and alerts",
          "Improved coordination across agencies and providers",
        ],
      },
      {
        title: "For Courts",
        points: [
          "Certified, tamper-proof evidence of family progress",
          "Objective behavioral data for custody decisions",
          "Reduced time in case review and hearings",
          "Ohio-compliant documentation meeting legal standards",
        ],
      },
    ];

    benefits.forEach((benefit) => {
      checkPage(18);
      addHeading(benefit.title, 10.5, DARK_GREEN);
      benefit.points.forEach((point) => {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT);
        const lines = doc.splitTextToSize(`✓ ${point}`, CW - 4);
        doc.text(lines, ML + 2, y);
        y += lines.length * 3.2 + 1.5;
      });
      y += 2;
    });

    addPageFooter();

    // ═══════════════════════════════════════════════════════════════
    // FINAL PAGE — CONTACT & CTA
    // ═══════════════════════════════════════════════════════════════
    doc.addPage();
    y = MT + 4;
    addPageHeader();

    doc.setFillColor(...DARK_GREEN);
    doc.roundedRect(ML, y, CW, 30, 2, 2, "F");
    y += 3;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Ready to Get Started?", ML + CW / 2, y + 6, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 210, 190);
    doc.text("Rooted 21 is designed for foster, adoptive, and kinship families navigating the child welfare system.", ML + CW / 2, y + 13, { align: "center" });
    doc.text("Learn how Rooted 21 can support your organization, family, or case.", ML + CW / 2, y + 17, { align: "center" });

    y += 32;

    addHeading("Contact Information", 12, DARK_GREEN);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT);
    doc.text("Website: www.rooted21.org", ML, y);
    y += 5;
    doc.text("Email: info@rooted21.org", ML, y);
    y += 5;
    doc.text("Phone: (555) 555-5555", ML, y);
    y += 8;

    addHeading("For Agencies & Professionals", 10.5, DARK_GREEN);
    addText("Request a demo or consultation to learn how Rooted 21 can integrate with your case management workflows.", 9, TEXT);
    y += 3;

    addHeading("For Families", 10.5, DARK_GREEN);
    addText("Join the waitlist to be notified when Rooted 21 launches in your area. Free and accessible to all families.", 9, TEXT);

    addPageFooter();

    const pdfBytes = doc.output("arraybuffer");
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    return Response.json({
      success: true,
      base64,
      fileName: `Rooted21-Professional-Overview-${new Date().toISOString().split("T")[0]}.pdf`,
    });
  } catch (error) {
    console.error("Error generating presentation PDF:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});