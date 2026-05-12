import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.2.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { parent_email } = await req.json();
    if (!parent_email) {
      return Response.json({ error: 'parent_email required' }, { status: 400 });
    }

    // Fetch parent info
    const parentUsers = await base44.asServiceRole.entities.User.filter({ email: parent_email }, "", 1);
    if (parentUsers.length === 0) {
      return Response.json({ error: 'Parent not found' }, { status: 404 });
    }
    const parent = parentUsers[0];

    // Fetch completed milestones
    const milestones = await base44.asServiceRole.entities.ParentMilestone.filter(
      { user_email: parent_email, completed: true },
      "-completed_date",
      100
    );

    // Fetch case plan checklists
    const casePlans = await base44.asServiceRole.entities.CasePlanChecklist.filter(
      { parent_email: parent_email },
      "-created_date",
      100
    );

    // Calculate completion percentage
    let totalItems = 0;
    let completedItems = 0;
    casePlans.forEach(plan => {
      if (plan.items) {
        totalItems += plan.items.length;
        completedItems += plan.items.filter(item => item.completed).length;
      }
    });
    const completionPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Generate PDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Dimensions
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Background gradient effect (create with subtle colors)
    doc.setFillColor(13, 42, 24); // Dark green background
    doc.rect(0, 0, width, height, 'F');

    // Gold border
    doc.setDrawColor(201, 151, 58);
    doc.setLineWidth(3);
    doc.rect(margin - 5, margin - 5, width - (margin - 5) * 2, height - (margin - 5) * 2);

    // Inner decorative border
    doc.setLineWidth(1);
    doc.setDrawColor(72, 209, 122);
    doc.rect(margin, margin, width - margin * 2, height - margin * 2);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(201, 151, 58); // Gold
    doc.setFontSize(36);
    doc.text('CERTIFICATE OF PROGRESS', width / 2, margin + 25, { align: 'center' });

    // Subtitle
    doc.setTextColor(248, 241, 207); // Light cream
    doc.setFontSize(12);
    doc.text('Rooted 21 Parenting Network', width / 2, margin + 40, { align: 'center' });

    // This certifies that...
    doc.setFontSize(11);
    doc.setTextColor(230, 216, 184);
    doc.text('This certifies that', width / 2, margin + 55, { align: 'center' });

    // Parent name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(201, 151, 58);
    doc.text(parent.full_name || 'Parent', width / 2, margin + 70, { align: 'center' });

    // Achievement text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(230, 216, 184);
    const achievementText = `has demonstrated remarkable dedication and progress in their parenting journey. Through consistent engagement with their case plan and milestones, this parent has shown unwavering commitment to their family's wellbeing and growth.`;
    doc.text(achievementText, margin + 10, margin + 88, { maxWidth: width - (margin + 10) * 2, align: 'center' });

    // Stats section
    doc.setFontSize(10);
    doc.setTextColor(72, 209, 122);
    doc.text(`Completed Milestones: ${milestones.length}`, margin + 15, margin + 120);
    doc.text(`Case Plan Completion: ${completionPct}%`, margin + 15, margin + 128);
    doc.text(`Active Case Plans: ${casePlans.length}`, margin + 15, margin + 136);

    // Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(230, 216, 184);
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Issued: ${today}`, width - margin - 20, height - margin - 30, { align: 'right' });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(191, 175, 138);
    doc.text('Rooted 21 recognizes and celebrates the resilience of parents navigating hard systems.', width / 2, height - margin + 5, { align: 'center' });

    // Generate PDF as blob and return
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${parent.full_name}_progress_certificate.pdf"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});