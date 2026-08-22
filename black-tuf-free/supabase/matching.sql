-- ============================================================
-- Black Tuf — Skill-based project matching
-- Run this in the Supabase SQL editor (once).
-- Adds: domains, freelancer_domains, project_domains,
--       projects.skills / projects.experience_required,
--       proposal-count RPC, matching-notification trigger,
--       realtime publication for the new tables.
-- ============================================================

-- ------------------------------------------------------------
-- domains — fixed service-domain catalogue (many-to-many basis)
-- ------------------------------------------------------------
create table if not exists public.domains (
  id text primary key,
  name text not null,
  description text not null default '',
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.domains enable row level security;

insert into public.domains (id, name, description, icon, sort_order) values
  ('web',        'Web Development',             'High-performance web applications and portals.', 'Globe',       1),
  ('mobile',     'Mobile Application Development', 'Native and cross-platform mobile apps.',         'Smartphone',  2),
  ('uiux',       'UI/UX & Graphic Design',      'Interfaces, branding and user research.',          'Palette',     3),
  ('game',       'Game Development',            '2D/3D games and interactive experiences.',         'Gamepad2',    4),
  ('ai',         'AI Development',              'Custom AI, ML pipelines and generative AI.',        'Brain',       5),
  ('iot',        'IoT Automation',              'Connected devices and real-time monitoring.',      'Activity',    6),
  ('plc',        'PLC Programming',             'Industrial automation logic.',                     'Cpu',         7),
  ('electrical', 'Electrical Works',            'LV panels, wiring and power distribution.',        'Zap',         8)
on conflict (id) do nothing;

drop policy if exists "domains_select_public" on public.domains;
create policy "domains_select_public" on public.domains
  for select using (is_active or public.is_admin());

drop policy if exists "domains_insert_admin" on public.domains;
create policy "domains_insert_admin" on public.domains
  for insert with check (public.is_admin());

drop policy if exists "domains_update_admin" on public.domains;
create policy "domains_update_admin" on public.domains
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "domains_delete_admin" on public.domains;
create policy "domains_delete_admin" on public.domains
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- freelancer_domains — engineers select which domains they serve
-- ------------------------------------------------------------
create table if not exists public.freelancer_domains (
  user_id uuid not null references public.profiles (id) on delete cascade,
  domain_id text not null references public.domains (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, domain_id)
);

alter table public.freelancer_domains enable row level security;

drop policy if exists "freelancer_domains_select" on public.freelancer_domains;
create policy "freelancer_domains_select" on public.freelancer_domains
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.engineer_profiles e
      where e.user_id = freelancer_domains.user_id and e.is_available
    )
  );

drop policy if exists "freelancer_domains_insert_own" on public.freelancer_domains;
create policy "freelancer_domains_insert_own" on public.freelancer_domains
  for insert with check (auth.uid() = user_id);

drop policy if exists "freelancer_domains_delete_own" on public.freelancer_domains;
create policy "freelancer_domains_delete_own" on public.freelancer_domains
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- project_domains — projects belong to one or more domains
-- ------------------------------------------------------------
create table if not exists public.project_domains (
  project_id uuid not null references public.projects (id) on delete cascade,
  domain_id text not null references public.domains (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, domain_id)
);

alter table public.project_domains enable row level security;

drop policy if exists "project_domains_select" on public.project_domains;
create policy "project_domains_select" on public.project_domains
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (
          (p.is_published and p.status = 'pending')
          or public.can_access_project(p.id)
        )
    )
  );

drop policy if exists "project_domains_insert" on public.project_domains;
create policy "project_domains_insert" on public.project_domains
  for insert with check (
    public.is_admin()
    or auth.uid() = (select client_id from public.projects where id = project_id)
  );

drop policy if exists "project_domains_delete" on public.project_domains;
create policy "project_domains_delete" on public.project_domains
  for delete using (
    public.is_admin()
    or auth.uid() = (select client_id from public.projects where id = project_id)
  );

-- ------------------------------------------------------------
-- projects — extra fields for matching & cards
-- ------------------------------------------------------------
alter table public.projects add column if not exists skills text[] not null default '{}';
alter table public.projects add column if not exists experience_required integer;

-- ------------------------------------------------------------
-- Proposal counts — security definer so engineers can see how
-- many proposals an open project has without leaking proposal rows.
-- ------------------------------------------------------------
create or replace function public.project_proposal_counts()
returns table (project_id uuid, proposal_count bigint)
language sql
security definer set search_path = public
as $$
  select p.id, count(pr.id)::bigint
  from public.projects p
  left join public.proposals pr on pr.project_id = p.id
  where p.is_published and p.status = 'pending'
  group by p.id;
$$;

-- ------------------------------------------------------------
-- Matching notifications — when a project is posted, notify only
-- freelancers whose domains intersect the project's domains.
-- ------------------------------------------------------------
create or replace function public.notify_matching_freelancers()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, body, type, project_id, link)
  select fd.user_id,
         'New project matches your skills',
         'A new project "' || (select name from public.projects where id = new.project_id) || '" matches your service domains.',
         'project_update',
         new.project_id,
         '/engineer/recommended'
  from public.freelancer_domains fd
  where fd.domain_id = new.domain_id
    and exists (
      select 1 from public.projects p
      where p.id = new.project_id and p.is_published and p.status = 'pending'
    )
    and not exists (
      select 1 from public.notifications n
      where n.user_id = fd.user_id and n.project_id = new.project_id
        and n.type = 'project_update'
    );
  return new;
end;
$$;

drop trigger if exists project_domains_notify_matching on public.project_domains;
create trigger project_domains_notify_matching
  after insert on public.project_domains
  for each row execute function public.notify_matching_freelancers();

-- ------------------------------------------------------------
-- Realtime — new tables stream instantly
-- ------------------------------------------------------------
do $$
declare _t text;
begin
  foreach _t in array array[
    'public.domains',
    'public.freelancer_domains',
    'public.project_domains'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname || '.' || tablename = _t
    ) then
      execute format('alter publication supabase_realtime add table %s', _t);
    end if;
  end loop;
end $$;
