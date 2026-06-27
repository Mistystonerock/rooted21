create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('parent', 'staff', 'admin')),
  agency_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  caregiver_name text,
  primary_client_name text,
  case_note text,
  assigned_course_slug text,
  invited_staff_user_id uuid references auth.users(id) on delete set null,
  invite_code_used text,
  created_at timestamptz not null default now()
);

create unique index if not exists families_parent_user_id_idx
on public.families(parent_user_id);

create table if not exists public.family_children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_family_assignments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  staff_user_id uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (family_id, staff_user_id)
);

create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  staff_user_id uuid not null references auth.users(id) on delete cascade,
  agency_name text,
  assigned_course_slug text,
  is_active boolean not null default true,
  redeemed_by_parent_user_id uuid references auth.users(id) on delete set null,
  redeemed_family_id uuid references public.families(id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  day_number integer check (day_number between 1 and 21),
  session_title text,
  log_date date not null default current_date,
  what_happened text,
  connection_used text,
  reward_used text,
  follow_through text,
  learned text,
  tomorrow_focus text,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  session_title text,
  session_date date not null default current_date,
  status text,
  learned text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  assessment_type text,
  ratings jsonb not null default '{}'::jsonb,
  strengths text,
  growth_area text,
  family_change text,
  created_at timestamptz not null default now()
);

create table if not exists public.completion_records (
  family_id uuid primary key references public.families(id) on delete cascade,
  completed_sessions integer not null default 0,
  certificate_unlocked boolean not null default false,
  completed_at timestamptz,
  certificate_name text
);

create table if not exists public.family_messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('parent', 'staff', 'admin')),
  message_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.family_shared_goals (
  family_id uuid primary key references public.families(id) on delete cascade,
  goals jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.family_support_plans (
  family_id uuid primary key references public.families(id) on delete cascade,
  plan jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.family_schedule_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_by_role text not null check (created_by_role in ('parent', 'staff', 'admin', 'teacher')),
  event_type text,
  title text not null,
  event_date date not null,
  event_time text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.family_documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  uploaded_by_user_id uuid not null references auth.users(id) on delete cascade,
  uploaded_by_role text not null check (uploaded_by_role in ('parent', 'staff', 'admin', 'teacher')),
  document_type text,
  file_name text not null,
  file_size bigint,
  mime_type text,
  storage_bucket text not null default 'family-documents',
  storage_path text not null,
  notes text,
  visible_to_parent boolean not null default true,
  visible_to_staff boolean not null default true,
  visible_to_teacher boolean not null default false,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('family-documents', 'family-documents', false)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_children enable row level security;
alter table public.staff_family_assignments enable row level security;
alter table public.invite_codes enable row level security;
alter table public.daily_logs enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.assessment_submissions enable row level security;
alter table public.completion_records enable row level security;
alter table public.family_messages enable row level security;
alter table public.family_shared_goals enable row level security;
alter table public.family_support_plans enable row level security;
alter table public.family_schedule_events enable row level security;
alter table public.family_documents enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "families_parent_full_access" on public.families;
create policy "families_parent_full_access"
on public.families
for all
to authenticated
using (parent_user_id = auth.uid())
with check (parent_user_id = auth.uid());

drop policy if exists "families_staff_read_only" on public.families;
create policy "families_staff_read_only"
on public.families
for select
to authenticated
using (
  invited_staff_user_id = auth.uid()
  or exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = families.id
      and sfa.staff_user_id = auth.uid()
  )
);

drop policy if exists "children_parent_full_access" on public.family_children;
create policy "children_parent_full_access"
on public.family_children
for all
to authenticated
using (
  exists (
    select 1
    from public.families f
    where f.id = family_children.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.families f
    where f.id = family_children.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "children_staff_read_only" on public.family_children;
create policy "children_staff_read_only"
on public.family_children
for select
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_children.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1
    from public.families f
    where f.id = family_children.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "staff_assignments_self_read" on public.staff_family_assignments;
create policy "staff_assignments_self_read"
on public.staff_family_assignments
for select
to authenticated
using (staff_user_id = auth.uid());

drop policy if exists "staff_assignments_parent_invite_insert" on public.staff_family_assignments;
create policy "staff_assignments_parent_invite_insert"
on public.staff_family_assignments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.families f
    where f.id = staff_family_assignments.family_id
      and f.parent_user_id = auth.uid()
      and f.invited_staff_user_id = staff_family_assignments.staff_user_id
  )
);

drop policy if exists "invite_codes_staff_manage" on public.invite_codes;
create policy "invite_codes_staff_manage"
on public.invite_codes
for all
to authenticated
using (staff_user_id = auth.uid())
with check (staff_user_id = auth.uid());

drop policy if exists "invite_codes_parent_lookup" on public.invite_codes;
create policy "invite_codes_parent_lookup"
on public.invite_codes
for select
to authenticated
using (is_active = true);

drop policy if exists "invite_codes_parent_redeem" on public.invite_codes;
create policy "invite_codes_parent_redeem"
on public.invite_codes
for update
to authenticated
using (is_active = true and redeemed_by_parent_user_id is null)
with check (redeemed_by_parent_user_id = auth.uid());

drop policy if exists "daily_logs_parent_full_access" on public.daily_logs;
create policy "daily_logs_parent_full_access"
on public.daily_logs
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = daily_logs.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = daily_logs.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "daily_logs_staff_read_only" on public.daily_logs;
create policy "daily_logs_staff_read_only"
on public.daily_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = daily_logs.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = daily_logs.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "attendance_parent_full_access" on public.attendance_logs;
create policy "attendance_parent_full_access"
on public.attendance_logs
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = attendance_logs.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = attendance_logs.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "attendance_staff_read_only" on public.attendance_logs;
create policy "attendance_staff_read_only"
on public.attendance_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = attendance_logs.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = attendance_logs.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "assessment_parent_full_access" on public.assessment_submissions;
create policy "assessment_parent_full_access"
on public.assessment_submissions
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = assessment_submissions.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = assessment_submissions.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "assessment_staff_read_only" on public.assessment_submissions;
create policy "assessment_staff_read_only"
on public.assessment_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = assessment_submissions.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = assessment_submissions.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "completion_parent_full_access" on public.completion_records;
create policy "completion_parent_full_access"
on public.completion_records
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = completion_records.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = completion_records.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "completion_staff_read_only" on public.completion_records;
create policy "completion_staff_read_only"
on public.completion_records
for select
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = completion_records.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = completion_records.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "messages_parent_full_access" on public.family_messages;
create policy "messages_parent_full_access"
on public.family_messages
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = family_messages.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = family_messages.family_id
      and f.parent_user_id = auth.uid()
  )
  and sender_user_id = auth.uid()
  and sender_role = 'parent'
);

