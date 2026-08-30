import { Router } from 'express';
import { supabaseAdmin } from '../../services/supabaseServer';
import { getSchedulerHealth } from '../../services/monitoringScheduler';
import { countRows, daysAgoIso } from './helpers';

export function createOverviewRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });

    const [
      totalUsers,
      freeUsers,
      proUsers,
      agencyUsers,
      newSignups7d,
      totalScans,
      failedScans,
      activeMonitoredSitesRows,
      activeProSubscriptions,
      activeAgencySubscriptions,
      failedMonitoringJobs24h,
      failedPayments,
      recentCancellations,
      mrrRows,
    ] = await Promise.all([
      countRows('profiles'),
      countRows('profiles', q => q.eq('plan', 'free')),
      countRows('profiles', q => q.eq('plan', 'pro')),
      countRows('profiles', q => q.eq('plan', 'agency')),
      countRows('profiles', q => q.gte('created_at', daysAgoIso(7))),
      countRows('scans'),
      countRows('scans', q => q.in('scan_status', ['failed', 'timed_out'])),
      supabaseAdmin.from('monitored_sites').select('user_id').eq('enabled', true),
      countRows('subscriptions', q => q.eq('plan', 'pro').eq('status', 'active')),
      countRows('subscriptions', q => q.eq('plan', 'agency').eq('status', 'active')),
      countRows('monitoring_runs', q => q.eq('status', 'failed').gte('started_at', daysAgoIso(1))),
      countRows('payments', q => q.eq('status', 'failed')),
      countRows('subscriptions', q => q.eq('status', 'cancelled').gte('updated_at', daysAgoIso(30))),
      supabaseAdmin.from('subscriptions').select('amount').eq('status', 'active'),
    ]);

    // "Active monitoring subscriptions" isn't a distinct paid tier in this app -- monitoring is a
    // feature bundled into Pro/Agency. We report the number of distinct users actually using it
    // (an enabled monitored site) rather than fabricating a separate subscription count.
    const distinctMonitoringUsers = new Set((activeMonitoredSitesRows.data || []).map((r: any) => r.user_id)).size;
    const mrr = (mrrRows.data || []).reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0);

    res.json({
      totalUsers,
      freeUsers,
      paidSubscribers: proUsers + agencyUsers,
      activeProSubscriptions,
      activeMonitoringSubscriptions: distinctMonitoringUsers,
      activeAgencySubscriptions,
      mrr,
      newSignups7d,
      totalScans,
      failedScans,
      activeMonitoredWebsites: activeMonitoredSitesRows.data?.length || 0,
      failedMonitoringJobs24h,
      failedPayments,
      recentCancellations,
      schedulerHealth: getSchedulerHealth(),
    });
  });

  return router;
}
