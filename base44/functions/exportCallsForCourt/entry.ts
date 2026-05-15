import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Generate court-ready PDF export of all co-parenting calls
 * Includes transcripts, tone analysis, and court summaries
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partnership_id } = await req.json();

    if (!partnership_id) {
      return Response.json(
        { error: 'Missing partnership_id' },
        { status: 400 }
      );
    }

    // Fetch partnership
    const partnerships = await base44.asServiceRole.entities.CoParentingPartnership.filter(
      { id: partnership_id },
      undefined,
      1
    );

    if (!partnerships.length) {
      return Response.json({ error: 'Partnership not found' }, { status: 404 });
    }

    const partnership = partnerships[0];
    const canAccess = partnership.parent_1_email === user.email || partnership.parent_2_email === user.email || partnership.court_email === user.email || user.role === 'founder';
    if (!canAccess) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all calls for this partnership
    const calls = await base44.asServiceRole.entities.CoParentingCall.filter(
      { partnership_id, status: 'ended' },
      '-start_time',
      1000
    );

    if (!calls.length) {
      return Response.json(
        { error: 'No completed calls found' },
        { status: 404 }
      );
    }

    // Generate PDF using jsPDF
    const { jsPDF } = await import('npm:jspdf@4.2.1');
    const doc = new jsPDF();

    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(13, 40, 24); // Dark green
    doc.text('Co-Parenting Call Records', margin, yPos);

    // Metadata
    yPos += 12;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Child: ${partnership.child_name}`, margin, yPos);
    yPos += 5;
    doc.text(`Date Range: ${new Date(calls[calls.length - 1].start_time).toLocaleDateString()} - ${new Date(calls[0].start_time).toLocaleDateString()}`, margin, yPos);
    yPos += 5;
    doc.text(`Total Calls: ${calls.length}`, margin, yPos);
    yPos += 5;
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);

    yPos += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Call summaries
    calls.forEach((call, index) => {
      yPos += 8;

      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      // Call header
      doc.setFontSize(11);
      doc.setTextColor(13, 40, 24);
      doc.setFont(undefined, 'bold');
      doc.text(`Call ${index + 1}: ${call.initiator_name} ↔ ${call.recipient_name}`, margin, yPos);

      yPos += 6;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);

      const startDate = new Date(call.start_time);
      const duration = Math.floor(call.duration_seconds / 60);
      const durationSecs = call.duration_seconds % 60;

      doc.text(`Date: ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}`, margin, yPos);
      yPos += 5;
      doc.text(`Duration: ${duration}m ${durationSecs}s`, margin, yPos);
      yPos += 5;
      doc.text(`Topic: ${call.topic}`, margin, yPos);
      yPos += 5;

      // Tension indicator
      if (call.tension_detected) {
        doc.setTextColor(184, 76, 42);
        doc.setFont(undefined, 'bold');
        doc.text(`⚠️ Tension Detected: ${call.tension_summary}`, margin, yPos);
        yPos += 5;
      }

      // Court summary (if available)
      if (call.transcript) {
        yPos += 3;
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.setFont(undefined, 'italic');
        const summaryLines = doc.splitTextToSize(
          `Transcript: ${call.transcript.substring(0, 300)}...`,
          pageWidth - margin * 2
        );
        summaryLines.forEach(line => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, margin, yPos);
          yPos += 4;
        });
      }

      // Court review status
      yPos += 2;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        call.read_by_court ? '✓ Court Reviewed' : '○ Pending Court Review',
        margin,
        yPos
      );

      yPos += 6;
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    });

    // Footer
    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This document contains recorded calls made within Rooted 21. All calls are timestamped, transcribed, and court-admissible.',
      margin,
      yPos,
      { maxWidth: pageWidth - margin * 2 }
    );

    const pdfBase64 = doc.output('dataurlstring').split(',')[1];

    return Response.json({
      success: true,
      base64: pdfBase64,
      fileName: `co-parenting-calls-${partnership.child_name}-${new Date().toISOString().split('T')[0]}.pdf`,
    });
  } catch (error) {
    console.error('Call export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});