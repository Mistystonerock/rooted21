import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function isThisWeek(item, since) {
  return item?.created_date && new Date(item.created_date) >= since;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    let created = 0;

    for (const user of users.filter(u => u.email)) {
      const [lessons, checkins, visits, tasks] = await Promise.all([
        base44.asServiceRole.entities.LessonProgress.filter({ created_by: user.email, completed: true }, '-created_date', 100),
        base44.asServiceRole.entities.CheckIn.filter({ created_by: user.email }, '-created_date', 100),
        base44.asServiceRole.entities.VisitationLog.filter({ created_by: user.email }, '-created_date', 100),
        base44.asServiceRole.entities.CaseTask.filter({ created_by: user.email, status: 'completed' }, '-created_date', 100),
      ]);

      const weekLessons = lessons.filter(item => isThisWeek(item, sevenDaysAgo)).length;
      const weekCheckins = checkins.filter(item => isThisWeek(item, sevenDaysAgo)).length;
      const weekVisits = visits.filter(item => isThisWeek(item, sevenDaysAgo)).length;
      const weekTasks = tasks.filter(item => isThisWeek(item, sevenDaysAgo)).length;

      if (weekLessons + weekCheckins + weekVisits + weekTasks === 0) continue;

      const wins = [
        weekLessons ? `${weekLessons} lesson${weekLessons === 1 ? '' : 's'} completed` : null,
        weekTasks ? `${weekTasks} case-plan task${weekTasks === 1 ? '' : 's'} completed` : null,
        weekVisits ? `${weekVisits} visitation log${weekVisits === 1 ? '' : 's'} saved` : null,
        weekCheckins ? `${weekCheckins} daily check-in${weekCheckins === 1 ? '' : 's'} recorded` : null,
      ].filter(Boolean);

      await base44.asServiceRole.entities.Notification.create({
        user_email: user.email,
        type: 'progress',
        title: 'Your weekly progress summary',
        body: `Here’s what you accomplished this week: ${wins.join(', ')}. Great job — every step counts.`,
        related_link: '/progress',
        read: false,
      });
      created++;
    }

    return Response.json({ success: true, notifications_created: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});