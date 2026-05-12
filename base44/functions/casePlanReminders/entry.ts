import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Look ahead 3 days for upcoming due dates
    const threeDaysOut = new Date();
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);
    const threeDaysStr = threeDaysOut.toISOString().split('T')[0];

    // Fetch all active checklists
    const checklists = await base44.asServiceRole.entities.CasePlanChecklist.filter(
      { status: 'active' }, '-created_date', 500
    );

    let notificationsCreated = 0;

    for (const cl of checklists) {
      const items = cl.items || [];
      const dueSoon = items.filter(item => {
        if (item.completed || !item.due_date) return false;
        return item.due_date >= todayStr && item.due_date <= threeDaysStr;
      });
      const overdue = items.filter(item => {
        if (item.completed || !item.due_date) return false;
        return item.due_date < todayStr;
      });

      for (const item of dueSoon) {
        const dueDate = new Date(item.due_date + 'T12:00:00');
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const label = daysLeft === 0 ? 'due TODAY' : daysLeft === 1 ? 'due tomorrow' : `due in ${daysLeft} days`;

        await base44.asServiceRole.entities.Notification.create({
          user_email: cl.parent_email,
          type: 'appointment',
          title: `Case Plan Task ${label.toUpperCase()}`,
          body: `"${item.text}" from your case plan "${cl.title}" is ${label}.`,
          related_id: cl.id,
          related_link: '/case-plan-checklist',
          read: false,
        });
        notificationsCreated++;
      }

      for (const item of overdue) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: cl.parent_email,
          type: 'appointment',
          title: `⚠️ Overdue Case Plan Task`,
          body: `"${item.text}" from "${cl.title}" is past its due date. Complete it as soon as possible.`,
          related_id: cl.id,
          related_link: '/case-plan-checklist',
          read: false,
        });
        notificationsCreated++;
      }
    }

    return Response.json({ success: true, notifications_created: notificationsCreated, checklists_checked: checklists.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});