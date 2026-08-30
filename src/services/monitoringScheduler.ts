import { supabaseAdmin } from './supabaseServer';
import { performScan } from './scannerEngine';
import { startScanRecord, completeScanRecord, failScanRecord } from './scanLifecycle';

const TICK_INTERVAL_MS = 5 * 60 * 1000; // check for due sites every 5 minutes
const INTERVAL_MS: Record<string, number> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

interface MonitoredSiteRow {
  id: string;
  user_id: string;
  url: string;
  interval: string;
  consecutive_failures?: number;
}

let lastTickAt: Date | null = null;
let lastTickError: string | null = null;
let tickInProgress = false;

export function getSchedulerHealth() {
  return { lastTickAt, lastTickError, tickInProgress, tickIntervalMs: TICK_INTERVAL_MS };
}

async function getPreviousScore(monitoredSiteId: string): Promise<number | null> {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('monitoring_runs')
    .select('score')
    .eq('monitored_site_id', monitoredSiteId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.score ?? null;
}

async function fetchUserPlan(userId: string): Promise<'free' | 'pro' | 'agency' | 'anonymous'> {
  if (!supabaseAdmin) return 'anonymous';
  const { data } = await supabaseAdmin.from('profiles').select('plan').eq('id', userId).single();
  return (data?.plan as 'free' | 'pro' | 'agency') || 'free';
}

/**
 * Runs one monitoring check for a single site: a monitoring_runs row and a
 * scans row are both created so this shows up in Scan Management too.
 * Used by the scheduler loop and by the admin "run now" / "retry" actions.
 */
export async function runMonitoredSite(site: MonitoredSiteRow): Promise<void> {
  if (!supabaseAdmin) return;

  const previousScore = await getPreviousScore(site.id);
  const plan = await fetchUserPlan(site.user_id);

  const { data: run } = await supabaseAdmin
    .from('monitoring_runs')
    .insert({ monitored_site_id: site.id, status: 'running', previous_score: previousScore, started_at: new Date().toISOString() })
    .select('id')
    .single();
  const runId = run?.id;

  const scanRecordId = await startScanRecord({ id: site.user_id, email: undefined, role: 'user', plan: plan as any, status: 'active' }, site.url);
  const startedAt = Date.now();

  try {
    const result = await performScan(site.url);
    await completeScanRecord(scanRecordId, result, Date.now() - startedAt);

    if (runId) {
      await supabaseAdmin
        .from('monitoring_runs')
        .update({ status: 'completed', score: result.overallScore, scan_id: scanRecordId, completed_at: new Date().toISOString() })
        .eq('id', runId);
    }

    const intervalMs = INTERVAL_MS[site.interval] || INTERVAL_MS.weekly;
    await supabaseAdmin
      .from('monitored_sites')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: new Date(Date.now() + intervalMs).toISOString(),
        consecutive_failures: 0,
      })
      .eq('id', site.id);
  } catch (err: any) {
    const message = err?.message || 'Monitoring scan failed';
    const isTimeout = /timed out/i.test(message);
    await failScanRecord(scanRecordId, message, isTimeout ? 'timed_out' : 'failed', Date.now() - startedAt);

    if (runId) {
      await supabaseAdmin
        .from('monitoring_runs')
        .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
        .eq('id', runId);
    }

    const intervalMs = INTERVAL_MS[site.interval] || INTERVAL_MS.weekly;
    await supabaseAdmin
      .from('monitored_sites')
      .update({
        next_run_at: new Date(Date.now() + intervalMs).toISOString(),
        consecutive_failures: (site.consecutive_failures ?? 0) + 1,
      })
      .eq('id', site.id);
  }
}

async function tick(): Promise<void> {
  if (!supabaseAdmin || tickInProgress) return;
  tickInProgress = true;
  try {
    const { data: dueSites, error } = await supabaseAdmin
      .from('monitored_sites')
      .select('id, user_id, url, interval, consecutive_failures')
      .eq('enabled', true)
      .lte('next_run_at', new Date().toISOString())
      .limit(20); // bound how much work one tick can take on

    if (error) throw error;

    for (const site of dueSites || []) {
      await runMonitoredSite(site as MonitoredSiteRow);
    }

    lastTickError = null;
  } catch (err: any) {
    lastTickError = err?.message || 'Unknown scheduler error';
    console.error('Monitoring scheduler tick failed:', err);
  } finally {
    lastTickAt = new Date();
    tickInProgress = false;
  }
}

let started = false;

/** Starts the in-process monitoring scheduler. Safe to call once at server boot. */
export function startMonitoringScheduler(): void {
  if (started || !supabaseAdmin) return;
  started = true;
  setTimeout(tick, 10_000); // give the server a moment to finish booting
  setInterval(tick, TICK_INTERVAL_MS);
}
