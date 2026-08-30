import { Router } from 'express';
import { supabaseAdmin } from '../../services/supabaseServer';
import { parsePagination } from './helpers';

export function createAuditLogRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);
    const search = String(req.query.search || '').trim();

    let query = supabaseAdmin
      .from('admin_audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (search) query = query.or(`action.ilike.%${search}%,target_type.ilike.%${search}%,reason.ilike.%${search}%`);

    const { data: entries, count, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const adminIds = Array.from(new Set((entries || []).map(e => e.admin_id)));
    const { data: admins } = adminIds.length
      ? await supabaseAdmin.from('profiles').select('id, email').in('id', adminIds)
      : { data: [] as any[] };
    const emailsById = Object.fromEntries((admins || []).map((a: any) => [a.id, a.email]));

    const rows = (entries || []).map(e => ({ ...e, adminEmail: emailsById[e.admin_id] || 'Unknown' }));
    res.json({ rows, page, pageSize, total: count || 0 });
  });

  return router;
}
