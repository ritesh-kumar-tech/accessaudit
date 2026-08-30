import { Router } from 'express';
import { supabaseAdmin } from '../../services/supabaseServer';
import { parsePagination } from './helpers';

export function createAgenciesRouter(): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);

    const { data: agencies, count, error } = await supabaseAdmin
      .from('agencies')
      .select('id, owner_id, name, primary_color, contact_email, website, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    const ownerIds = (agencies || []).map(a => a.owner_id);
    const agencyIds = (agencies || []).map(a => a.id);

    const [{ data: owners }, { data: clients }, { data: monitoredCounts }] = await Promise.all([
      ownerIds.length ? supabaseAdmin.from('profiles').select('id, email, full_name').in('id', ownerIds) : Promise.resolve({ data: [] as any[] }),
      agencyIds.length ? supabaseAdmin.from('agency_clients').select('id, agency_id') : Promise.resolve({ data: [] as any[] }),
      ownerIds.length ? supabaseAdmin.from('monitored_sites').select('user_id').in('user_id', ownerIds).eq('enabled', true) : Promise.resolve({ data: [] as any[] }),
    ]);

    const ownersById = Object.fromEntries((owners || []).map((o: any) => [o.id, o]));
    const clientCountByAgency: Record<string, number> = {};
    for (const c of clients || []) clientCountByAgency[c.agency_id] = (clientCountByAgency[c.agency_id] || 0) + 1;
    const monitoringCountByOwner: Record<string, number> = {};
    for (const m of monitoredCounts || []) monitoringCountByOwner[m.user_id] = (monitoringCountByOwner[m.user_id] || 0) + 1;

    const rows = (agencies || []).map(a => ({
      ...a,
      ownerEmail: ownersById[a.owner_id]?.email || 'Unknown',
      ownerName: ownersById[a.owner_id]?.full_name || ownersById[a.owner_id]?.email || 'Unknown',
      clientCount: clientCountByAgency[a.id] || 0,
      monitoredSiteCount: monitoringCountByOwner[a.owner_id] || 0,
    }));

    res.json({ rows, page, pageSize, total: count || 0 });
  });

  // Client/site hierarchy is always scoped by :id from the URL, so one
  // agency's clients/sites can never be returned under another agency's ID.
  router.get('/:id', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const agencyId = req.params.id;

    const { data: agency, error } = await supabaseAdmin.from('agencies').select('*').eq('id', agencyId).single();
    if (error || !agency) return res.status(404).json({ error: 'Agency not found.' });

    const { data: clients } = await supabaseAdmin.from('agency_clients').select('id, name, created_at').eq('agency_id', agencyId);
    const clientIds = (clients || []).map(c => c.id);
    const { data: sites } = clientIds.length
      ? await supabaseAdmin.from('agency_sites').select('id, agency_client_id, url, created_at').in('agency_client_id', clientIds)
      : { data: [] as any[] };

    const sitesByClient: Record<string, any[]> = {};
    for (const s of sites || []) {
      (sitesByClient[s.agency_client_id] ||= []).push(s);
    }

    res.json({
      agency,
      clients: (clients || []).map(c => ({ ...c, sites: sitesByClient[c.id] || [] })),
    });
  });

  return router;
}
