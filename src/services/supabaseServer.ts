import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

// Service-role client: server-only, bypasses RLS. Never send this key to the browser.
export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'agency';
  status: 'active' | 'suspended';
}

/**
 * Verifies the Supabase access token from an Authorization: Bearer header.
 * Returns null for anonymous requests or an invalid/expired token -- callers
 * treat that as "anonymous", not as an error, since scanning doesn't require login.
 */
export async function getUserFromAuthHeader(authHeader: string | undefined): Promise<AuthenticatedUser | null> {
  if (!supabaseAdmin || !authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, plan, status')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email,
    role: (profile?.role as 'user' | 'admin') || 'user',
    plan: (profile?.plan as 'free' | 'pro' | 'agency') || 'free',
    status: (profile?.status as 'active' | 'suspended') || 'active',
  };
}

const DAILY_SCAN_LIMITS: Record<AuthenticatedUser['plan'], number> = {
  free: 5,
  pro: 100,
  agency: 500,
};
const ANONYMOUS_DAILY_LIMIT = 1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// In-memory fallback limiter for anonymous (unauthenticated) scans, keyed by IP.
// Resets on server restart and isn't shared across instances -- acceptable for a
// single-instance deployment; move to a shared store (Redis) before scaling out.
const anonymousScanLog = new Map<string, number[]>();

function pruneOld(timestamps: number[], now: number): number[] {
  return timestamps.filter(t => now - t < ONE_DAY_MS);
}

export interface QuotaCheckResult {
  allowed: boolean;
  limit: number;
  remaining: number;
}

export async function checkScanQuota(user: AuthenticatedUser | null, ip: string): Promise<QuotaCheckResult> {
  const now = Date.now();

  if (!user) {
    const recent = pruneOld(anonymousScanLog.get(ip) || [], now);
    const allowed = recent.length < ANONYMOUS_DAILY_LIMIT;
    return { allowed, limit: ANONYMOUS_DAILY_LIMIT, remaining: Math.max(0, ANONYMOUS_DAILY_LIMIT - recent.length) };
  }

  const limit = DAILY_SCAN_LIMITS[user.plan];

  if (!supabaseAdmin) {
    // Supabase not configured: fail open for authenticated users rather than
    // blocking scans entirely in local/dev setups without a database.
    return { allowed: true, limit, remaining: limit };
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('usage_reset_at')
    .eq('id', user.id)
    .single();

  const resetAt = profile?.usage_reset_at ? new Date(profile.usage_reset_at).getTime() : 0;
  const since = new Date(Math.max(resetAt, now - ONE_DAY_MS)).toISOString();

  const { count } = await supabaseAdmin
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('started_at', since);

  const used = count || 0;
  return { allowed: used < limit, limit, remaining: Math.max(0, limit - used) };
}

export function recordAnonymousScan(ip: string): void {
  const now = Date.now();
  const recent = pruneOld(anonymousScanLog.get(ip) || [], now);
  recent.push(now);
  anonymousScanLog.set(ip, recent);
}
