import { Router } from 'express';
import type { AdminRequest } from '../../services/adminAuth';
import { supabaseAdmin } from '../../services/supabaseServer';
import { runMonitoredSite } from '../../services/monitoringScheduler';
import { logAdminAction } from '../../services/auditLog';
import { parsePagination } from './helpers';

export function createMonitoringRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);

    const { data: sites, count, error } = await supabaseAdmin
      .from('monitored_sites')
      .select('id, user_id, url, name, interval, enabled, paused_at, last_run_at, next_run_at, consecutive_failures', { count: 'exact' })
      .order('next_run_at', { ascending: true })
      .range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    const siteIds = (sites || []).map(s => s.id);
    const userIds = Array.from(new Set((sites || []).map(s => s.user_id)));

    const [{ data: profiles }, { data: runs }] = await Promise.all([
      userIds.length ? supabaseAdmin.from('profiles').select('id, email').in('id', userIds) : Promise.resolve({ data: [] as any[] }),
      siteIds.length ? supabaseAdmin.from('monitoring_runs').select('monitored_site_id, status, score, previous_score, started_at, completed_at, error_message').in('monitored_site_id', siteIds).order('started_at', { ascending: false }) : Promise.resolve({ data: [] as any[] }),
    ]);

    const emailsById = Object.fromEntries((profiles || []).map((p: any) => [p.id, p.email]));
    const latestRunBySite: Record<string, any> = {};
    for (const run of runs || []) {
      if (!latestRunBySite[run.monitored_site_id]) latestRunBySite[run.monitored_site_id] = run;
    }

    const rows = (sites || []).map(s => ({
      ...s,
      customerEmail: emailsById[s.user_id] || 'Unknown',
      latestRun: latestRunBySite[s.id] || null,
    }));

    res.json({ rows, page, pageSize, total: count || 0 });
  });

  router.get('/:id/history', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin
      .from('monitoring_runs')
      .select('*')
      .eq('monitored_site_id', req.params.id)
      .order('started_at', { ascending: false })
      .limit(50);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ rows: data || [] });
  });

  router.post('/:id/pause', async (req: AdminRequest, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ error: 'A reason is required to pause monitoring.' });

    const { error } = await supabaseAdmin.from('monitored_sites').update({ enabled: false, paused_at: new Date().toISOString() }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });

    await logAdminAction({ adminId: req.admin!.id, action: 'monitoring.pause', targetType: 'monitored_site', targetId: req.params.id, previousValue: { enabled: true }, newValue: { enabled: false }, reason });
    res.json({ ok: true });
  });

  router.post('/:id/resume', async (req: AdminRequest, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ error: 'A reason is required to resume monitoring.' });

    const { error } = await supabaseAdmin.from('monitored_sites').update({ enabled: true, paused_at: null, next_run_at: new Date().toISOString() }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });

    await logAdminAction({ adminId: req.admin!.id, action: 'monitoring.resume', targetType: 'monitored_site', targetId: req.params.id, previousValue: { enabled: false }, newValue: { enabled: true }, reason });
    res.json({ ok: true });
  });

  async function triggerRun(req: AdminRequest, res: any, action: string) {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { data: site, error } = await supabaseAdmin
      .from('monitored_sites')
      .select('id, user_id, url, interval, consecutive_failures')
      .eq('id', req.params.id)
      .single();
    if (error || !site) return res.status(404).json({ error: 'Monitored site not found.' });

    await runMonitoredSite(site as any);
    await logAdminAction({ adminId: req.admin!.id, action, targetType: 'monitored_site', targetId: req.params.id, previousValue: null, newValue: null, reason: 'Admin-triggered' });
    res.json({ ok: true });
  }

  router.post('/:id/retry', (req: AdminRequest, res) => triggerRun(req, res, 'monitoring.retry'));
  router.post('/:id/run-now', (req: AdminRequest, res) => triggerRun(req, res, 'monitoring.run_now'));

  return router;
}
