import { Router } from 'express';
import type { AdminRequest } from '../../services/adminAuth';
import { supabaseAdmin } from '../../services/supabaseServer';
import { generateAndStoreReport, resolveAgencyBrandingForUser } from '../../services/reportGenerator';
import { logAdminAction } from '../../services/auditLog';
import { parsePagination } from './helpers';
import type { AuditResult, PlanTier } from '../../types';

export function createAdminReportsRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);

    const { data: reports, count, error } = await supabaseAdmin
      .from('reports')
      .select('id, scan_id, user_id, plan_used, status, error_message, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    const userIds = Array.from(new Set((reports || []).map(r => r.user_id).filter(Boolean))) as string[];
    const scanIds = Array.from(new Set((reports || []).map(r => r.scan_id).filter(Boolean))) as string[];

    const [{ data: profiles }, { data: scans }] = await Promise.all([
      userIds.length ? supabaseAdmin.from('profiles').select('id, email').in('id', userIds) : Promise.resolve({ data: [] as any[] }),
      scanIds.length ? supabaseAdmin.from('scans').select('id, url').in('id', scanIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const emailsById = Object.fromEntries((profiles || []).map((p: any) => [p.id, p.email]));
    const urlsByScan = Object.fromEntries((scans || []).map((s: any) => [s.id, s.url]));

    const rows = (reports || []).map(r => ({
      ...r,
      customerEmail: (r.user_id && emailsById[r.user_id]) || 'Unknown',
      site: (r.scan_id && urlsByScan[r.scan_id]) || 'Unknown',
    }));

    res.json({ rows, page, pageSize, total: count || 0 });
  });

  router.post('/:id/retry', async (req: AdminRequest, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });

    const { data: report, error } = await supabaseAdmin.from('reports').select('id, scan_id, user_id, plan_used').eq('id', req.params.id).single();
    if (error || !report) return res.status(404).json({ error: 'Report not found.' });

    const { data: scan } = await supabaseAdmin.from('scans').select('result').eq('id', report.scan_id).single();
    if (!scan?.result) return res.status(409).json({ error: 'The underlying scan has no stored result to regenerate from.' });

    await supabaseAdmin.from('reports').update({ status: 'generating', error_message: null }).eq('id', report.id);
    const branding = await resolveAgencyBrandingForUser(report.user_id, report.plan_used as PlanTier);
    await generateAndStoreReport(report.id, report.user_id, scan.result as AuditResult, branding, report.plan_used as PlanTier);

    await logAdminAction({ adminId: req.admin!.id, action: 'report.retry', targetType: 'report', targetId: report.id, previousValue: null, newValue: null, reason: 'Admin-triggered retry' });

    const { data: updated } = await supabaseAdmin.from('reports').select('id, status, error_message').eq('id', report.id).single();
    res.json(updated);
  });

  return router;
}
