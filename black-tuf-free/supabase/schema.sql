-- ============================================================
-- Black Tuf — Supabase schema
-- Run this in the Supabase SQL editor (once).
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  firebase_uid text unique,
  full_name text,
  email text,
  phone text,
  role text not null default 'client'
    check (role in ('client', 'admin', 'engineer')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile on first sign-up / first login.
-- Hybrid auth: the Supabase user is created server-side by the Firebase
-- bridge (via the admin API), which passes the Firebase UID, name, avatar
-- and role in raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, firebase_uid, full_name, email, phone, avatar_url, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'firebase_uid', ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('client', 'engineer', 'admin')
        then new.raw_user_meta_data ->> 'role'
      when exists (select 1 from public.profiles where role = 'admin') then 'client'
      else 'admin'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sync email / name updates from auth into the profile.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
    set email = new.email,
        full_name = coalesce(new.raw_user_meta_data ->> 'full_name', profiles.full_name)
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.sync_profile_email();

-- Admin check helper. SECURITY DEFINER so it can read profiles without
-- re-triggering the profiles RLS policies (avoids infinite recursion).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profile policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_select_admin_all" on public.profiles;
create policy "profiles_select_admin_all" on public.profiles
  for select using (
    public.is_admin()
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (
      -- normal users may never change their own role
      role = (select p.role from public.profiles p where p.id = auth.uid())
      or public.is_admin()
    )
  );

drop policy if exists "profiles_insert_trigger" on public.profiles;
create policy "profiles_insert_trigger" on public.profiles
  for insert with check (auth.uid() = id);

-- ------------------------------------------------------------
-- services (admin-managed service catalogue)
-- ------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  icon text,
  image_url text,
  price text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists "services_select_public" on public.services;
create policy "services_select_public" on public.services
  for select using (is_active or public.is_admin());

drop policy if exists "services_insert_admin" on public.services;
create policy "services_insert_admin" on public.services
  for insert with check (public.is_admin());

drop policy if exists "services_update_admin" on public.services;
create policy "services_update_admin" on public.services
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "services_delete_admin" on public.services;
create policy "services_delete_admin" on public.services
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- projects
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  engineer_id uuid references public.profiles (id) on delete set null,
  name text not null,
  service text not null,
  project_type text not null default 'online' check (project_type in ('online', 'on_site')),
  address text,
  city text,
  state text,
  pincode text,
  budget numeric(12,2),
  deadline date,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  description text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  has_sample boolean not null default false,
  is_published boolean not null default false,
  figma_link text,
  adobe_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- columns added later (kept idempotent for existing databases)
alter table public.projects add column if not exists city text;
alter table public.projects add column if not exists state text;
alter table public.projects add column if not exists pincode text;
alter table public.projects add column if not exists budget numeric(12,2);
alter table public.projects add column if not exists deadline date;
alter table public.projects add column if not exists priority text not null default 'medium' check (priority in ('high', 'medium', 'low'));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated on public.projects;
create trigger projects_touch_updated
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- project access helper used by many policies
create or replace function public.can_access_project(pid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid
      and (
        p.client_id = auth.uid()
        or p.engineer_id = auth.uid()
        or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role = 'admin')
      )
  );
$$;

-- Allow anyone (incl. anonymous) to read published case studies for the
-- public landing page. RLS is still enforced for everything else.
drop policy if exists "projects_select_public" on public.projects;
create policy "projects_select_public" on public.projects
  for select using (
    is_published
    and status = 'completed'
    and auth.role() in ('anon', 'authenticated')
  );

drop policy if exists "projects_select" on public.projects;
create policy "projects_select" on public.projects
  for select using (public.can_access_project(id));

-- Marketplace: engineers may browse published projects that are open to
-- proposals (status pending). Clients cannot see other clients' projects.
drop policy if exists "projects_select_marketplace" on public.projects;
create policy "projects_select_marketplace" on public.projects
  for select using (
    is_published
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'engineer'
    )
  );

drop policy if exists "projects_insert_client" on public.projects;
create policy "projects_insert_client" on public.projects
  for insert with check (
    -- admin may post a project for any client; clients can only self-serve
    public.is_admin()
    or (
      auth.uid() = client_id
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'client')
    )
  );

