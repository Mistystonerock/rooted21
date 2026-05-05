import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all tasks due in the next 24 hours that haven't been reminded
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const today = new Date().toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const tasksToRemind = await base44.asServiceRole.entities.CaseTask.filter({
      status: { $in: ["open", "in_progress"] },
      reminder_sent: false,
    }, "-due_date", 500);

    const tasksNeedingReminder = tasksToRemind.filter(task => {
      const dueDate = task.due_date;
      return dueDate >= today && dueDate <= tomorrowStr;
    });

    let remindersCount = 0;

    for (const task of tasksNeedingReminder) {
      try {
        // Create notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: task.assigned_to_email,
          type: "appointment",
          title: `Task Due Tomorrow: ${task.title}`,
          body: `"${task.title}" is due tomorrow. Assigned by ${task.assigned_by_name}.`,
          related_id: task.id,
          related_link: `/case-detail/${task.case_id}`,
          read: false,
        });

        // Mark as reminded
        await base44.asServiceRole.entities.CaseTask.update(task.id, {
          reminder_sent: true,
        });

        remindersCount++;
      } catch (err) {
        console.error(`Error sending reminder for task ${task.id}:`, err);
      }
    }

    return Response.json({
      success: true,
      reminders_sent: remindersCount,
      tasks_checked: tasksNeedingReminder.length,
    });
  } catch (error) {
    console.error('Error in sendTaskReminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});