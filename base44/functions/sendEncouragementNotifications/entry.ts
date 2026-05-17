import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MESSAGES = [
  'You are doing meaningful work. Take one kind breath for yourself today.',
  'You are an amazing parent. Remember to take time for yourself today.',
  'Small steady steps still count. You do not have to do everything at once.',
  'Your care, your notes, and your voice matter. Keep going.',
  'Rest is not quitting. Rest helps you keep showing up.'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const message = MESSAGES[new Date().getDay() % MESSAGES.length];
    let created = 0;

    for (const user of users.filter(u => u.email)) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: user.email,
        type: 'encouragement',
        title: 'A note from Moxie',
        body: message,
        related_link: '/well-being-toolkit',
        read: false,
      });
      created++;
    }

    return Response.json({ success: true, notifications_created: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});