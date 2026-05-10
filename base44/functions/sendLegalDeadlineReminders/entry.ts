import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.list("-created_date", 1000);

    const remindersSent = [];

    for (const user of users) {
      if (!user.email) continue;

      // Fetch user's events
      const [caseFiles, caseTasks, courtAppointments, visitationLogs] = await Promise.all([
        base44.asServiceRole.entities.CaseFile.filter({ parent_email: user.email }, "-created_date", 50),
        base44.asServiceRole.entities.CaseTask.filter({ assigned_by_email: user.email }, "-due_date", 100),
        base44.asServiceRole.entities.CourtAppointment.filter({ parent_email: user.email }, "-created_date", 50),
        base44.asServiceRole.entities.VisitationLog.filter({ parent_email: user.email }, "-visit_date", 100),
      ]);

      const reminders = [];
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const sevenDaysOut = new Date(now);
      sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

      // Check court deadlines (remind at 7 days, 1 day)
      caseFiles.forEach(cf => {
        if (cf.next_milestone_date) {
          const eventDate = new Date(cf.next_milestone_date);
          const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

          if (daysUntil === 7 || daysUntil === 1) {
            reminders.push({
              type: "court_deadline",
              title: `${cf.child_name} — ${cf.next_milestone}`,
              date: cf.next_milestone_date,
              daysUntil,
              priority: "high",
            });
          }
        }
      });

      // Check visitations (remind at 2 hours, 1 day)
      visitationLogs.forEach(v => {
        const eventDate = new Date(`${v.visit_date}T${v.visit_time || "09:00"}`);
        const minutesUntil = (eventDate - now) / (1000 * 60);

        if (minutesUntil > 0 && (minutesUntil <= 120 || (minutesUntil > 1200 && minutesUntil <= 1440))) {
          reminders.push({
            type: "visitation",
            title: `Visitation with ${v.visitor_name} — ${v.child_name}`,
            date: v.visit_date,
            time: v.visit_time,
            location: v.location,
            minutesUntil,
          });
        }
      });

      // Check case tasks due soon (remind at 1 day, 3 days)
      caseTasks.forEach(t => {
        if (t.due_date && t.status !== "completed" && t.status !== "cancelled") {
          const eventDate = new Date(t.due_date);
          const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

          if (daysUntil === 1 || daysUntil === 3) {
            reminders.push({
              type: "task",
              title: t.title,
              case_name: t.case_name,
              date: t.due_date,
              priority: t.priority,
              daysUntil,
            });
          }
        }
      });

      // Check court appointments (remind at 3 days, 1 day)
      courtAppointments.forEach(ca => {
        if (ca.court_date) {
          const eventDate = new Date(ca.court_date);
          const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

          if (daysUntil === 3 || daysUntil === 1) {
            reminders.push({
              type: "court_deadline",
              title: `Court Hearing — ${ca.case_name || "Scheduled"}`,
              date: ca.court_date,
              time: ca.time,
              location: ca.location,
              daysUntil,
              priority: "high",
            });
          }
        }
      });

      // Send reminders via SMS and email
      if (reminders.length > 0) {
        for (const reminder of reminders) {
          // Send SMS if user opted in and has reminder preference
          const smsMessage = formatReminderSMS(reminder);

          // Call sendSmsReminders function via asServiceRole
          await base44.asServiceRole.functions.invoke("sendSmsReminders", {
            user_email: user.email,
            user_phone: user.phone || null,
            message: smsMessage,
            reminder_type: reminder.type,
          });

          remindersSent.push({
            user_email: user.email,
            reminder_type: reminder.type,
            title: reminder.title,
            sent_at: new Date().toISOString(),
          });
        }
      }
    }

    return Response.json({
      success: true,
      reminders_sent: remindersSent.length,
      details: remindersSent,
    });
  } catch (error) {
    console.error("Reminder send error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function formatReminderSMS(reminder) {
  const dateStr = new Date(reminder.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  let message = "";
  if (reminder.type === "court_deadline") {
    message = `⚖️ COURT REMINDER: ${reminder.title} on ${dateStr}. Mark your calendar.`;
  } else if (reminder.type === "visitation") {
    message = `👥 VISITATION: ${reminder.title} ${reminder.time ? `at ${reminder.time}` : ""} ${
      reminder.location ? `at ${reminder.location}` : ""
    }.`;
  } else if (reminder.type === "task") {
    message = `✓ TASK DUE: ${reminder.title} for ${reminder.case_name} — due ${dateStr}.`;
  }

  return message;
}