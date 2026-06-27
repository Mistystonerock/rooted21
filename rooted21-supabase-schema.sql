create extension if not exists "pgcrypto";

do $$
begin
  create type public.rooted21_role as enum (
    'founder',
    'admin',
    'family',
    'caregiver',
    'professional'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.rooted21_professional_type as enum (
    'therapist',
    'cps',
    'court_legal',
    'school',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.rooted21_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.rooted21_role not null default 'family',
  display_name text,
  phone text,
  organization_name text,
  professional_type public.rooted21_professional_type,
  credentials text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooted21_families (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  caregiver_name text,
  household_summary text,
  county text default 'Ross County',
  state text default 'Ohio',
  privacy_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooted21_children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  first_name text not null,
  birth_month_year text,
  school_name text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.rooted21_case_plans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  title text not null,
  agency text,
  case_number text,
  start_date date,
  review_date date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooted21_case_tasks (
  id uuid primary key default gen_random_uuid(),
  case_plan_id uuid not null references public.rooted21_case_plans(id) on delete cascade,
  category text not null,
  title text not null,
  due_date date,
  completed_at timestamptz,
  evidence_document_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.rooted21_court_packets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  situation_type text not null,
  court_name text,
  hearing_date date,
  readiness_status text not null default 'getting_started',
  checklist jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooted21_behavior_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  child_id uuid references public.rooted21_children(id) on delete set null,
  incident_date date not null default current_date,
  what_happened text,
  what_happened_before text,
  child_response text,
  adult_response text,
  possible_trigger text,
  what_helped text,
  regulation_strategy text,
  ai_summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.rooted21_daily_checkins (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  checkin_date date not null default current_date,
  mood_level integer check (mood_level between 1 and 10),
  stress_level integer check (stress_level between 1 and 10),
  support_needed text,
  safety_concern boolean not null default false,
  reflection text,
  created_at timestamptz not null default now()
);

create table if not exists public.rooted21_class_progress (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  program_slug text not null default 'rooted-21-parenting',
  day_number integer not null check (day_number between 1 and 21),
  lesson_title text,
  completed_at timestamptz,
  quiz_score numeric,
  reflection text,
  unique (family_id, program_slug, day_number)
);

create table if not exists public.rooted21_resources (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  county text default 'Ross County',
  state text default 'Ohio',
  phone text,
  website text,
  address text,
  notes text,
  verification_status text not null default 'needs_review',
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooted21_documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  uploaded_by_user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  storage_bucket text not null default 'rooted21-documents',
  storage_path text not null,
  visible_to_professionals boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.rooted21_access_codes (
  id uuid primary key default gen_random_uuid(),
  professional_user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  professional_type public.rooted21_professional_type,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.rooted21_family_professional_links (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  professional_user_id uuid not null references auth.users(id) on delete cascade,
  access_code_id uuid references public.rooted21_access_codes(id) on delete set null,
  permissions jsonb not null default '{"progress": true, "behavior_logs": true, "documents": false, "reports": true}'::jsonb,
  approved_by_user_id uuid not null references auth.users(id) on delete cascade,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (family_id, professional_user_id)
);

create table if not exists public.rooted21_reports (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rooted21_families(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  reviewed_by_family boolean not null default false,
  exported_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.rooted21_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  family_id uuid references public.rooted21_families(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('rooted21-documents', 'rooted21-documents', false)
on conflict (id) do nothing;

alter table public.rooted21_profiles enable row level security;
alter table public.rooted21_families enable row level security;
alter table public.rooted21_children enable row level security;
alter table public.rooted21_case_plans enable row level security;
alter table public.rooted21_case_tasks enable row level security;
alter table public.rooted21_court_packets enable row level security;
alter table public.rooted21_behavior_logs enable row level security;
alter table public.rooted21_daily_checkins enable row level security;
alter table public.rooted21_class_progress enable row level security;
alter table public.rooted21_resources enable row level security;
alter table public.rooted21_documents enable row level security;
alter table public.rooted21_access_codes enable row level security;
alter table public.rooted21_family_professional_links enable row level security;
alter table public.rooted21_reports enable row level security;
alter table public.rooted21_audit_logs enable row level security;

create or replace function public.rooted21_is_founder()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'rooted21parenting@gmail.com'
$$;

create or replace function public.rooted21_is_admin_or_founder()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.rooted21_is_founder()
    or exists (
      select 1
      from public.rooted21_profiles p
      where p.user_id = auth.uid()
        and p.role in ('admin', 'founder')
        and p.is_active = true
    )
$$;

create or replace function public.rooted21_can_access_family(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.rooted21_is_admin_or_founder()
    or exists (
      select 1
      from public.rooted21_families f
      where f.id = target_family_id
        and f.owner_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.rooted21_family_professional_links l
      where l.family_id = target_family_id
        and l.professional_user_id = auth.uid()
        and l.revoked_at is null
    )
$$;

drop policy if exists "profiles_select_own_or_admin" on public.rooted21_profiles;
create policy "profiles_select_own_or_admin"
on public.rooted21_profiles
for select
to authenticated
using (user_id = auth.uid() or public.rooted21_is_admin_or_founder());

drop policy if exists "profiles_insert_own" on public.rooted21_profiles;
create policy "profiles_insert_own"
on public.rooted21_profiles
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    role in ('family', 'caregiver', 'professional')
    or public.rooted21_is_founder()
    or public.rooted21_is_admin_or_founder()
  )
);

drop policy if exists "profiles_update_own_or_admin" on public.rooted21_profiles;
create policy "profiles_update_own_or_admin"
on public.rooted21_profiles
for update
to authenticated
using (user_id = auth.uid() or public.rooted21_is_admin_or_founder())
with check (
  public.rooted21_is_admin_or_founder()
  or (
    user_id = auth.uid()
    and role in ('family', 'caregiver', 'professional')
  )
);

drop policy if exists "family_owner_or_admin_full" on public.rooted21_families;
create policy "family_owner_or_admin_full"
on public.rooted21_families
for all
to authenticated
using (owner_user_id = auth.uid() or public.rooted21_is_admin_or_founder())
with check (owner_user_id = auth.uid() or public.rooted21_is_admin_or_founder());

drop policy if exists "family_professional_read" on public.rooted21_families;
create policy "family_professional_read"
on public.rooted21_families
for select
to authenticated
using (public.rooted21_can_access_family(id));

drop policy if exists "children_family_access" on public.rooted21_children;
create policy "children_family_access"
on public.rooted21_children
for all
to authenticated
using (public.rooted21_can_access_family(family_id))
with check (public.rooted21_can_access_family(family_id));

drop policy if exists "case_plans_family_access" on public.rooted21_case_plans;
create policy "case_plans_family_access"
on public.rooted21_case_plans
for all
to authenticated
using (public.rooted21_can_access_family(family_id))
with check (public.rooted21_can_access_family(family_id));

drop policy if exists "case_tasks_family_access" on public.rooted21_case_tasks;
create policy "case_tasks_family_access"
on public.rooted21_case_tasks
for all
to authenticated
using (
  exists (
    select 1
    from public.rooted21_case_plans cp
    where cp.id = case_plan_id
      and public.rooted21_can_access_family(cp.family_id)
  )
)
with check (
  exists (
    select 1
    from public.rooted21_case_plans cp
    where cp.id = case_plan_id
      and public.rooted21_can_access_family(cp.family_id)
  )
);

drop policy if exists "court_packets_family_access" on public.rooted21_court_packets;
create policy "court_packets_family_access"
on public.rooted21_court_packets
for all
to authenticated
using (public.rooted21_can_access_family(family_id))
with check (public.rooted21_can_access_family(family_id));

drop policy if exists "behavior_logs_family_access" on public.rooted21_behavior_logs;
create policy "behavior_logs_family_access"
on public.rooted21_behavior_logs
for all
to authenticated
using (public.rooted21_can_access_family(family_id))
with check (public.rooted21_can_access_family(family_id));

drop policy if exists "daily_checkins_family_access" on public.rooted21_daily_checkins;
create policy "daily_checkins_family_access"
on public.rooted21_daily_checkins
for all
to authenticated
using (public.rooted21_can_access_family(family_id))
with check (public.rooted21_can_access_family(family_id));

drop policy if exists "class_progress_family_access" on public.rooted21_class_progress;
create policy "class_progress_family_access"
on public.rooted21_class_progress
for all
to authenticated
using (public.rooted21_can_access_family(family_id))
with check (public.rooted21_can_access_family(family_id));

drop policy if exists "documents_family_access" on public.rooted21_documents;
create policy "documents_family_access"
on public.rooted21_documents
for all
to authenticated
using (public.rooted21_can_access_family(family_id))
with check (public.rooted21_can_access_family(family_id));

drop policy if exists "reports_family_access" on public.rooted21_reports;
create policy "reports_family_access"
on public.rooted21_reports
for all
to authenticated
using (public.rooted21_can_access_family(family_id))
with check (public.rooted21_can_access_family(family_id));

drop policy if exists "links_family_or_professional_access" on public.rooted21_family_professional_links;
create policy "links_family_or_professional_access"
on public.rooted21_family_professional_links
for all
to authenticated
using (
  public.rooted21_can_access_family(family_id)
  or professional_user_id = auth.uid()
  or public.rooted21_is_admin_or_founder()
)
with check (
  public.rooted21_can_access_family(family_id)
  or professional_user_id = auth.uid()
  or public.rooted21_is_admin_or_founder()
);

drop policy if exists "access_codes_professional_or_admin" on public.rooted21_access_codes;
create policy "access_codes_professional_or_admin"
on public.rooted21_access_codes
for all
to authenticated
using (professional_user_id = auth.uid() or public.rooted21_is_admin_or_founder())
with check (professional_user_id = auth.uid() or public.rooted21_is_admin_or_founder());

drop policy if exists "resources_read_all_authenticated" on public.rooted21_resources;
create policy "resources_read_all_authenticated"
on public.rooted21_resources
for select
to authenticated
using (true);

drop policy if exists "resources_admin_write" on public.rooted21_resources;
create policy "resources_admin_write"
on public.rooted21_resources
for all
to authenticated
using (public.rooted21_is_admin_or_founder())
with check (public.rooted21_is_admin_or_founder());

drop policy if exists "audit_admin_read" on public.rooted21_audit_logs;
create policy "audit_admin_read"
on public.rooted21_audit_logs
for select
to authenticated
using (public.rooted21_is_admin_or_founder() or actor_user_id = auth.uid());

drop policy if exists "audit_authenticated_insert" on public.rooted21_audit_logs;
create policy "audit_authenticated_insert"
on public.rooted21_audit_logs
for insert
to authenticated
with check (actor_user_id = auth.uid() or public.rooted21_is_admin_or_founder());

create unique index if not exists rooted21_resources_unique_idx
on public.rooted21_resources(category, name, county, state);

insert into public.rooted21_resources (category, name, county, state, website, notes, verification_status)
values
  ('Food', 'Ross County food support placeholder', 'Ross County', 'Ohio', null, 'Replace with verified local food resources.', 'needs_review'),
  ('Housing', 'Ross County housing support placeholder', 'Ross County', 'Ohio', null, 'Replace with verified housing resources.', 'needs_review'),
  ('Legal Aid', 'Court support placeholder', 'Ross County', 'Ohio', null, 'Replace with official court and legal aid links.', 'needs_review'),
  ('Recovery', 'Recovery meeting support placeholder', 'Ross County', 'Ohio', null, 'Replace with verified recovery resources.', 'needs_review'),
  ('Domestic Violence', 'DV safety support placeholder', 'Ross County', 'Ohio', null, 'Replace with verified DV safety resources.', 'needs_review')
on conflict do nothing;
