import { Router } from 'express';
import { supabaseAdmin } from '../../services/supabaseServer';
import { getSchedulerHealth } from '../../services/monitoringScheduler';
import { SCAN_NAV_TIMEOUT_MS } from '../../services/scannerEngine';
import { daysAgoIso } from './helpers';

/**
 * Every value here comes from a real query or a real in-process counter.
 * Where a subsystem isn't wired up yet (Stripe, email), the status is
 * reported as "not_configured" rather than a fabricated "operational".
 */
export function createSystemHealthRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });

    const dbCheckStart = Date.now();
    const { error: dbError } = await supabaseAdmin.from('profiles').select('id', { head: true, count: 'exact' }).limit(1);
    const database = {
      status: dbError ? 'down' : 'operational',
      latencyMs: Date.now() - dbCheckStart,
      error: dbError?.message || null,
    };

    const oneHourAgo = daysAgoIso(1 / 24);
    const { data: recentScans } = await supabaseAdmin
      .from('scans')
      .select('scan_status, started_at')
      .gte('started_at', oneHourAgo);

    const queued = (recentScans || []).filter(s => s.scan_status === 'queued').length;
    const running = (recentScans || []).filter(s => s.scan_status === 'running').length;
    const completed = (recentScans || []).filter(s => s.scan_status === 'completed').length;
    const failed = (recentScans || []).filter(s => s.scan_status === 'failed' || s.scan_status === 'timed_out').length;

    let scannerStatus: 'operational' | 'degraded' | 'unknown' = 'unknown';
    if (completed > 0 && failed === 0) scannerStatus = 'operational';
    else if (completed > 0 && failed > 0) scannerStatus = 'degraded';
    else if (completed === 0 && failed > 0) scannerStatus = 'degraded';

    const stuckRunning = (recentScans || []).filter(
      s => s.scan_status === 'running' && Date.now() - new Date(s.started_at).getTime() > SCAN_NAV_TIMEOUT_MS * 2
    ).length;

    const failedMonitoring24h = (await supabaseAdmin.from('monitoring_runs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('started_at', daysAgoIso(1))).count || 0;

    const stripeConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
    let webhooks: any = { status: 'not_configured' };
    if (stripeConfigured) {
      const { data: recentEvents } = await supabaseAdmin.from('webhook_events').select('processed_status, received_at').order('received_at', { ascending: false }).limit(50);
      const failedEvents = (recentEvents || []).filter(e => e.processed_status === 'failed').length;
      webhooks = {
        status: failedEvents > 0 ? 'degraded' : 'operational',
        lastReceivedAt: recentEvents?.[0]?.received_at || null,
        recentFailures: failedEvents,
      };
    }

    const emailConfigured = Boolean(process.env.RESEND_API_KEY);
    let email: any = { status: 'not_configured' };
    if (emailConfigured) {
      const { count: recentFailures } = await supabaseAdmin.from('email_logs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', daysAgoIso(1));
      email = { status: (recentFailures || 0) > 0 ? 'degraded' : 'operational', recentFailures: recentFailures || 0 };
    }

    res.json({
      database,
      scanner: { status: scannerStatus, queued, running, completedLastHour: completed, failedLastHour: failed, stuckRunning },
      monitoringScheduler: { ...getSchedulerHealth(), failedRunsLast24h: failedMonitoring24h },
      webhooks,
      email,
    });
  });

  return router;
}
