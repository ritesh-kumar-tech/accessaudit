import { Router } from 'express';
import { supabaseAdmin } from '../../services/supabaseServer';
import { parsePagination } from './helpers';

export function createEmailLogsRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);

    const { data, count, error } = await supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ rows: data || [], page, pageSize, total: count || 0, emailProviderConfigured: Boolean(process.env.RESEND_API_KEY) });
  });

  return router;
}