drop policy if exists "messages_staff_read_write" on public.family_messages;
create policy "messages_staff_read_write"
on public.family_messages
for all
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_messages.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_messages.family_id
      and f.invited_staff_user_id = auth.uid()
  )
)
with check (
  (
    exists (
      select 1
      from public.staff_family_assignments sfa
      where sfa.family_id = family_messages.family_id
        and sfa.staff_user_id = auth.uid()
    )
    or exists (
      select 1 from public.families f
      where f.id = family_messages.family_id
        and f.invited_staff_user_id = auth.uid()
    )
  )
  and sender_user_id = auth.uid()
  and sender_role in ('staff', 'admin')
);

drop policy if exists "shared_goals_parent_full_access" on public.family_shared_goals;
create policy "shared_goals_parent_full_access"
on public.family_shared_goals
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = family_shared_goals.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = family_shared_goals.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "shared_goals_staff_read_write" on public.family_shared_goals;
create policy "shared_goals_staff_read_write"
on public.family_shared_goals
for all
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_shared_goals.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_shared_goals.family_id
      and f.invited_staff_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_shared_goals.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_shared_goals.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "support_plan_parent_full_access" on public.family_support_plans;
create policy "support_plan_parent_full_access"
on public.family_support_plans
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = family_support_plans.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = family_support_plans.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "support_plan_staff_read_write" on public.family_support_plans;
create policy "support_plan_staff_read_write"
on public.family_support_plans
for all
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_support_plans.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_support_plans.family_id
      and f.invited_staff_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_support_plans.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_support_plans.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "schedule_parent_full_access" on public.family_schedule_events;
create policy "schedule_parent_full_access"
on public.family_schedule_events
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = family_schedule_events.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = family_schedule_events.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "schedule_staff_read_write" on public.family_schedule_events;
create policy "schedule_staff_read_write"
on public.family_schedule_events
for all
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_schedule_events.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_schedule_events.family_id
      and f.invited_staff_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_schedule_events.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_schedule_events.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "documents_parent_full_access" on public.family_documents;
create policy "documents_parent_full_access"
on public.family_documents
for all
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = family_documents.family_id
      and f.parent_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = family_documents.family_id
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "documents_staff_read_write" on public.family_documents;
create policy "documents_staff_read_write"
on public.family_documents
for all
to authenticated
using (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_documents.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_documents.family_id
      and f.invited_staff_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.staff_family_assignments sfa
    where sfa.family_id = family_documents.family_id
      and sfa.staff_user_id = auth.uid()
  )
  or exists (
    select 1 from public.families f
    where f.id = family_documents.family_id
      and f.invited_staff_user_id = auth.uid()
  )
);

drop policy if exists "family_documents_storage_parent_access" on storage.objects;
create policy "family_documents_storage_parent_access"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'family-documents'
  and exists (
    select 1
    from public.families f
    where f.id::text = split_part(name, '/', 1)
      and f.parent_user_id = auth.uid()
  )
)
with check (
  bucket_id = 'family-documents'
  and exists (
    select 1
    from public.families f
    where f.id::text = split_part(name, '/', 1)
      and f.parent_user_id = auth.uid()
  )
);

drop policy if exists "family_documents_storage_staff_access" on storage.objects;
create policy "family_documents_storage_staff_access"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'family-documents'
  and (
    exists (
      select 1
      from public.staff_family_assignments sfa
      where sfa.family_id::text = split_part(name, '/', 1)
        and sfa.staff_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.families f
      where f.id::text = split_part(name, '/', 1)
        and f.invited_staff_user_id = auth.uid()
    )
  )
)
with check (
  bucket_id = 'family-documents'
  and (
    exists (
      select 1
      from public.staff_family_assignments sfa
      where sfa.family_id::text = split_part(name, '/', 1)
        and sfa.staff_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.families f
      where f.id::text = split_part(name, '/', 1)
        and f.invited_staff_user_id = auth.uid()
    )
  )
);
