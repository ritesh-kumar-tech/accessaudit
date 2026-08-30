-- AccessAudit initial schema: user profiles + persisted scan history.
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- against a fresh project. Safe to re-run: guarded with IF NOT EXISTS /
-- OR REPLACE where possible.

-- ============================================================
-- profiles: one row per auth.users row, holds app-specific fields
-- Supabase Auth already stores email/password/OAuth identity in
-- auth.users; we never duplicate credentials here.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up (email/password or
-- Google OAuth both go through auth.users first).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- scans: persisted history of every scan run, anonymous or authenticated.
-- user_id is null for anonymous scans (rate-limited separately by IP).
-- Full axe-derived result is stored as jsonb so the results UI/PDF
-- generator can re-render it later without re-scanning.
-- ============================================================
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  url text not null,
  overall_score int not null,
  grade text not null,
  status text not null,
  critical_count int not null default 0,
  moderate_count int not null default 0,
  minor_count int not null default 0,
  passed_count int not null default 0,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists scans_user_id_created_at_idx
  on public.scans (user_id, created_at desc);

-- ============================================================
-- Row Level Security: users can only ever read their own data.
-- All writes from the app go through the server using the service-role
-- key, which bypasses RLS, so no insert/update policies are needed here.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.scans enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Deliberately no client-side UPDATE policy on profiles: `plan` and `role`
-- must only ever be changed by the server (service role), e.g. once Stripe
-- webhooks or admin overrides are wired up. Letting authenticated users
-- update their own row would let them grant themselves a paid plan for free.

drop policy if exists "scans_select_own" on public.scans;
create policy "scans_select_own" on public.scans
  for select using (auth.uid() = user_id);
