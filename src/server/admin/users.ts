import { Router } from 'express';
import type { AdminRequest } from '../../services/adminAuth';
import { supabaseAdmin } from '../../services/supabaseServer';
import { logAdminAction } from '../../services/auditLog';
import { parsePagination, aggregateScanStats } from './helpers';

export function createUsersRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);
    const search = String(req.query.search || '').trim();

    let query = supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, plan, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: profiles, count, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const ids = (profiles || []).map(p => p.id);
    const stats = await aggregateScanStats(ids);

    const rows = (profiles || []).map(p => ({
      id: p.id,
      name: p.full_name || p.email,
      email: p.email,
      role: p.role,
      plan: p.plan,
      status: p.status,
      signupDate: p.created_at,
      lastActivity: stats[p.id]?.lastActivity ?? null,
      totalScans: stats[p.id]?.totalScans ?? 0,
      monthlyUsage: stats[p.id]?.monthlyUsage ?? 0,
    }));

    res.json({ rows, page, pageSize, total: count || 0 });
  });

  router.get('/:id', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const userId = req.params.id;

    const [{ data: profile, error }, { data: scans }, { data: sites }, { data: reports }, { data: payments }, { data: subscriptions }, { data: auditLog }] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('scans').select('id, url, overall_score, scan_status, result_status, critical_count, started_at, completed_at').eq('user_id', userId).order('started_at', { ascending: false }).limit(50),
      supabaseAdmin.from('monitored_sites').select('id, url, name, interval, enabled, last_run_at, next_run_at, consecutive_failures').eq('user_id', userId),
      supabaseAdmin.from('reports').select('id, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('payments').select('id, amount, currency, status, plan, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabaseAdmin.from('admin_audit_log').select('id, admin_id, action, previous_value, new_value, reason, created_at').eq('target_type', 'user').eq('target_id', userId).order('created_at', { ascending: false }).limit(50),
    ]);

    if (error || !profile) return res.status(404).json({ error: 'User not found.' });

    res.json({ profile, scans: scans || [], monitoredSites: sites || [], reports: reports || [], payments: payments || [], subscriptions: subscriptions || [], adminActions: auditLog || [] });
  });

  router.post('/:id/suspend', async (req: AdminRequest, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ error: 'A reason is required to suspend an account.' });

    const { data: before } = await supabaseAdmin.from('profiles').select('status').eq('id', req.params.id).single();
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'suspended', suspended_at: new Date().toISOString(), suspended_reason: reason })
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });

    await logAdminAction({
      adminId: req.admin!.id, action: 'user.suspend', targetType: 'user', targetId: req.params.id,
      previousValue: before, newValue: { status: 'suspended' }, reason,
    });
    res.json({ ok: true });
  });

  router.post('/:id/reactivate', async (req: AdminRequest, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ error: 'A reason is required to reactivate an account.' });

    const { data: before } = await supabaseAdmin.from('profiles').select('status').eq('id', req.params.id).single();
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'active', suspended_at: null, suspended_reason: null })
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });

    await logAdminAction({
      adminId: req.admin!.id, action: 'user.reactivate', targetType: 'user', targetId: req.params.id,
      previousValue: before, newValue: { status: 'active' }, reason,
    });
    res.json({ ok: true });
  });

  router.post('/:id/override-plan', async (req: AdminRequest, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { plan, reason } = req.body;
    if (!['free', 'pro', 'agency'].includes(plan)) return res.status(400).json({ error: 'Invalid plan.' });
    if (!reason?.trim()) return res.status(400).json({ error: 'A reason is required to change a plan manually.' });

    const { data: before } = await supabaseAdmin.from('profiles').select('plan').eq('id', req.params.id).single();
    const { error } = await supabaseAdmin.from('profiles').update({ plan }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });

    await logAdminAction({
      adminId: req.admin!.id, action: 'user.override_plan', targetType: 'user', targetId: req.params.id,
      previousValue: before, newValue: { plan }, reason,
    });
    res.json({ ok: true });
  });

  router.post('/:id/reset-usage', async (req: AdminRequest, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ error: 'A reason is required to reset usage limits.' });

    const { error } = await supabaseAdmin.from('profiles').update({ usage_reset_at: new Date().toISOString() }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });

    await logAdminAction({
      adminId: req.admin!.id, action: 'user.reset_usage', targetType: 'user', targetId: req.params.id,
      previousValue: null, newValue: { usage_reset_at: new Date().toISOString() }, reason,
    });
    res.json({ ok: true });
  });

  return router;
}
