import { Router } from 'express';
import type { AdminRequest } from '../../services/adminAuth';
import { supabaseAdmin } from '../../services/supabaseServer';
import { logAdminAction } from '../../services/auditLog';
import { parsePagination } from './helpers';

/**
 * Subscriptions/payments/webhooks are Stripe-backed. Until the Stripe
 * integration batch is wired up, these tables are real but empty -- the
 * endpoints below return real (empty) data rather than fabricated rows,
 * and mutating actions (refunds) return an honest 501 instead of pretending
 * to touch a payment processor that isn't connected.
 */
export function createBillingRouter(): Router {
  const router = Router();

  async function withCustomerEmails<T extends { user_id: string | null }>(rows: T[]): Promise<(T & { customerEmail: string })[]> {
    if (!supabaseAdmin) return rows.map(r => ({ ...r, customerEmail: 'Unknown' }));
    const ids = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean))) as string[];
    if (ids.length === 0) return rows.map(r => ({ ...r, customerEmail: 'Unknown' }));
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, email').in('id', ids);
    const byId = Object.fromEntries((profiles || []).map((p: any) => [p.id, p.email]));
    return rows.map(r => ({ ...r, customerEmail: (r.user_id && byId[r.user_id]) || 'Unknown' }));
  }

  router.get('/subscriptions', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);
    const { data, count, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ rows: await withCustomerEmails(data || []), page, pageSize, total: count || 0, stripeConnected: Boolean(process.env.STRIPE_SECRET_KEY) });
  });

  router.get('/payments', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);
    const { data, count, error } = await supabaseAdmin
      .from('payments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ rows: await withCustomerEmails(data || []), page, pageSize, total: count || 0, stripeConnected: Boolean(process.env.STRIPE_SECRET_KEY) });
  });

  router.get('/failed-payments', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ rows: await withCustomerEmails(data || []), stripeConnected: Boolean(process.env.STRIPE_SECRET_KEY) });
  });

  router.post('/payments/:id/refund', async (req: AdminRequest, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(501).json({ error: 'Stripe is not connected on this deployment yet, so refunds cannot be processed.' });
    }
    const { amount, reason } = req.body;
    if (!amount || !reason?.trim()) {
      return res.status(400).json({ error: 'A refund amount and reason are required.' });
    }
    // Real Stripe refund + payments/webhook_events reconciliation lands with the Stripe billing batch.
    // Stripe stays authoritative: a refund is issued through the Stripe API first, and this row is
    // only ever updated afterward by the webhook handler confirming it -- never edited directly here.
    return res.status(501).json({ error: 'Refund processing is not implemented yet.' });
  });

  router.get('/webhooks', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured.' });
    const { page, pageSize, from, to } = parsePagination(req);
    const { data, count, error } = await supabaseAdmin
      .from('webhook_events')
      .select('*', { count: 'exact' })
      .order('received_at', { ascending: false })
      .range(from, to);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ rows: data || [], page, pageSize, total: count || 0, stripeConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET) });
  });

  return router;
}
