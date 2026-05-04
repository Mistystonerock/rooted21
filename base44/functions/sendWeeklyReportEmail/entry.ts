import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch report data
    const [children, behaviors, lessons, checkins] = await Promise.all([
      base44.entities.ChildProfile.list('-created_date', 1),
      base44.entities.BehaviorLog.list('-created_date', 100),
      base44.entities.LessonProgress.filter({ completed: true }, '-created_date', 100),
      base44.entities.CheckIn.list('-created_date', 100),
    ]);

    const child = children[0];
    const weekBehaviors = behaviors.filter(b => new Date(b.created_date) >= sevenDaysAgo);
    const weekLessons = lessons.filter(l => new Date(l.created_date) >= sevenDaysAgo);
    const weekCheckins = checkins.filter(c => new Date(c.created_date) >= sevenDaysAgo);

    const avgChildReg = weekCheckins.length > 0
      ? (weekCheckins.reduce((sum, c) => sum + c.child_regulation, 0) / weekCheckins.length).toFixed(1)
      : 'N/A';
    const avgParentCalm = weekCheckins.length > 0
      ? (weekCheckins.reduce((sum, c) => sum + c.parent_calm, 0) / weekCheckins.length).toFixed(1)
      : 'N/A';

    // Get assignment and partnership
    const [assignments, partnerships] = await Promise.all([
      base44.entities.AssignedFamily.filter({ family_email: user.email }, '-created_date', 1),
      base44.entities.CoParentingPartnership.list('-created_date', 100),
    ]);

    const assignment = assignments[0];
    const partnership = partnerships.find(p => p.parent_1_email === user.email || p.parent_2_email === user.email);

    // Build recipients
    const recipients = [user.email];
    if (partnership) {
      const otherParent = partnership.parent_1_email === user.email
        ? partnership.parent_2_email
        : partnership.parent_1_email;
      if (!recipients.includes(otherParent)) recipients.push(otherParent);
    }
    if (assignment?.professional_email && !recipients.includes(assignment.professional_email)) {
      recipients.push(assignment.professional_email);
    }

    // Send emails
    const subject = `Weekly Report - ${child?.first_name || 'Child'} (${sevenDaysAgo.toISOString().split('T')[0]})`;
    const body = `Weekly Behavior Report

Child: ${child?.first_name || 'Child'}
Week: ${sevenDaysAgo.toLocaleDateString()} to ${now.toLocaleDateString()}

SUMMARY:
- Avg child regulation: ${avgChildReg}/5
- Your avg calm: ${avgParentCalm}/5
- Check-ins: ${weekCheckins.length}
- Behaviors logged: ${weekBehaviors.length}
- Lessons completed: ${weekLessons.length}

Login to Rooted 21 for full detailed report.

Rooted 21 Parenting Network`;

    for (const recipientEmail of recipients) {
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject,
        body,
        from_name: 'Rooted 21',
      });
    }

    return Response.json({ success: true, recipients: recipients.length });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});