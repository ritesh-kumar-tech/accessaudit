import { Router } from 'express';
import { supabaseAdmin } from '../services/supabaseServer';
import { getUserFromAuthHeader } from '../services/supabaseServer';
import { generateAndStoreReport, resolveAgencyBrandingForUser } from '../services/reportGenerator';
import type { AuditResult, PlanTier } from '../types';

/**
 * User-facing report endpoints (not admin-only). Every handler re-derives
 * the caller's identity from their own bearer token and checks row
 * ownership explicitly -- a user can never generate or download a report
 * that belongs to someone else's scan, even by guessing/enumerating IDs.
 */
export function createReportsRouter(): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Reports require Supabase to be configured on the server.' });

    const user = await getUserFromAuthHeader(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Sign in to generate a report.' });

    const { scanId } = req.body;
    if (!scanId) return res.status(400).json({ error: 'scanId is required.' });

    const { data: scan, error: scanError } = await supabaseAdmin
      .from('scans')
      .select('id, user_id, scan_status, result')
      .eq('id', scanId)
      .single();

    if (scanError || !scan || scan.user_id !== user.id) {
      return res.status(404).json({ error: 'Scan not found.' });
    }
    if (scan.scan_status !== 'completed' || !scan.result) {
      return res.status(409).json({ error: 'This scan has no completed result to report on yet.' });
    }

    const { data: reportRow, error: insertError } = await supabaseAdmin
      .from('reports')
      .insert({ scan_id: scan.id, user_id: user.id, plan_used: user.plan, status: 'generating' })
      .select('id')
      .single();
    if (insertError || !reportRow) {
      return res.status(500).json({ error: 'Could not start report generation.' });
    }

    const branding = await resolveAgencyBrandingForUser(user.id, user.plan as PlanTier);
    await generateAndStoreReport(reportRow.id, user.id, scan.result as AuditResult, branding, user.plan as PlanTier);

    const { data: finalReport } = await supabaseAdmin
      .from('reports')
      .select('id, status, error_message, created_at')
      .eq('id', reportRow.id)
      .single();

    res.json(finalReport);
  });

  router.get('/:id/download', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Reports require Supabase to be configured on the server.' });

    const user = await getUserFromAuthHeader(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Sign in to download this report.' });

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('id, user_id, status, storage_path')
      .eq('id', req.params.id)
      .single();

    if (error || !report) return res.status(404).json({ error: 'Report not found.' });
    if (report.user_id !== user.id) return res.status(403).json({ error: 'You do not have access to this report.' });
    if (report.status !== 'ready' || !report.storage_path) {
      return res.status(409).json({ error: `Report is not ready yet (status: ${report.status}).` });
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from('reports')
      .createSignedUrl(report.storage_path, 60);

    if (signError || !signed) return res.status(500).json({ error: 'Could not create a download link.' });
    res.json({ url: signed.signedUrl });
  });

  return router;
}
