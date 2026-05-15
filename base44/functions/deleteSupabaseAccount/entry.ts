import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const DATA_TABLES = [
  'messages',
  'co_parent_partnerships',
  'behavior_logs',
  'daily_checkins',
  'safety_plans',
  'child_profiles',
  'user_profiles',
  'journal_entries',
  'lesson_progress',
  'goals',
  'calendar_events',
  'care_calendar_events',
  'secure_documents',
  'parent_journals',
  'check_ins',
  'behavior_logs',
  'case_tasks',
  'family_events',
  'notifications'
];

const USER_COLUMNS = [
  'user_id',
  'id',
  'profile_id',
  'parent_id',
  'sender_id',
  'recipient_id',
  'created_by_id',
  'owner_id'
];

const EMAIL_COLUMNS = [
  'email',
  'user_email',
  'parent_email',
  'family_email',
  'created_by',
  'owner_email',
  'sender_email',
  'recipient_email',
  'parent_1_email',
  'parent_2_email'
];

async function deleteMatchingRows(supabase, table, userId, email) {
  const attempts = [];

  if (userId) {
    for (const column of USER_COLUMNS) {
      attempts.push(supabase.from(table).delete().eq(column, userId));
    }
  }

  if (email) {
    for (const column of EMAIL_COLUMNS) {
      attempts.push(supabase.from(table).delete().eq(column, email));
    }
  }

  await Promise.all(attempts.map(async promise => {
    const { error } = await promise;
    if (error && !/column|schema|relation|does not exist|not found/i.test(error.message || '')) {
      console.warn(`Delete warning for ${table}: ${error.message}`);
    }
  }));
}

async function findAuthUserId(supabase, email, providedUserId) {
  if (providedUserId) return providedUserId;
  if (!email) return null;

  let page = 1;
  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data?.users?.find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (!data?.users?.length || data.users.length < 1000) break;
    page += 1;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { confirmText, supabaseUserId } = await req.json();
    if (confirmText !== 'DELETE') {
      return Response.json({ error: 'Type DELETE to confirm account deletion.' }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const email = user.email;
    const authUserId = await findAuthUserId(supabase, email, supabaseUserId);

    await Promise.all([...new Set(DATA_TABLES)].map(table => deleteMatchingRows(supabase, table, authUserId, email)));

    if (authUserId) {
      const { error } = await supabase.auth.admin.deleteUser(authUserId);
      if (error && !/not found/i.test(error.message || '')) {
        throw error;
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Account deletion failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});