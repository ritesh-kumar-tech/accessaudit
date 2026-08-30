import { Router } from 'express';
import type { AdminRequest } from '../../services/adminAuth';
import { supabaseAdmin } from '../../services/supabaseServer';
import { performScan } from '../../services/scannerEngine';
import { startScanRecord, completeScanRecord, failScanRecord } from '../../services/scanLifecycle';
import { logAdminAction } from '../../services/auditLog';
import { parsePagination } from './helpers';

export function createScansRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '').trim();

    let query = supabaseAdmin
      .from('scans')
      .select('id, user_id, url, plan_used, overall_score, scan_status, result_status, critical_count, started_at, completed_at, duration_ms, error_message', { count: 'exact' })
      .order('started_at', { ascending: false })
      .range(from, to);

    if (search) query = query.ilike('url', `%${search}%`);
    if (status) query = query.eq('scan_status', status);

    const { data: scans, count, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const userIds = Array.from(new Set((scans || []).map(s => s.user_id).filter(Boolean))) as string[];
    let emailsById: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin.from('profiles').select('id, email').in('id', userIds);
      emailsById = Object.fromEntries((profiles || []).map(p => [p.id, p.email]));
    }

    const rows = (scans || []).map(s => ({
      ...s,
      userEmail: s.user_id ? emailsById[s.user_id] || 'Unknown' : 'Anonymous',
    }));

    res.json({ rows, page, pageSize, total: count || 0 });
  });

  router.post('/:id/retry', async (req: AdminRequest, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });

    const { data: original, error } = await supabaseAdmin.from('scans').select('id, user_id, url, plan_used').eq('id', req.params.id).single();
    if (error || !original) return res.status(404).json({ error: 'Scan not found.' });
    if (original.url === 'Custom HTML Snippet') {
      return res.status(400).json({ error: 'Custom HTML snippet scans cannot be retried (the original snippet is not stored).' });
    }

    const scanRecordId = await startScanRecord(
      original.user_id ? { id: original.user_id, email: undefined, role: 'user', plan: (original.plan_used as any) || 'free', status: 'active' } : null,
      original.url
    );
    const startedAt = Date.now();

    try {
      const result = await performScan(original.url);
      await completeScanRecord(scanRecordId, result, Date.now() - startedAt);
      await logAdminAction({
        adminId: req.admin!.id, action: 'scan.retry', targetType: 'scan', targetId: req.params.id,
        previousValue: null, newValue: { newScanId: scanRecordId, outcome: 'completed' }, reason: 'Admin-triggered retry',
      });
      res.json({ ok: true, newScanId: scanRecordId, result });
    } catch (err: any) {
      const message = err?.message || 'Scan retry failed';
      const isTimeout = /timed out/i.test(message);
      await failScanRecord(scanRecordId, message, isTimeout ? 'timed_out' : 'failed', Date.now() - startedAt);
      await logAdminAction({
        adminId: req.admin!.id, action: 'scan.retry', targetType: 'scan', targetId: req.params.id,
        previousValue: null, newValue: { newScanId: scanRecordId, outcome: 'failed', error: message }, reason: 'Admin-triggered retry',
      });
      res.status(502).json({ error: message });
    }
  });

  return router;
}
