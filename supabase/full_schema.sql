-- AccessAudit — combined schema (0001_init.sql + 0002_admin_platform.sql)
-- Generated for convenience; the source of truth is the two files in
-- supabase/migrations/. Keep both in sync if you edit one.
--
-- IMPORTANT: this script uses Supabase-specific objects (the `auth.users`
-- table, `storage.buckets`/`storage.objects`, `auth.uid()`) that only exist
-- inside a real Supabase project (cloud or a local `supabase start` stack).
-- It will NOT run against a plain vanilla Postgres or MySQL install.
--
-- To run it against a Supabase project: paste this whole file into
-- Project -> SQL Editor -> New query -> Run. Safe to re-run (guarded with
-- IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS throughout).

-- ============================================================
-- 0001_init.sql
-- ============================================================

-- profiles: one row per auth.users row, holds app-specific fields
-- Supabase Auth already stores email/password/OAuth identity in
-- auth.users; we never duplicate credentials here.
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

-- scans: persisted history of every scan run, anonymous or authenticated.
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  url text not null,
  overall_score int,
  grade text,
  result_status text,
  critical_count int not null default 0,
  moderate_count int not null default 0,
  minor_count int not null default 0,
  passed_count int not null default 0,
  result jsonb,
  created_at timestamptz not null default now(),
  scan_status text not null default 'queued'
    check (scan_status in ('queued', 'running', 'completed', 'failed', 'timed_out')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms int,
  error_message text,
  plan_used text
);

create index if not exists scans_user_id_created_at_idx on public.scans (user_id, created_at desc);
create index if not exists scans_scan_status_idx on public.scans (scan_status, started_at desc);

alter table public.profiles enable row level security;
alter table public.scans enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Deliberately no client-side UPDATE policy on profiles: `plan` and `role`
-- must only ever be changed by the server (service role).

drop policy if exists "scans_select_own" on public.scans;
create policy "scans_select_own" on public.scans
  for select using (auth.uid() = user_id);

-- ============================================================
-- 0002_admin_platform.sql
-- ============================================================

alter table public.profiles add column if not exists status text not null default 'active' check (status in ('active', 'suspended'));
alter table public.profiles add column if not exists suspended_at timestamptz;
alter table public.profiles add column if not exists suspended_reason text;
alter table public.profiles add column if not exists usage_reset_at timestamptz not null default now();

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users (id),
  action text not null,
  target_type text not null,
  target_id text,
  previous_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  tagline text,
  primary_color text not null default '#2563EB',
  accent_color text not null default '#10B981',
  logo_url text,
  contact_email text,
  website text,
  created_at timestamptz not null default now()
);

create table if not exists public.agency_clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.agency_sites (
  id uuid primary key default gen_random_uuid(),
  agency_client_id uuid not null references public.agency_clients (id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.agencies enable row level security;
alter table public.agency_clients enable row level security;
alter table public.agency_sites enable row level security;

drop policy if exists "agencies_select_own" on public.agencies;
create policy "agencies_select_own" on public.agencies for select using (auth.uid() = owner_id);

drop policy if exists "agency_clients_select_own" on public.agency_clients;
create policy "agency_clients_select_own" on public.agency_clients for select using (
  exists (select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid())
);

drop policy if exists "agency_sites_select_own" on public.agency_sites;
create policy "agency_sites_select_own" on public.agency_sites for select using (
  exists (
    select 1 from public.agency_clients c
    join public.agencies a on a.id = c.agency_id
    where c.id = agency_client_id and a.owner_id = auth.uid()
  )
);

create table if not exists public.monitored_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agency_site_id uuid references public.agency_sites (id) on delete set null,
  url text not null,
  name text,
  interval text not null default 'weekly' check (interval in ('daily', 'weekly', 'monthly')),
  enabled boolean not null default true,
  paused_at timestamptz,
  last_run_at timestamptz,
  next_run_at timestamptz not null default now(),
  consecutive_failures int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.monitoring_runs (
  id uuid primary key default gen_random_uuid(),
  monitored_site_id uuid not null references public.monitored_sites (id) on delete cascade,
  scan_id uuid references public.scans (id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  previous_score int,
  score int,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.monitored_sites enable row level security;
alter table public.monitoring_runs enable row level security;

drop policy if exists "monitored_sites_select_own" on public.monitored_sites;
create policy "monitored_sites_select_own" on public.monitored_sites for select using (auth.uid() = user_id);

drop policy if exists "monitoring_runs_select_own" on public.monitoring_runs;
create policy "monitoring_runs_select_own" on public.monitoring_runs for select using (
  exists (select 1 from public.monitored_sites m where m.id = monitored_site_id and m.user_id = auth.uid())
);

create index if not exists monitored_sites_next_run_idx on public.monitored_sites (next_run_at) where enabled = true;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references public.scans (id) on delete set null,
  user_id uuid references auth.users (id) on delete cascade,
  agency_id uuid references public.agencies (id) on delete set null,
  plan_used text not null default 'free',
  status text not null default 'generating' check (status in ('generating', 'ready', 'failed')),
  storage_path text,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports for select using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

drop policy if exists "reports_bucket_select_own" on storage.objects;
create policy "reports_bucket_select_own" on storage.objects
  for select using (
    bucket_id = 'reports'
    and auth.uid()::text = (storage.foldername(name)) [1]
  );

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null,
  status text not null check (status in ('active', 'trialing', 'past_due', 'cancelled', 'incomplete')),
  price_id text,
  amount numeric,
  currency text default 'usd',
  interval text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  amount numeric not null,
  currency text not null default 'usd',
  plan text,
  status text not null check (status in ('succeeded', 'failed', 'refunded', 'partially_refunded')),
  failure_reason text,
  refund_reason text,
  refunded_amount numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_status text not null default 'pending' check (processed_status in ('pending', 'processed', 'failed')),
  processing_error text
);

alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  email_type text not null,
  related_user_id uuid references auth.users (id) on delete set null,
  status text not null check (status in ('sent', 'failed', 'pending')),
  provider_id text,
  failure_reason text,
  created_at timestamptz not null default now()
);
alter table public.email_logs enable row level security;