drop policy if exists "projects_update" on public.projects;
create policy "projects_update" on public.projects
  for update using (public.can_access_project(id))
  with check (public.can_access_project(id));

drop policy if exists "projects_delete_admin" on public.projects;
create policy "projects_delete_admin" on public.projects
  for delete using (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- project_files
-- ------------------------------------------------------------
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  file_type text not null default 'file',
  size integer not null default 0,
  storage_path text,
  created_at timestamptz not null default now()
);

alter table public.project_files enable row level security;

drop policy if exists "project_files_select" on public.project_files;
create policy "project_files_select" on public.project_files
  for select using (public.can_access_project(project_id));

drop policy if exists "project_files_insert" on public.project_files;
create policy "project_files_insert" on public.project_files
  for insert with check (
    auth.uid() = uploaded_by and public.can_access_project(project_id)
  );

drop policy if exists "project_files_delete" on public.project_files;
create policy "project_files_delete" on public.project_files
  for delete using (
    auth.uid() = uploaded_by
    or public.is_admin()
  );

-- ------------------------------------------------------------
-- messages (live chat scoped to a project)
-- ------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text,
  file_path text,
  file_name text,
  file_type text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages
  for select using (public.can_access_project(project_id));

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id and public.can_access_project(project_id)
  );

drop policy if exists "messages_update_read" on public.messages;
create policy "messages_update_read" on public.messages
  for update using (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

-- ------------------------------------------------------------
-- typing_indicator (realtime ephemeral presence)
-- ------------------------------------------------------------
create table if not exists public.typing_indicator (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  updated_at timestamptz not null default now()
);

alter table public.typing_indicator enable row level security;

drop policy if exists "typing_select" on public.typing_indicator;
create policy "typing_select" on public.typing_indicator
  for select using (public.can_access_project(project_id));

drop policy if exists "typing_upsert" on public.typing_indicator;
create policy "typing_upsert" on public.typing_indicator
  for insert with check (public.can_access_project(project_id) and auth.uid() = user_id);

drop policy if exists "typing_update" on public.typing_indicator;
create policy "typing_update" on public.typing_indicator
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "typing_delete" on public.typing_indicator;
create policy "typing_delete" on public.typing_indicator
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  type text not null default 'project_update'
    check (type in ('project_update', 'message', 'payment', 'visit', 'system')),
  project_id uuid references public.projects (id) on delete cascade,
  link text,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_select_admin_all" on public.notifications;
create policy "notifications_select_admin_all" on public.notifications
  for select using (
    public.is_admin()
  );

drop policy if exists "notifications_insert_any" on public.notifications;
create policy "notifications_insert_any" on public.notifications
  for insert with check (auth.uid() is not null);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete using (user_id = auth.uid());

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ------------------------------------------------------------
-- feedback
-- ------------------------------------------------------------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  communication integer check (communication between 1 and 5),
  quality integer check (quality between 1 and 5),
  delivery integer check (delivery between 1 and 5),
  support integer check (support between 1 and 5),
  comment text not null default '',
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (project_id, client_id)
);

alter table public.feedback enable row level security;

drop policy if exists "feedback_select" on public.feedback;
create policy "feedback_select" on public.feedback
  for select using (public.can_access_project(project_id));

drop policy if exists "feedback_insert_client" on public.feedback;
create policy "feedback_insert_client" on public.feedback
  for insert with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid()
    )
  );

drop policy if exists "feedback_select_public" on public.feedback;
create policy "feedback_select_public" on public.feedback
  for select using (is_approved and comment <> '' and auth.role() in ('anon', 'authenticated'));

drop policy if exists "feedback_update_own" on public.feedback;
create policy "feedback_update_own" on public.feedback
  for update using (auth.uid() = client_id) with check (auth.uid() = client_id);

