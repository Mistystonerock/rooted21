import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.2.1';

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 6) {
  const lines = doc.splitTextToSize(String(text || 'Not provided'), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function ensurePage(doc, y) {
  if (y > 265) {
    doc.addPage();
    return 20;
  }
  return y;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Family Safety and Crisis Plan', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Prepared for: ${data.childName || 'Family / Child'}`, margin, y);
    y += 5;
    doc.text(`Prepared by: ${user.full_name || user.email}`, margin, y);
    y += 5;
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, margin, y);
    y += 10;

    doc.setFillColor(240, 246, 240);
    doc.rect(margin, y, contentWidth, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Purpose', margin + 3, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Use this plan with school staff, CPS, medical providers, and emergency responders.', margin + 3, y + 12);
    y += 24;

    const sections = [
      ['Child / Family Information', [
        ['Child name', data.childName],
        ['Date of birth / age', data.childAge],
        ['Primary caregiver', data.caregiverName],
        ['Address / safe location', data.safeLocation],
      ]],
      ['Emergency Contacts', [
        ['Primary emergency contact', data.primaryContact],
        ['Secondary emergency contact', data.secondaryContact],
        ['Doctor / pediatrician', data.doctorContact],
        ['Therapist / counselor', data.therapistContact],
        ['Caseworker / agency contact', data.caseworkerContact],
      ]],
      ['Medical Needs and Safety Notes', [
        ['Diagnoses / medical conditions', data.medicalConditions],
        ['Medications', data.medications],
        ['Allergies', data.allergies],
        ['Medical equipment or special instructions', data.medicalInstructions],
      ]],
      ['Behavioral / Emotional Triggers', [
        ['Known triggers', data.triggers],
        ['Early warning signs', data.warningSigns],
        ['Behaviors adults may see during crisis', data.crisisBehaviors],
      ]],
      ['Calming Strategies That Help', [
        ['Preferred calming tools', data.calmingTools],
        ['Helpful adult responses', data.helpfulResponses],
        ['Words or actions to avoid', data.avoidResponses],
        ['Safe de-escalation steps', data.deescalationSteps],
      ]],
      ['Emergency Response Instructions', [
        ['When to call caregiver', data.callCaregiverWhen],
        ['When to call 911 / emergency services', data.call911When],
        ['Transport / restraint cautions', data.restraintCautions],
        ['Other critical notes', data.additionalNotes],
      ]],
    ];

    for (const [title, fields] of sections) {
      y = ensurePage(doc, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(25, 82, 43);
      doc.text(title, margin, y);
      y += 7;
      doc.setTextColor(0, 0, 0);

      for (const [label, value] of fields) {
        y = ensurePage(doc, y);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${label}:`, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        y = addWrappedText(doc, value, margin + 2, y, contentWidth - 2, 5.5) + 3;
      }
      y += 3;
    }

    y = ensurePage(doc, y);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    addWrappedText(doc, 'This plan is a communication tool and does not replace medical, legal, mental health, or emergency advice. In immediate danger, call 911. For mental health crisis support, call or text 988.', margin, y, contentWidth, 4.5);

    const dataUri = doc.output('datauristring');
    const base64 = dataUri.split(',')[1];
    const fileName = `family-safety-crisis-plan-${(data.childName || 'family').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;

    return Response.json({ fileName, base64 });
  } catch (error) {
    console.error('Family safety plan generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});