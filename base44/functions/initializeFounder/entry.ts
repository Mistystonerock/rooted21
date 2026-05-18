import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOUNDER_EMAIL = 'misty.stonerock88@gmail.com';
const FOUNDER_NAME = 'Misty Stonerock';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isFounderAccount = user.email?.toLowerCase() === FOUNDER_EMAIL;

    if (isFounderAccount && user.role !== 'founder') {
      await base44.asServiceRole.entities.User.update(user.id, {
        role: 'founder',
        onboarding_completed: true,
        account_status: 'active',
      });

      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: 'founder',
        event_type: 'role_change',
        entity_name: 'User',
        entity_id: user.id,
        severity: 'critical',
        summary: `${FOUNDER_NAME} founder role initialized`,
        occurred_at: new Date().toISOString(),
      });
    }

    if (!isFounderAccount && user.role === 'founder') {
      await base44.asServiceRole.entities.User.update(user.id, { role: 'admin' });
      await base44.asServiceRole.entities.RootedAuditEvent.create({
        actor_email: user.email,
        actor_role: 'admin',
        event_type: 'security_alert',
        entity_name: 'User',
        entity_id: user.id,
        severity: 'critical',
        summary: 'Unauthorized founder role was removed from a non-founder account',
        occurred_at: new Date().toISOString(),
      });
      return Response.json({ success: true, is_founder: false, role: 'admin' });
    }

    return Response.json({
      success: true,
      is_founder: isFounderAccount,
      role: isFounderAccount ? 'founder' : user.role,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});