drop policy if exists "feedback_update_admin" on public.feedback;
create policy "feedback_update_admin" on public.feedback
  for update using (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- site_visits
-- ------------------------------------------------------------
create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  engineer_id uuid references public.profiles (id) on delete set null,
  title text not null default 'Site visit',
  visit_date date,
  visit_time time,
  status text not null default 'requested'
    check (status in ('requested', 'scheduled', 'confirmed', 'completed', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_visits enable row level security;

drop trigger if exists site_visits_touch_updated on public.site_visits;
create trigger site_visits_touch_updated
  before update on public.site_visits
  for each row execute function public.touch_updated_at();

drop policy if exists "site_visits_select" on public.site_visits;
create policy "site_visits_select" on public.site_visits
  for select using (
    client_id = auth.uid()
    or engineer_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "site_visits_insert_client" on public.site_visits;
create policy "site_visits_insert_client" on public.site_visits
  for insert with check (
    auth.uid() = client_id
    and exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );

drop policy if exists "site_visits_update" on public.site_visits;
create policy "site_visits_update" on public.site_visits
  for update using (
    client_id = auth.uid()
    or engineer_id = auth.uid()
    or public.is_admin()
  );

-- ------------------------------------------------------------
-- invoices
-- ------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  invoice_number text not null,
  description text not null default '',
  amount numeric(14, 2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  due_date date,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

drop trigger if exists invoices_touch_updated on public.invoices;
create trigger invoices_touch_updated
  before update on public.invoices
  for each row execute function public.touch_updated_at();

drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select" on public.invoices
  for select using (public.can_access_project(project_id));

drop policy if exists "invoices_insert_admin" on public.invoices;
create policy "invoices_insert_admin" on public.invoices
  for insert with check (
    public.is_admin()
  );

drop policy if exists "invoices_update_admin" on public.invoices;
create policy "invoices_update_admin" on public.invoices
  for update using (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- Realtime — everything updates instantly
-- ------------------------------------------------------------
do $$
declare _t text;
begin
  foreach _t in array array[
    'public.projects',
    'public.project_files',
    'public.messages',
    'public.typing_indicator',
    'public.notifications',
    'public.feedback',
    'public.site_visits',
    'public.invoices'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname || '.' || tablename = _t
    ) then
      execute format('alter publication supabase_realtime add table %s', _t);
    end if;
  end loop;
end $$;

-- ------------------------------------------------------------
-- Storage buckets
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false),
  ('project-files', 'project-files', false),
  ('quotations', 'quotations', false),
  ('invoices', 'invoices', false)
on conflict (id) do nothing;

drop policy if exists "storage_read_own_folder" on storage.objects;
create policy "storage_read_own_folder" on storage.objects
  for select using (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "storage_upload_avatars" on storage.objects;
create policy "storage_upload_avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "storage_project_files_select" on storage.objects;
create policy "storage_project_files_select" on storage.objects
  for select using (
    bucket_id in ('project-files', 'quotations', 'invoices')
    and auth.role() = 'authenticated'
  );

drop policy if exists "storage_project_files_insert" on storage.objects;
create policy "storage_project_files_insert" on storage.objects
  for insert with check (
    bucket_id in ('avatars', 'project-files', 'quotations', 'invoices')
    and auth.role() = 'authenticated'
  );

create or replace function public.notify_admins_new_project()
returns trigger
language plpgsql
as $$
begin
  insert into public.notifications (user_id, title, body, type, project_id)
  select p.id, 'New project',
         'A new project "' || new.name || '" was created.',
         'project_update', new.id
  from public.profiles p
  where p.role = 'admin';
  return new;
end;
$$;

drop trigger if exists projects_notify_admin on public.projects;
create trigger projects_notify_admin
  after insert on public.projects
  for each row execute function public.notify_admins_new_project();

create or replace function public.notify_message_recipients()
returns trigger
language plpgsql
as $$
begin
  insert into public.notifications (user_id, title, body, type, project_id)
  select p.id, 'New message', 'You have a new message in "' || (
      select name from public.projects where id = new.project_id
    ) || '".', 'message', new.project_id
  from public.profiles p
  where p.id in (
      (select client_id from public.projects where id = new.project_id),
      (select engineer_id from public.projects where id = new.project_id)
    )
    and p.id <> new.sender_id;
  return new;
end;
$$;

drop trigger if exists messages_notify_recipients on public.messages;
create trigger messages_notify_recipients
  after insert on public.messages
  for each row execute function public.notify_message_recipients();

-- ------------------------------------------------------------
-- blog_posts — public blog content managed from the admin CMS
-- ------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  author_id uuid references public.profiles (id) on delete set null,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_select_public" on public.blog_posts;
create policy "blog_posts_select_public" on public.blog_posts
  for select using (is_published and published_at is not null);

drop policy if exists "blog_posts_select_admin_all" on public.blog_posts;
create policy "blog_posts_select_admin_all" on public.blog_posts
  for select using (
    public.is_admin()
  );

drop policy if exists "blog_posts_insert_admin" on public.blog_posts;
create policy "blog_posts_insert_admin" on public.blog_posts
  for insert with check (
    public.is_admin()
  );

drop policy if exists "blog_posts_update_admin" on public.blog_posts;
create policy "blog_posts_update_admin" on public.blog_posts
  for update using (
    public.is_admin()
  );

drop policy if exists "blog_posts_delete_admin" on public.blog_posts;
create policy "blog_posts_delete_admin" on public.blog_posts
  for delete using (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- quote_requests — public "Request a Quote" submissions
-- ------------------------------------------------------------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service text not null,
  budget text,
  description text not null default '',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

drop policy if exists "quote_requests_insert_any" on public.quote_requests;
create policy "quote_requests_insert_any" on public.quote_requests
  for insert with check (auth.role() in ('anon', 'authenticated'));

drop policy if exists "quote_requests_select_admin" on public.quote_requests;
create policy "quote_requests_select_admin" on public.quote_requests
  for select using (
    public.is_admin()
  );

drop policy if exists "quote_requests_update_admin" on public.quote_requests;
create policy "quote_requests_update_admin" on public.quote_requests
  for update using (
    public.is_admin()
  );

drop policy if exists "quote_requests_delete_admin" on public.quote_requests;
create policy "quote_requests_delete_admin" on public.quote_requests
  for delete using (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- consultation_bookings — public "Book a consultation" submissions
-- ------------------------------------------------------------
create table if not exists public.consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service text,
  preferred_date date,
  preferred_time time,
  notes text not null default '',
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.consultation_bookings enable row level security;

drop policy if exists "consultation_bookings_insert_any" on public.consultation_bookings;
create policy "consultation_bookings_insert_any" on public.consultation_bookings
  for insert with check (auth.role() in ('anon', 'authenticated'));

drop policy if exists "consultation_bookings_select_admin" on public.consultation_bookings;
create policy "consultation_bookings_select_admin" on public.consultation_bookings
  for select using (
    public.is_admin()
  );

drop policy if exists "consultation_bookings_update_admin" on public.consultation_bookings;
create policy "consultation_bookings_update_admin" on public.consultation_bookings
  for update using (
    public.is_admin()
  );

drop policy if exists "consultation_bookings_delete_admin" on public.consultation_bookings;
create policy "consultation_bookings_delete_admin" on public.consultation_bookings
  for delete using (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- contact_messages — public contact form submissions
-- ------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert_any" on public.contact_messages;
create policy "contact_messages_insert_any" on public.contact_messages
  for insert with check (auth.role() in ('anon', 'authenticated'));

drop policy if exists "contact_messages_select_admin" on public.contact_messages;
create policy "contact_messages_select_admin" on public.contact_messages
  for select using (
    public.is_admin()
  );

drop policy if exists "contact_messages_update_admin" on public.contact_messages;
create policy "contact_messages_update_admin" on public.contact_messages
  for update using (
    public.is_admin()
  );

drop policy if exists "contact_messages_delete_admin" on public.contact_messages;
create policy "contact_messages_delete_admin" on public.contact_messages
  for delete using (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- site_settings — key/value CMS settings editable by admins
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_admin" on public.site_settings;
create policy "site_settings_select_admin" on public.site_settings
  for select using (
    public.is_admin()
  );

drop policy if exists "site_settings_upsert_admin" on public.site_settings;
create policy "site_settings_upsert_admin" on public.site_settings
  for all using (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- Realtime — everything updates instantly
-- ------------------------------------------------------------
do $$
declare _t text;
begin
  foreach _t in array array[
    'public.blog_posts',
    'public.quote_requests',
    'public.consultation_bookings',
    'public.contact_messages',
    'public.site_settings',
    'public.services'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname || '.' || tablename = _t
    ) then
      execute format('alter publication supabase_realtime add table %s', _t);
    end if;
  end loop;
end $$;

-- ------------------------------------------------------------
-- engineer_profiles — extended profile fields for engineers
-- (skills, availability, certificates, portfolio, pricing)
-- ------------------------------------------------------------
create table if not exists public.engineer_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  title text not null default '',
  bio text not null default '',
  skills text[] not null default '{}',
  hourly_rate numeric(10,2),
  experience_years integer not null default 0,
  portfolio_links text[] not null default '{}',
  certificates text[] not null default '{}',
  availability text not null default 'full_time'
    check (availability in ('full_time', 'part_time', 'contract', 'busy')),
  location text,
  languages text[] not null default '{}',
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.engineer_profiles enable row level security;

drop trigger if exists engineer_profiles_touch_updated on public.engineer_profiles;
create trigger engineer_profiles_touch_updated
  before update on public.engineer_profiles
  for each row execute function public.touch_updated_at();

drop policy if exists "engineer_profiles_select_public" on public.engineer_profiles;
create policy "engineer_profiles_select_public" on public.engineer_profiles
  for select using (
    is_available or user_id = auth.uid() or public.is_admin()
  );

drop policy if exists "engineer_profiles_insert_own" on public.engineer_profiles;
create policy "engineer_profiles_insert_own" on public.engineer_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "engineer_profiles_update_own" on public.engineer_profiles;
create policy "engineer_profiles_update_own" on public.engineer_profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------
-- proposals — engineers apply to client projects
-- ------------------------------------------------------------
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  engineer_id uuid not null references public.profiles (id) on delete cascade,
  price numeric(12,2) not null default 0,
  estimated_time text not null default '',
  cover_letter text not null default '',
  portfolio_link text,
  status text not null default 'pending'
    check (status in ('pending', 'shortlisted', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, engineer_id)
);

alter table public.proposals enable row level security;

drop trigger if exists proposals_touch_updated on public.proposals;
create trigger proposals_touch_updated
  before update on public.proposals
  for each row execute function public.touch_updated_at();

drop policy if exists "proposals_select" on public.proposals;
create policy "proposals_select" on public.proposals
  for select using (
    engineer_id = auth.uid()
    or public.can_access_project(project_id)
  );

drop policy if exists "proposals_insert_engineer" on public.proposals;
create policy "proposals_insert_engineer" on public.proposals
  for insert with check (
    auth.uid() = engineer_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'engineer')
    and exists (select 1 from public.projects pr where pr.id = project_id)
  );

drop policy if exists "proposals_update" on public.proposals;
create policy "proposals_update" on public.proposals
  for update using (
    engineer_id = auth.uid()
    or public.can_access_project(project_id)
  );

drop policy if exists "proposals_delete_own" on public.proposals;
create policy "proposals_delete_own" on public.proposals
  for delete using (engineer_id = auth.uid());

create index if not exists proposals_project_idx on public.proposals (project_id, created_at desc);
create index if not exists proposals_engineer_idx on public.proposals (engineer_id, created_at desc);

-- ------------------------------------------------------------
-- contracts — binding agreement between client and engineer
-- ------------------------------------------------------------
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  proposal_id uuid references public.proposals (id) on delete set null,
  client_id uuid not null references public.profiles (id) on delete cascade,
  engineer_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12,2) not null default 0,
  terms text not null default '',
  milestones jsonb not null default '[]',
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'signed', 'active', 'completed', 'cancelled')),
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contracts enable row level security;

drop trigger if exists contracts_touch_updated on public.contracts;
create trigger contracts_touch_updated
  before update on public.contracts
  for each row execute function public.touch_updated_at();

drop policy if exists "contracts_select" on public.contracts;
create policy "contracts_select" on public.contracts
  for select using (
    client_id = auth.uid()
    or engineer_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "contracts_insert" on public.contracts;
create policy "contracts_insert" on public.contracts
  for insert with check (
    client_id = auth.uid()
    or engineer_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "contracts_update" on public.contracts;
create policy "contracts_update" on public.contracts
  for update using (
    client_id = auth.uid()
    or engineer_id = auth.uid()
    or public.is_admin()
  );

-- ------------------------------------------------------------
-- saved_engineers — clients shortlist engineers
-- ------------------------------------------------------------
create table if not exists public.saved_engineers (
  client_id uuid not null references public.profiles (id) on delete cascade,
  engineer_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, engineer_id)
);

alter table public.saved_engineers enable row level security;

drop policy if exists "saved_engineers_select" on public.saved_engineers;
create policy "saved_engineers_select" on public.saved_engineers
  for select using (client_id = auth.uid() or public.is_admin());

drop policy if exists "saved_engineers_insert" on public.saved_engineers;
create policy "saved_engineers_insert" on public.saved_engineers
  for insert with check (client_id = auth.uid());

drop policy if exists "saved_engineers_delete" on public.saved_engineers;
create policy "saved_engineers_delete" on public.saved_engineers
  for delete using (client_id = auth.uid());

-- ------------------------------------------------------------
-- newsletter_subscribers — public newsletter signups
-- ------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter_insert_any" on public.newsletter_subscribers;
create policy "newsletter_insert_any" on public.newsletter_subscribers
  for insert with check (auth.role() in ('anon', 'authenticated'));

drop policy if exists "newsletter_select_admin" on public.newsletter_subscribers;
create policy "newsletter_select_admin" on public.newsletter_subscribers
  for select using (public.is_admin());

drop policy if exists "newsletter_delete_admin" on public.newsletter_subscribers;
create policy "newsletter_delete_admin" on public.newsletter_subscribers
  for delete using (public.is_admin());

-- Notify the assigned engineer when a proposal is accepted.
create or replace function public.notify_proposal_accepted()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'accepted' and old.status <> 'accepted' then
    insert into public.notifications (user_id, title, body, type, project_id, link)
    select engineer_id, 'Proposal accepted',
           'Congratulations! Your proposal was accepted.',
           'project_update', new.project_id, '/engineer/proposals'
    from public.proposals where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists proposals_notify_engineer on public.proposals;
create trigger proposals_notify_engineer
  after update on public.proposals
  for each row execute function public.notify_proposal_accepted();

-- Realtime for new marketplace tables
do $$
declare _t text;
begin
  foreach _t in array array[
    'public.proposals',
    'public.engineer_profiles',
    'public.contracts',
    'public.saved_engineers',
    'public.newsletter_subscribers'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname || '.' || tablename = _t
    ) then
      execute format('alter publication supabase_realtime add table %s', _t);
    end if;
  end loop;
end $$;

-- ------------------------------------------------------------
-- push_tokens — FCM device tokens for push notifications
-- ------------------------------------------------------------
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  token text not null,
  device text not null default 'web',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table public.push_tokens enable row level security;

create policy "Users manage their own push tokens"
  on public.push_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow the service role to read/delete tokens for sending pushes.
create policy "Service role manages push tokens"
  on public.push_tokens for all
  using (true)
  with check (true);

-- ------------------------------------------------------------
-- Push notification webhook — forwards new in-app notifications to the
-- Black Tuf API so FCM push messages are delivered. Requires:
--   1. pg_net extension enabled (Database > Extensions > pg_net)
--   2. A site setting `push_webhook_url` containing
--      https://<your-app>/api/notifications/send
--   3. A site setting `push_webhook_secret` matching PUSH_WEBHOOK_SECRET
-- ------------------------------------------------------------
create extension if not exists pg_net;

create or replace function public.handle_push_notification()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _url text;
  _secret text;
  _payload jsonb;
begin
  select value #>> '{}' into _url from public.site_settings where key = 'push_webhook_url';
  select value #>> '{}' into _secret from public.site_settings where key = 'push_webhook_secret';
  if _url is null or _url = '' then
    return new;
  end if;

  _payload := jsonb_build_object(
    'user_id', new.user_id,
    'title', new.title,
    'body', new.body,
    'secret', coalesce(_secret, ''),
    'data', jsonb_build_object(
      'type', new.type,
      'path', coalesce(new.link, '/dashboard/notifications')
    )
  );

  perform net.http_post(
    url := _url,
    body := _payload,
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  return new;
end;
$$;

drop trigger if exists notifications_push_webhook on public.notifications;
create trigger notifications_push_webhook
  after insert on public.notifications
  for each row execute function public.handle_push_notification();

-- ------------------------------------------------------------
--   update public.profiles set role = 'admin'
--   where id = '<your auth user uuid>';
-- Or the very first user to run:
--   update public.profiles
--   set role = 'admin'
--   where id = auth.uid();
--   (requires running from the SQL editor as the postgres role)
-- ------------------------------------------------------------
