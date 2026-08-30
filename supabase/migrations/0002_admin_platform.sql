-- Admin/operations platform: account status, scan execution lifecycle,
-- monitoring, agencies, reports, billing (Stripe-backed), email logs, and
-- an append-only admin audit log. Run after 0001_init.sql.
--
-- Design note: none of these tables grant broad client-side RLS write
-- access. Admin reads/writes all go through the Express server using the
-- service-role key (see src/services/adminAuth.ts), which is the only
-- place admin-ness is checked -- there is no client-side "isAdmin" trust
-- boundary. Tables that end users read directly from the browser (their
-- own scans, monitored sites, reports, subscriptions, payments) keep
-- narrow "select own row" policies and no client-side write policies.

-- ============================================================
-- profiles: account status (separate from Stripe subscription status)
-- ============================================================
alter table public.profiles add column if not exists status text not null default 'active' check (status in ('active', 'suspended'));
alter table public.profiles add column if not exists suspended_at timestamptz;
alter table public.profiles add column if not exists suspended_reason text;
-- Bumped by an admin "reset usage" action; the scan quota check only counts
-- scans since greatest(usage_reset_at, now() - 24h).
alter table public.profiles add column if not exists usage_reset_at timestamptz not null default now();

-- ============================================================
-- scans: split the axe-derived result quality ("result_status": passed/
-- warning/failed) from the scan's own execution lifecycle ("scan_status").
-- Every scan attempt is now recorded (including anonymous and failed ones)
-- so admin can see real totals/failures, not just successful authenticated
-- scans.
-- ============================================================
alter table public.scans rename column status to result_status;
alter table public.scans alter column result_status drop not null;
alter table public.scans alter column overall_score drop not null;
alter table public.scans alter column grade drop not null;
alter table public.scans alter column result drop not null;

alter table public.scans add column if not exists scan_status text not null default 'queued'
  check (scan_status in ('queued', 'running', 'completed', 'failed', 'timed_out'));
alter table public.scans add column if not exists started_at timestamptz not null default now();
alter table public.scans add column if not exists completed_at timestamptz;
alter table public.scans add column if not exists duration_ms int;
alter table public.scans add column if not exists error_message text;
alter table public.scans add column if not exists plan_used text;

create index if not exists scans_scan_status_idx on public.scans (scan_status, started_at desc);

-- ============================================================
-- admin_audit_log: append-only. No RLS policies are granted to the
-- anon/authenticated roles at all, so it is unreadable and unwritable
-- through the public API key under any circumstance -- only the server's
-- service-role client can touch it.
-- ============================================================
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

-- ============================================================
-- Agencies: owner -> clients -> sites hierarchy. RLS scopes everything to
-- the owning agency so one agency's clients/sites can never be selected by
-- another agency's owner, even though admin queries bypass RLS entirely
-- via the service role and scope explicitly by agency_id in application code.
-- ============================================================
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

-- ============================================================
-- Monitoring: recurring scans of a saved site, plus a per-run history so
-- score changes and failures can be tracked over time.
-- ============================================================
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

-- ============================================================
-- Reports: a tracked, server-generated PDF artifact per scan, stored in
-- the private "reports" Storage bucket (created below). Authorization for
-- downloads is enforced by RLS on storage.objects (path-scoped to the
-- owning user) plus an explicit ownership check in the download endpoint.
-- ============================================================
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

-- ============================================================
-- Billing (Stripe-backed). These tables stay empty until the Stripe
-- integration batch is wired up -- the admin UI shows an honest "not
-- connected" state rather than fabricated rows in the meantime. Stripe
-- remains authoritative: rows here are a read-optimized mirror written
-- only by verified webhook events, never edited directly by an admin
-- action against a live Stripe-managed subscription.
-- ============================================================
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

-- webhook_events: intentionally no client policies -- admin/service-role only.

-- ============================================================
-- Email logs: operational visibility once an email provider (Resend) is
-- wired up. No client policies -- admin/service-role only, since this is
-- an ops log, not user-facing data.
-- ============================================================
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
