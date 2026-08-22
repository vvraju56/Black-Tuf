-- ============================================================
-- Black Tuf — Unified professional marketplace profile (simplified)
-- Run this in the Supabase SQL editor (once).
--
-- Focus: professional identity + marketplace hiring/work info.
-- Sections: profile photo/cover, basic info, headline, about,
--   service domains, skills, hourly rate, location, portfolio,
--   experience, reviews (existing feedback table).
--
-- Cleanly drops any tables created by the earlier (superseded)
-- profile-v2 draft that are no longer part of the product.
-- ============================================================

-- ------------------------------------------------------------
-- Drop superseded profile modules
-- ------------------------------------------------------------
drop table if exists public.publications cascade;
drop table if exists public.articles cascade;
drop table if exists public.references cascade;
drop table if exists public.qualifications cascade;
drop table if exists public.certifications cascade;
drop table if exists public.certification_attempts cascade;
drop table if exists public.certification_programs cascade;
drop table if exists public.rewards cascade;
drop table if exists public.profile_views cascade;
drop table if exists public.profile_verifications cascade;
drop table if exists public.reviews cascade;

drop function if exists public.award_reward(uuid, text, text, text, text) cascade;
drop function if exists public.award_completed_project_reward() cascade;
drop function if exists public.award_review_reward() cascade;
drop trigger if exists projects_award_completed_reward on public.projects;

do $$
begin
  if to_regclass('public.reviews') is not null then
    drop trigger if exists reviews_award_reward on public.reviews;
  end if;
end $$;

-- ------------------------------------------------------------
-- profiles — unified profile columns
-- ------------------------------------------------------------
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists headline text not null default '';
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists cover_url text;
alter table public.profiles add column if not exists verification_badge boolean not null default false;
alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.profiles add column if not exists available_for_work boolean not null default false;
alter table public.profiles add column if not exists hourly_rate numeric(10,2);
alter table public.profiles add column if not exists hourly_currency text not null default 'USD';
alter table public.profiles add column if not exists timezone text;

-- Email verification (source of truth: Firebase Auth emailVerified, synced
-- server-side on every token exchange). Freelancer work features are gated
-- on this flag at the database level, so a frontend-only value is never trusted.
alter table public.profiles add column if not exists email_verified boolean not null default false;
alter table public.profiles add column if not exists freelancer_enabled boolean not null default false;
alter table public.profiles add column if not exists freelancer_enabled_at timestamptz;

create unique index if not exists profiles_username_key on public.profiles (username) where username is not null;

-- "Available for Work" may only be switched on after email verification.
-- Enforced with a trigger so it holds regardless of which client writes.
create or replace function public.profile_available_for_work_check()
returns trigger
language plpgsql
as $$
begin
  if new.available_for_work and not coalesce(new.email_verified, false) then
    raise exception 'Email verification is required before you can mark yourself as available for work.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_available_for_work_check on public.profiles;
create trigger profiles_available_for_work_check
  before insert or update on public.profiles
  for each row execute function public.profile_available_for_work_check();

-- Backfill: unverified users must not remain marked available for work.
update public.profiles set available_for_work = false
where available_for_work and not coalesce(email_verified, false);

-- Unverified engineers can browse, but must verify before submitting a
-- proposal. Enforced at the DB level (not just the UI). The original
-- proposals_insert_engineer policy is replaced so verification can't be bypassed.
drop policy if exists "proposals_insert_engineer" on public.proposals;
drop policy if exists "proposals_insert_engineer_verified" on public.proposals;
create policy "proposals_insert_engineer_verified" on public.proposals
  for insert with check (
    auth.uid() = engineer_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'engineer' and p.email_verified
    )
    and exists (select 1 from public.projects pr where pr.id = project_id)
  );

-- Accepting work / receiving an assignment also requires a verified engineer.
-- Replaces the original contracts_insert policy so verification can't be bypassed.
drop policy if exists "contracts_insert" on public.contracts;
drop policy if exists "contracts_insert_verified" on public.contracts;
create policy "contracts_insert_verified" on public.contracts
  for insert with check (
    (
      client_id = auth.uid()
      or engineer_id = auth.uid()
      or public.is_admin()
    )
    and exists (
      select 1 from public.profiles p
      where p.id = engineer_id and p.email_verified
    )
  );

-- Public-safe projection of profiles. The profiles table itself stays
-- private (own + admin only) so emails/phones are never exposed; public
-- profile pages read this view instead.
drop view if exists public.public_profiles;
create view public.public_profiles
with (security_invoker = false) as
select
  id,
  full_name,
  username,
  headline,
  bio,
  country,
  city,
  hourly_rate,
  hourly_currency,
  timezone,
  avatar_url,
  cover_url,
  verification_badge,
  email_verified,
  available_for_work,
  last_seen_at,
  created_at
from public.profiles;

revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- ------------------------------------------------------------
-- profile_reviews — approved feedback exposed safely via a
-- security-invoker=false (definer) view. Only shows approved
-- feedback with a non-empty comment, joined to the project and
-- reviewer profile. Keeps emails/phones/roles out of public.
-- ------------------------------------------------------------
drop view if exists public.profile_reviews;
create view public.profile_reviews
with (security_invoker = false) as
select
  f.id,
  f.rating,
  f.comment,
  f.created_at,
  p.id as project_id,
  p.engineer_id,
  p.name as project_name,
  c.full_name as reviewer_name,
  c.avatar_url as reviewer_avatar
from public.feedback f
join public.projects p on p.id = f.project_id
left join public.profiles c on c.id = f.client_id
where f.is_approved = true and f.comment <> '';

revoke all on public.profile_reviews from anon, authenticated;
grant select on public.profile_reviews to anon, authenticated;

-- ------------------------------------------------------------
-- skills — global skill catalogue
-- ------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.skills enable row level security;

drop policy if exists "skills_select_public" on public.skills;
create policy "skills_select_public" on public.skills
  for select using (true);

drop policy if exists "skills_insert_authenticated" on public.skills;
create policy "skills_insert_authenticated" on public.skills
  for insert with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- user_skills — per-user skills (ordered)
-- ------------------------------------------------------------
create table if not exists public.user_skills (
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

alter table public.user_skills enable row level security;

drop policy if exists "user_skills_select" on public.user_skills;
create policy "user_skills_select" on public.user_skills
  for select using (true);

drop policy if exists "user_skills_insert_own" on public.user_skills;
create policy "user_skills_insert_own" on public.user_skills
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_skills_update_own" on public.user_skills;
create policy "user_skills_update_own" on public.user_skills
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_skills_delete_own" on public.user_skills;
create policy "user_skills_delete_own" on public.user_skills
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- profile_domains — service domains used for project matching
-- ------------------------------------------------------------
create table if not exists public.profile_domains (
  user_id uuid not null references public.profiles (id) on delete cascade,
  domain_id text not null references public.domains (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, domain_id)
);

alter table public.profile_domains enable row level security;

drop policy if exists "profile_domains_select" on public.profile_domains;
create policy "profile_domains_select" on public.profile_domains
  for select using (true);

drop policy if exists "profile_domains_insert_own" on public.profile_domains;
create policy "profile_domains_insert_own" on public.profile_domains
  for insert with check (auth.uid() = user_id);

drop policy if exists "profile_domains_delete_own" on public.profile_domains;
create policy "profile_domains_delete_own" on public.profile_domains
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- portfolio_projects — simple portfolio (max 6 enforced in UI)
-- ------------------------------------------------------------
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  project_url text,
  github_url text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_projects enable row level security;

drop trigger if exists portfolio_projects_touch_updated on public.portfolio_projects;
create trigger portfolio_projects_touch_updated
  before update on public.portfolio_projects
  for each row execute function public.touch_updated_at();

drop policy if exists "portfolio_projects_select" on public.portfolio_projects;
create policy "portfolio_projects_select" on public.portfolio_projects
  for select using (true);

drop policy if exists "portfolio_projects_insert_own" on public.portfolio_projects;
create policy "portfolio_projects_insert_own" on public.portfolio_projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "portfolio_projects_update_own" on public.portfolio_projects;
create policy "portfolio_projects_update_own" on public.portfolio_projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "portfolio_projects_delete_own" on public.portfolio_projects;
create policy "portfolio_projects_delete_own" on public.portfolio_projects
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- experience — basic work history
-- ------------------------------------------------------------
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_title text not null,
  company text not null default '',
  description text not null default '',
  start_date date,
  end_date date,
  currently_working boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experience enable row level security;

drop trigger if exists experience_touch_updated on public.experience;
create trigger experience_touch_updated
  before update on public.experience
  for each row execute function public.touch_updated_at();

drop policy if exists "experience_select" on public.experience;
create policy "experience_select" on public.experience
  for select using (true);

drop policy if exists "experience_insert_own" on public.experience;
create policy "experience_insert_own" on public.experience
  for insert with check (auth.uid() = user_id);

drop policy if exists "experience_update_own" on public.experience;
create policy "experience_update_own" on public.experience
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "experience_delete_own" on public.experience;
create policy "experience_delete_own" on public.experience
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Storage — public profile assets (photos, covers, portfolio images)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', true)
on conflict (id) do nothing;

drop policy if exists "storage_profile_assets_insert" on storage.objects;
create policy "storage_profile_assets_insert" on storage.objects
  for insert with check (
    bucket_id = 'profile-assets' and auth.role() = 'authenticated'
  );

drop policy if exists "storage_profile_assets_delete" on storage.objects;
create policy "storage_profile_assets_delete" on storage.objects
  for delete using (
    bucket_id = 'profile-assets' and owner = auth.uid()
  );

-- ------------------------------------------------------------
-- Realtime — profile data streams instantly
-- ------------------------------------------------------------
do $$
declare _t text;
begin
  foreach _t in array array[
    'public.profiles',
    'public.user_skills',
    'public.profile_domains',
    'public.portfolio_projects',
    'public.experience'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname || '.' || tablename = _t
    ) then
      execute format('alter publication supabase_realtime add table %s', _t);
    end if;
  end loop;
end $$;
